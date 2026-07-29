# memory.md — AI Management Platform (Living Document)

> Update after **every** implementation session.

---

## Project Overview

Production-grade Artificial Insemination Management Platform for **cattle and goats**, built to scale to thousands of farmers across multiple states. **Three independent Expo (React Native) apps** — Admin (Expo Web, desktop-first), Farmer (mobile), Technician (mobile) — sharing **one NestJS backend** with **PostgreSQL/Prisma**, **Cloudinary** media, **FCM** push, **Google Maps**, **JWT + OTP** auth.

---

## Current Phase

**Phase 2 — Authentication (OTP + JWT + Roles).** Built and verified by every means possible in this environment (typecheck, build, unit tests, bundling). **Not yet verified end-to-end against a live database** — Docker/Postgres still isn't running (see Known Issues); the user explicitly chose to proceed into Phase 2 without closing that Phase 1 gap. That live-DB check (login working through a real Postgres instance) is the one remaining item before Phase 2 can be called fully done per rules.md's "verify and test before proceeding."

---

## Completed Work

- PRD.md, architecture.md, rules.md, phases.md, design.md, memory.md authored (Phase 0). Docs moved to `docs/` per architecture.md's repo layout.
- Refinements applied: all three apps → **Expo/React Native**; **Cloudinary** replaces AWS S3; **Docker used only for local PostgreSQL**.
- **Phase 1 scaffold built:**
  - Root: pnpm workspace (`pnpm-workspace.yaml`), Turborepo (`turbo.json`), base tsconfig, root `.gitignore`.
  - `packages/config`: shared `tsconfig.base.json` / `tsconfig.react-native.json`, ESLint preset (legacy `.eslintrc`-style — **not yet flat-config**, see Known Issues), NativeWind/Tailwind preset with design.md tokens.
  - `server/`: NestJS 11 app (`nest new`), TS strict mode enabled, Prisma 6 wired via a global `PrismaModule`/`PrismaService`, `GET /api/v1/health` pings the DB, `ConfigModule` loads `.env`.
  - `apps/admin`, `apps/farmer`, `apps/technician`: scaffolded via `create-expo-app@latest` (Expo SDK 57, RN 0.86, React 19.2.3), restructured to match architecture.md. NativeWind wired in all three.
  - `docker/postgres/docker-compose.yml`: Postgres 16-alpine service with healthcheck, `.env.example`.
