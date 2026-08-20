import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, randomToken } from '../common/crypto.util';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateTechnicianDto } from './dto/create-technician.dto';

export interface UserSummary {
  id: string;
  phone: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  address: string | null;
  districtId: string | null;
  district: { id: string; name: string; state: string } | null;
  serviceAreaId: string | null;
  serviceArea: { id: string; name: string; districtId: string } | null;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

const userSelect = {
  id: true,
  phone: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  address: true,
  districtId: true,
  district: { select: { id: true, name: true, state: true } },
  serviceAreaId: true,
  serviceArea: { select: { id: true, name: true, districtId: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    role: Role,
    query: ListUsersQueryDto,
  ): Promise<PaginatedResult<UserSummary>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.UserWhereInput = {
      role,
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
      // Farmers are filtered by their own district; technicians by their
      // service area's district (there's no direct districtId on a technician).
      ...(query.districtId
        ? role === Role.TECHNICIAN
          ? { serviceArea: { districtId: query.districtId } }
          : { districtId: query.districtId }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(role: Role, id: string): Promise<UserSummary> {
    const user = await this.prisma.user.findFirst({
      where: { id, role },
      select: userSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    role: Role,
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserSummary> {
    await this.findOne(role, id); // 404s if missing or wrong role
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.districtId !== undefined ? { districtId: dto.districtId } : {}),
        ...(dto.serviceAreaId !== undefined
          ? { serviceAreaId: dto.serviceAreaId }
          : {}),
      },
      select: userSelect,
    });
  }

  async findOwnProfile(userId: string): Promise<UserSummary> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateOwnProfile(userId: string, dto: UpdateProfileDto): Promise<UserSummary> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.districtId !== undefined ? { districtId: dto.districtId } : {}),
      },
      select: userSelect,
    });
  }

  /**
   * Farmer-initiated account deletion. Google Play requires an in-app path for
   * any app that lets users create an account, so this is what the farmer app's
   * "Delete my account" button calls.
   *
   * The row is anonymised, not dropped. Bookings and breeding history are the
   * operator's service records — `Booking.farmerId` is `onDelete: Restrict`
   * precisely so a recorded insemination can never lose its trail, and the
   * straw inventory decremented against those visits has to stay auditable. So
   * we strip every identifier, destroy every credential and session, and leave
   * the service history pointing at an anonymous farmer. What we retain is
   * disclosed on the public deletion page linked from the Play listing.
   */
  async deleteOwnAccount(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Hashing is deliberately outside the transaction — it's the slowest step
    // here and holding a DB transaction open for it buys nothing.
    const deadPasswordHash = await hashPassword(randomToken());

    await this.prisma.$transaction(async (tx) => {
      // Nobody should be left holding a scheduled visit for an account that no
      // longer exists. Straws are only decremented on completion, so cancelling
      // an open booking has no inventory side effect.
      await tx.booking.updateMany({
        where: {
          farmerId: userId,
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.ASSIGNED,
              BookingStatus.IN_PROGRESS,
            ],
          },
        },
        data: { status: BookingStatus.CANCELLED },
      });
      // Animals stay for the breeding history that references them, but they
      // drop out of every picker and list.
      await tx.animal.updateMany({
        where: { farmerId: userId },
        data: { isActive: false },
      });
      await tx.refreshToken.deleteMany({ where: { userId } });
      await tx.deviceToken.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: {
          // `@@unique([phone, role])` means the placeholder must still be
          // unique — and using the id frees the real number, so the same person
          // can register again later with a clean account.
          phone: `deleted-${userId}`,
          name: 'Deleted account',
          address: null,
          districtId: null,
          passwordHash: deadPasswordHash,
          isActive: false,
        },
      });
    });
  }

  async createTechnician(dto: CreateTechnicianDto): Promise<UserSummary> {
    const existing = await this.prisma.user.findUnique({
      where: { phone_role: { phone: dto.phone, role: Role.TECHNICIAN } },
    });
    if (existing) {
      throw new ConflictException('A technician with this phone already exists');
    }
    return this.prisma.user.create({
      data: {
        phone: dto.phone,
        role: Role.TECHNICIAN,
        name: dto.name,
        passwordHash: await hashPassword(dto.password),
      },
      select: userSelect,
    });
  }
}
