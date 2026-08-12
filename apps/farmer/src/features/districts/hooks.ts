import { useQuery } from "@tanstack/react-query";
import { districtsApi } from "./api";

export function useDistricts() {
  return useQuery({
    queryKey: ["districts"],
    queryFn: () => districtsApi.list(),
  });
}
