import type {
  BookingsReport,
  ConceptionReport,
  ConceptionReportQuery,
  DateRangeQuery,
  InventoryReport,
  TechnicianPerformanceEntry,
} from "@ai-platform/types";
import { apiClient } from "../../lib/api";

function toQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const reportsApi = {
  inventory: () => apiClient.get<InventoryReport>(`/reports/inventory`),
  bookings: (q: DateRangeQuery) =>
    apiClient.get<BookingsReport>(`/reports/bookings${toQuery(q)}`),
  technicians: (q: DateRangeQuery) =>
    apiClient.get<TechnicianPerformanceEntry[]>(`/reports/technicians${toQuery(q)}`),
  conception: (q: ConceptionReportQuery) =>
    apiClient.get<ConceptionReport>(`/reports/conception${toQuery(q)}`),
};
