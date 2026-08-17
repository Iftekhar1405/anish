import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SpeciesMetrics } from '@prisma/client';

export class CreateSpeciesDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  /** Which extra sire fields the catalogue should ask for. */
  @IsOptional()
  @IsEnum(SpeciesMetrics)
  metrics?: SpeciesMetrics;
}
