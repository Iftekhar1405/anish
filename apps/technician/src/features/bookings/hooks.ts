import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ListBookingsQuery } from "@ai-platform/types";
import { bookingsApi } from "./api";

const KEY = "assignments";

export function useAssignments(query: ListBookingsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => bookingsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => bookingsApi.getOne(id),
  });
}

export function useStartBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingsApi.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; serviceNotes?: string }) =>
      bookingsApi.complete(vars.id, vars.serviceNotes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
