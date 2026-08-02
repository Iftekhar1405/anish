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
import { CreateTechnicianDto } from './dto/create-technician.dto';

export interface UserSummary {
  id: string;
  phone: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
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
