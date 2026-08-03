import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Farmer self-service profile edit — the fields a technician needs to find them. */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  districtId?: string;
}
