import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SireCatalogue } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { SpeciesService } from '../species/species.service';
import { CreateSireDto } from './dto/create-sire.dto';
import { UpdateSireDto } from './dto/update-sire.dto';
import { ListSiresQueryDto } from './dto/list-sires-query.dto';

const sireInclude = {
  species: { select: { id: true, name: true, code: true, metrics: true } },
  breed: { select: { id: true, name: true, speciesId: true } },
  organization: { select: { id: true, name: true } },
} satisfies Prisma.SireCatalogueInclude;

@Injectable()
export class CatalogueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly species: SpeciesService,
  ) {}

  async list(query: ListSiresQueryDto): Promise<PaginatedResult<SireCatalogue>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.SireCatalogueWhereInput = {
      ...(query.speciesId ? { speciesId: query.speciesId } : {}),
      ...(query.breedId ? { breedId: query.breedId } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.sireCatalogue.findMany({
        where,
        orderBy: { name: 'asc' },
        include: sireInclude,
        skip,
        take,
      }),
      this.prisma.sireCatalogue.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<SireCatalogue> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateSireDto): Promise<SireCatalogue> {
    await this.species.assertSelectable(dto.speciesId);
    try {
      return await this.prisma.sireCatalogue.create({
        data: dto,
        include: sireInclude,
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateSireDto): Promise<SireCatalogue> {
    await this.getOrThrow(id);
    if (dto.speciesId) await this.species.assertSelectable(dto.speciesId);
    try {
      return await this.prisma.sireCatalogue.update({
        where: { id },
        data: dto,
        include: sireInclude,
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private async getOrThrow(id: string): Promise<SireCatalogue> {
    const sire = await this.prisma.sireCatalogue.findUnique({
      where: { id },
      include: sireInclude,
    });
    if (!sire) throw new NotFoundException('Sire not found');
    return sire;
  }

  private mapError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        return new NotFoundException('Breed or organization not found');
      }
    }
    return err instanceof Error ? err : new Error('Unknown error');
  }
}
