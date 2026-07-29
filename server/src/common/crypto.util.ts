import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'crypto';

const SCRYPT_KEY_LENGTH = 64;

/** Hashes a secret (OTP code, refresh token) with a random salt using scrypt. */
export function hashSecret(secret: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(secret, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifySecret(secret: string, hash: string): boolean {
  const [salt, storedDerived] = hash.split(':');
  if (!salt || !storedDerived) return false;
  const derived = scryptSync(secret, salt, SCRYPT_KEY_LENGTH);
  const stored = Buffer.from(storedDerived, 'hex');
  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}

/** Generates a zero-padded numeric OTP code, e.g. "042817". */
export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, '0');
}

export function generateOpaqueToken(): string {
  return randomBytes(32).toString('hex');
}
