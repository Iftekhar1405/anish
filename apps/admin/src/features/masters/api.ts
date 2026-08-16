import type {
  Animal,
  Batch,
  Breed,
  District,
  ListAnimalsQuery,
  ListBatchesQuery,
  ListSiresQuery,
  Organization,
  PaginatedResult,
  ServiceArea,
  Sire,
  Species,
  UploadSignature,
} from "@ai-platform/types";
import { apiClient } from "../../lib/api";

/* ---------------------------------------------------------------- helpers */

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** Serializes a flat query object, dropping empty/undefined values. */
function toQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/* --------------------------------------------------------- request shapes */

export interface BreedCreate {
  species: Species;
  name: string;
  code?: string;
}
export interface BreedUpdate {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export interface OrganizationCreate {
  name: string;
  code?: string;
  contact?: string;
}
export interface OrganizationUpdate extends OrganizationCreate {
  isActive?: boolean;
}

export interface DistrictCreate {
  name: string;
  state: string;
  code?: string;
}
export type DistrictUpdate = DistrictCreate;

export interface ServiceAreaCreate {
  name: string;
  districtId: string;
}
export interface ServiceAreaUpdate {
  name?: string;
  isActive?: boolean;
}

export interface SireCreate {
  species: Species;
  name: string;
  breedId: string;
  organizationId?: string;
  fertilityRating: Sire["fertilityRating"];
  strawPriceMinor: number;
  imageUrl?: string;
  imagePublicId?: string;
  geneticScore?: number;
  milkYieldPotential?: number;
  fatPct?: number;
  growthIndex?: number;
}
export type SireUpdate = Partial<SireCreate> & { isAvailable?: boolean };

export interface BatchCreate {
  sireId: string;
  batchNumber: string;
  producedOn?: string;
  notes?: string;
  quantityTotal: number;
  quantityAvailable: number;
}
export interface BatchUpdate {
  batchNumber?: string;
  producedOn?: string;
  notes?: string;
  quantityTotal?: number;
  quantityAvailable?: number;
}

export interface AnimalCreate {
  farmerId: string;
  species: Species;
  breedId?: string;
  /** Free-text breed, when the farmer's breed isn't in the master list. */
  breedOther?: string;
  tag: string;
  ageMonths?: number;
  breedingStatus?: Animal["breedingStatus"];
}
export interface AnimalUpdate {
  species?: Species;
  breedId?: string;
  breedOther?: string;
  tag?: string;
  ageMonths?: number;
  breedingStatus?: Animal["breedingStatus"];
  isActive?: boolean;
}

/* ------------------------------------------------------------------- apis */

export const mastersApi = {
  // breeds
  listBreeds: (q: ListParams) =>
    apiClient.get<PaginatedResult<Breed>>(`/breeds${toQuery(q)}`),
  createBreed: (input: BreedCreate) =>
    apiClient.post<Breed>(`/breeds`, input),
  updateBreed: (id: string, input: BreedUpdate) =>
    apiClient.patch<Breed>(`/breeds/${id}`, input),

  // organizations
  listOrganizations: (q: ListParams) =>
    apiClient.get<PaginatedResult<Organization>>(`/organizations${toQuery(q)}`),
  createOrganization: (input: OrganizationCreate) =>
    apiClient.post<Organization>(`/organizations`, input),
  updateOrganization: (id: string, input: OrganizationUpdate) =>
    apiClient.patch<Organization>(`/organizations/${id}`, input),

  // districts
  listDistricts: (q: ListParams) =>
    apiClient.get<PaginatedResult<District>>(`/districts${toQuery(q)}`),
  createDistrict: (input: DistrictCreate) =>
    apiClient.post<District>(`/districts`, input),
  updateDistrict: (id: string, input: DistrictUpdate) =>
    apiClient.patch<District>(`/districts/${id}`, input),

  // service areas
  listServiceAreas: (q: ListParams) =>
    apiClient.get<PaginatedResult<ServiceArea>>(`/service-areas${toQuery(q)}`),
  createServiceArea: (input: ServiceAreaCreate) =>
    apiClient.post<ServiceArea>(`/service-areas`, input),
  updateServiceArea: (id: string, input: ServiceAreaUpdate) =>
    apiClient.patch<ServiceArea>(`/service-areas/${id}`, input),

  // catalogue (sires)
  listSires: (q: ListSiresQuery) =>
    apiClient.get<PaginatedResult<Sire>>(`/catalogue/sires${toQuery(q)}`),
  createSire: (input: SireCreate) =>
    apiClient.post<Sire>(`/catalogue/sires`, input),
  updateSire: (id: string, input: SireUpdate) =>
    apiClient.patch<Sire>(`/catalogue/sires/${id}`, input),

  // inventory (batches)
  listBatches: (q: ListBatchesQuery) =>
    apiClient.get<PaginatedResult<Batch>>(`/batches${toQuery(q)}`),
  createBatch: (input: BatchCreate) =>
    apiClient.post<Batch>(`/batches`, input),
  updateBatch: (id: string, input: BatchUpdate) =>
    apiClient.patch<Batch>(`/batches/${id}`, input),

  // animals
  listAnimals: (q: ListAnimalsQuery) =>
    apiClient.get<PaginatedResult<Animal>>(`/animals${toQuery(q)}`),
  createAnimal: (input: AnimalCreate) =>
    apiClient.post<Animal>(`/animals`, input),
  updateAnimal: (id: string, input: AnimalUpdate) =>
    apiClient.patch<Animal>(`/animals/${id}`, input),

  // cloudinary signing
  signUpload: (folder?: string) =>
    apiClient.post<UploadSignature>(`/uploads/signature`, folder ? { folder } : {}),
};
