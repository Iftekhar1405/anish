import { IsOptional, IsString } from 'class-validator';

export class ConceptionReportQueryDto {
  @IsOptional()
  @IsString()
  speciesId?: string;

  @IsOptional()
  @IsString()
  breedId?: string;
}
