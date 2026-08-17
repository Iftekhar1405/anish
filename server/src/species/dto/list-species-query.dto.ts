import { IsBooleanString, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination';

export class ListSpeciesQueryDto extends PaginationQueryDto {
  /** `true` limits the list to species still offered — what the pickers use. */
  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
