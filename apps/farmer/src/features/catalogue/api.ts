import type { Batch, ListBatchesQuery, ListSiresQuery, PaginatedResult, Sire } from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export const catalogueApi = {
  listSires: (q: ListSiresQuery) =>
    apiClient.get<PaginatedResult<Sire>>(`/catalogue/sires${toQuery(q)}`),
  listBatches: (q: ListBatchesQuery) =>
    apiClient.get<PaginatedResult<Batch>>(`/batches${toQuery(q)}`),
};
