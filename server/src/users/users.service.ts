import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../common/crypto.util';
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
