import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { animalsApi, type ListMyAnimalsQuery, type MyAnimalCreate, type MyAnimalUpdate } from "./api";

const KEY = "my-animals";

export function useMyAnimals(query: ListMyAnimalsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => animalsApi.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateMyAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MyAnimalCreate) => animalsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateMyAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: MyAnimalUpdate }) =>
      animalsApi.update(vars.id, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => animalsApi.getOne(id),
  });
}

export function useBreedingHistory(id: string) {
  return useQuery({
    queryKey: [KEY, "breeding-history", id],
    queryFn: () => animalsApi.breedingHistory(id),
  });
}
