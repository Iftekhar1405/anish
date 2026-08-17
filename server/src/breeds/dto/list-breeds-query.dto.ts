import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class ListBreedsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  speciesId?: string;
}
