# phases.md — AI Management Platform

> Rule: build **one phase at a time**. Each phase is **verified and tested** before proceeding. Update `memory.md` after every session.

---

## Phase 0 — Documentation (current)
**Objective:** Establish foundational docs.
**Deliverables:** PRD.md, architecture.md, rules.md, phases.md, design.md, memory.md.
**Completion checklist:** All six files reviewed and approved. No code.
**Dependencies:** None.

---

## Phase 1 — Monorepo & Environment Setup
**Objective:** Stand up the monorepo and local infrastructure.
**Deliverables:**
- pnpm workspaces + Turborepo; `apps/` (admin, farmer, technician Expo apps), `packages/` (types, api-client, ui, config), `server/` (NestJS).
- **Docker Compose for local PostgreSQL** (`docker/postgres`).
- Prisma initialized (no domain schema yet); DB connection verified.
- Shared tsconfig/eslint/NativeWind presets.
**Completion checklist:** All three Expo apps boot (native + Expo Web for admin); NestJS boots; Prisma connects to Dockerized Postgres.
**Dependencies:** Phase 0.

---

## Phase 2 — Authentication (OTP + JWT + Roles)
**Objective:** End-to-end auth across all apps.
**Deliverables:**
- Backend: OTP request/verify, JWT access/refresh, roles guard (ADMIN/FARMER/TECHNICIAN).
- Clients: OTP login screens, SecureStore token storage, auth provider, protected routing.
- Shared `api-client` with auth headers + refresh handling.
**Completion checklist:** Login works on all three apps; role-scoped access enforced; tested.
**Dependencies:** Phase 1.

---

## Phase 3 — Design System & Shared UI
**Objective:** Implement the design system in RN.
**Deliverables:** NativeWind theme tokens (from design.md), `packages/ui` primitives (Button, Input, Card, Table, Dialog, EmptyState, Loading, Toast), navigation shells.
**Completion checklist:** Component gallery renders on native + web; states covered.
**Dependencies:** Phase 1.

---

## Phase 4 — Admin Core: Dashboard, Farmers, Technicians
**Objective:** Admin foundation.
**Deliverables:** Admin dashboard shell; Manage Farmers (CRUD); Manage Technicians (CRUD); tables/filters/pagination.
**Completion checklist:** CRUD verified end-to-end; typed APIs; tested.
**Dependencies:** Phases 2, 3.

---

## Phase 5 — Catalogue & Inventory
**Objective:** Semen catalogue and straw inventory.
**Deliverables:**
- Bull/Buck catalogue (cattle + goat fields per PRD), Cloudinary image upload (backend-signed).
- Inventory (batches, straws, availability), price management.
- Admin CRUD + list/filter.
**Completion checklist:** Catalogue and inventory verified; image upload works via Cloudinary; tested.
**Dependencies:** Phase 4.

---

## Phase 6 — Animals & Districts/Service Areas
**Objective:** Supporting master data.
**Deliverables:** Animal model + admin management; Districts; Service Areas.
**Completion checklist:** CRUD verified; relationships intact; tested.
**Dependencies:** Phase 4.

---

## Phase 7 — Farmer App: Animals + Catalogue Browse
**Objective:** Farmer-side foundations.
**Deliverables:** Farmer profile; Manage animals (CRUD); browse catalogue with filters.
**Completion checklist:** Verified on device/simulator; tested.
**Dependencies:** Phases 5, 6.

---

## Phase 8 — Booking Creation (Farmer)
**Objective:** Farmer booking flow.
**Deliverables:** Select Animal → Select Straw → Choose Date → Submit. Booking lands in Admin as PENDING. Status tracking screen.
**Completion checklist:** Booking created and visible in admin; state machine enforced; tested.
**Dependencies:** Phase 7.

---

## Phase 9 — Admin Booking Review & Technician Assignment
**Objective:** Assignment workflow.
**Deliverables:** Admin booking queue; review; assign technician (PENDING→ASSIGNED); notifications trigger.
**Completion checklist:** Assignment verified; only admin can assign; tested.
**Dependencies:** Phase 8.

---

## Phase 10 — Technician App: Schedule, Navigation, Service Recording
**Objective:** Field workflow.
**Deliverables:** Assigned bookings + today's schedule; Google Maps navigation; record insemination details + straw used; status transitions ASSIGNED→IN_PROGRESS→COMPLETED; inventory decrement on completion.
**Completion checklist:** Full service cycle verified; inventory decrements transactionally; tested.
**Dependencies:** Phase 9.

---

## Phase 11 — Breeding History & Notifications
**Objective:** Records + push.
**Deliverables:** Breeding history per animal; FCM push across apps (booking status, assignment, completion); admin notification management.
**Completion checklist:** History populated on completion; push delivered; tested.
**Dependencies:** Phase 10.

---

## Phase 12 — Reports & Analytics
**Objective:** Admin insight.
**Deliverables:** Inventory reports, booking reports, technician performance, conception statistics.
**Completion checklist:** Reports accurate against seed data; tested.
**Dependencies:** Phase 11.

---

## Phase 13 — Settings & Hardening
**Objective:** Finalize.
**Deliverables:** Application settings; security review; performance passes; accessibility passes; error-state audit.
**Completion checklist:** Checklists green; tested.
**Dependencies:** Phase 12.

---

## Phase 14 — Deployment
**Objective:** Ship.
**Deliverables:** Backend deployed with managed Postgres; **EAS builds** for Farmer & Technician (iOS/Android); Admin Expo Web export hosted; Cloudinary + FCM + Maps configured in prod.
**Completion checklist:** All apps reachable in production; smoke-tested.
**Dependencies:** Phase 13.

---

**Each phase includes:** Objective · Deliverables · Completion Checklist · Dependencies — and is not started until the previous phase is verified and tested.
