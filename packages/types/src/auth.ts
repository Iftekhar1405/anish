import { z } from "zod";
import type { UserRole } from "./role";

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  name: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginInput {
  phone: string;
  password: string;
  role: UserRole;
}

export interface RegisterInput {
  phone: string;
  name: string;
  password: string;
}

export interface RefreshInput {
  refreshToken: string;
}

/** Claims returned by GET /auth/me (decoded access-token payload). */
export interface AuthClaims {
  sub: string;
  role: UserRole;
  phone: string;
}

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, "Enter a valid phone number, e.g. +919876543210");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

export const nameSchema = z
  .string()
  .min(2, "Enter your name")
  .max(80, "Name is too long");

export const loginFormSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Enter your password"),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
