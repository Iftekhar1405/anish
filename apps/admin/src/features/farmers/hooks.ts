import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateAdminUserInput, ListQuery, UpdateAdminUserInput } from "@ai-platform/types";
import { farmersApi } from "./api";

const FARMERS_KEY = "farmers";

export function useFarmersQuery(query: ListQuery) {
  return useQuery({
    queryKey: [FARMERS_KEY, query],
    queryFn: () => farmersApi.list(query),
  });
}

export function useCreateFarmerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => farmersApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FARMERS_KEY] }),
  });
}

export function useUpdateFarmerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminUserInput }) =>
      farmersApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [FARMERS_KEY] }),
  });
}
