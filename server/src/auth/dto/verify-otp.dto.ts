import { Role } from '@prisma/client';
import { IsEnum, IsString, Matches } from 'class-validator';

const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;

export class VerifyOtpDto {
  @IsString()
  @Matches(PHONE_PATTERN, {
    message: 'phone must be a valid international phone number, e.g. +919876543210',
  })
  phone!: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit numeric string' })
  code!: string;
}
