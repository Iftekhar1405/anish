import { useQuery } from "@tanstack/react-query";
import { breedsApi } from "./api";

export function useBreeds(speciesId?: string) {
  return useQuery({
    queryKey: ["breeds", speciesId],
    // No species picked yet means there's no meaningful breed list to show.
    enabled: Boolean(speciesId),
    queryFn: () => breedsApi.list({ speciesId, pageSize: 100 }),
  });
}
