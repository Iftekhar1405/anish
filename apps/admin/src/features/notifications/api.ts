import type { AppNotification, ListNotificationsQuery, PaginatedResult } from "@ai-platform/types";
import { apiClient } from "../../lib/api";

function toQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export interface BroadcastInput {
  title: string;
  body: string;
  role?: string;
}

export const notificationsApi = {
  listAll: (q: ListNotificationsQuery) =>
    apiClient.get<PaginatedResult<AppNotification>>(`/notifications${toQuery(q)}`),
  broadcast: (input: BroadcastInput) =>
    apiClient.post<{ recipients: number }>(`/notifications/broadcast`, input),
};
