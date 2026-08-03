import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Farmer only: postal address shown to the assigned technician. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  /** Farmer only: which district they're in. */
  @IsOptional()
  @IsString()
  districtId?: string;

  /** Technician only: which service area they cover. */
  @IsOptional()
  @IsString()
  serviceAreaId?: string;
}
