import type { Booking, ListBookingsQuery, PaginatedResult } from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export interface CreateBookingInput {
  animalId: string;
  batchId: string;
  preferredDate: string;
  /** Where the technician should come for this visit. */
  location?: string;
  notes?: string;
}

export const bookingsApi = {
  list: (q: ListBookingsQuery) =>
    apiClient.get<PaginatedResult<Booking>>(`/bookings${toQuery(q)}`),
  getOne: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),
  create: (input: CreateBookingInput) => apiClient.post<Booking>(`/bookings`, input),
};
