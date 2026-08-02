import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Species } from '@prisma/client';

export class CreateBreedDto {
  @IsEnum(Species)
  species!: Species;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;
}
