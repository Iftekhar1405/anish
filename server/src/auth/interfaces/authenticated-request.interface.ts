import type { Request } from 'express';
import { AccessTokenPayload } from './jwt-payload.interface';

export interface AuthenticatedRequest extends Request {
  user: AccessTokenPayload;
}
