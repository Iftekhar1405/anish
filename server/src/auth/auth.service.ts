import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import type { AuthTokens, AuthUser, RequestOtpResult, VerifyOtpResult } from '@ai-platform/types';
import { PrismaService } from '../prisma/prisma.service';
import {
  generateOpaqueToken,
  generateOtpCode,
  hashSecret,
  verifySecret,
} from '../common/crypto.util';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { OTP_PROVIDER } from './otp-provider';
import type { OtpProvider } from './otp-provider';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from './auth.constants';
import { AccessTokenPayload, RefreshTokenPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(OTP_PROVIDER) private readonly otpProvider: OtpProvider,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<RequestOtpResult> {
    const user = await this.findOrProvisionUser(dto.phone, dto.role);

    const lastOtp = await this.prisma.otpCode.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const secondsSinceLast = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
        throw new HttpException(
          {
            message: 'Please wait before requesting another code.',
            retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast),
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // Invalidate any still-active prior codes so verify only ever considers the newest one.
    await this.prisma.otpCode.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = generateOtpCode();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        codeHash: hashSecret(code),
        expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      },
    });

    await this.otpProvider.send(user.phone, code);

    return {
      message: 'A verification code has been sent.',
      retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      devCode: this.isProduction() ? undefined : code,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResult> {
    const user = await this.prisma.user.findUnique({
      where: { phone_role: { phone: dto.phone, role: dto.role } },
    });
    if (!user) throw new UnauthorizedException('Invalid phone, role, or code.');

    const otp = await this.prisma.otpCode.findFirst({
      where: { userId: user.id, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new UnauthorizedException('No active code found. Please request a new one.');

    if (otp.expiresAt.getTime() < Date.now()) {
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
      throw new UnauthorizedException('Code expired. Please request a new one.');
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
      throw new UnauthorizedException('Too many attempts. Please request a new code.');
    }

    if (!verifySecret(dto.code, otp.codeHash)) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid code.');
    }

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const tokens = await this.issueTokens(user);
    return { ...tokens, user: this.toAuthUser(user) };
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokens> {
    const payload = await this.verifyRefreshJwt(dto.refreshToken);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Invalid refresh token.');

    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    });

    const matched = activeTokens.find((t) => verifySecret(payload.jti, t.tokenHash));

    if (!matched) {
      // Signature valid but no matching active record — possible reuse of a
      // rotated/revoked token. Defensively revoke everything for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token has been revoked. Please log in again.');
    }

    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(user);
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.verifyRefreshJwt(dto.refreshToken);
    } catch {
      return; // idempotent — already invalid/expired
    }

    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { userId: payload.sub, revokedAt: null },
    });
    const matched = activeTokens.find((t) => verifySecret(payload.jti, t.tokenHash));
    if (matched) {
      await this.prisma.refreshToken.update({
        where: { id: matched.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    return this.toAuthUser(user);
  }

  private async findOrProvisionUser(phone: string, role: Role): Promise<User> {
    const existing = await this.prisma.user.findUnique({
      where: { phone_role: { phone, role } },
    });
    if (existing) return existing;

    if (role !== Role.FARMER) {
      throw new NotFoundException(
        `No ${role.toLowerCase()} account found for this phone number. Contact an administrator.`,
      );
    }

    return this.prisma.user.create({ data: { phone, role } });
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessTokenExpiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
    const accessPayload: AccessTokenPayload = { sub: user.id, role: user.role, phone: user.phone };
    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });

    const jti = generateOpaqueToken();
    const refreshPayload: RefreshTokenPayload = { sub: user.id, jti };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_TTL_SECONDS,
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashSecret(jti),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
    };
  }

  private async verifyRefreshJwt(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, phone: user.phone, role: user.role, name: user.name };
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
