import { z } from "zod";
import type { UserRole } from "./role";

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
  name: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** ISO timestamp the access token expires at. */
  accessTokenExpiresAt: string;
}

export interface VerifyOtpResult extends AuthTokens {
  user: AuthUser;
}

export interface RequestOtpResult {
  message: string;
  retryAfterSeconds: number;
  /** Only present outside production — lets clients/tests complete the flow without a real SMS provider. */
  devCode?: string;
}

export interface RequestOtpInput {
  phone: string;
  role: UserRole;
}

export interface VerifyOtpInput {
  phone: string;
  role: UserRole;
  code: string;
}

export interface RefreshInput {
  refreshToken: string;
}

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, "Enter a valid phone number, e.g. +919876543210");

export const otpCodeSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

/** Form-level schema — role/phone-role pairing is attached by the api-client, not entered by the user. */
export const requestOtpFormSchema = z.object({ phone: phoneSchema });
export type RequestOtpFormValues = z.infer<typeof requestOtpFormSchema>;

export const verifyOtpFormSchema = z.object({ code: otpCodeSchema });
export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>;
