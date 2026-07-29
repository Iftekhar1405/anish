import { Injectable, Logger } from '@nestjs/common';

export const OTP_PROVIDER = Symbol('OTP_PROVIDER');

export interface OtpProvider {
  send(phone: string, code: string): Promise<void>;
}

/**
 * Dev-mode provider: logs the OTP instead of sending a real SMS.
 * A real provider (keyed by OTP_PROVIDER_KEY, per architecture.md) can replace
 * this binding in AuthModule without touching AuthService.
 */
@Injectable()
export class ConsoleOtpProvider implements OtpProvider {
  private readonly logger = new Logger(ConsoleOtpProvider.name);

  async send(phone: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${phone}: ${code}`);
  }
}
