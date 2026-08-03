import type { Breed, PaginatedResult, Species } from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export const breedsApi = {
  list: (q: { species?: Species; pageSize?: number }) =>
    apiClient.get<PaginatedResult<Breed>>(`/breeds${toQuery(q)}`),
};
