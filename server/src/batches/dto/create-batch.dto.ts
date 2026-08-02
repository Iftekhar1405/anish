import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateBatchDto {
  @IsString()
  sireId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(60)
  batchNumber!: string;

  @IsOptional()
  @IsISO8601()
  producedOn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsInt()
  @Min(0)
  quantityTotal!: number;

  @IsInt()
  @Min(0)
  quantityAvailable!: number;
}
