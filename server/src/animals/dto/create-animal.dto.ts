import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { AnimalBreedingStatus, Species } from '@prisma/client';

export class CreateAnimalDto {
  @IsString()
  farmerId!: string;

  @IsEnum(Species)
  species!: Species;

  @IsOptional()
  @IsString()
  breedId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  tag!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  ageMonths?: number;

  @IsOptional()
  @IsEnum(AnimalBreedingStatus)
  breedingStatus?: AnimalBreedingStatus;
}
