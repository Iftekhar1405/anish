import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AnimalBreedingStatus, Species } from '@prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class ListAnimalsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  farmerId?: string;

  @IsOptional()
  @IsEnum(Species)
  species?: Species;

  @IsOptional()
  @IsEnum(AnimalBreedingStatus)
  breedingStatus?: AnimalBreedingStatus;
}
