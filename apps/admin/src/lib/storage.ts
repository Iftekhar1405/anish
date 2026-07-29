import type { StoredTokens, TokenStorage } from "@ai-platform/api-client";

const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";

// Admin ships as an Expo Web build only (see architecture.md) — SecureStore
// has no web implementation, so tokens live in localStorage instead. Guarded
// for the static-rendering pass, which runs outside a browser.
function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export const webTokenStorage: TokenStorage = {
  async getAccessToken() {
    return hasLocalStorage() ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
  },
  async getRefreshToken() {
    return hasLocalStorage() ? window.localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  },
  async setTokens(tokens: StoredTokens) {
    if (!hasLocalStorage()) return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  async clear() {
    if (!hasLocalStorage()) return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
