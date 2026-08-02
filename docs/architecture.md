# architecture.md — AI Management Platform

> The single source of technical truth: system design, data model, API, auth, deployment, engineering standards, and local setup. Product scope lives in `PRD.md`; the build order lives in `phases.md`; the visual system lives in `design.md`.

---

## 1. Overall Architecture

A **single NestJS backend** exposes a typed REST API consumed by **three native React Native (Expo) apps**. **Supabase-hosted PostgreSQL** is the primary datastore (accessed via **Prisma** over a standard connection URL). **Cloudinary** handles media uploads. Push notifications (**FCM**) arrive with the notifications phase; **OTP login** and **Google Maps** navigation are deliberately deferred to the final feature phase.

```
   Admin (Expo, native adaptive) ┐
   Farmer (Expo, native)         ├──► NestJS API (REST/JWT) ──► PostgreSQL @ Supabase (Prisma)
   Technician (Expo, native)     ┘                          ├──► Cloudinary (media)
                                                            └──► FCM (notifications) + Google Maps (final)
```

---

## 2. Application Relationship

- **One backend, three native frontends.** All three Expo apps share the same API, auth, and data model; they differ only by role scope and UI.
- **All three run as native mobile apps (iOS/Android).** The **Admin app is native with an adaptive layout** — tablet/large-screen aware, data tables collapse to list/card views on phones. No web build.
- Shared frontend logic (API client, types, hooks, UI primitives) lives in shared packages consumed by all three apps (monorepo).

---

## 3. Repository & Folder Structure

Monorepo: **pnpm workspaces + Turborepo**. No app-specific business logic duplicated.

```
ai-platform/
├── apps/
│   ├── admin/            # Expo native app, adaptive admin layout
│   ├── farmer/           # Expo native app
│   └── technician/       # Expo native app
├── packages/
│   ├── api-client/       # typed fetch layer + TanStack Query hooks
│   ├── types/            # shared TS types / DTO mirrors / Zod schemas
│   ├── ui/               # shared RN components (NativeWind-based)
│   └── config/           # eslint, tsconfig, nativewind presets
├── server/               # NestJS backend
│   ├── src/
│   │   ├── modules/      # feature modules
│   │   ├── common/       # guards, interceptors, filters, decorators
│   │   ├── prisma/       # Prisma module + service
│   │   └── main.ts
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── docs/                 # PRD, architecture, phases, design, memory
└── package.json
```

### Frontend app structure (per Expo app — feature-based)

```
apps/<app>/
├── app/                  # Expo Router routes (file-based)
├── src/
│   ├── features/         # feature folders (auth, animals, catalogue, bookings…)
│   │   └── <feature>/{components, hooks, screens, schema.ts}
│   ├── components/       # app-local shared components
│   ├── lib/              # api client wiring, query client, storage
│   ├── theme/            # tokens, NativeWind config
│   └── providers/        # QueryClientProvider, AuthProvider
└── app.json / app.config.ts
```

---

## 4. Backend Architecture (NestJS)

- **Feature modules** (target set): `auth`, `farmers`, `technicians`, `animals`, `catalogue`, `inventory`, `bookings`, `assignment`, `breeding`, `notifications`, `districts`, `service-areas`, `breeds`, `organizations`, `reports`, `settings`. Modules land across the phases that introduce them (`phases.md`).
- **Layers per module**: Controller → Service → Prisma. DTOs validated with `class-validator` (+ Zod-mirrored types shared to clients where useful).
- **Common**: JWT auth guard, roles guard, global exception filter, response/serialization interceptor, request logging (with secret redaction).
- **Prisma module**: single `PrismaService` injected everywhere.
- **Media**: `CloudinaryModule` wraps signed uploads — backend issues signed upload params, clients upload directly to Cloudinary, backend stores returned URL + `public_id`.

---

## 5. Data Model

PostgreSQL via **Prisma**. Money stored as **integer minor units** (never floats). Soft-delete (`is_active`) where auditability matters.

### 5.1 Master tables (11)

| # | Table | Key Fields | Notes |
|---|-------|-----------|-------|
| 1 | `farmers` | name, phone, password_hash, district_id, address, is_active | Farmer accounts |
| 2 | `technicians` | name, phone, password_hash, service_area_id, is_active | Technician accounts |
| 3 | `animals` | farmer_id, species, breed_id, tag, age, breeding_status | Livestock |
| 4 | `sire_catalogue` | species, name, breed_id, organization_id, fertility_rating, disease_free, image_url, + cattle{genetic_score, milk_yield, fat_pct} / goat{growth_index} | Bull/Buck straws offered |
| 5 | `batches` | sire_id, batch_number, produced_date, notes | Straw production batches |
| 6 | `straws` (inventory_items) | batch_id, quantity_available, status | Per-batch stock |
| 7 | `prices` | sire_id, amount_minor, currency, effective_from | Straw pricing |
| 8 | `districts` | name, state, code | Geographic master |
| 9 | `service_areas` | name, district_id, coverage | Technician coverage zones |
| 10 | `breeds` | species, name, code | Referenced by animals + catalogue |
| 11 | `organizations` | name, code, contact | Referenced by catalogue |

