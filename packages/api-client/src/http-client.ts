export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  /**
   * Whether a refresh could even be attempted (i.e. a refresh token is stored).
   * Lets the client refresh *before* a request that would otherwise be a
   * guaranteed 401, instead of surfacing "Missing bearer token" to the user.
   */
  canRefresh?: () => boolean | Promise<boolean>;
  /**
   * Refreshes the session. Should persist the new tokens and return the new
   * access token, return `null` if the session is genuinely dead, or **throw**
   * `NetworkError` if it simply couldn't reach the server — a request that
   * failed because the device was offline must never end the session.
   */
  onUnauthorized?: () => Promise<string | null>;
  /**
   * Called once the session is definitively over (refresh returned `null`), so
   * the app can log out and route to the login screen rather than leaving the
   * user staring at auth errors.
   */
  onSessionExpired?: () => void | Promise<void>;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly error?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * The request never reached the server (no connectivity, DNS failure, timeout).
 * Deliberately *not* an `ApiError`: there's no status code, and callers must
 * not treat it as an authentication failure.
 */
export class NetworkError extends Error {
  constructor(
    message = "Can't reach the server. Check your connection and try again.",
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class ApiClient {
  private refreshInFlight: Promise<string | null> | null = null;

  constructor(private readonly config: ApiClientConfig) {}

  /**
   * Refreshes at most once at a time. Without this, the several queries a
   * screen fires on mount would each kick off their own refresh, and all but
   * one would be rejected as a reused token.
   */
  private refreshOnce(): Promise<string | null> {
    if (!this.config.onUnauthorized) return Promise.resolve(null);
    if (!this.refreshInFlight) {
      const attempt = this.config.onUnauthorized();
      this.refreshInFlight = attempt;
      void attempt
        .catch(() => null)
        .finally(() => {
          this.refreshInFlight = null;
        });
    }
    return this.refreshInFlight;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    let token = await this.config.getAccessToken?.();
    if (!token && !isRetry && (await this.config.canRefresh?.())) {
      token = await this.refreshOnce();
    }

    const headers = new Headers(init.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}${path}`, { ...init, headers });
    } catch (err) {
      throw new NetworkError(undefined, err);
    }

    if (response.status === 401 && !isRetry && this.config.onUnauthorized) {
      const refreshedToken = await this.refreshOnce();
      if (refreshedToken) {
        return this.request<T>(path, init, true);
      }
      await this.config.onSessionExpired?.();
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      throw new ApiError(
        response.status,
        body.message ?? response.statusText,
        body.error,
      );
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

/** User-facing message for any error a request can produce. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof NetworkError) return err.message;
  if (err instanceof ApiError) return err.message;
  // Anything reaching here is a client-side fault rather than a server reply.
  // Returning only `fallback` made those undiagnosable — a form would report
  // "Could not save species" with no hint that the request never even left the
  // device — so append whatever the error actually said.
  const detail =
    err instanceof Error && err.message
      ? err.message
      : typeof err === "string" && err
        ? err
        : "";
  return detail ? `${fallback}: ${detail}` : fallback;
}
