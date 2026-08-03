import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListBatchesQuery, ListSiresQuery } from "@ai-platform/types";
import { catalogueApi } from "./api";

export function useSires(query: ListSiresQuery) {
  return useQuery({
    queryKey: ["catalogue-sires", query],
    queryFn: () => catalogueApi.listSires(query),
    placeholderData: keepPreviousData,
  });
}

export function useBatchesForSire(query: ListBatchesQuery) {
  return useQuery({
    queryKey: ["catalogue-batches", query],
    queryFn: () => catalogueApi.listBatches(query),
    enabled: Boolean(query.sireId),
  });
}
