/**
 * Recursively redacts sensitive fields from a value before it is logged.
 *
 * Auth flows carry OTP codes, JWTs, and hashed secrets through request and
 * response bodies; those must never land in server logs. Matching is
 * case-insensitive on the key name so `accessToken`, `AccessToken`, and
 * `access_token` are all caught.
 */
const SENSITIVE_KEYS = new Set([
  'code',
  'devcode',
  'otp',
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'tokenhash',
  'codehash',
  'authorization',
  'secret',
]);

const REDACTED = '[REDACTED]';

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitive);
  }

  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEYS.has(key.toLowerCase())
        ? REDACTED
        : redactSensitive(val);
    }
    return out;
  }

  return value;
}
