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
  getOne: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),
  start: (id: string) => apiClient.patch<Booking>(`/bookings/${id}/start`, {}),
  complete: (id: string, serviceNotes?: string) =>
    apiClient.patch<Booking>(`/bookings/${id}/complete`, { serviceNotes }),
};
