import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Wraps the Cloudinary SDK. The API secret never leaves the backend — clients
 * request a short-lived signature here, then upload the file directly to
 * Cloudinary from the device using that signature (backend-signed uploads).
 */
@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Cloudinary credentials missing — upload signing will fail until CLOUDINARY_* env vars are set.',
      );
      return;
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    this.configured = true;
  }

  /** Returns the params a client needs to perform a signed direct upload. */
  signUpload(folder = 'sires'): UploadSignature {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME') ?? '';
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY') ?? '';
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET') ?? '';
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret,
    );
    return { cloudName, apiKey, timestamp, folder, signature };
  }

  /** Best-effort delete of an uploaded asset by its public id. */
  async destroy(publicId: string): Promise<void> {
    if (!this.configured) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      this.logger.warn(
        `Failed to delete Cloudinary asset ${publicId}: ${String(err)}`,
      );
    }
  }
}
