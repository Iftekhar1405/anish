import type {
  Animal,
  AnimalBreedingStatus,
  BreedingHistoryEntry,
  PaginatedResult,
  Species,
} from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export interface ListMyAnimalsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  species?: Species;
  breedingStatus?: AnimalBreedingStatus;
}

/** Farmer self-service: farmerId is always resolved server-side from the JWT. */
export interface MyAnimalCreate {
  species: Species;
  breedId?: string;
  tag: string;
  ageMonths?: number;
}
export interface MyAnimalUpdate {
  breedId?: string;
  tag?: string;
  ageMonths?: number;
}

export const animalsApi = {
  list: (q: ListMyAnimalsQuery) =>
    apiClient.get<PaginatedResult<Animal>>(`/animals${toQuery(q)}`),
  getOne: (id: string) => apiClient.get<Animal>(`/animals/${id}`),
  create: (input: MyAnimalCreate) => apiClient.post<Animal>(`/animals`, input),
  update: (id: string, input: MyAnimalUpdate) =>
    apiClient.patch<Animal>(`/animals/${id}`, input),
  breedingHistory: (id: string) =>
    apiClient.get<BreedingHistoryEntry[]>(`/animals/${id}/breeding-history`),
};
