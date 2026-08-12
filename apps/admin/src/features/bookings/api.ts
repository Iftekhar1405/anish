import type { Booking, ListBookingsQuery, PaginatedResult } from "@ai-platform/types";
import { apiClient } from "../../lib/api";

function toQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const bookingsApi = {
  list: (q: ListBookingsQuery) =>
    apiClient.get<PaginatedResult<Booking>>(`/bookings${toQuery(q)}`),
  assign: (id: string, technicianId: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/assign`, { technicianId }),
};
