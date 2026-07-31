import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateAdminUserInput, ListQuery, UpdateAdminUserInput } from "@ai-platform/types";
import { techniciansApi } from "./api";

const TECHNICIANS_KEY = "technicians";

export function useTechniciansQuery(query: ListQuery) {
  return useQuery({
    queryKey: [TECHNICIANS_KEY, query],
    queryFn: () => techniciansApi.list(query),
  });
}

export function useCreateTechnicianMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => techniciansApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TECHNICIANS_KEY] }),
  });
}

export function useUpdateTechnicianMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminUserInput }) =>
      techniciansApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TECHNICIANS_KEY] }),
  });
}