**Species** is an enum (`CATTLE` / `GOAT`), not a table.

### 5.2 Transactional & auth tables

- `bookings` — status enum `PENDING/ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED`; relations to animal, farmer, straw/batch, technician (nullable), preferred_date.
- `breeding_history` — per animal; links booking + straw; populated on completion.
- `notifications` — event/message records (notifications phase).
- `refresh_tokens` — hashed refresh tokens (rotation + reuse detection).
- `otp_codes` — added in the final phase when OTP login is introduced.

### 5.3 Key relationships

`animals.{farmer_id→farmers, breed_id→breeds}` · `sire_catalogue.{breed_id→breeds, organization_id→organizations}` · `batches.sire_id→sire_catalogue` · `straws.batch_id→batches` · `farmers.district_id→districts` · `service_areas.district_id→districts` · `technicians.service_area_id→service_areas` · `bookings.{animal_id, farmer_id, straw_id, technician_id}`.

---

## 6. Authentication

**Day-one auth is phone + password** (JWT access + refresh). OTP login is added in the **final phase** as an additional method, not a replacement.

```
Phase-1 auth (phone + password):
Client → POST /auth/login {phone, password} → verify password hash → issue JWT (access + refresh)
Client stores JWT in Expo SecureStore → sends Authorization: Bearer <token> on every call
Backend → JwtAuthGuard validates → RolesGuard checks role scope

Final-phase addition (OTP):
Client → request OTP → verify OTP → issue JWT (same token machinery)
```

- Roles: `ADMIN`, `FARMER`, `TECHNICIAN`.
- Passwords hashed at rest (`scrypt`/`argon2`); refresh tokens hashed with rotation + reuse detection.
- Short-lived access tokens; `api-client` refreshes on 401 and retries once.

---

## 7. Booking Workflow (state machine)

```
PENDING ── admin assigns ──► ASSIGNED ── technician starts ──► IN_PROGRESS
   │                                                              │
   └── admin/farmer cancels ──► CANCELLED        technician submits ▼
                                                              COMPLETED
```

Enforced server-side. Only **Admin** can assign. Only the **assigned Technician** advances ASSIGNED→IN_PROGRESS→COMPLETED. Completion records straw used + insemination details, writes breeding history, and **decrements inventory transactionally** (Prisma `$transaction`; stock never goes negative). Farmers never select a technician.

---

## 8. Role Permissions

| Capability | Admin | Farmer | Technician |
|---|---|---|---|
| Manage masters (catalogue/inventory/prices/districts/service areas/breeds/orgs) | ✅ | ❌ | ❌ |
| Manage all farmers/technicians | ✅ | ❌ | ❌ |
| Create booking | ✅(behalf) | ✅(own) | ❌ |
| Assign technician | ✅ | ❌ | ❌ |
| Perform/complete service | ❌ | ❌ | ✅(assigned) |
| View animals/bookings | ✅(all) | ✅(own) | ✅(assigned) |
| Reports/Analytics | ✅ | ❌ | ❌ |

---

## 9. API Design Principles

- RESTful, resource-oriented, versioned (`/api/v1`).
- Fully typed DTOs; **no `any`**. Shared types from `packages/types` keep server and clients in sync.
- Pagination, filtering, and sorting on all list endpoints.
- Consistent error envelope `{ statusCode, message, error }`.
- Explicit state-transition endpoints for bookings (e.g. `PATCH /bookings/:id/assign`); idempotent where appropriate.

---

## 10. Standards & Rules

**Development**
- Build **one phase at a time**; each phase is verified and tested before the next. Update `memory.md` after every session.
- Update docs first, then implement. Never create placeholder/non-production screens.

**Code**
- TypeScript strict everywhere; **no `any`**. Small, focused functions/components. No duplicated code — extract shared logic.
- Feature-based architecture on client and server. No cross-feature deep imports; go through a feature's public surface or shared packages.

