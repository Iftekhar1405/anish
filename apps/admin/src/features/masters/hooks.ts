import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { PaginatedResult } from "@ai-platform/types";
import {
  mastersApi,
  type AnimalCreate,
  type AnimalUpdate,
  type BatchCreate,
  type BatchUpdate,
  type BreedCreate,
  type BreedUpdate,
  type DistrictCreate,
  type DistrictUpdate,
  type OrganizationCreate,
  type OrganizationUpdate,
  type ServiceAreaCreate,
  type ServiceAreaUpdate,
  type SireCreate,
  type SireUpdate,
  type SpeciesCreate,
  type SpeciesUpdate,
} from "./api";

interface CrudApi<T, LQ, C, U> {
  list: (q: LQ) => Promise<PaginatedResult<T>>;
  create: (input: C) => Promise<T>;
  update: (id: string, input: U) => Promise<T>;
}

/** Builds list/create/update hooks for one master resource against a query key. */
function makeCrudHooks<T, LQ, C, U>(key: string, api: CrudApi<T, LQ, C, U>) {
  const useList = (query: LQ) =>
    useQuery({
      queryKey: [key, query],
      queryFn: () => api.list(query),
      placeholderData: keepPreviousData,
    });

  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (input: C) => api.create(input),
      onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
    });
  };

  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (vars: { id: string; input: U }) =>
        api.update(vars.id, vars.input),
      onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
    });
  };

  return { useList, useCreate, useUpdate };
}

export const species = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listSpecies>>["items"][number],
  Parameters<typeof mastersApi.listSpecies>[0],
  SpeciesCreate,
  SpeciesUpdate
>("species", {
  list: mastersApi.listSpecies,
  create: mastersApi.createSpecies,
  update: mastersApi.updateSpecies,
});

export const breeds = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listBreeds>>["items"][number],
  Parameters<typeof mastersApi.listBreeds>[0],
  BreedCreate,
  BreedUpdate
>("breeds", {
  list: mastersApi.listBreeds,
  create: mastersApi.createBreed,
  update: mastersApi.updateBreed,
});

export const organizations = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listOrganizations>>["items"][number],
  Parameters<typeof mastersApi.listOrganizations>[0],
  OrganizationCreate,
  OrganizationUpdate
>("organizations", {
  list: mastersApi.listOrganizations,
  create: mastersApi.createOrganization,
  update: mastersApi.updateOrganization,
});

export const districts = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listDistricts>>["items"][number],
  Parameters<typeof mastersApi.listDistricts>[0],
  DistrictCreate,
  DistrictUpdate
>("districts", {
  list: mastersApi.listDistricts,
  create: mastersApi.createDistrict,
  update: mastersApi.updateDistrict,
});

export const serviceAreas = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listServiceAreas>>["items"][number],
  Parameters<typeof mastersApi.listServiceAreas>[0],
  ServiceAreaCreate,
  ServiceAreaUpdate
>("service-areas", {
  list: mastersApi.listServiceAreas,
  create: mastersApi.createServiceArea,
  update: mastersApi.updateServiceArea,
});

export const sires = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listSires>>["items"][number],
  Parameters<typeof mastersApi.listSires>[0],
  SireCreate,
  SireUpdate
>("sires", {
  list: mastersApi.listSires,
  create: mastersApi.createSire,
  update: mastersApi.updateSire,
});

export const batches = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listBatches>>["items"][number],
  Parameters<typeof mastersApi.listBatches>[0],
  BatchCreate,
  BatchUpdate
>("batches", {
  list: mastersApi.listBatches,
  create: mastersApi.createBatch,
  update: mastersApi.updateBatch,
});

export const animals = makeCrudHooks<
  Awaited<ReturnType<typeof mastersApi.listAnimals>>["items"][number],
  Parameters<typeof mastersApi.listAnimals>[0],
  AnimalCreate,
  AnimalUpdate
>("animals", {
  list: mastersApi.listAnimals,
  create: mastersApi.createAnimal,
  update: mastersApi.updateAnimal,
});
