import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import type { AdminUserSummary, PaginatedResult } from '@ai-platform/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';

const SORTABLE_FIELDS = new Set(['name', 'phone', 'createdAt']);
const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    role: Role,
    query: ListAdminUsersQueryDto,
  ): Promise<PaginatedResult<AdminUserSummary>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortBy = query.sortBy && SORTABLE_FIELDS.has(query.sortBy) ? query.sortBy : 'createdAt';
    const sortDir = query.sortDir ?? 'desc';

    const where: Prisma.UserWhereInput = {
      role,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((user) => this.toSummary(user)),
      page,
      pageSize,
      total,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async create(role: Role, dto: CreateAdminUserDto): Promise<AdminUserSummary> {
    const existing = await this.prisma.user.findUnique({
      where: { phone_role: { phone: dto.phone, role } },
    });
    if (existing) {
      throw new ConflictException(
        `A ${role.toLowerCase()} account with this phone number already exists.`,
      );
    }

    const user = await this.prisma.user.create({
      data: { phone: dto.phone, name: dto.name, role },
    });
    return this.toSummary(user);
  }

  async update(role: Role, id: string, dto: UpdateAdminUserDto): Promise<AdminUserSummary> {
    const existing = await this.prisma.user.findFirst({ where: { id, role } });
    if (!existing) throw new NotFoundException('Account not found.');

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    return this.toSummary(user);
  }

  private toSummary(user: User): AdminUserSummary {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
