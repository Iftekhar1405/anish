import {
  createApiClient,
  createAuthApi,
  NetworkError,
} from "@ai-platform/api-client";
import { tokenStorage } from "./storage";

const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

// Registered by AuthProvider. A session that is genuinely over should end in a
// clean logout + redirect to login, not in every screen reporting an auth error.
let sessionExpiredHandler: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export const apiClient = createApiClient({
  baseUrl,
  getAccessToken: () => tokenStorage.getAccessToken(),
  // Lets the client refresh before a request that would otherwise be a
  // guaranteed 401 (e.g. the access token was dropped but the session is fine).
  canRefresh: async () => Boolean(await tokenStorage.getRefreshToken()),
  onUnauthorized: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const result = await authApi.refresh({ refreshToken });
      await tokenStorage.setTokens(result);
      return result.accessToken;
    } catch (err) {
      // Being offline (airplane mode, no signal) is not a logout — keep the
      // tokens so the session survives once connectivity comes back.
      if (err instanceof NetworkError) throw err;
      await tokenStorage.clear();
      return null;
    }
  },
  onSessionExpired: () => sessionExpiredHandler?.(),
});

export const authApi = createAuthApi(apiClient);
