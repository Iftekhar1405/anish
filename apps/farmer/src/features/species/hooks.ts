import { useQuery } from "@tanstack/react-query";
import { speciesApi } from "./api";

/** The species a farmer can choose from — only the ones still offered. */
export function useSpecies() {
  return useQuery({
    queryKey: ["species", "active"],
    queryFn: () => speciesApi.list({ pageSize: 100, isActive: true }),
  });
}
