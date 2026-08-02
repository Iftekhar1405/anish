import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildResult,
  PaginatedResult,
  PaginationQueryDto,
  paginate,
} from '../common/pagination';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const DUPLICATE = 'An organization with this name already exists';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Organization>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.OrganizationWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take,
      }),
      this.prisma.organization.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<Organization> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    try {
      return await this.prisma.organization.create({ data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    await this.getOrThrow(id);
    try {
      return await this.prisma.organization.update({ where: { id }, data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private async getOrThrow(id: string): Promise<Organization> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  private mapError(err: unknown): Error {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return new ConflictException(DUPLICATE);
    }
    return err instanceof Error ? err : new Error('Unknown error');
  }
}
