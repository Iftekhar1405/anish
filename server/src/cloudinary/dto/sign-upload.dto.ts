import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class SignUploadDto {
  /** Optional target folder in Cloudinary (defaults to "sires"). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(/^[a-z0-9/_-]+$/i, {
    message: 'folder may only contain letters, numbers, / _ -',
  })
  folder?: string;
}
