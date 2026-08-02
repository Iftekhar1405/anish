import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class ListBatchesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  sireId?: string;
}
