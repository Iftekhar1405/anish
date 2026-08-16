import type {
  CreateTechnicianInput,
  ListUsersQuery,
  PaginatedResult,
  UpdateUserInput,
  UserSummary,
} from "@ai-platform/types";
import { apiClient } from "../../lib/api";

function toQuery(params: ListUsersQuery): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.search) sp.set("search", params.search);
  if (params.isActive !== undefined) sp.set("isActive", String(params.isActive));
  // Powers the assign picker: technicians whose service area is in the
  // farmer's district. Without this the filter silently did nothing.
  if (params.districtId) sp.set("districtId", params.districtId);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export const usersApi = {
  listFarmers: (q: ListUsersQuery) =>
    apiClient.get<PaginatedResult<UserSummary>>(`/farmers${toQuery(q)}`),
  listTechnicians: (q: ListUsersQuery) =>
    apiClient.get<PaginatedResult<UserSummary>>(`/technicians${toQuery(q)}`),
  updateFarmer: (id: string, input: UpdateUserInput) =>
    apiClient.patch<UserSummary>(`/farmers/${id}`, input),
  updateTechnician: (id: string, input: UpdateUserInput) =>
    apiClient.patch<UserSummary>(`/technicians/${id}`, input),
  createTechnician: (input: CreateTechnicianInput) =>
    apiClient.post<UserSummary>(`/technicians`, input),
};
