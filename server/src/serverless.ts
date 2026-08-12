// Serverless bootstrap for Vercel. Lives in src/ so `nest build` (tsc) compiles
// it with emitDecoratorMetadata — the metadata NestJS DI needs and that Vercel's
// esbuild bundler would otherwise strip. api/index.ts delegates to the compiled
// output of this file (dist/serverless.js).
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Express, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<Express> {
  const app = await NestFactory.create(AppModule);

  // Mirror src/main.ts (the local-dev entry).
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
  try {
    cachedApp ??= bootstrap();
    const app = await cachedApp;
    app(req, res);
  } catch (err) {
    // A failed bootstrap must not poison the cached promise, or every
    // subsequent request on this warm instance would crash too. Reset it so
    // the next invocation retries, and return a handled 500 instead of
    // FUNCTION_INVOCATION_FAILED.
    cachedApp = undefined;
    console.error('[serverless] bootstrap failed:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Server initialization failed' }));
  }
}
