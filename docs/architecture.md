# architecture.md — AI Management Platform

---

## 1. Overall Architecture

A **single NestJS backend** exposes a typed REST API consumed by **three Expo (React Native) clients**. **PostgreSQL** is the primary datastore (accessed via **Prisma**). **Cloudinary** handles media uploads. **Firebase Cloud Messaging (FCM)** delivers push notifications. **Google Maps** provides navigation/geocoding.

```
                    ┌──────────────────────────┐
   Admin (Expo Web) │                          │
   Farmer (Expo)    │   NestJS API (REST/JWT)  │──► PostgreSQL (Prisma)
   Technician (Expo)│                          │──► Cloudinary (media)
                    └──────────────────────────┘──► FCM (push)
                                                └──► Google Maps
```

---

## 2. Application Relationship

- **One backend, three frontends.** All three Expo apps share the same API, auth, and data model; they differ only by role scope and UI.
- **Admin** runs desktop-first as an **Expo Web** build (`react-native-web`).
- **Farmer** and **Technician** run as **native mobile** (iOS/Android via Expo).
- Shared frontend logic (API client, types, hooks, UI primitives) lives in a **shared package** consumed by all three apps (monorepo).

---

## 3. Repository & Folder Structure

Monorepo (recommended: **pnpm workspaces + Turborepo**; or Expo/EAS monorepo). No app-specific business logic duplicated.

```
ai-platform/
├── apps/
│   ├── admin/            # Expo app, web-first (react-native-web)
│   ├── farmer/           # Expo app, mobile-first
│   └── technician/       # Expo app, mobile-first
├── packages/
│   ├── api-client/       # typed fetch layer + TanStack Query hooks
│   ├── types/            # shared TS types / DTO mirrors / Zod schemas
│   ├── ui/               # shared RN components (NativeWind-based)
│   └── config/           # eslint, tsconfig, tailwind/nativewind presets
├── server/               # NestJS backend
│   ├── src/
│   │   ├── modules/      # feature modules
│   │   ├── common/       # guards, interceptors, filters, decorators
│   │   ├── prisma/       # Prisma module + service
│   │   └── main.ts
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── docker/
│   └── postgres/         # docker-compose for local Postgres ONLY
├── docs/                 # PRD, architecture, rules, phases, design, memory
└── package.json
```

---

## 4. Frontend App Structure (per Expo app — feature-based)

```
apps/<app>/
├── app/                  # Expo Router routes (file-based)
├── src/
│   ├── features/         # feature folders (auth, animals, catalogue, bookings…)
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── screens/
│   │       └── schema.ts # Zod
│   ├── components/       # app-local shared components
│   ├── lib/              # api client wiring, query client, storage
│   ├── theme/            # tokens, NativeWind config
│   └── providers/        # QueryClientProvider, AuthProvider
└── app.json / app.config.ts
```

---

## 5. Backend Architecture (NestJS)

- **Feature modules**: `auth`, `farmers`, `animals`, `catalogue`, `inventory`, `bookings`, `assignment`, `technicians`, `breeding`, `notifications`, `districts`, `service-areas`, `reports`, `settings`.
- **Layers per module**: Controller → Service → Prisma. DTOs validated with `class-validator` (+ Zod-mirrored types shared to clients where useful).
- **Common**: JWT auth guard, roles guard, global exception filter, response/serialization interceptor, request logging.
- **Prisma module**: single `PrismaService` injected everywhere.
- **Media**: `CloudinaryModule` wraps signed uploads; backend issues signed upload params, clients upload directly to Cloudinary, backend stores returned URLs/public_ids.

---

## 6. Database Strategy

