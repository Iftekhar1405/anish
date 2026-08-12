import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: 'ok'; database: 'connected' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      // Log the real Prisma error so the cause is visible in Vercel logs
      // instead of being swallowed behind a generic 503.
      const raw = process.env.DATABASE_URL ?? '';
      console.error(
        `[health] DATABASE_URL prefix=${JSON.stringify(raw.slice(0, 14))} len=${raw.length}`,
      );
      console.error('[health] DB check failed:', err);
      throw new ServiceUnavailableException('Database connection failed');
    }
    return { status: 'ok', database: 'connected' };
  }
}
