import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@ai-platform/types";
import { authApi, tokenStorage } from "../lib/api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface RequestOtpResult {
  retryAfterSeconds: number;
  devCode?: string;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  requestOtp: (phone: string) => Promise<RequestOtpResult>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE = "FARMER" as const;

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    void hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function hydrate(): Promise<void> {
    const accessToken = await tokenStorage.getAccessToken();
    if (!accessToken) {
      setStatus("unauthenticated");
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
      setStatus("authenticated");
    } catch {
      await tokenStorage.clear();
      setStatus("unauthenticated");
    }
  }

  async function requestOtp(phone: string): Promise<RequestOtpResult> {
    const result = await authApi.requestOtp({ phone, role: ROLE });
    return { retryAfterSeconds: result.retryAfterSeconds, devCode: result.devCode };
  }

  async function verifyOtp(phone: string, code: string): Promise<void> {
    const result = await authApi.verifyOtp({ phone, role: ROLE, code });
    await tokenStorage.setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    setUser(result.user);
    setStatus("authenticated");
  }

  async function logout(): Promise<void> {
    const refreshToken = await tokenStorage.getRefreshToken();
    await tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
    if (refreshToken) {
      await authApi.logout({ refreshToken }).catch(() => undefined);
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, requestOtp, verifyOtp, logout }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
