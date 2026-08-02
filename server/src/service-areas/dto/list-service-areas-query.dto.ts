import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class ListServiceAreasQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  districtId?: string;
}
