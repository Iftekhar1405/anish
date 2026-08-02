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

- **Phase:** Phases 1–2 ✅ done & verified on device. **Phase 3 — Design System & Admin Core — starting.**
- **Branch / PR:** `phase-1-foundation` → `phase-2-auth` → `phase-3-admin-core` (stacked, **local — not pushed**).
- **Health:** 🟢 Green — auth works end-to-end on all three apps (login + farmer register verified).
- **Decision:** **Reset code fresh**; account model — **farmer self-registers; admin/technician seeded**; technician accounts created by Admin (Phase 3) with an admin-set initial password.
- **Last updated by:** Amaan Ali · **Date:** 2026-08-02
- **One-line summary:** Auth complete. Now building the design system (`packages/ui`) + Admin core (dashboard, Manage Farmers/Technicians).

---

## In Progress (WIP)

- **Phase 3 — Design System & Admin Core — starting** on `phase-3-admin-core`.
  - Plan chunks: **(A) backend** farmers + technicians modules (list/get/update; technician create) — admin-guarded, verify via curl. **(B) `packages/ui`** reset from `design.md` (Button, Input, Card/StatCard, adaptive Table↔Card, Dialog/Sheet, EmptyState, Loading, Toast). **(C) Admin app** navigation shell + Dashboard + Manage Farmers/Technicians CRUD with RHF+Zod, all five states.
  - Note: farmers = `User(role=FARMER)`, technicians = `User(role=TECHNICIAN)` — no new tables; admin creates technicians with an initial password.

---

## Next Steps  *(ordered queue — do the top one)*

1. **Phase 3 · Chunk A (backend):** `farmers` + `technicians` admin-guarded modules — list (paginate/search/filter by isActive), get, update (name/isActive), create technician (phone/name/password). Verify via curl with an admin token.
2. **Chunk B:** reset `packages/ui` to `design.md` primitives (+ adaptive Table↔Card). Typecheck.
3. **Chunk C:** Admin nav shell + Dashboard + Manage Farmers/Technicians screens; human simulator check.

---

## Blockers / Decisions Needed

- **None blocking.** Supabase URL received; backend green. Remaining Phase 1 (app shells) can proceed; final app-boot check needs a simulator on a dev machine.
- Deferred to Phase 9 (not blocking): SMS/OTP provider account, Google Maps API key + billing.

---

## Active Ownership  *(prevent collisions — who is on what right now)*

| Owner | Working on | Branch | Since |
|-------|-----------|--------|-------|
| Amaan Ali | Phase 3 — Design System & Admin Core | `phase-3-admin-core` | 2026-08-02 |

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

### 2026-08-02 — Amaan Ali (7)
- **Did:** Phase 2 login/register verified on simulators — **Phase 2 complete**. Marked done in `phases.md`. Starting Phase 3.
- **State:** 🟢 Auth done end-to-end.
- **Next:** Phase 3 · Chunk A — backend farmers/technicians modules.

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
