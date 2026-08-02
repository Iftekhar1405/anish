# memory.md — AI Management Platform (Living Log)

> Updated after every implementation session. Records the current state, decisions, and open items so any session can resume with full context.

---

## 1. Project Overview

Production-grade Artificial Insemination management platform for **cattle and goats**. One **NestJS** backend serves **three native React Native (Expo) apps** — Admin (native, adaptive), Farmer, Technician. **Supabase Postgres** (Prisma), **Cloudinary** media. Build proceeds **one phase at a time** (`phases.md`). Full scope in `PRD.md`; technical spec in `architecture.md`; design system in `design.md`.

---

## 2. Current Phase

**Phase 1 — Foundation & Infrastructure — in progress** on branch `phase-1-foundation` (reset-fresh rebuild). 🟡 Blocked on a Supabase `DATABASE_URL`. See `HANDOFF.md` for the live state.

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

---

## 6. Known Issues

- None yet (implementation not started under the fresh roadmap).

---

## 7. Future Improvements

Out of current scope (see `PRD.md` §15): payments, subsidy handling, multi-language, AI-based genetics recommendation, IoT heat-detection.

---

## 8. Session Notes

- **This session:** Refined the plan to all-native RN (adaptive Admin) + Cloudinary; switched DB to Supabase (no Docker); set day-one auth to phone+password with OTP and Maps deferred to the final phase; standardized on `lucide-react-native`; finalized the 11-master data model. Rewrote PRD, phases, architecture, design, memory; removed `rules.md` and `SETUP.md`. Awaiting review/approval before implementation begins.
