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

export const notificationsApi = {
  listMine: (q: ListNotificationsQuery) =>
    apiClient.get<PaginatedResult<AppNotification>>(`/notifications/me${toQuery(q)}`),
  markRead: (id: string) =>
    apiClient.patch<AppNotification>(`/notifications/${id}/read`, {}),
};
