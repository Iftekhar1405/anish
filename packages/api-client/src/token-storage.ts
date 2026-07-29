export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

/** Persists auth tokens. Each app supplies its own implementation
 * (SecureStore on native, localStorage on Expo Web for Admin). */
export interface TokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(tokens: StoredTokens): Promise<void>;
  clear(): Promise<void>;
}
