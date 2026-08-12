# memory.md — AI Management Platform (Living Log)

> Updated after every implementation session. Records the current state, decisions, and open items so any session can resume with full context.

---

## 1. Project Overview

Production-grade Artificial Insemination management platform for **cattle and goats**. One **NestJS** backend serves **three native React Native (Expo) apps** — Admin (native, adaptive), Farmer, Technician. **Supabase Postgres** (Prisma), **Cloudinary** media. Build proceeds **one phase at a time** (`phases.md`). Full scope in `PRD.md`; technical spec in `architecture.md`; design system in `design.md`.

---

## 2. Current Phase

**Phases 1–3 ✅ done & verified on device.** **Phase 4 — Master Data — CODE-COMPLETE** on `phase-4-master-data` (4A–4E); pending a simulator pass to close it. Backend (4A–4D) all curl-verified; admin master-data UI (4E) typecheck-clean across all workspaces. `packages/ui` reused as-is (design.md-aligned). Phase 4 notes: straw price stored as a field on the sire catalogue (no separate price-history table for now); straws = per-`Batch` quantity (no straw rows). Cloudinary uploads are **backend-signed** — `POST /uploads/signature` returns a signature; the client uploads directly (via `expo-image-picker`) so the API secret never ships. Admin master screens sit under a **Masters** tab → hub → 7 per-master screens.

**Phases 5, 6, 7 and 8 — all CODE-COMPLETE**, on `phase-5-farmer-booking` (branched off `phase-4-master-data`): `Booking` model/module (create/list/detail + assign/start/complete transitions with an atomic inventory decrement), farmer app (4-tab shell, My Animals with per-animal breeding history, Catalogue, booking wizard, Profile with address/district), admin Bookings queue + district-filtered assign picker, a full technician app (Assignments/Today/Profile) built from its Phase-1 shell, `BreedingHistory` populated on completion, a `notifications` module (in-app inbox on all three apps + best-effort FCM push + admin compose/broadcast/history), and — Phase 8 — a `reports` module (inventory/bookings/technician-performance/conception), a `settings` module, the admin Dashboard restructured into a Reports hub, and a hardening pass (added the previously-missing global exception filter; accessibility props on the shared `Input`/`Select`). `animals`/`catalogue/sires`/`batches`/`breeds`/`districts` widened from admin-only to admin+farmer (read-only except animals); `User` gained farmer (address/district) and technician (serviceArea) profile fields. Curl-verified end-to-end (full booking lifecycle incl. the atomic zero-stock guard, notifications, breeding history, all four reports against real data) and `expo export --platform web` clean for all three apps; pending a simulator pass (same as Phase 4) and, separately, real Firebase credentials to verify actual push delivery. **Phase 9 is on hold** (explicit instruction, 2026-08-03) — only an unused `OtpCode` Prisma model/migration exist, no service/frontend work; needs a real SMS/OTP provider + Google Maps API key to resume meaningfully. **Phase 10 is on hold entirely** (explicit instruction) — nothing done, not even prep config, pending the user's hosting/account decisions. See `HANDOFF.md`.

---

## 3. Completed Work

- **Documentation refactored** to the all-native + Supabase + Cloudinary model:
  - `PRD.md`, `phases.md` rewritten from scratch.
  - `architecture.md` rewritten and expanded (now also absorbs the old `rules.md` and `SETUP.md`, which were removed).
  - `design.md` updated (adaptive admin, `lucide-react-native` icons) and **substantially enhanced for high-UX/feel**: experience principles, role-tuned UX, motion/haptics, skeleton+optimistic feedback system, offline UX, imagery, data-viz, onboarding, microcopy voice, accessibility, performance-as-UX.
  - Doc set: PRD, architecture, phases, design, memory, **HANDOFF** (+ root **CLAUDE.md**).
  - Added **`docs/HANDOFF.md`** (live two-developer baton) and root **`CLAUDE.md`** enforcing the handoff protocol: every agent reads HANDOFF.md first and updates it before pushing.
- No application phase implemented yet under the fresh roadmap.

---

