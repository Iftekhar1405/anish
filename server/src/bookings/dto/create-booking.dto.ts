import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  animalId!: string;

  @IsString()
  batchId!: string;

  @IsISO8601()
  preferredDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  /** Admin-only: which farmer this booking is created on behalf of. */
  @IsOptional()
  @IsString()
  farmerId?: string;
}
