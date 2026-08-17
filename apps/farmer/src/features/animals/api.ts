import type {
  Animal,
  AnimalBreedingStatus,
  BreedingHistoryEntry,
  PaginatedResult,
} from "@ai-platform/types";
import { apiClient } from "../../lib/api";
import { toQuery } from "../../lib/query";

export interface ListMyAnimalsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  speciesId?: string;
  breedingStatus?: AnimalBreedingStatus;
}

/** Farmer self-service: farmerId is always resolved server-side from the JWT. */
export interface MyAnimalCreate {
  speciesId: string;
  breedId?: string;
  /** Free-text breed, when the farmer's breed isn't in the master list. */
  breedOther?: string;
  tag: string;
  ageMonths?: number;
}
export interface MyAnimalUpdate {
  speciesId?: string;
  breedId?: string;
  breedOther?: string;
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
