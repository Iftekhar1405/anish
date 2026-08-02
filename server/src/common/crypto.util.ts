import {
  randomBytes,
  scrypt as _scrypt,
  timingSafeEqual,
  createHash,
} from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);
const KEY_LEN = 64;

/** Hash a password with a per-password random salt (scrypt). Format: `salt:hash`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, KEY_LEN)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

/** Constant-time verify of a password against a stored `salt:hash`. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = (await scrypt(password, salt, KEY_LEN)) as Buffer;
  const keyBuf = Buffer.from(key, 'hex');
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
}

/** Opaque, high-entropy refresh token (returned to the client once). */
export function randomToken(): string {
  return randomBytes(48).toString('hex');
}

/** Deterministic hash for storing refresh tokens at rest (never store raw). */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
