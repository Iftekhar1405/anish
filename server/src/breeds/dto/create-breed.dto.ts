import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBreedDto {
  @IsString()
  speciesId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;
}
