import type { PaginatedResult, Species } from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export const speciesApi = {
  list: (q: { pageSize?: number; isActive?: boolean }) =>
    apiClient.get<PaginatedResult<Species>>(`/species${toQuery(q)}`),
};
