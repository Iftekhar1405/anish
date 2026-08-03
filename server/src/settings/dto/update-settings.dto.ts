import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  supportPhone?: string;
}
