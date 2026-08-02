# HANDOFF.md — Live Handoff / Baton

> **This is the "start here" doc for two-developer collaboration.** Two developers — **Amaan Ali** and **Iftekhar Ahemad** — each with an AI agent, work on this repo. This file is the live baton: it always reflects **where we are, what's in flight, and what to do next**, so whoever picks up (human or agent) resumes without guessing.
>
> `memory.md` holds long-lived project decisions. **This file holds the active state** — keep it short and current, not a diary of everything.

---

## Protocol (every agent + developer MUST follow)

1. **On start:** `git pull`, then **read this file first**, then `memory.md`. Begin from **Next Steps** below.
2. **Pick one thing** from Next Steps. If another owner is listed as active on it (see Active Ownership), coordinate — don't double-work.
3. **Work one phase at a time** (see `phases.md`); update docs before code; verify/test before claiming done.
4. **Before every push:** update the four rolling sections below (**Current Status · In Progress · Next Steps · Blockers**) and add a **Handoff Log** entry (newest on top). Update `memory.md` if a decision or phase status changed.
5. **Branch per unit of work** (e.g. `phase-1-foundation`); open a PR; note branch/PR in Current Status. Never leave `master` in a broken state.
6. Leave the repo so the next person can `pull` and continue with zero context loss.

---

## Current Status  *(overwrite each session — single source of truth)*

- **Phase:** Phase 1 ✅ done. Phase 2 — phone + password auth — **code-complete**; backend verified via curl, all typechecks clean. Remaining: on-simulator login test.
- **Branch / PR:** Phase 1 on `phase-1-foundation`; Phase 2 on `phase-2-auth` (stacked on Phase 1, **local — not pushed**).
- **Health:** 🟢 Backend auth verified (register/login/me/refresh/reuse-detection all pass). Apps typecheck clean; boot/login unverified on device.
- **Decision:** **Reset code fresh**; account model — **farmer self-registers; admin/technician seeded**.
- **Last updated by:** Amaan Ali · **Date:** 2026-08-02
- **One-line summary:** Full phone+password auth built across backend + shared packages + all three apps. Needs a simulator login test to close Phase 2.

---

## In Progress (WIP)

- **Phase 2 auth — code-complete on `phase-2-auth`, pending simulator test.**
  - Backend (`56d3813`): `User`+`RefreshToken` (migration on Supabase); `/auth/register|login|refresh|logout|me`; scrypt passwords; rotating sha256 refresh tokens + reuse detection; RolesGuard; admin+technician seeded (`Password@123`). **Verified via curl.**
  - Packages (`f119c40`): `types` + `api-client` auth surface reset to phone+password.
  - Apps (`62f575b`): SecureStore storage, AuthProvider, role-scoped login (all), farmer register, Expo Router auth gating, home shows user+logout+health. All typecheck clean.
- **To close Phase 2:** run each app on a simulator and test login (+ farmer register). See Next Steps. `packages/ui` reset still deferred to Phase 3.

---

## Next Steps  *(ordered queue — do the top one)*

1. **Login test (human):** start server (`pnpm --filter server start:dev`); run each app; then close Phase 2:
   - **admin** → login `+10000000001` / `Password@123`
   - **technician** → login `+10000000002` / `Password@123`
   - **farmer** → Register a new account (name/phone/password), land on Home, Log out, log back in
   - (Physical device: set `EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP.)
2. **Phase 3 — Design System & Admin Core:** build `packages/ui` primitives from `design.md` (reset old UI), adaptive table/card, then Admin dashboard + Manage Farmers/Technicians CRUD.

---

## Blockers / Decisions Needed

- **None blocking.** Supabase URL received; backend green. Remaining Phase 1 (app shells) can proceed; final app-boot check needs a simulator on a dev machine.
- Deferred to Phase 9 (not blocking): SMS/OTP provider account, Google Maps API key + billing.

---

## Active Ownership  *(prevent collisions — who is on what right now)*

| Owner | Working on | Branch | Since |
|-------|-----------|--------|-------|
| Amaan Ali | Phase 2 — auth (code-complete, awaiting boot test) | `phase-2-auth` | 2026-08-02 |

_Convention: split by phase or by layer (e.g. one on backend module, one on the app screens) to avoid overlapping the same files._

---

## Resume Instructions

```bash
git pull
pnpm install
# backend needs Supabase DATABASE_URL in server/.env
pnpm --filter server prisma migrate dev   # once schema exists
pnpm --filter server start:dev            # verify GET /api/v1/health
pnpm --filter admin start                 # or farmer / technician
```
See `architecture.md` §14 (Local Setup) for detail.

---

## Handoff Log  *(append newest on top; keep entries short)*

### 2026-08-02 — Amaan Ali (6)
- **Did:** Built Phase 2 phone+password auth end-to-end: backend (verified via curl), shared `types`/`api-client` reset, and all three apps (login/register/protected routing/logout). Account model: farmer self-registers; admin+technician seeded. Commits `56d3813`, `f119c40`, `62f575b`.
- **State:** 🟢 Code-complete; backend verified. Apps typecheck clean but not yet run on a simulator.
- **Next:** Human login test on simulators (see Next Steps), then Phase 3.

### 2026-08-02 — Amaan Ali (5)
- **Did:** Simulator boot check passed — all three apps show `API ok · DB connected`. **Phase 1 complete & verified.** Marked done in `phases.md`.
- **State:** 🟢 Phase 1 closed.
- **Next:** Phase 2 — phone + password auth.

### 2026-08-02 — Amaan Ali (4)
- **Did:** Reset the three Expo apps to clean Phase 1 shells (minimal `_layout` + `/health`-pinging home). All three typecheck clean (commit `950748a`).
- **State:** 🟢 Phase 1 code-complete. Only the on-simulator boot check remains.
- **Next:** Human runs each app on a simulator to confirm boot; then Phase 2 (phone+password auth).

### 2026-08-02 — Amaan Ali (3)
- **Did:** Reset backend to clean foundation on Supabase (purged OTP auth/admin-users/old migrations; minimal schema; Config+Prisma+Health). **Verified `GET /api/v1/health` green** against Supabase (commits `d3f0046`, `bb75be7`).
- **State:** 🟢 Backend done. Frontend (3 Expo apps + shared packages) still old-plan.
- **Next:** Reduce the three Expo apps to Phase 1 shells; verify boot on a simulator.

### 2026-08-02 — Amaan Ali (2)
- **Did:** Chose **reset code fresh**. Started Phase 1 on `phase-1-foundation`: removed `docker/`, switched `server/.env.example` to Supabase + phone-password.
- **State:** 🟡 Blocked — need a Supabase `DATABASE_URL` before the DB rebuild + verification.
- **Next:** Provide Supabase URL, then purge old-plan code and rebuild clean NestJS + Expo apps.

### 2026-08-02 — Amaan Ali
- **Did:** Refactored the full doc set (PRD, architecture, phases, design, memory) to all-native RN + Supabase + Cloudinary; enhanced design.md for high-UX; established this handoff protocol.
- **State:** Docs complete; no code started.
- **Next:** Begin Phase 1 — Foundation & Infrastructure.
