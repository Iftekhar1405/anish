import { z } from "zod";

/* ------------------------------------------------------------------ enums */

/** Which extra sire details a species has — set per species by the admin. */
export const SPECIES_METRICS = ["DAIRY", "MEAT"] as const;
export type SpeciesMetrics = (typeof SPECIES_METRICS)[number];

export const SPECIES_METRICS_LABELS: Record<SpeciesMetrics, string> = {
  DAIRY: "Dairy — genetic score, milk yield, fat %",
  MEAT: "Meat — growth index",
};

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

/**
 * Admin-managed species (Cattle, Goat, …). Was a fixed enum; it's a master
 * list so an admin can add one without a release.
 */
export interface Species {
  id: string;
  name: string;
  code: string | null;
  metrics: SpeciesMetrics;
  isActive: boolean;
  createdAt: string;
}

/** How a species is embedded in the rows that reference it. */
export interface SpeciesRef {
  id: string;
  name: string;
  code?: string | null;
  metrics?: SpeciesMetrics;
}

export interface Breed {
  id: string;
  speciesId: string;
  species?: SpeciesRef | null;
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
  speciesId: string;
  species?: SpeciesRef | null;
  name: string;
  breedId: string;
  breed?: { id: string; name: string; speciesId: string } | null;
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
  sire?: { id: string; name: string; species?: SpeciesRef | null } | null;
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
    batch?: {
      sire?: { id: string; name: string; species?: SpeciesRef | null } | null;
    } | null;
  } | null;
}

export interface Animal {
  id: string;
  farmerId: string;
  farmer?: { id: string; name: string; phone: string } | null;
  speciesId: string;
  species?: SpeciesRef | null;
  breedId: string | null;
  breed?: { id: string; name: string; speciesId: string } | null;
  /** Free-text breed, used when the breed isn't in the master list. */
  breedOther: string | null;
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
  speciesId?: string;
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
  speciesId?: string;
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

const speciesIdSchema = z.string().min(1, "Species is required");
const fertilitySchema = z.enum(FERTILITY_RATINGS);
const breedingStatusSchema = z.enum(ANIMAL_BREEDING_STATUSES);

/* ----------------------------------------------------------- form schemas */

// Species
export const speciesFormSchema = z.object({
  name: requiredText("Name", 60),
  code: optionalText(20),
  metrics: z.enum(SPECIES_METRICS),
});
export type SpeciesFormInput = z.input<typeof speciesFormSchema>;
export type SpeciesFormValues = z.output<typeof speciesFormSchema>;

// Breed
export const breedFormSchema = z.object({
  speciesId: speciesIdSchema,
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
  speciesId: speciesIdSchema,
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
//
// Breed is either picked from the master list (`breedId`) or typed by hand.
// Farmers routinely don't know the registered breed, so the Select carries an
// extra "Other" entry with this sentinel value; picking it reveals a free-text
// field and the schema swaps the two over on output.
export const OTHER_BREED_VALUE = "__other__";

const breedChoiceFields = {
  breedId: z.string().optional(),
  breedOther: z.string().trim().max(60).optional(),
};

function refineBreedChoice(
  value: { breedId?: string; breedOther?: string },
  ctx: z.RefinementCtx,
): void {
  if (value.breedId === OTHER_BREED_VALUE && !value.breedOther?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Type the breed name",
      path: ["breedOther"],
    });
  }
}

function transformBreedChoice<T extends { breedId?: string; breedOther?: string }>(
  value: T,
): Omit<T, "breedId" | "breedOther"> & { breedId: string; breedOther: string } {
  const isOther = value.breedId === OTHER_BREED_VALUE;
  // Empty strings rather than `undefined`: an absent key tells the server to
  // leave the breed alone, so clearing it back to "not sure" has to be sent
  // explicitly.
  return {
    ...value,
    breedId: isOther ? "" : (value.breedId ?? ""),
    breedOther: isOther ? (value.breedOther?.trim() ?? "") : "",
  };
}

export const animalFormSchema = z
  .object({
    farmerId: z.string().min(1, "Farmer is required"),
    speciesId: speciesIdSchema,
    ...breedChoiceFields,
    tag: z.string().trim().min(1, "Tag / number / name is required").max(60),
    ageMonths: optionalIntText("Age (months)", 600),
    breedingStatus: breedingStatusSchema,
  })
  .superRefine(refineBreedChoice)
  .transform(transformBreedChoice);
export type AnimalFormInput = z.input<typeof animalFormSchema>;
export type AnimalFormValues = z.output<typeof animalFormSchema>;

// Animal (farmer self-service — no farmerId/breedingStatus, those are
// server-resolved or system-managed rather than farmer-editable).
export const farmerAnimalFormSchema = z
  .object({
    speciesId: speciesIdSchema,
    ...breedChoiceFields,
    tag: z.string().trim().min(1, "Tag / number / name is required").max(60),
    ageMonths: optionalIntText("Age (months)", 600),
  })
  .superRefine(refineBreedChoice)
  .transform(transformBreedChoice);
export type FarmerAnimalFormInput = z.input<typeof farmerAnimalFormSchema>;
export type FarmerAnimalFormValues = z.output<typeof farmerAnimalFormSchema>;

/**
 * Turns an animal's stored breed into the Select value + free-text pair the
 * forms above expect, so opening "Edit" round-trips a hand-typed breed.
 */
export function toBreedChoice(animal: {
  breedId: string | null;
  breedOther: string | null;
}): { breedId: string; breedOther: string } {
  if (animal.breedOther) {
    return { breedId: OTHER_BREED_VALUE, breedOther: animal.breedOther };
  }
  return { breedId: animal.breedId ?? "", breedOther: "" };
}

/** What to show in a list/detail view for an animal's breed. */
export function breedLabel(animal: {
  breed?: { name: string } | null;
  breedOther: string | null;
}): string {
  return animal.breed?.name ?? animal.breedOther ?? "—";
}
