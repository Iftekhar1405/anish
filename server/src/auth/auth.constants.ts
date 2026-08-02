/** Short-lived access token (JWT). */
export const ACCESS_TOKEN_TTL = '15m';

/** Refresh token lifetime (rotated on every use). */
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
