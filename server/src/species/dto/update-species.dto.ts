import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { SpeciesMetrics } from '@prisma/client';

export class UpdateSpeciesDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @IsOptional()
  @IsEnum(SpeciesMetrics)
  metrics?: SpeciesMetrics;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
