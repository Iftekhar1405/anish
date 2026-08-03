import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListBookingsQuery } from "@ai-platform/types";
import { bookingsApi } from "./api";

const KEY = "admin-bookings";

export function useBookings(query: ListBookingsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => bookingsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useAssignBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; technicianId: string }) =>
      bookingsApi.assign(vars.id, vars.technicianId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
