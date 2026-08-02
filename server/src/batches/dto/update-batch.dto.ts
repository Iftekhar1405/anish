import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateBatchDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  batchNumber?: string;

  @IsOptional()
  @IsISO8601()
  producedOn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantityTotal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantityAvailable?: number;
}
