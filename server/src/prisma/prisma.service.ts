import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  // No eager $connect() in onModuleInit: on Vercel's serverless runtime a DB
  // hiccup during startup would reject app bootstrap and crash the whole
  // function (FUNCTION_INVOCATION_FAILED) instead of surfacing a handled error.
  // Prisma connects lazily on the first query, so failures show up as normal
  // query errors we can catch (e.g. the /health 503) rather than a hard crash.
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
