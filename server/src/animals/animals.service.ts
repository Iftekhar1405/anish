import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Animal, BreedingHistory, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
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

  async list(
    query: ListAnimalsQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResult<Animal>> {
    const { page, pageSize, skip, take } = paginate(query);
    const where: Prisma.AnimalWhereInput = {
      farmerId: currentUser.role === Role.FARMER ? currentUser.sub : query.farmerId,
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

  async findOne(id: string, currentUser: JwtPayload): Promise<Animal> {
    const animal = await this.getOrThrow(id);
    this.assertOwnership(animal, currentUser);
    return animal;
  }

  async listBreedingHistory(
    id: string,
    currentUser: JwtPayload,
  ): Promise<BreedingHistory[]> {
    const animal = await this.getOrThrow(id);
    this.assertOwnership(animal, currentUser);
    return this.prisma.breedingHistory.findMany({
      where: { animalId: id },
      orderBy: { inseminationDate: 'desc' },
      include: {
        booking: {
          select: {
            batch: {
              select: { sire: { select: { id: true, name: true, species: true } } },
            },
          },
        },
      },
    });
  }

  async create(dto: CreateAnimalDto, currentUser: JwtPayload): Promise<Animal> {
    const farmerId = this.resolveFarmerId(dto.farmerId, currentUser);
    await this.assertFarmer(farmerId);
    try {
      return await this.prisma.animal.create({
        data: { ...dto, farmerId },
        include: animalInclude,
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async update(
    id: string,
    dto: UpdateAnimalDto,
    currentUser: JwtPayload,
  ): Promise<Animal> {
    const current = await this.getOrThrow(id);
    this.assertOwnership(current, currentUser);
    // Farmers manage their own animal's details but not the admin soft-delete flag.
    const data = currentUser.role === Role.FARMER ? { ...dto, isActive: undefined } : dto;
    try {
      return await this.prisma.animal.update({
        where: { id },
        data,
        include: animalInclude,
      });
    } catch (err) {
      throw this.mapError(err);
    }
  }

  private resolveFarmerId(
    dtoFarmerId: string | undefined,
    currentUser: JwtPayload,
  ): string {
    if (currentUser.role === Role.FARMER) return currentUser.sub;
    if (currentUser.role === Role.ADMIN) {
      if (!dtoFarmerId) {
        throw new BadRequestException(
          'farmerId is required when creating an animal on behalf of a farmer',
        );
      }
      return dtoFarmerId;
    }
    throw new ForbiddenException('Insufficient role');
  }

  private assertOwnership(animal: Animal, currentUser: JwtPayload): void {
    if (currentUser.role === Role.FARMER && animal.farmerId !== currentUser.sub) {
      throw new NotFoundException('Animal not found');
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
