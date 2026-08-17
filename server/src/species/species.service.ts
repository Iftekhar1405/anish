import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Species } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { ListSpeciesQueryDto } from './dto/list-species-query.dto';

const DUPLICATE = 'A species with this name already exists';

@Injectable()
export class SpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListSpeciesQueryDto): Promise<PaginatedResult<Species>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.SpeciesWhereInput = {
      ...(query.isActive !== undefined ? { isActive: query.isActive === 'true' } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.species.findMany({ where, orderBy: { name: 'asc' }, skip, take }),
      this.prisma.species.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<Species> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateSpeciesDto): Promise<Species> {
    try {
      return await this.prisma.species.create({ data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateSpeciesDto): Promise<Species> {
    await this.getOrThrow(id);
    // Deactivating hides a species from the pickers but keeps every animal,
    // breed and sire already recorded against it — that history has to stay
    // readable, so there is deliberately no delete.
    try {
      return await this.prisma.species.update({ where: { id }, data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  /**
   * Resolves a client-supplied species id, rejecting one that doesn't exist or
   * is no longer offered. Shared by animals/breeds/catalogue so the error a
   * user sees is the same wherever they pick a species.
   */
  async assertSelectable(speciesId: string): Promise<Species> {
    const species = await this.prisma.species.findUnique({ where: { id: speciesId } });
    if (!species) throw new NotFoundException('Species not found');
    if (!species.isActive) {
      throw new BadRequestException('This species is no longer offered');
    }
    return species;
  }

  private async getOrThrow(id: string): Promise<Species> {
    const species = await this.prisma.species.findUnique({ where: { id } });
    if (!species) throw new NotFoundException('Species not found');
    return species;
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
