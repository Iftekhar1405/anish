import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { redactSensitive } from './redact.util';

/** Request shape after JwtAuthGuard populates the authenticated user (if any). */
type LoggedRequest = Request & { user?: { sub?: string; id?: string } };

/** Cap serialized payloads so a large list response can't flood the logs. */
const MAX_SERIALIZED_LENGTH = 4000;

/**
 * Logs every HTTP request with its (redacted) payload and every response with
 * its (redacted) body, status code, and duration. Registered globally via
 * APP_INTERCEPTOR. Errors thrown by pipes/controllers are logged too; guard
 * rejections (401/403 before the interceptor runs) are handled by the framework.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<LoggedRequest>();
    const res = http.getResponse<Response>();
    const { method, originalUrl } = req;
    const startedAt = Date.now();
    const userId = req.user?.sub ?? req.user?.id;

    const requestMeta: Record<string, unknown> = { method, url: originalUrl };
    if (userId) {
      requestMeta.userId = userId;
    }
    if (req.query && Object.keys(req.query).length > 0) {
      requestMeta.query = req.query;
    }
    if (req.body && Object.keys(req.body as object).length > 0) {
      requestMeta.body = redactSensitive(req.body);
    }
    this.logger.log(`--> ${method} ${originalUrl} ${this.serialize(requestMeta)}`);

    return next.handle().pipe(
      tap((data) => {
        const ms = Date.now() - startedAt;
        this.logger.log(
          `<-- ${method} ${originalUrl} ${res.statusCode} ${ms}ms ${this.serialize({ response: redactSensitive(data) })}`,
        );
      }),
      catchError((err: unknown) => {
        const ms = Date.now() - startedAt;
        const status =
          (err as { status?: number; statusCode?: number })?.status ??
          (err as { statusCode?: number })?.statusCode ??
          500;
        const message = (err as { message?: string })?.message ?? 'Unknown error';
        const body = (err as { response?: unknown })?.response;
        this.logger.error(
          `<-- ${method} ${originalUrl} ${status} ${ms}ms ${this.serialize({ error: message, response: redactSensitive(body) })}`,
        );
        return throwError(() => err);
      }),
    );
  }

  private serialize(payload: unknown): string {
    const json = JSON.stringify(payload) ?? '';
    return json.length > MAX_SERIALIZED_LENGTH
      ? `${json.slice(0, MAX_SERIALIZED_LENGTH)}…(${json.length} bytes)`
      : json;
  }
}
