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
}

export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  isActive?: boolean;
}

export interface CreateTechnicianInput {
  phone: string;
  name: string;
  password: string;
}

export const updateUserFormSchema = z.object({ name: nameSchema });
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

export const createTechnicianFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
export type CreateTechnicianFormValues = z.infer<typeof createTechnicianFormSchema>;
