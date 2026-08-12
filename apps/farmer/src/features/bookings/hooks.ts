import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListBookingsQuery } from "@ai-platform/types";
import { bookingsApi, type CreateBookingInput } from "./api";

const KEY = "my-bookings";

export function useMyBookings(query: ListBookingsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => bookingsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => bookingsApi.getOne(id),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
