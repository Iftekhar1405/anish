import { z } from "zod";

/* ------------------------------------------------------------------ enums */

export const SPECIES = ["CATTLE", "GOAT"] as const;
export type Species = (typeof SPECIES)[number];

export const FERTILITY_RATINGS = ["LOW", "MEDIUM", "HIGH"] as const;
export type FertilityRating = (typeof FERTILITY_RATINGS)[number];

export const ANIMAL_BREEDING_STATUSES = [
  "OPEN",
  "INSEMINATED",
  "PREGNANT",
  "CALVED",
] as const;
export type AnimalBreedingStatus = (typeof ANIMAL_BREEDING_STATUSES)[number];

/* --------------------------------------------------------------- entities */

export interface Breed {
  id: string;
  species: Species;
  name: string;
  code: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string | null;
  contact: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  state: string;
  code: string | null;
  createdAt: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  districtId: string;
  district?: { id: string; name: string; state: string } | null;
  isActive: boolean;
  createdAt: string;
}

export interface Sire {
  id: string;
  species: Species;
  name: string;
  breedId: string;
  breed?: { id: string; name: string; species: Species } | null;
  organizationId: string | null;
  organization?: { id: string; name: string } | null;
  fertilityRating: FertilityRating;
  diseaseFree: boolean;
  strawPriceMinor: number;
  isAvailable: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  geneticScore: number | null;
  milkYieldPotential: number | null;
  fatPct: number | null;
  growthIndex: number | null;
  createdAt: string;
}

export interface Batch {
  id: string;
  sireId: string;
  sire?: { id: string; name: string; species: Species } | null;
  batchNumber: string;
  producedOn: string | null;
  notes: string | null;
  quantityTotal: number;
  quantityAvailable: number;
  createdAt: string;
}

export interface BreedingHistoryEntry {
  id: string;
  animalId: string;
  bookingId: string;
  inseminationDate: string;
  notes: string | null;
  createdAt: string;
  booking?: {
    batch?: { sire?: { id: string; name: string; species: Species } | null } | null;
  } | null;
}

export interface Animal {
  id: string;
  farmerId: string;
  farmer?: { id: string; name: string; phone: string } | null;
  species: Species;
  breedId: string | null;
  breed?: { id: string; name: string; species: Species } | null;
  tag: string;
  ageMonths: number | null;
  breedingStatus: AnimalBreedingStatus;
  isActive: boolean;
  createdAt: string;
}

/* ----------------------------------------------------------- list queries */

export interface ListSiresQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  species?: Species;
  breedId?: string;
}

export interface ListBatchesQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sireId?: string;
}

export interface ListAnimalsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  farmerId?: string;
  species?: Species;
  breedingStatus?: AnimalBreedingStatus;
}

/* ---------------------------------------------------------- upload signing */

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/* --------------------------------------------------- shared field schemas */

const requiredText = (label: string, max = 80) =>
  z.string().trim().min(2, `${label} is required`).max(max);
const optionalText = (max = 80) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));
const optionalIntText = (label: string, max = 1_000_000) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || (/^\d+$/.test(v) && Number(v) <= max),
      `${label} must be a whole number`,
    )
    .transform((v) => (v ? Number(v) : undefined));
const optionalDecimalText = (label: string) =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^\d+(\.\d+)?$/.test(v), `${label} must be a number`)
    .transform((v) => (v ? Number(v) : undefined));
const requiredIntText = (label: string, max = 1_000_000) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (v) => /^\d+$/.test(v) && Number(v) <= max,
      `${label} must be a whole number`,
    )
    .transform((v) => Number(v));

const speciesSchema = z.enum(SPECIES);
const fertilitySchema = z.enum(FERTILITY_RATINGS);
const breedingStatusSchema = z.enum(ANIMAL_BREEDING_STATUSES);

/* ----------------------------------------------------------- form schemas */

// Breed
export const breedFormSchema = z.object({
  species: speciesSchema,
  name: requiredText("Name"),
  code: optionalText(20),
});
export type BreedFormInput = z.input<typeof breedFormSchema>;
export type BreedFormValues = z.output<typeof breedFormSchema>;

// Organization
export const organizationFormSchema = z.object({
  name: requiredText("Name"),
  code: optionalText(20),
  contact: optionalText(120),
});
export type OrganizationFormInput = z.input<typeof organizationFormSchema>;
export type OrganizationFormValues = z.output<typeof organizationFormSchema>;

// District
export const districtFormSchema = z.object({
  name: requiredText("Name"),
  state: requiredText("State"),
  code: optionalText(20),
});
export type DistrictFormInput = z.input<typeof districtFormSchema>;
export type DistrictFormValues = z.output<typeof districtFormSchema>;

// Service Area
export const serviceAreaFormSchema = z.object({
  name: requiredText("Name"),
  districtId: z.string().min(1, "District is required"),
});
export type ServiceAreaFormInput = z.input<typeof serviceAreaFormSchema>;
export type ServiceAreaFormValues = z.output<typeof serviceAreaFormSchema>;

// Sire (catalogue)
export const sireFormSchema = z.object({
  species: speciesSchema,
  name: requiredText("Name"),
  breedId: z.string().min(1, "Breed is required"),
  organizationId: z.string().optional().transform((v) => (v ? v : undefined)),
  fertilityRating: fertilitySchema,
  strawPriceMinor: requiredIntText("Straw price"),
  imageUrl: optionalText(500),
  imagePublicId: optionalText(200),
  // Cattle
  geneticScore: optionalDecimalText("Genetic score"),
  milkYieldPotential: optionalIntText("Milk yield"),
  fatPct: optionalDecimalText("Fat %"),
  // Goat
  growthIndex: optionalDecimalText("Growth index"),
});
export type SireFormInput = z.input<typeof sireFormSchema>;
export type SireFormValues = z.output<typeof sireFormSchema>;

// Batch (inventory)
export const batchFormSchema = z
  .object({
    sireId: z.string().min(1, "Sire is required"),
    batchNumber: z.string().trim().min(1, "Batch number is required").max(60),
    producedOn: optionalText(10),
    notes: optionalText(500),
    quantityTotal: requiredIntText("Total quantity"),
    quantityAvailable: requiredIntText("Available quantity"),
  })
  .refine((v) => v.quantityAvailable <= v.quantityTotal, {
    message: "Available cannot exceed total",
    path: ["quantityAvailable"],
  });
export type BatchFormInput = z.input<typeof batchFormSchema>;
export type BatchFormValues = z.output<typeof batchFormSchema>;

// Animal
export const animalFormSchema = z.object({
  farmerId: z.string().min(1, "Farmer is required"),
  species: speciesSchema,
  breedId: z.string().optional().transform((v) => (v ? v : undefined)),
  tag: z.string().trim().min(1, "Tag is required").max(60),
  ageMonths: optionalIntText("Age (months)", 600),
  breedingStatus: breedingStatusSchema,
});
export type AnimalFormInput = z.input<typeof animalFormSchema>;
export type AnimalFormValues = z.output<typeof animalFormSchema>;

// Animal (farmer self-service — no farmerId/breedingStatus, those are
// server-resolved or system-managed rather than farmer-editable).
export const farmerAnimalFormSchema = z.object({
  species: speciesSchema,
  breedId: z.string().optional().transform((v) => (v ? v : undefined)),
  tag: z.string().trim().min(1, "Tag is required").max(60),
  ageMonths: optionalIntText("Age (months)", 600),
});
export type FarmerAnimalFormInput = z.input<typeof farmerAnimalFormSchema>;
export type FarmerAnimalFormValues = z.output<typeof farmerAnimalFormSchema>;