## 4. Pending Work

All 10 phases (`phases.md`): 1 Foundation · 2 Auth (phone+password) · 3 Design System & Admin Core · 4 Master Data · 5 Farmer App & Booking · 6 Assignment & Technician Workflow · 7 Breeding History & Notifications · 8 Reports/Analytics/Settings/Hardening · 9 OTP Login & Maps Navigation · 10 Deployment.

---

## 5. Architecture Decisions

- **All three apps are native mobile RN (Expo)**; the **Admin app is native with an adaptive layout** (tables ↔ cards) — no Expo Web build.
- **Database: Supabase-hosted Postgres** via a standard `DATABASE_URL`. **Docker for the DB is dropped.**
- **Auth day-one = phone + password** (JWT access/refresh). **OTP login is deferred to the final phase** as an added method.
- **Maps/navigation (Google Maps) also deferred to the final phase**; technician sees a plain address until then.
- **Media uploads via Cloudinary** (backend-signed); AWS S3 removed.
- **Icons: `lucide-react-native`** used consistently across all apps.
- **11 master tables**: farmers, technicians, animals, sire_catalogue, batches, straws, prices, districts, service_areas, breeds, organizations. Bookings/breeding_history/notifications are transactional.
- Money as integer minor units; booking state machine + inventory decrement enforced server-side in a transaction.
- **Reset code fresh** (2026-08-02): the earlier scaffold embodied the old plan (OTP auth, Docker Postgres, Expo-Web admin). Rather than adapt, we rebuild from zero to match the fresh roadmap and new decisions.
- **Booking ownership is always server-resolved** (2026-08-03): `Booking.farmerId` comes from the JWT for a FARMER caller (any client-supplied `farmerId` is ignored, not merely validated) and is a required, explicitly-checked field for an ADMIN caller creating on behalf of a farmer. Never trust a client-asserted farmer id for a booking — this is the boundary between "farmer books for themself" and "admin books on behalf of," and getting it wrong would let a farmer create bookings under another farmer's name.
- **Booking creation validates business rules server-side, not just referential integrity** (2026-08-03): animal must be active and owned by the resolved farmer; batch's sire must be `isAvailable` and have `quantityAvailable > 0`; the animal's species must match the sire's species; `preferredDate` cannot be in the past. All are enforced in `BookingsService.create`, not left to the client.
- **Master-data controllers are shared between Admin and Farmer, not Admin-exclusive, once a phase needs farmer self-service** (2026-08-03): `animals`, `catalogue/sires`, `batches`, `breeds` were changed from `@AdminOnly()` to `@Roles(ADMIN, FARMER)` at the controller level, with `@Roles(ADMIN)` overrides on individual mutating routes (Nest's `RolesGuard` resolves method-level metadata over class-level via `getAllAndOverride`). `animals` additionally scopes by ownership in the service layer (farmer sees/edits only their own; 404 not 403 on someone else's, to avoid confirming existence). Reason: Phase 5's farmer app needs to manage its own animals and browse the catalogue/inventory read-only, and duplicating those modules per-role would violate "no duplicated code." Future phases needing another role on an existing admin-only module should extend it the same way rather than forking it.
- **The booking wizard hides raw inventory batches from farmers** (2026-08-03): a farmer picks an animal and a Bull/Buck (sire), not a batch number. The client resolves an available `Batch` for the chosen sire (first one with `quantityAvailable > 0` from `GET /batches?sireId=`) and submits that as `batchId` — batch/straw bookkeeping stays an internal admin/inventory concept, never surfaced in the farmer UI. See `apps/farmer/app/(app)/bookings/new.tsx`.
- **Inventory decrement on completion uses a guarded `updateMany`, not a read-then-write** (2026-08-03): `BookingsService.complete` does `tx.batch.updateMany({where:{id, quantityAvailable:{gt:0}}, data:{quantityAvailable:{decrement:1}}})` inside a `$transaction`, then checks `count === 0` to throw `ConflictException`. A naive read-check-write (`findUnique` then `update`) would race under concurrent completions; this pattern is atomic at the database level. Verified by racing two IN_PROGRESS bookings against a 1-unit batch — the second correctly 409s and its booking stays IN_PROGRESS, not silently COMPLETED. Any future stock-decrementing logic should follow this same pattern, not a plain read-then-write.
- **Farmer/Technician ownership checks return 404, not 403, on someone else's resource** (2026-08-03): consistent across `animals`, `bookings` (farmer *and* technician scoping). Reason: a 403 confirms the resource exists; a 404 doesn't leak that. Established in Phase 5 for farmers, extended to technicians in Phase 6 (`getScopedOrThrow` in `bookings.service.ts`) — follow the same convention for any future role-scoped resource.
- **`User` carries both a farmer profile (address/district) and a technician profile (serviceArea) on the same table** (2026-08-03): no separate `FarmerProfile`/`TechnicianProfile` tables — the fields are simply nullable and only populated for the relevant role, matching how the rest of auth already treats `User` as the single account table discriminated by `role`. The admin's technician-assign picker filters `GET /technicians?districtId=` by `serviceArea.districtId`, matched against the booking's farmer's `districtId`.
- **Push notifications use `firebase-admin`, not Expo's own push relay** (2026-08-03): architecture.md explicitly names `firebase-admin` as the allowed library for the notifications phase, so that's what was used even though Expo's push relay (`expo-server-sdk`) would need zero Firebase credentials and is arguably simpler. `NotificationsService` follows the exact same graceful-degradation pattern as `CloudinaryService`: `onModuleInit` checks for `FCM_PROJECT_ID`/`FCM_CLIENT_EMAIL`/`FCM_PRIVATE_KEY`, logs a warning and sets `configured = false` if missing, and every send site checks that flag first. **In-app notifications (the `Notification` table + all the inbox/read-state UI) do not depend on this at all** — they're written unconditionally; only the actual FCM push send is gated. Don't reintroduce a hard dependency on Firebase being configured for anything user-facing.
- **A booking-transition notification must never be able to fail the transition itself** (2026-08-03): `NotificationsService.notifyUser`/`pushToUser` catch and log all push errors internally rather than propagating them, and are called *after* the Prisma write in `BookingsService.assign/start/complete`, not inside the transaction. If this pattern changes (e.g. notifications move inside a `$transaction`), make sure a down Firebase project or bad token still can't roll back a booking assign/start/complete.
- **No charting library was added for the Phase 8 reports** (2026-08-03): `architecture.md` §12's allowed-libraries list doesn't mention one, and adding recharts/victory-native/etc. purely for a few bar visualizations felt like scope creep. The report screens use plain `View` elements with a `style={{width: '${pct}%'}}` proportional bar instead — good enough for the inventory/booking/conception breakdowns. If a future phase needs real interactive charts, that's a deliberate library decision to make then, not something to retrofit silently.
- **A global exception filter was missing through Phases 1–7 despite being documented** (2026-08-03, found during the Phase 8 hardening pass): `architecture.md` §10 calls for one; none existed. It turned out not to be a real vulnerability — Nest's default handling already sanitizes non-HttpException errors to a generic 500, and `LoggingInterceptor` already logs everything with redaction — but `server/src/common/http-exception.filter.ts` (registered via `APP_FILTER`) now makes the `{statusCode, message, error}` envelope an explicit guarantee rather than an artifact of framework defaults. Verified via curl that no existing error response shape changed.

---

## 6. Known Issues

- None yet (implementation not started under the fresh roadmap).

---

## 7. Future Improvements

Out of current scope (see `PRD.md` §15): payments, subsidy handling, multi-language, AI-based genetics recommendation, IoT heat-detection.

---

## 8. Session Notes

- **This session:** Refined the plan to all-native RN (adaptive Admin) + Cloudinary; switched DB to Supabase (no Docker); set day-one auth to phone+password with OTP and Maps deferred to the final phase; standardized on `lucide-react-native`; finalized the 11-master data model. Rewrote PRD, phases, architecture, design, memory; removed `rules.md` and `SETUP.md`. Awaiting review/approval before implementation begins.
