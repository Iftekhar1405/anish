import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Batch, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { ListBatchesQueryDto } from './dto/list-batches-query.dto';

const DUPLICATE = 'A batch with this number already exists for this sire';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListBatchesQueryDto): Promise<PaginatedResult<Batch>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.BatchWhereInput = {
      ...(query.sireId ? { sireId: query.sireId } : {}),
      ...(query.search
        ? { batchNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.batch.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { sire: { select: { id: true, name: true, species: true } } },
        skip,
        take,
      }),
      this.prisma.batch.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<Batch> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateBatchDto): Promise<Batch> {
    this.assertQuantities(dto.quantityAvailable, dto.quantityTotal);
    try {
      return await this.prisma.batch.create({
        data: {
          sireId: dto.sireId,
          batchNumber: dto.batchNumber,
          notes: dto.notes,
          quantityTotal: dto.quantityTotal,
          quantityAvailable: dto.quantityAvailable,
          producedOn: dto.producedOn ? new Date(dto.producedOn) : undefined,
        },
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateBatchDto): Promise<Batch> {
    const current = await this.getOrThrow(id);
    const total = dto.quantityTotal ?? current.quantityTotal;
    const available = dto.quantityAvailable ?? current.quantityAvailable;
    this.assertQuantities(available, total);
    try {
      return await this.prisma.batch.update({
        where: { id },
        data: {
          batchNumber: dto.batchNumber,
          notes: dto.notes,
          quantityTotal: dto.quantityTotal,
          quantityAvailable: dto.quantityAvailable,
          producedOn: dto.producedOn ? new Date(dto.producedOn) : undefined,
        },
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private assertQuantities(available: number, total: number): void {
    if (available > total) {
      throw new BadRequestException(
        'quantityAvailable cannot exceed quantityTotal',
      );
    }
  }

  private async getOrThrow(id: string): Promise<Batch> {
    const batch = await this.prisma.batch.findUnique({ where: { id } });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  private mapError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return new ConflictException(DUPLICATE);
      if (err.code === 'P2003') return new NotFoundException('Sire not found');
    }
    return err instanceof Error ? err : new Error('Unknown error');
  }
}
