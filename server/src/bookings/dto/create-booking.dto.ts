import { IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  animalId!: string;

  @IsString()
  batchId!: string;

  @IsISO8601()
  preferredDate!: string;

  /** Where the technician should go for this visit (defaults to the farmer's address). */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  /** Admin-only: which farmer this booking is created on behalf of. */
  @IsOptional()
  @IsString()
  farmerId?: string;
}
