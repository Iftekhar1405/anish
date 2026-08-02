import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Breed, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { ListBreedsQueryDto } from './dto/list-breeds-query.dto';

const DUPLICATE = 'A breed with this name already exists for this species';

@Injectable()
export class BreedsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListBreedsQueryDto): Promise<PaginatedResult<Breed>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.BreedWhereInput = {
      ...(query.species ? { species: query.species } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.breed.findMany({ where, orderBy: { name: 'asc' }, skip, take }),
      this.prisma.breed.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<Breed> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateBreedDto): Promise<Breed> {
    try {
      return await this.prisma.breed.create({ data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateBreedDto): Promise<Breed> {
    await this.getOrThrow(id);
    try {
      return await this.prisma.breed.update({ where: { id }, data: dto });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private async getOrThrow(id: string): Promise<Breed> {
    const breed = await this.prisma.breed.findUnique({ where: { id } });
    if (!breed) throw new NotFoundException('Breed not found');
    return breed;
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
