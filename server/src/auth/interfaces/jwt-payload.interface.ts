import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  phone: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}
