import { Body, Controller, Post } from '@nestjs/common';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { CloudinaryService } from './cloudinary.service';
import { SignUploadDto } from './dto/sign-upload.dto';

@Controller('uploads')
@AdminOnly()
export class CloudinaryController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  /** Issue a signature for a direct, client-side upload to Cloudinary. */
  @Post('signature')
  sign(@Body() dto: SignUploadDto) {
    return this.cloudinary.signUpload(dto.folder);
  }
}
