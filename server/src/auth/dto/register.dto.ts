import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Farmer self-registration (only farmers may self-register). */
export class RegisterDto {
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'phone must be 7-15 digits, optionally prefixed with +',
  })
  phone!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
