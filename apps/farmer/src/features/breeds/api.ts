import type { Breed, PaginatedResult } from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export const breedsApi = {
  list: (q: { speciesId?: string; pageSize?: number }) =>
    apiClient.get<PaginatedResult<Breed>>(`/breeds${toQuery(q)}`),
};
