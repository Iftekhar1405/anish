import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { District, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { ListDistrictsQueryDto } from './dto/list-districts-query.dto';

const DUPLICATE = 'A district with this name already exists in this state';

@Injectable()
export class DistrictsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListDistrictsQueryDto): Promise<PaginatedResult<District>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.DistrictWhereInput = {
      ...(query.state ? { state: { equals: query.state, mode: 'insensitive' } } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.district.findMany({
        where,
        orderBy: [{ state: 'asc' }, { name: 'asc' }],
        skip,
        take,
      }),
      this.prisma.district.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<District> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateDistrictDto): Promise<District> {
    try {
      return await this.prisma.district.create({ data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateDistrictDto): Promise<District> {
    await this.getOrThrow(id);
    try {
      return await this.prisma.district.update({ where: { id }, data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private async getOrThrow(id: string): Promise<District> {
    const district = await this.prisma.district.findUnique({ where: { id } });
    if (!district) throw new NotFoundException('District not found');
    return district;
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
