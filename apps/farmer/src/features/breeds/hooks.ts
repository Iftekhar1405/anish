import { useQuery } from "@tanstack/react-query";
import type { Species } from "@ai-platform/types";
import { breedsApi } from "./api";

export function useBreeds(species?: Species) {
  return useQuery({
    queryKey: ["breeds", species],
    queryFn: () => breedsApi.list({ species, pageSize: 100 }),
  });
}