**Components (React Native)**
- Reusable primitives live in `packages/ui`; styled with **NativeWind** tokens.
- **No RSC / server components** — they don't exist in RN; fetch via TanStack Query hooks.
- Admin uses responsive/adaptive layouts with the **same RN component model** (no web-DOM stack).
- Every form implements **Validation, Loading, Error, Success, Empty** states.

**Validation & Errors**
- **Zod** on the client (RHF resolver) + `class-validator` on backend DTOs. Validate at the boundary; never trust client input.
- Backend global exception filter with a consistent envelope. No swallowed errors; log with context (secrets redacted). Technician submissions handle connectivity failure gracefully (retry/queue where feasible).

**Database**
- Prisma migrations for every schema change; never edit the DB manually. Transactions for multi-step writes (completion + inventory decrement). No floats for money.

**Security**
- JWT + roles guard on every protected route. Least-privilege scoping (Admin/Farmer/Technician).
- Secrets only on the backend; **Cloudinary uploads use backend-signed params** — never ship secrets to clients. Tokens in Expo SecureStore.

**Performance & Accessibility**
- Paginated, cached queries (TanStack Query); `FlatList` virtualization for long lists; Cloudinary transforms for images; memoize expensive components.
- Adequate touch targets/contrast, accessible labels/roles, readable typography, system font scaling.

**Testing**
- Unit tests for services and critical logic (booking state machine, inventory). Component tests for shared UI. E2E for the core flow (booking → assignment → completion) where feasible.

---

## 11. State Management

- **Server state**: TanStack Query (caching, invalidation, retries).
- **Forms**: React Hook Form + Zod resolver.
- **Local/UI/session state**: React state/context; lightweight store (Zustand) only if needed for cross-screen state. **No Redux.**

---

## 12. Libraries

**Allowed — Frontend:** Expo, Expo Router, React Native, TypeScript, NativeWind, React Hook Form, TanStack Query, Zod, `lucide-react-native` (icons, app-wide), Expo SecureStore, Zustand (only if needed); Expo Notifications/FCM (notifications phase); `react-native-maps` (final phase).
**Allowed — Backend:** NestJS, TypeScript, Prisma, class-validator/class-transformer, JWT, Cloudinary Node SDK; `firebase-admin` (notifications phase).

**Not allowed:** Next.js / any web-DOM UI (Shadcn, Tailwind DOM) · AWS S3 SDK (Cloudinary instead) · Docker for the database (Supabase instead) · Redux/Redux Toolkit · unmaintained or duplicate-purpose dependencies.

---

## 13. Deployment

- **Database**: **Supabase-hosted PostgreSQL**; app connects via a standard `DATABASE_URL`. Prisma Migrate manages schema. No Docker.
- **Backend**: NestJS deployed as a stateless service (Node host / container / PaaS).
- **All three apps**: built and distributed via **Expo EAS Build** (iOS/Android) — Admin, Farmer, Technician.
- Media served from **Cloudinary CDN**. **FCM, Google Maps, and the OTP provider** are configured for production.

---

## 14. Local Setup

1. Install: `pnpm install` at the repo root.
2. Create a **Supabase** project; copy the Postgres connection string into `server/.env` as `DATABASE_URL`.
3. `pnpm --filter server prisma migrate dev` to apply migrations.
4. Start backend: `pnpm --filter server start:dev` → verify `GET /api/v1/health`.
5. Start an app: `pnpm --filter admin start` (or `farmer` / `technician`) and open on an iOS/Android simulator.

No local database container is needed — Postgres is Supabase-hosted.

---

## 15. Environment Variables

**Backend (`server/.env`)**
```
DATABASE_URL=            # Supabase Postgres connection string
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# Later phases:
# FCM_SERVER_KEY=          # notifications phase
# OTP_PROVIDER_KEY=        # final feature phase
# GOOGLE_MAPS_API_KEY=     # final feature phase
```

**Apps (Expo — public where required)**
```
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
# Final feature phase:
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```
Secrets are never bundled into clients; uploads use backend-signed Cloudinary params.

---

## 16. Naming Conventions

- Files `kebab-case`; React components `PascalCase`; hooks `useCamelCase`.
- Prisma models `PascalCase` singular; tables `snake_case` via `@@map` where needed.
- API routes: plural nouns, kebab-case.
- Env vars `UPPER_SNAKE_CASE`; client-exposed vars prefixed `EXPO_PUBLIC_`.

---

## 17. Things to Never Do

- Never let the farmer select a technician (admin assigns).
- Never store money as a float. · Never ship secrets to clients. · Never use `any`.
- Never build multiple phases at once. · Never create placeholder/non-production screens.
- Never bypass validation or the booking state machine. · Never edit the database outside Prisma migrations.
