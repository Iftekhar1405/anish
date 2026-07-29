import * as SecureStore from "expo-secure-store";
import type { StoredTokens, TokenStorage } from "@ai-platform/api-client";

const ACCESS_TOKEN_KEY = "farmer_access_token";
const REFRESH_TOKEN_KEY = "farmer_refresh_token";

export const secureTokenStorage: TokenStorage = {
  getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async setTokens(tokens: StoredTokens) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
