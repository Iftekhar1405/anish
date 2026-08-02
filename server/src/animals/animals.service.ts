import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Animal, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildResult, PaginatedResult, paginate } from '../common/pagination';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { ListAnimalsQueryDto } from './dto/list-animals-query.dto';

const DUPLICATE = 'This farmer already has an animal with this tag';

const animalInclude = {
  farmer: { select: { id: true, name: true, phone: true } },
  breed: { select: { id: true, name: true, species: true } },
} satisfies Prisma.AnimalInclude;

@Injectable()
export class AnimalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAnimalsQueryDto): Promise<PaginatedResult<Animal>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.AnimalWhereInput = {
      ...(query.farmerId ? { farmerId: query.farmerId } : {}),
      ...(query.species ? { species: query.species } : {}),
      ...(query.breedingStatus ? { breedingStatus: query.breedingStatus } : {}),
      ...(query.search
        ? { tag: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.animal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: animalInclude,
        skip,
        take,
      }),
      this.prisma.animal.count({ where }),
    ]);
    return buildResult(items, total, page, pageSize);
  }

  findOne(id: string): Promise<Animal> {
    return this.getOrThrow(id);
  }

  async create(dto: CreateAnimalDto): Promise<Animal> {
    await this.assertFarmer(dto.farmerId);
    try {
      return await this.prisma.animal.create({
        data: dto,
        include: animalInclude,
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(id: string, dto: UpdateAnimalDto): Promise<Animal> {
    await this.getOrThrow(id);
    try {
      return await this.prisma.animal.update({
        where: { id },
        data: dto,
        include: animalInclude,
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  /** Ensures the target user exists and is a FARMER before assigning ownership. */
  private async assertFarmer(farmerId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: farmerId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('Farmer not found');
    if (user.role !== Role.FARMER) {
      throw new BadRequestException('Owner must be a farmer');
    }
  }

  private async getOrThrow(id: string): Promise<Animal> {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: animalInclude,
    });
    if (!animal) throw new NotFoundException('Animal not found');
    return animal;
  }

  private mapError(err: unknown): Error {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return new ConflictException(DUPLICATE);
      if (err.code === 'P2003') return new NotFoundException('Breed not found');
    }
    return err instanceof Error ? err : new Error('Unknown error');
  }
}
