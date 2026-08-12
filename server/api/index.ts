// Vercel serverless entry point for the NestJS app.
//
// Vercel runs this as a function (not a long-running server), so we build the
// Nest app once, cache the underlying Express instance across warm invocations,
// and hand each request straight to it. No app.listen() — Vercel owns the socket.
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Express, Request, Response } from 'express';
import { AppModule } from '../src/app.module';

async function bootstrap(): Promise<Express> {
  const app = await NestFactory.create(AppModule);

  // Mirror src/main.ts — kept in sync manually since main.ts is the local-dev
  // entry and this is the serverless one.
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
}

// Cache the bootstrap promise so concurrent cold requests share one init.
let cachedApp: Promise<Express> | undefined;

export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  cachedApp ??= bootstrap();
  const app = await cachedApp;
  app(req, res);
}
