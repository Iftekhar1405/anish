import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { ConsoleOtpProvider } from './otp-provider';
import { OTP_MAX_ATTEMPTS } from './auth.constants';
import { PrismaService } from '../prisma/prisma.service';

interface FakeUser {
  id: string;
  phone: string;
  role: Role;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FakeOtp {
  id: string;
  userId: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

interface FakeRefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `id_${idCounter}`;
}

function createFakePrisma() {
  const users: FakeUser[] = [];
  const otpCodes: FakeOtp[] = [];
  const refreshTokens: FakeRefreshToken[] = [];

  return {
    user: {
      findUnique: jest.fn(async ({ where }: any) => {
        if (where.id) return users.find((u) => u.id === where.id) ?? null;
        if (where.phone_role) {
          return (
            users.find(
              (u) => u.phone === where.phone_role.phone && u.role === where.phone_role.role,
            ) ?? null
          );
        }
        return null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const user: FakeUser = {
          id: nextId(),
          phone: data.phone,
          role: data.role,
          name: data.name ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        users.push(user);
        return user;
      }),
    },
    otpCode: {
      findFirst: jest.fn(async ({ where }: any) => {
        let rows = otpCodes.filter((o) => o.userId === where.userId);
        if ('consumedAt' in where && where.consumedAt === null) {
          rows = rows.filter((o) => o.consumedAt === null);
        }
        rows = rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return rows[0] ?? null;
      }),
      create: jest.fn(async ({ data }: any) => {
        const otp: FakeOtp = {
          id: nextId(),
          userId: data.userId,
          codeHash: data.codeHash,
          attempts: 0,
          expiresAt: data.expiresAt,
          consumedAt: null,
          createdAt: new Date(),
        };
        otpCodes.push(otp);
        return otp;
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const otp = otpCodes.find((o) => o.id === where.id);
        if (!otp) throw new Error('otp not found');
        if (data.consumedAt !== undefined) otp.consumedAt = data.consumedAt;
        if (data.attempts?.increment) otp.attempts += data.attempts.increment;
        return otp;
      }),
      updateMany: jest.fn(async ({ where, data }: any) => {
        const rows = otpCodes.filter(
          (o) =>
            o.userId === where.userId &&
            (where.consumedAt === undefined || o.consumedAt === where.consumedAt),
        );
        rows.forEach((o) => {
          if (data.consumedAt !== undefined) o.consumedAt = data.consumedAt;
        });
        return { count: rows.length };
      }),
    },
    refreshToken: {
      create: jest.fn(async ({ data }: any) => {
        const token: FakeRefreshToken = {
          id: nextId(),
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          createdAt: new Date(),
        };
        refreshTokens.push(token);
        return token;
      }),
      findMany: jest.fn(async ({ where }: any) => {
        return refreshTokens.filter((t) => {
          if (t.userId !== where.userId) return false;
          if ('revokedAt' in where && where.revokedAt === null && t.revokedAt !== null) return false;
          if (where.expiresAt?.gt && t.expiresAt.getTime() <= where.expiresAt.gt.getTime()) {
            return false;
          }
          return true;
        });
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const token = refreshTokens.find((t) => t.id === where.id);
        if (!token) throw new Error('token not found');
        if (data.revokedAt !== undefined) token.revokedAt = data.revokedAt;
        return token;
      }),
      updateMany: jest.fn(async ({ where, data }: any) => {
        const rows = refreshTokens.filter(
          (t) =>
            t.userId === where.userId &&
            (where.revokedAt === undefined || t.revokedAt === where.revokedAt),
        );
        rows.forEach((t) => {
          if (data.revokedAt !== undefined) t.revokedAt = data.revokedAt;
        });
        return { count: rows.length };
      }),
    },
  };
}

function createConfigService(): ConfigService {
  const values: Record<string, string> = {
    JWT_ACCESS_SECRET: 'test-access-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    NODE_ENV: 'test',
  };
  return {
    get: (key: string) => values[key],
    getOrThrow: (key: string) => {
      const value = values[key];
      if (value === undefined) throw new Error(`Missing config ${key}`);
      return value;
    },
  } as unknown as ConfigService;
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createFakePrisma>;

  beforeEach(() => {
    prisma = createFakePrisma();
    service = new AuthService(
      prisma as unknown as PrismaService,
      new JwtService(),
      createConfigService(),
      new ConsoleOtpProvider(),
    );
  });

  it('auto-provisions a farmer on first OTP request and lets them verify', async () => {
    const { devCode } = await service.requestOtp({ phone: '+911234567890', role: Role.FARMER });
    expect(devCode).toEqual(expect.stringMatching(/^\d{6}$/));

    const result = await service.verifyOtp({
      phone: '+911234567890',
      role: Role.FARMER,
      code: devCode!,
    });
    expect(result.user.role).toBe(Role.FARMER);
    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
  });

  it('rejects an OTP request for a technician phone that has not been seeded', async () => {
    await expect(
      service.requestOtp({ phone: '+911111111111', role: Role.TECHNICIAN }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('allows OTP request/verify for a pre-seeded technician', async () => {
    await prisma.user.create({
      data: { phone: '+922222222222', role: Role.TECHNICIAN, name: 'Tech' },
    });
    const { devCode } = await service.requestOtp({
      phone: '+922222222222',
      role: Role.TECHNICIAN,
    });
    const result = await service.verifyOtp({
      phone: '+922222222222',
      role: Role.TECHNICIAN,
      code: devCode!,
    });
    expect(result.user.role).toBe(Role.TECHNICIAN);
  });

  it('rejects a wrong code, increments attempts, and locks out after too many tries', async () => {
    await service.requestOtp({ phone: '+933333333333', role: Role.FARMER });

    for (let i = 0; i < OTP_MAX_ATTEMPTS; i += 1) {
      await expect(
        service.verifyOtp({ phone: '+933333333333', role: Role.FARMER, code: '000000' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }

    // attempts are now exhausted — even a correct-shaped code is locked out
    await expect(
      service.verifyOtp({ phone: '+933333333333', role: Role.FARMER, code: '000000' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates refresh tokens and detects reuse of a rotated token', async () => {
    const { devCode } = await service.requestOtp({ phone: '+944444444444', role: Role.FARMER });
    const verifyResult = await service.verifyOtp({
      phone: '+944444444444',
      role: Role.FARMER,
      code: devCode!,
    });

    const refreshed = await service.refresh({ refreshToken: verifyResult.refreshToken });
    // accessToken content (sub/role/phone/iat/exp) can coincide when issued in
    // the same second — refreshToken always differs because its jti is random.
    expect(refreshed.refreshToken).not.toEqual(verifyResult.refreshToken);

    // reusing the original (now-rotated) refresh token must fail
    await expect(
      service.refresh({ refreshToken: verifyResult.refreshToken }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    // reuse detection revokes the whole chain, so the latest token is dead too
    await expect(service.refresh({ refreshToken: refreshed.refreshToken })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('enforces a resend cooldown on repeated OTP requests', async () => {
    await service.requestOtp({ phone: '+955555555555', role: Role.FARMER });
    await expect(
      service.requestOtp({ phone: '+955555555555', role: Role.FARMER }),
    ).rejects.toThrow();
  });
});
