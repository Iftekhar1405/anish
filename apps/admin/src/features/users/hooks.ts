import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CreateTechnicianInput,
  ListUsersQuery,
  UpdateUserInput,
} from "@ai-platform/types";
import { usersApi } from "./api";

export function useFarmers(query: ListUsersQuery) {
  return useQuery({
    queryKey: ["farmers", query],
    queryFn: () => usersApi.listFarmers(query),
    placeholderData: keepPreviousData,
  });
}

export function useTechnicians(query: ListUsersQuery) {
  return useQuery({
    queryKey: ["technicians", query],
    queryFn: () => usersApi.listTechnicians(query),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateFarmer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateUserInput }) =>
      usersApi.updateFarmer(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["farmers"] }),
  });
}

export function useUpdateTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateUserInput }) =>
      usersApi.updateTechnician(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["technicians"] }),
  });
}

export function useCreateTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTechnicianInput) =>
      usersApi.createTechnician(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["technicians"] }),
  });
}
