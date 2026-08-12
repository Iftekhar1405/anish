import { useQuery } from "@tanstack/react-query";
import type { ConceptionReportQuery, DateRangeQuery } from "@ai-platform/types";
import { reportsApi } from "./api";

export function useInventoryReport() {
  return useQuery({
    queryKey: ["reports", "inventory"],
    queryFn: () => reportsApi.inventory(),
  });
}

export function useBookingsReport(query: DateRangeQuery) {
  return useQuery({
    queryKey: ["reports", "bookings", query],
    queryFn: () => reportsApi.bookings(query),
  });
}

export function useTechnicianPerformance(query: DateRangeQuery) {
  return useQuery({
    queryKey: ["reports", "technicians", query],
    queryFn: () => reportsApi.technicians(query),
  });
}

export function useConceptionReport(query: ConceptionReportQuery) {
  return useQuery({
    queryKey: ["reports", "conception", query],
    queryFn: () => reportsApi.conception(query),
  });
}
