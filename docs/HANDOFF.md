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

- **Phase:** Phase 1 — Foundation & Infrastructure **in progress** (reset-fresh rebuild).
- **Branch / PR:** docs on `docs/planning-refactor` (PR open, unmerged); Phase 1 work on `phase-1-foundation` (stacked on docs).
- **Health:** 🟡 Blocked — waiting on a Supabase `DATABASE_URL` to run migrations + verify.
- **Decision:** **Reset code fresh** — the earlier OTP/Docker/Expo-Web scaffold is being removed and rebuilt to the new plan.
- **Last updated by:** Amaan Ali · **Date:** 2026-08-02
- **One-line summary:** Started Phase 1 on a clean-slate basis: removed Docker Postgres, switched env to Supabase. Old app/server code still present pending the rebuild (needs Supabase URL).

---

## In Progress (WIP)

- **Phase 1 reset-fresh rebuild.** Done so far on `phase-1-foundation`: removed `docker/` (Supabase replaces local Docker Postgres); rewrote `server/.env.example` for Supabase + phone-password + Cloudinary (OTP/FCM/Maps commented as later phases).
- **Still to do (blocked on Supabase URL):** remove old-plan code (`server/src/auth` OTP module, `server/src/admin-users`, OTP Prisma models, old app screens/CORS); stand up a clean NestJS (health + Prisma) against Supabase; re-scaffold the three Expo apps; verify `GET /api/v1/health` + apps boot.

---

## Next Steps  *(ordered queue — do the top one)*

1. **Provide a Supabase `DATABASE_URL`** (create project → paste here or into `server/.env`). Blocks everything below.
2. **Finish Phase 1 rebuild:** purge old-plan code, clean NestJS (health + Prisma) on Supabase, re-scaffold the three Expo apps, verify health + boots.
3. Then Phase 2 — Auth (phone + password).

---

## Blockers / Decisions Needed

- 🔴 **Need a Supabase `DATABASE_URL`** to run Prisma migrations and verify Phase 1. Cannot proceed with the rebuild's DB steps without it.
- Deferred to Phase 9 (not blocking): SMS/OTP provider account, Google Maps API key + billing.

---

## Active Ownership  *(prevent collisions — who is on what right now)*

| Owner | Working on | Branch | Since |
|-------|-----------|--------|-------|
| Amaan Ali | Phase 1 — Foundation (reset-fresh rebuild) | `phase-1-foundation` | 2026-08-02 |

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

### 2026-08-02 — Amaan Ali (2)
- **Did:** Chose **reset code fresh**. Started Phase 1 on `phase-1-foundation`: removed `docker/`, switched `server/.env.example` to Supabase + phone-password.
- **State:** 🟡 Blocked — need a Supabase `DATABASE_URL` before the DB rebuild + verification.
- **Next:** Provide Supabase URL, then purge old-plan code and rebuild clean NestJS + Expo apps.

### 2026-08-02 — Amaan Ali
- **Did:** Refactored the full doc set (PRD, architecture, phases, design, memory) to all-native RN + Supabase + Cloudinary; enhanced design.md for high-UX; established this handoff protocol.
- **State:** Docs complete; no code started.
- **Next:** Begin Phase 1 — Foundation & Infrastructure.
