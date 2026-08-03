import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { NotificationEvent } from '@prisma/client';
import { PaginationQueryDto } from '../../common/pagination';

export class ListNotificationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(NotificationEvent)
  event?: NotificationEvent;

  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  unreadOnly?: boolean;
}
