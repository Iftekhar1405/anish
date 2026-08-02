# phases.md — AI Management Platform

> **Rule:** build **one phase at a time**. Each phase is **verified and tested** before proceeding to the next. Update `memory.md` after every session.

This roadmap is organized into **10 phases**, all **pending** — the build starts fresh. Every application is a **native mobile React Native (Expo) app** (Admin, Farmer, Technician) sharing **one NestJS backend**. Database is **Supabase-hosted PostgreSQL** (standard `DATABASE_URL`, no Docker). Media uploads use **Cloudinary**. **Day-one auth is phone + password**; **OTP login and Google Maps navigation are deferred to Phase 9** (the final feature phase before deployment). Documentation is treated as ongoing rather than a numbered phase.

**Legend:** ✅ Done · 🚧 In Progress · ⬜ Pending

Each phase defines: **Objective · Deliverables · Implementation Plan · Completion Checklist · Dependencies.**

---

## Phase 1 — Foundation & Infrastructure ⬜ Pending

**Objective:** Stand up the monorepo, shared tooling, and the Supabase-backed database connection.

**Deliverables:**
- pnpm workspaces + Turborepo monorepo: `apps/` (admin, farmer, technician Expo apps), `packages/` (types, api-client, ui, config), `server/` (NestJS).
- Supabase Postgres connected via `DATABASE_URL`; Prisma initialized; health endpoint live.
- Shared tsconfig / ESLint / NativeWind presets in `packages/config`.

