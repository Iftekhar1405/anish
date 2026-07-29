import type {
  AuthTokens,
  AuthUser,
  RefreshInput,
  RequestOtpInput,
  RequestOtpResult,
  VerifyOtpInput,
  VerifyOtpResult,
} from "@ai-platform/types";
import type { ApiClient } from "./http-client";

export interface AuthApi {
  requestOtp(input: RequestOtpInput): Promise<RequestOtpResult>;
  verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult>;
  refresh(input: RefreshInput): Promise<AuthTokens>;
  logout(input: RefreshInput): Promise<void>;
  me(): Promise<AuthUser>;
}

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    requestOtp: (input) => client.post<RequestOtpResult>("/auth/otp/request", input),
    verifyOtp: (input) => client.post<VerifyOtpResult>("/auth/otp/verify", input),
    refresh: (input) => client.post<AuthTokens>("/auth/refresh", input),
    logout: (input) => client.post<void>("/auth/logout", input),
    me: () => client.get<AuthUser>("/auth/me"),
  };
}
