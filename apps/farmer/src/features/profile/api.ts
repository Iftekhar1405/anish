import type { UpdateProfileInput, UserSummary } from "@ai-platform/types";
import { apiClient } from "../../lib/api";

export const profileApi = {
  me: () => apiClient.get<UserSummary>(`/profile/me`),
  update: (input: UpdateProfileInput) =>
    apiClient.patch<UserSummary>(`/profile/me`, input),
  // Anonymises the account server-side and revokes every session.
  deleteAccount: () => apiClient.delete<void>(`/profile/me`),
};
