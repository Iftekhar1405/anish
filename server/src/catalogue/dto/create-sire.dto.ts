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

export class CreateSireDto {
  @IsEnum(Species)
  species!: Species;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  breedId!: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsEnum(FertilityRating)
  fertilityRating!: FertilityRating;

  @IsOptional()
  @IsBoolean()
  diseaseFree?: boolean;

  /** Straw price in integer minor units (e.g. paise). */
  @IsInt()
  @Min(0)
  strawPriceMinor!: number;

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

  // Cattle (Bull) specific
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

  // Goat (Buck) specific
  @IsOptional()
  @IsNumber()
  growthIndex?: number;
}
