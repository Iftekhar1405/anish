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

- **Phase:** Phase 1 — Foundation & Infrastructure — ✅ **COMPLETE & verified** (all three apps boot and show `API ok · DB connected`). Ready to start **Phase 2**.
- **Branch / PR:** docs on `docs/planning-refactor` (PR open, unmerged); Phase 1 work on `phase-1-foundation` (stacked on docs, **local — not pushed**).
- **Health:** 🟢 Green — backend live on Supabase; three native apps boot.
- **Decision:** **Reset code fresh** — earlier OTP/Docker/Expo-Web scaffold removed and rebuilt to the new plan.
- **Last updated by:** Amaan Ali · **Date:** 2026-08-02
- **One-line summary:** Phase 1 done and verified end-to-end. Next: Phase 2 — phone + password auth.

---

## In Progress (WIP)

- **Nothing in flight.** Phase 1 complete and committed on `phase-1-foundation`. Phase 2 not yet started.
- Reference — Phase 1 delivered: Supabase-backed NestJS (Config+Prisma+Health, verified green) and three native Expo app shells (boot + `/health` status, typecheck clean). Shared-package auth/UI reset still deferred to Phases 2–3.

---

## Next Steps  *(ordered queue — do the top one)*

1. **Boot check (human):** `pnpm --filter admin start` (then `farmer`, `technician`) on a simulator; confirm the home screen shows `API ok · DB connected`. Start the server first (`pnpm --filter server start:dev`). Closes Phase 1.
2. **Phase 2 — Auth (phone + password):** Prisma `User`(+password_hash, `@@unique([phone, role])`)/`RefreshToken`; `POST /auth/login` + `/auth/refresh`; roles guard; reset `packages/api-client` auth surface (drop OTP); login screens + secure token storage in each app.

---

## Blockers / Decisions Needed

- **None blocking.** Supabase URL received; backend green. Remaining Phase 1 (app shells) can proceed; final app-boot check needs a simulator on a dev machine.
- Deferred to Phase 9 (not blocking): SMS/OTP provider account, Google Maps API key + billing.

---

## Active Ownership  *(prevent collisions — who is on what right now)*

| Owner | Working on | Branch | Since |
|-------|-----------|--------|-------|
| _(none — Phase 1 done)_ | — | — | — |

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
