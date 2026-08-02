import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDistrictDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  state!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;
}
