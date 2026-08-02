import type {
  AuthClaims,
  AuthResult,
  LoginInput,
  RefreshInput,
  RegisterInput,
} from "@ai-platform/types";
import type { ApiClient } from "./http-client";

export interface AuthApi {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  refresh(input: RefreshInput): Promise<AuthResult>;
  logout(input: RefreshInput): Promise<void>;
  me(): Promise<AuthClaims>;
}

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    register: (input) => client.post<AuthResult>("/auth/register", input),
    login: (input) => client.post<AuthResult>("/auth/login", input),
    refresh: (input) => client.post<AuthResult>("/auth/refresh", input),
    logout: (input) => client.post<void>("/auth/logout", input),
    me: () => client.get<AuthClaims>("/auth/me"),
  };
}
