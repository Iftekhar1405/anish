import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;

export class CreateAdminUserDto {
  @IsString()
  @Matches(PHONE_PATTERN, {
    message: 'phone must be a valid international phone number, e.g. +919876543210',
  })
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;
}
