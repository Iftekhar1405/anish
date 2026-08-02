import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ServiceArea } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { ListServiceAreasQueryDto } from './dto/list-service-areas-query.dto';

const DUPLICATE = 'A service area with this name already exists in this district';

@Injectable()
export class ServiceAreasService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListServiceAreasQueryDto,
  ): Promise<PaginatedResult<ServiceArea>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.ServiceAreaWhereInput = {
      ...(query.districtId ? { districtId: query.districtId } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceArea.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { district: { select: { id: true, name: true, state: true } } },
        skip,
        take,
      }),
      this.prisma.serviceArea.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<ServiceArea> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateServiceAreaDto): Promise<ServiceArea> {
    try {
      return await this.prisma.serviceArea.create({ data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateServiceAreaDto): Promise<ServiceArea> {
    await this.getOrThrow(id);
    try {
      return await this.prisma.serviceArea.update({ where: { id }, data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private async getOrThrow(id: string): Promise<ServiceArea> {
    const area = await this.prisma.serviceArea.findUnique({ where: { id } });
    if (!area) throw new NotFoundException('Service area not found');
    return area;
  }

  private mapError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return new ConflictException(DUPLICATE);
      if (err.code === 'P2003') return new NotFoundException('District not found');
    }
    return err instanceof Error ? err : new Error('Unknown error');
  }
}
