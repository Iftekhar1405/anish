import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, LoginInput, RegisterInput } from "@ai-platform/types";
import { authApi, setSessionExpiredHandler } from "../lib/api";
import { getStoredUser, saveSession, tokenStorage } from "../lib/storage";

type Status = "loading" | "authed" | "guest";

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [refreshToken, storedUser] = await Promise.all([
        tokenStorage.getRefreshToken(),
        getStoredUser(),
      ]);
      if (!active) return;
      if (refreshToken && storedUser) {
        setUser(storedUser);
        setStatus("authed");
      } else {
        setStatus("guest");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // A request that comes back 401 *and* can't be refreshed means the session is
  // over: drop it here so the app routes back to login, instead of leaving the
  // user on a screen full of auth errors.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      void tokenStorage.clear();
      setUser(null);
      setStatus("guest");
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (input) => {
        const result = await authApi.login(input);
        await saveSession(result);
        setUser(result.user);
        setStatus("authed");
      },
      register: async (input) => {
        const result = await authApi.register(input);
        await saveSession(result);
        setUser(result.user);
        setStatus("authed");
      },
      logout: async () => {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          try {
            await authApi.logout({ refreshToken });
          } catch {
            // best-effort server-side revocation
          }
        }
        await tokenStorage.clear();
        setUser(null);
        setStatus("guest");
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
