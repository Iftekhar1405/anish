import { IsEnum, IsString, Matches } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'phone must be 7-15 digits, optionally prefixed with +',
  })
  phone!: string;

  @IsString()
  password!: string;

  // Each app is role-specific and sends its role; a phone is unique per role.
  @IsEnum(Role)
  role!: Role;
}
