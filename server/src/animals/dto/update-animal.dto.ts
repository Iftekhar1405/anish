import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { AnimalBreedingStatus } from '@prisma/client';

export class UpdateAnimalDto {
  @IsOptional()
  @IsString()
  speciesId?: string;

  @IsOptional()
  @IsString()
  breedId?: string;

  /** Free-text breed for farmers whose breed isn't in the master list. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  breedOther?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  tag?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  ageMonths?: number;

  @IsOptional()
  @IsEnum(AnimalBreedingStatus)
  breedingStatus?: AnimalBreedingStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
