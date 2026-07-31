import type {
  AdminUserSummary,
  CreateAdminUserInput,
  ListQuery,
  PaginatedResult,
  UpdateAdminUserInput,
} from "@ai-platform/types";
import { apiClient } from "../../lib/api";

function toQueryString(query: ListQuery): string {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.search) params.set("search", query.search);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export const techniciansApi = {
  list: (query: ListQuery) =>
    apiClient.get<PaginatedResult<AdminUserSummary>>(`/admin/technicians${toQueryString(query)}`),
  create: (input: CreateAdminUserInput) =>
    apiClient.post<AdminUserSummary>("/admin/technicians", input),
  update: (id: string, input: UpdateAdminUserInput) =>
    apiClient.patch<AdminUserSummary>(`/admin/technicians/${id}`, input),
};
