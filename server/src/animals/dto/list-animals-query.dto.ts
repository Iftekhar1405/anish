import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AnimalBreedingStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class ListAnimalsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  farmerId?: string;

  @IsOptional()
  @IsString()
  speciesId?: string;

  @IsOptional()
  @IsEnum(AnimalBreedingStatus)
  breedingStatus?: AnimalBreedingStatus;
}
