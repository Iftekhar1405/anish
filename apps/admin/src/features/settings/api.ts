import type { AppSettings, UpdateSettingsInput } from "@ai-platform/types";
import { apiClient } from "../../lib/api";

export const settingsApi = {
  get: () => apiClient.get<AppSettings>(`/settings`),
  update: (input: UpdateSettingsInput) => apiClient.patch<AppSettings>(`/settings`, input),
};
