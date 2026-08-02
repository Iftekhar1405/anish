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

- **Phase:** Documentation & planning complete. Implementation **not started**.
- **Next phase to build:** Phase 1 — Foundation & Infrastructure.
- **Branch / PR:** `master` (no feature branch yet).
- **Health:** 🟢 Green — docs consistent, nothing broken.
- **Last updated by:** Amaan Ali · **Date:** 2026-08-02
- **One-line summary:** Docs refactored to all-native RN + Supabase + Cloudinary, phone+password day-one auth, 10-phase roadmap. Ready to start Phase 1.

---

## In Progress (WIP)

- Nothing in flight. No half-done code.
- _(When picking up work, list here: what you're building, files touched, and how to run/test the partial state so your partner can continue it.)_

---

## Next Steps  *(ordered queue — do the top one)*

1. **Start Phase 1 — Foundation & Infrastructure** (`phases.md` §Phase 1): monorepo (pnpm + Turborepo), three Expo apps, `packages/*`, NestJS server, Prisma + **Supabase** `DATABASE_URL`, `GET /api/v1/health`.
2. Then Phase 2 — Auth (phone + password).
3. Then Phase 3 — Design System & Admin Core.

---

## Blockers / Decisions Needed

- **None right now.**
- Deferred to Phase 9 (not blocking): SMS/OTP provider account, Google Maps API key + billing.

---

## Active Ownership  *(prevent collisions — who is on what right now)*

| Owner | Working on | Branch | Since |
|-------|-----------|--------|-------|
| _(none)_ | — | — | — |

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

### 2026-08-02 — Amaan Ali
- **Did:** Refactored the full doc set (PRD, architecture, phases, design, memory) to all-native RN + Supabase + Cloudinary; enhanced design.md for high-UX; established this handoff protocol.
- **State:** Docs complete; no code started.
- **Next:** Begin Phase 1 — Foundation & Infrastructure.
