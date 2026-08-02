import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Species } from '@prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class ListSiresQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Species)
  species?: Species;

  @IsOptional()
  @IsString()
  breedId?: string;
}
