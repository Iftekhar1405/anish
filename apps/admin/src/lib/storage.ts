import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { AuthResult, AuthUser } from "@ai-platform/types";
import type { StoredTokens, TokenStorage } from "@ai-platform/api-client";

const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";
const USER_KEY = "auth.user";

interface KeyValueStore {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

/**
 * `expo-secure-store` ships no web implementation: in a browser every call
 * lands on a stub and throws `getValueWithKeyAsync is not a function`, which
 * happens during the very first session read and takes the whole app down
 * before the login screen renders. The admin app is the adaptive one (it is
 * meant to run on web as well as phones), so it needs a web-safe backend.
 *
 * `localStorage` is the right trade here — the keychain simply doesn't exist on
 * web, and this matches what `architecture.md` already describes.
 */
const webStore: KeyValueStore = {
  getItemAsync: async (key) =>
    typeof localStorage === "undefined" ? null : localStorage.getItem(key),
  setItemAsync: async (key, value) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
  deleteItemAsync: async (key) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  },
};

const nativeStore: KeyValueStore = {
  getItemAsync: (key) => SecureStore.getItemAsync(key),
  setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
};

const store: KeyValueStore = Platform.OS === "web" ? webStore : nativeStore;

export const tokenStorage: TokenStorage = {
  getAccessToken: () => store.getItemAsync(ACCESS_KEY),
  getRefreshToken: () => store.getItemAsync(REFRESH_KEY),
  async setTokens(tokens: StoredTokens): Promise<void> {
    await store.setItemAsync(ACCESS_KEY, tokens.accessToken);
    await store.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  },
  async clear(): Promise<void> {
    await store.deleteItemAsync(ACCESS_KEY);
    await store.deleteItemAsync(REFRESH_KEY);
    await store.deleteItemAsync(USER_KEY);
  },
};

export async function saveSession(result: AuthResult): Promise<void> {
  await tokenStorage.setTokens(result);
  await store.setItemAsync(USER_KEY, JSON.stringify(result.user));
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await store.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