**Implementation Plan:**
1. Initialize repo root: `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, `.gitignore`.
2. Scaffold three Expo apps (`apps/admin`, `apps/farmer`, `apps/technician`) with Expo Router, TypeScript, and NativeWind configured (`babel.config.js`, `metro.config.js`, `global.css`, `nativewind-env.d.ts`).
3. Scaffold `packages/config` (shared eslint/tsconfig/nativewind presets), `packages/types`, `packages/ui`, `packages/api-client` as workspace packages.
4. Scaffold `server/` NestJS app; add `PrismaModule`/`PrismaService`; `HealthModule` exposing `GET /api/v1/health` that pings the DB.
5. Create a **Supabase** project; put its Postgres connection string in `server/.env` as `DATABASE_URL`; run initial `prisma migrate dev` to verify connectivity.
6. Confirm all three apps boot on iOS/Android simulators and the API boots and connects to Supabase Postgres.

**Completion Checklist:** All three native apps boot on simulators; NestJS boots; Prisma connects to Supabase Postgres; `GET /api/v1/health` returns healthy. Verified and tested.

**Dependencies:** None.

---

## Phase 2 — Authentication & Access Control (Phone + Password) ⬜ Pending

**Objective:** End-to-end phone + password auth across all three apps with role scoping. (OTP is added later in Phase 9.)

**Deliverables:**
- Backend: register/login with **phone + password**, JWT access/refresh with rotation + reuse detection, roles guard (ADMIN/FARMER/TECHNICIAN). Passwords and refresh tokens hashed at rest.
- Clients: phone + password login screens, secure token storage (Expo SecureStore), auth provider, protected routing.
- Shared `packages/api-client` with auth headers + refresh-on-401 handling.

**Implementation Plan:**
1. Prisma models: `User` (unique `[phone, role]`, `password_hash`, `isActive` soft-deactivate), `RefreshToken`; `Role` enum. Migrate.
2. Backend `AuthModule`: `POST /auth/login` (phone + password), `POST /auth/refresh` (and admin-created accounts or `POST /auth/register` where applicable). Hash passwords (`scrypt`/`argon2`) and refresh tokens; short-lived access token; rotating refresh with reuse detection.
3. Guards + decorators: `JwtAuthGuard`, `RolesGuard`, `@Roles()`, `@CurrentUser()`; global protection with explicit public routes.
4. `packages/api-client`: typed fetch layer, attaches `Authorization`, transparently refreshes on 401 and retries once.
5. Each app: phone + password login screen, `AuthProvider`, SecureStore persistence, protected route groups in Expo Router. Admin/Farmer/Technician each land in their role's shell.
6. Unit tests for auth service (password verify, refresh rotation, reuse detection) and roles guard.

**Completion Checklist:** Phone + password login works on all three apps; role-scoped access enforced server-side; refresh rotation + reuse detection verified; tested live against Supabase.

**Dependencies:** Phase 1.

---

## Phase 3 — Design System & Admin Core ⬜ Pending

**Objective:** Implement the shared design system and the admin foundation (adaptive native).

**Deliverables:**
- NativeWind theme tokens (from `design.md`); `packages/ui` primitives (Button, Input, Select, Card/StatCard, adaptive Table/List, Dialog/Sheet, EmptyState, Loading, Toast) and navigation shells (adaptive drawer/rail, TopBar, BottomTabBar). Icons via `lucide-react-native`.
- Admin dashboard shell; Manage Farmers (CRUD); Manage Technicians (CRUD); adaptive lists with search/filter/pagination.

**Implementation Plan:**
1. Encode `design.md` tokens (colors, typography, spacing, radius, shadow) into a shared NativeWind preset in `packages/config`; consume in all apps. Wire `lucide-react-native` as the single icon set.
2. Build `packages/ui` primitives, each with default/disabled/loading/error/empty states where applicable; validate on native simulators.
3. Adaptive data presentation: the shared view renders a columnar table on tablet/large screens and collapses to stacked list/cards on phones (drives the admin adaptive experience).
4. Backend `admin-users` (or `farmers` + `technicians`) modules: CRUD, list with pagination/filter/search, typed DTOs with `class-validator`.
5. Admin app: navigation shell (adaptive drawer/rail + top bar), Dashboard shell, Manage Farmers and Manage Technicians screens wired to typed API-client hooks (TanStack Query) with RHF + Zod forms covering all five states.

**Completion Checklist:** Component gallery renders on iOS/Android with all states; adaptive table/card switch verified on phone vs. tablet; Admin Farmer/Technician CRUD verified end-to-end with typed APIs. Tested.

**Dependencies:** Phases 1, 2.

---

## Phase 4 — Master Data: Catalogue, Inventory & Animals ⬜ Pending

**Objective:** Semen catalogue, straw inventory, animals, and supporting master data.

**Deliverables:**
- Bull/Buck catalogue (cattle + goat fields per PRD) with **Cloudinary** image upload (backend-signed).
- Inventory (batches, straws, availability) and price management.
- Animal model + admin management.
- Districts, Service Areas, Breeds, Organizations.
- Admin CRUD + list/filter for each.

**Implementation Plan:**
1. Prisma models for the master tables: `SireCatalogue` (species-discriminated Bull/Buck fields), `Batch`, `Straw`, `Price`, `Animal`, `District`, `ServiceArea`, `Breed`, `Organization`, with relations. Migrate. Money as integer minor units.
2. Backend `CloudinaryModule`: issue signed upload params; clients upload directly to Cloudinary; backend stores returned URL + `public_id`. No secrets shipped to clients.
3. Backend modules: `catalogue`, `inventory`, `animals`, `districts`, `service-areas`, `breeds`, `organizations` — Controller → Service → Prisma, typed DTOs, list endpoints with pagination/filter/sort.
4. Admin screens: catalogue management (image upload + species-specific fields), inventory (batches/straws/availability), price management, animals, districts, service areas, breeds, organizations — all with adaptive lists and full-state forms.
5. Seed representative master data for testing.

**Completion Checklist:** All 11 masters CRUD verified; Cloudinary signed upload works end-to-end; relationships intact; money stored as minor units. Tested.

**Dependencies:** Phase 3.

---

## Phase 5 — Farmer App & Booking Creation ⬜ Pending

**Objective:** Farmer-side foundations plus the booking creation flow.

**Deliverables:**
- Farmer profile; manage animals (CRUD); browse catalogue with filters.
- Booking creation: **Select Animal → Select Straw → Choose Date → Submit** (booking lands in Admin as `PENDING`).
- Booking status tracking screen.

**Implementation Plan:**
1. Prisma `Booking` model with status enum (`PENDING/ASSIGNED/IN_PROGRESS/COMPLETED/CANCELLED`), relations to Animal, Farmer, Straw/Batch, Technician (nullable). Migrate.
2. Backend `bookings` module: `POST /bookings` (creates `PENDING`), farmer-scoped list/detail; validates that the animal + straw belong to valid, available entities. State-machine guard rejects illegal transitions.
3. Farmer app shell (bottom tabs): Profile, My Animals (CRUD), Catalogue (browse + filter by species/breed/organization/availability), Bookings.
4. Booking wizard: Select Animal → Select Bull/Buck Straw → Choose Preferred Date → Submit; RHF + Zod, full-state handling; success confirmation.
5. Booking status tracking screen with live status via TanStack Query.

**Completion Checklist:** Verified on device/simulator; a farmer's booking appears in admin as `PENDING`; farmer cannot select a technician; state machine enforced. Tested.

**Dependencies:** Phase 4.

---

## Phase 6 — Admin Assignment & Technician Field Workflow ⬜ Pending

**Objective:** Admin assignment plus the technician field service cycle. (Turn-by-turn maps navigation comes in Phase 9; until then the technician sees the farmer's address/location.)

**Deliverables:**
- Admin booking queue; review; assign technician (`PENDING → ASSIGNED`); assignment notification trigger.
- Technician app: assigned bookings + today's schedule; farmer address/location display.
- Service recording: insemination details + straw used; transitions `ASSIGNED → IN_PROGRESS → COMPLETED`; transactional inventory decrement on completion.

**Implementation Plan:**
1. Backend assignment endpoint: `PATCH /bookings/:id/assign` (Admin only) → `ASSIGNED`, sets technician, emits notification event.
2. Backend technician transition endpoints: start (`ASSIGNED → IN_PROGRESS`) and complete (`IN_PROGRESS → COMPLETED`) — only the assigned technician; completion writes insemination details + straw used and **decrements inventory transactionally** (Prisma `$transaction`).
3. Admin app: booking queue with review + assign action (technician picker filtered by service area); status visibility.
4. Technician app shell (bottom tabs): Assignments, Today's Schedule, booking detail with the farmer's address/location.
5. Service recording screen: capture insemination details + straw, submit completion; graceful handling of poor connectivity (retry/queue where feasible).

**Completion Checklist:** Only Admin can assign; only the assigned Technician advances a booking; full service cycle verified; inventory decrements transactionally and cannot go negative. Tested.

**Dependencies:** Phase 5.

---

## Phase 7 — Breeding History & Notifications ⬜ Pending

**Objective:** Breeding records and push notifications.

**Deliverables:**
- Breeding/conception history per animal (populated on completion).
- FCM push across apps (booking status, assignment, completion).
- Admin notification management.

**Implementation Plan:**
1. Prisma `BreedingHistory` model linked to Animal + Booking + Straw; populated on booking completion within the completion transaction.
2. Backend `notifications` module: `firebase-admin` FCM integration, device-token registration, event-driven sends on status changes (created/assigned/in-progress/completed).
3. Client push setup: Expo Notifications registration + token upload on login; in-app handling and deep links to the relevant booking/animal.
4. Farmer breeding history screen per animal; admin notification management (compose/broadcast, history).

**Completion Checklist:** Breeding history populated on completion; FCM push delivered to the correct role/app; admin notification management works. Tested.

**Dependencies:** Phase 6.

---

## Phase 8 — Reports, Analytics, Settings & Hardening ⬜ Pending

**Objective:** Admin insight plus production-readiness hardening.

**Deliverables:**
- Reports & analytics: inventory reports, booking reports, technician performance, conception statistics.
- Application settings.
- Security review; performance passes; accessibility passes; error-state audit.

**Implementation Plan:**
1. Backend `reports` module: aggregate queries for inventory, bookings, technician performance, and conception statistics (paginated/filterable, date-ranged).
2. Admin analytics screens: dashboards + report views with adaptive charts/tables, filters, and export where applicable.
3. Backend `settings` module + admin settings screens.
4. Hardening: security review (auth, role scoping, input validation, secret handling), performance passes (pagination, list virtualization, Cloudinary transforms, query caching), accessibility passes (touch targets, contrast, labels), and a full Loading/Error/Empty/Success state audit across screens.

**Completion Checklist:** Reports accurate against seed data; settings persist; security/performance/accessibility hardening checklists green. Tested.

**Dependencies:** Phase 7.

---

## Phase 9 — OTP Login & Maps Navigation (Deferred Features) ⬜ Pending

**Objective:** Layer in the two deliberately-deferred features once the core platform is complete.

**Deliverables:**
- **OTP login** as an additional authentication method alongside phone + password.
- **Google Maps navigation** for the technician (turn-by-turn to the farmer location).

**Implementation Plan:**
1. Prisma `OtpCode` model (hashed at rest). Backend `POST /auth/request-otp` + `POST /auth/verify-otp` issuing the same JWTs; pluggable SMS/OTP provider.
2. Clients: OTP request → verify screens added to the existing auth flow; users can log in with password or OTP.
3. Technician app: integrate `react-native-maps` (Google Maps) — navigate from current location to the farmer's coordinates on the booking detail; deep-link to the native maps app as a fallback.
4. Wire `GOOGLE_MAPS_API_KEY` (backend/geocoding where needed) and `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (client) and the OTP provider key.

