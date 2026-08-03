import { IsString, MaxLength } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  @MaxLength(400)
  token!: string;
}
