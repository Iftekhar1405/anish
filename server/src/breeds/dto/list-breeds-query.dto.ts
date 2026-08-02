import { IsEnum, IsOptional } from 'class-validator';
import { Species } from '@prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class ListBreedsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(Species)
  species?: Species;
}
