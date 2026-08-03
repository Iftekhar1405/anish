import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorEnvelope {
  statusCode: number;
  message: string | string[];
  error: string;
}

/**
 * Guarantees the `{ statusCode, message, error }` envelope for every error
 * response. Recognized HttpExceptions pass their shape through unchanged;
 * anything else (a bug, an unmapped Prisma error, ...) becomes a generic 500
 * so internal details never reach the client. Logging with redaction is
 * already handled by LoggingInterceptor upstream of this filter.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const envelope = this.toEnvelope(exception);
    res.status(envelope.statusCode).json(envelope);
  }

  private toEnvelope(exception: unknown): ErrorEnvelope {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return { statusCode: status, message: response, error: exception.name };
      }
      const body = response as Record<string, unknown>;
      return {
        statusCode: status,
        message: (body.message as string | string[]) ?? exception.message,
        error: (body.error as string) ?? exception.name,
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}