**Completion Checklist:** OTP login works end-to-end alongside password login; technician maps navigation works to real coordinates; no regression to existing auth. Tested.

**Dependencies:** Phase 8.

---

## Phase 10 — Deployment ⬜ Pending

**Objective:** Ship to production.

**Deliverables:**
- Backend deployed as a stateless service against Supabase Postgres.
- **EAS builds for all three native apps** (Admin, Farmer, Technician) for iOS/Android.
- Cloudinary + FCM + Google Maps + OTP provider configured in production.

**Implementation Plan:**
1. Point production at the Supabase Postgres instance; run production migrations; deploy NestJS as a stateless service with production env vars.
2. Configure EAS Build profiles; produce iOS/Android builds for Admin, Farmer, and Technician; set store metadata / internal distribution.
3. Wire production Cloudinary, FCM, Google Maps, and OTP-provider credentials; verify signed uploads, push delivery, maps, and OTP in production.
4. Production smoke test of the full flow: login → booking → assignment → service completion → breeding history → notifications.

**Completion Checklist:** Backend reachable in production; all three native apps installable via EAS; production integrations verified; end-to-end flow smoke-tested.

**Dependencies:** Phase 9.

---

**Each phase includes:** Objective · Deliverables · Implementation Plan · Completion Checklist · Dependencies — and is not started until the previous phase is verified and tested.
