import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Species } from '@prisma/client';

export class ConceptionReportQueryDto {
  @IsOptional()
  @IsEnum(Species)
  species?: Species;

  @IsOptional()
  @IsString()
  breedId?: string;
}
