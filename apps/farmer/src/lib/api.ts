import { createApiClient, createAuthApi } from "@ai-platform/api-client";
import { secureTokenStorage } from "./storage";

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

export const tokenStorage = secureTokenStorage;

export const apiClient = createApiClient({
  baseUrl,
  getAccessToken: () => tokenStorage.getAccessToken(),
  onUnauthorized: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const tokens = await authApi.refresh({ refreshToken });
      await tokenStorage.setTokens(tokens);
      return tokens.accessToken;
    } catch {
      await tokenStorage.clear();
      return null;
    }
  },
});

export const authApi = createAuthApi(apiClient);
