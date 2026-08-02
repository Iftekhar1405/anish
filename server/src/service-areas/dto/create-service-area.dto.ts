import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateServiceAreaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  districtId!: string;
}
