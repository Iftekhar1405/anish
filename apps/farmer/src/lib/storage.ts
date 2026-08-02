import * as SecureStore from "expo-secure-store";
import type { AuthResult, AuthUser } from "@ai-platform/types";
import type { StoredTokens, TokenStorage } from "@ai-platform/api-client";

const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";
const USER_KEY = "auth.user";

export const tokenStorage: TokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_KEY),
  async setTokens(tokens: StoredTokens): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};

export async function saveSession(result: AuthResult): Promise<void> {
  await tokenStorage.setTokens(result);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(result.user));
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
