import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class BroadcastNotificationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  body!: string;

  /** Omit to broadcast to every active user. */
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
