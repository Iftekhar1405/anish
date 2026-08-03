import type { District, PaginatedResult } from "@ai-platform/types";
import { apiClient } from "../../lib/api";

export const districtsApi = {
  list: () => apiClient.get<PaginatedResult<District>>(`/districts?pageSize=100`),
};
