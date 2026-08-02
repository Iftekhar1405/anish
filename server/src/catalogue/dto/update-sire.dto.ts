import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { FertilityRating, Species } from '@prisma/client';

export class UpdateSireDto {
  @IsOptional()
  @IsEnum(Species)
  species?: Species;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  breedId?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsEnum(FertilityRating)
  fertilityRating?: FertilityRating;

  @IsOptional()
  @IsBoolean()
  diseaseFree?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  strawPriceMinor?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  imagePublicId?: string;

  @IsOptional()
  @IsNumber()
  geneticScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  milkYieldPotential?: number;

  @IsOptional()
  @IsNumber()
  fatPct?: number;

  @IsOptional()
  @IsNumber()
  growthIndex?: number;
}
