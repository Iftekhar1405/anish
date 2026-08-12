import type { UpdateProfileInput, UserSummary } from "@ai-platform/types";
import { apiClient } from "../../lib/api";

export const profileApi = {
  me: () => apiClient.get<UserSummary>(`/profile/me`),
  update: (input: UpdateProfileInput) =>
    apiClient.patch<UserSummary>(`/profile/me`, input),
};
