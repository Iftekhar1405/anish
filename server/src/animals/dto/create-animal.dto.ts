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
import { AnimalBreedingStatus } from '@prisma/client';

export class CreateAnimalDto {
  /** Required when an Admin creates on behalf of a farmer; ignored/derived for a Farmer caller. */
  @IsOptional()
  @IsString()
  farmerId?: string;

  @IsString()
  speciesId!: string;

  @IsOptional()
  @IsString()
  breedId?: string;

  /** Free-text breed for farmers whose breed isn't in the master list. */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  breedOther?: string;

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