- **Phase 2 built (this session):**
  - **Prisma schema**: `Role` enum (ADMIN/FARMER/TECHNICIAN), `User` (unique on `[phone, role]` — same phone can hold one account per role), `OtpCode` (hashed code, attempts, expiry), `RefreshToken` (hashed, revocable, rotation-tracked). Schema validated and client generated (`prisma validate`/`generate` don't require a live DB connection); **migration not yet created** since Postgres isn't running.
  - **`server/src/auth/`**: `AuthService` (OTP request/verify, JWT access+refresh issuance, refresh rotation with reuse detection that revokes the whole chain, logout, `getCurrentUser`), `AuthController` (`POST /auth/otp/request`, `/otp/verify`, `/refresh`, `/logout`, `GET /auth/me`), `JwtAuthGuard` + `RolesGuard` + `@Roles()`/`@CurrentUser()` decorators. OTP codes and refresh-token identifiers are hashed at rest via Node's built-in `scrypt` (`src/common/crypto.util.ts`) — no bcrypt dependency needed. OTP delivery is a swappable `OtpProvider` interface; `ConsoleOtpProvider` (dev-mode, logs the code) is the only implementation — matches `OTP_PROVIDER_KEY` already anticipated in architecture.md's env list. Non-production responses include a `devCode` field so the flow is testable without a real SMS provider.
  - **Role provisioning policy**: FARMER accounts self-provision on first OTP verify; ADMIN and TECHNICIAN accounts must already exist (seeded, or later created via Phase 4 admin CRUD) — requesting an OTP for a non-existent admin/technician phone returns 404. `prisma/seed.ts` + `pnpm prisma:seed` provisions one default ADMIN and one TECHNICIAN from `SEED_ADMIN_PHONE`/`SEED_TECHNICIAN_PHONE` env vars.
  - Global `ValidationPipe` (whitelist + transform) added in `main.ts`; `class-validator`/`class-transformer`/`@nestjs/jwt` added as deps. `server` now also depends on `@ai-platform/types` (workspace) so DTO response shapes and client types share one source of truth, per rules.md's shared-types rule.
  - **`packages/types`**: added `UserRole`, `AuthUser`, `AuthTokens`, `RequestOtpInput/Result`, `VerifyOtpInput/Result`, `RefreshInput`, plus zod schemas (`phoneSchema`, `otpCodeSchema`, `requestOtpFormSchema`, `verifyOtpFormSchema`) shared by all three apps' forms. Added `zod` dependency.
  - **`packages/api-client`**: `TokenStorage` interface (per-app implementation), `createAuthApi()` wrapping the five auth endpoints, and retry-once-on-401 handling built into `ApiClient` itself (`onUnauthorized` config hook calls back into the app's refresh logic, then the client retries the original request once).
  - **All three apps**: `src/lib/storage.ts` (SecureStore for farmer/technician; `localStorage` guarded for SSR for admin, since Admin is Expo-Web-only per architecture.md), `src/lib/api.ts` (wires client + storage + refresh), `src/providers/AuthProvider.tsx` (status: loading/authenticated/unauthenticated, hydrates from stored token via `GET /auth/me` on launch), `src/features/auth/{schema.ts,screens/RequestOtpScreen.tsx,screens/VerifyOtpScreen.tsx}` (React Hook Form + zod, loading/error/resend states). Routing restructured into `(auth)` (`login`, `verify`) and `(app)` (protected `index`) Expo Router groups; each group's `_layout.tsx` does the redirect (`(auth)` → `/` if already authenticated; `(app)` → `/login` if not, with a loading spinner while hydrating). Added `react-hook-form` + `@hookform/resolvers` to each app; admin's login/verify screens use a centered card layout (desktop-first per design.md) vs. full-bleed on farmer/technician.
- **Verified:** `turbo run typecheck` passes for all 7 TS packages + server; `nest build` succeeds; **11 backend unit tests pass** (`auth.service.spec.ts` covering farmer auto-provision, technician/admin must-preexist, wrong-code lockout after max attempts, refresh rotation + reuse-detection revoking the whole chain, resend cooldown; `roles.guard.spec.ts` covering role match/mismatch/no-requirement/no-user) — all against an in-memory Prisma fake, no live DB needed; all three Expo apps bundle cleanly (`expo export -p web`) with the new `(auth)`/`(app)` routes present in the static route list.

---

## Pending Work

- **Docker Desktop still isn't running in this environment.** Next session (or once Docker is started) must, in order: `docker compose up -d` in `docker/postgres` → confirm `GET /api/v1/health` returns `{status:"ok", database:"connected"}` → `prisma migrate dev --name add_auth` (creates the actual Auth tables — no migration exists yet, only the validated schema) → `pnpm prisma:seed` → then do a real end-to-end login check (request OTP, read `devCode` from the response, verify, confirm `GET /auth/me` and the app's protected route work) for all three roles before Phase 2 is fully closed out per rules.md.
- Phase 3 (Design System & Shared UI) onward per docs/phases.md, once the above is confirmed.

---

## Architecture Decisions

- **Monorepo** with shared `packages/` (types, api-client, ui, config).
- **NativeWind** for styling across native + web (replaces Shadcn/Tailwind-DOM).
- **No Server Components** (not available in RN); TanStack Query for server state.
- Admin ships as **Expo Web** build (same RN component model, not a separate DOM stack).
- **Backend-signed Cloudinary uploads**; no secrets in clients.
- **Docker only for local Postgres**; app deployment via EAS (mobile) + static web export (admin) + Node/managed Postgres (backend).
- Money as integer minor units; booking state machine enforced server-side.
- Farmer never selects technician — **admin assigns**.
- **Auth**: phone+role is the identity key (one phone can hold at most one account per role). Farmers self-provision on first login; admins/technicians must be pre-provisioned (seed script now, admin CRUD from Phase 4 on). OTP codes and refresh-token identifiers are hashed with Node's built-in `scrypt` rather than adding bcrypt. Refresh tokens rotate on every use; reuse of an already-rotated token revokes the user's entire refresh-token chain (theft/replay defense) rather than just the one token.
- **api-client owns refresh-on-401**: each app supplies a `TokenStorage` + an `onUnauthorized` callback; the shared `ApiClient` retries the original request once after a successful refresh, so this logic isn't duplicated per app.

---

## Known Issues

- **DB connectivity still unverified**: Docker Desktop's engine isn't running locally; `docker compose up -d`, a `GET /api/v1/health` check, the Phase 2 `prisma migrate dev`, and a live end-to-end auth check are all still pending. Everything in Phase 2 has been verified by every other available means (typecheck, build, bundling, and unit tests against an in-memory Prisma fake) but not against a real Postgres instance.
- `packages/config/eslint-preset.js` is written in legacy `.eslintrc` format, but the server scaffold (and Expo's own `expo lint`) use ESLint 9 flat config (`eslint.config.mjs`). The shared preset isn't actually wired into any app/server lint pipeline yet — it exists but flat-config wiring is deferred (revisit before Phase 13 hardening).
- NativeWind v4 on Expo SDK 57 requires manually adding `babel-preset-expo` and `react-native-css-interop` as **direct** dependencies of each app (pnpm's strict node_modules doesn't hoist Expo's transitive deps) — already fixed in all three apps' package.json, documented here so the pattern isn't rediscovered.
- No SMS provider is integrated yet — `ConsoleOtpProvider` logs the code server-side and non-production responses include `devCode`. A real provider should be wired behind `OTP_PROVIDER_KEY` before production (Phase 13/14 hardening), without needing to touch `AuthService`.

---

## Future Improvements

- Payments/subsidy, multi-language, AI genetics recommendations, IoT heat detection (out of current scope).

---

## Session Notes

- **Session 1:** Created initial documentation set and applied three refinements (Expo for all apps, Cloudinary, Postgres-in-Docker) without changing project scope. Established verify-and-test, phase-by-phase cadence. Ready for Phase 1 on approval.
- **Session 2:** Built Phase 1 (monorepo, 3 Expo apps, NestJS+Prisma server, Docker Compose for Postgres). Typecheck/build/bundle all verified; live DB connection deferred because Docker Desktop wasn't running and the user chose to skip starting it this session. Moved docs into `docs/` to match architecture.md's documented repo layout (was previously flat at repo root).
- **Session 3:** Docker still wasn't running; user explicitly chose to proceed into Phase 2 anyway rather than fix that gap first (deviation from rules.md's normal phase-gating, done knowingly). Built the full Phase 2 auth module end-to-end: backend (Prisma models, AuthService/Controller, guards, seed script, 11 passing unit tests), shared packages (types + zod schemas, api-client auth wiring with refresh-on-401), and OTP login + protected routing in all three apps. Verified everything short of a live database (typecheck, build, bundle, unit tests all green). The live-DB migration, seed, and real end-to-end login check remain outstanding and are the first thing to do next session once Docker is available.
