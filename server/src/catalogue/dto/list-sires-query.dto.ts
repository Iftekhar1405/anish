import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class ListSiresQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  speciesId?: string;

  @IsOptional()
  @IsString()
  breedId?: string;
}
