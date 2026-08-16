import { z } from "zod";
import type { UserRole } from "./role";
import { nameSchema, passwordSchema, phoneSchema } from "./auth";

export interface UserSummary {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  address: string | null;
  districtId: string | null;
  district: { id: string; name: string; state: string } | null;
  serviceAreaId: string | null;
  serviceArea: { id: string; name: string; districtId: string } | null;
}

export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  districtId?: string;
}

export interface UpdateUserInput {
  name?: string;
  isActive?: boolean;
  address?: string;
  districtId?: string;
  serviceAreaId?: string;
}

export interface UpdateProfileInput {
  address?: string;
  districtId?: string;
}

export const updateProfileFormSchema = z.object({
  address: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  districtId: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type UpdateProfileFormInput = z.input<typeof updateProfileFormSchema>;
export type UpdateProfileFormValues = z.output<typeof updateProfileFormSchema>;

export interface CreateTechnicianInput {
  phone: string;
  name: string;
  password: string;
}

export const updateUserFormSchema = z.object({ name: nameSchema });
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

/**
 * Admin-side farmer edit. Carries the farmer's location, which is what the
 * admin needs when assigning a technician and what the technician travels to.
 */
export const updateFarmerFormSchema = z.object({
  name: nameSchema,
  address: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  districtId: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type UpdateFarmerFormInput = z.input<typeof updateFarmerFormSchema>;
export type UpdateFarmerFormValues = z.output<typeof updateFarmerFormSchema>;

export const updateTechnicianFormSchema = z.object({
  name: nameSchema,
  serviceAreaId: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type UpdateTechnicianFormInput = z.input<typeof updateTechnicianFormSchema>;
export type UpdateTechnicianFormValues = z.output<typeof updateTechnicianFormSchema>;

export const createTechnicianFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
export type CreateTechnicianFormValues = z.infer<typeof createTechnicianFormSchema>;
