import { Injectable } from '@nestjs/common';
import { AppSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

/** A single settings row acts as the whole app's config — created lazily on first read. */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<AppSettings> {
    const existing = await this.prisma.appSettings.findFirst();
    if (existing) return existing;
    return this.prisma.appSettings.create({ data: {} });
  }

  async update(dto: UpdateSettingsDto): Promise<AppSettings> {
    const current = await this.get();
    return this.prisma.appSettings.update({
      where: { id: current.id },
      data: {
        ...(dto.lowStockThreshold !== undefined
          ? { lowStockThreshold: dto.lowStockThreshold }
          : {}),
        ...(dto.supportPhone !== undefined ? { supportPhone: dto.supportPhone } : {}),
      },
    });
  }
}