- **PostgreSQL** as the single source of truth, managed via **Prisma ORM** and Prisma Migrate.
- **Local dev**: Postgres runs in **Docker** (`docker/postgres`, docker-compose). Application code runs on the host (not containerized in this scope).
- **Booking state machine** enforced in the service layer (e.g., `PENDING → ASSIGNED → IN_PROGRESS → COMPLETED / CANCELLED`).
- Straw usage decrements inventory transactionally on completion.
- Money stored as integer minor units (e.g., paise) — never floats.
- Soft-delete where auditability matters; hard-delete otherwise.

*(No schema is written in this documentation phase.)*

---

## 7. Authentication Flow

```
Client → request OTP (phone) → backend sends OTP
Client → submit OTP → backend verifies → issues JWT (access + refresh)
Client stores JWT (SecureStore on native / secure web storage)
Every API call → Authorization: Bearer <token>
Backend → JWT guard validates → Roles guard checks role scope
```

- Roles: `ADMIN`, `FARMER`, `TECHNICIAN`.
- Refresh-token rotation; short-lived access tokens.

---

## 8. Booking Workflow (state machine)

```
PENDING ── admin assigns ──► ASSIGNED ── technician starts ──► IN_PROGRESS
   │                                                              │
   └── admin/farmer cancels ──► CANCELLED        technician submits ▼
                                                              COMPLETED
```

Only Admin can assign. Only the assigned Technician can move ASSIGNED→IN_PROGRESS→COMPLETED. Completion records straw used + insemination details and updates breeding history.

---

## 9. Role Permissions (summary)

| Capability | Admin | Farmer | Technician |
|---|---|---|---|
| Manage catalogue/inventory/prices | ✅ | ❌ | ❌ |
| Manage all farmers/technicians | ✅ | ❌ | ❌ |
| Create booking | ✅(behalf) | ✅(own) | ❌ |
| Assign technician | ✅ | ❌ | ❌ |
| Perform/complete service | ❌ | ❌ | ✅(assigned) |
| View own animals/bookings | ✅(all) | ✅(own) | ✅(assigned) |
| Reports/Analytics | ✅ | ❌ | ❌ |

---

## 10. API Design Principles

- RESTful, resource-oriented, versioned (`/api/v1`).
- Fully typed DTOs; no `any`.
- Pagination, filtering, sorting on all list endpoints.
- Consistent error envelope `{ statusCode, message, error }`.
- Idempotent where appropriate; explicit state-transition endpoints for bookings.

---

## 11. Coding Standards

- TypeScript strict everywhere; no `any`.
- Shared types from `packages/types` — server DTOs and client types stay in sync.
- No duplicated code; reusable components/hooks only.
- Feature-based architecture on both client and server.

---

## 12. State Management

- **Server state**: TanStack Query (caching, invalidation, retries).
- **Forms**: React Hook Form + Zod resolver.
- **Local/UI state**: React state/context; lightweight store (e.g., Zustand) only if needed for cross-screen UI state (auth/session).
- No Redux.

---

## 13. Deployment Architecture

- **Backend**: NestJS deployed as a stateless service (Node host / container / PaaS) with managed PostgreSQL in production.
- **Mobile (Farmer, Technician)**: built and distributed via **Expo EAS Build** (iOS/Android).
- **Admin (Expo Web)**: exported static web build, served via any static/web host.
- **Docker is used only for local PostgreSQL**, not for app deployment in this scope.
- Media served from Cloudinary CDN. Push via FCM.

---

## 14. Environment Variables

**Backend**
```
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
OTP_PROVIDER_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FCM_SERVER_KEY=
GOOGLE_MAPS_API_KEY=
```

**Apps (Expo, public where required)**
```
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```
Secrets never bundled into clients; uploads use backend-signed Cloudinary params.

---

## 15. Naming Conventions

- Files: `kebab-case`; React components: `PascalCase`; hooks: `useCamelCase`.
- Prisma models: `PascalCase` singular; tables snake_case via `@@map` if needed.
- API routes: plural nouns, kebab-case.
- Env vars: `UPPER_SNAKE_CASE`; client-exposed vars prefixed `EXPO_PUBLIC_`.
