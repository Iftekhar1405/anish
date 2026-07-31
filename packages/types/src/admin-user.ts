import { z } from "zod";
import type { UserRole } from "./role";
import { phoneSchema } from "./auth";

export interface AdminUserSummary {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateAdminUserInput {
  phone: string;
  name: string;
}

export interface UpdateAdminUserInput {
  name?: string;
  isActive?: boolean;
}

const nameSchema = z.string().trim().min(2, "Enter a name").max(120);

export const createAdminUserFormSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
});
export type CreateAdminUserFormValues = z.infer<typeof createAdminUserFormSchema>;

export const updateAdminUserFormSchema = z.object({
  name: nameSchema,
});
export type UpdateAdminUserFormValues = z.infer<typeof updateAdminUserFormSchema>;
