# CLAUDE.md — Agent Guide

Production-grade **Artificial Insemination Management Platform** (cattle + goats): one **NestJS** backend + three **native React Native (Expo)** apps (Admin adaptive, Farmer, Technician). **Supabase** Postgres (Prisma), **Cloudinary** media.

## ⚠️ Two-developer workflow — read this first, every session

Two developers — **Amaan Ali** and **Iftekhar Ahemad** — each with an AI agent, share this repo. To resume exactly where the other left off:

1. **On start:** `git pull`, then **read** `docs/HANDOFF.md` **first**, then `docs/memory.md`. Begin from HANDOFF's **Next Steps**.
2. **Check Active Ownership** in `docs/HANDOFF.md` before touching files — don't double-work what the partner is on.
3. **Before every push:** update `docs/HANDOFF.md` (Current Status · In Progress · Next Steps · Blockers + a Handoff Log entry) and `docs/memory.md` if a decision or phase status changed.
4. **Branch per unit of work**, open a PR, and never leave `master` broken.



## Documentation map

- `docs/HANDOFF.md` — **live baton**: current status, WIP, next steps (start here).
- `docs/memory.md` — long-lived decisions and session log.
- `docs/PRD.md` — product scope (what & why).
- `docs/phases.md` — the **10-phase** build roadmap; build **one phase at a time**.
- `docs/architecture.md` — system design, data model (11 masters), API, auth, standards/rules, setup, env.
- `docs/design.md` — design system + UX.



## Core rules (full detail in `architecture.md` §10 & §17)

- **One phase at a time**; each phase verified and tested before the next. Update docs first, then code.
- TypeScript strict, **no** `any`; shared types from `packages/types`; feature-based architecture; no duplicated code.
- Every form has Validation / Loading / Error / Success / Empty states. No placeholder screens.
- Day-one auth = **phone + password**; OTP and Google Maps are **deferred to Phase 9**.
- Money as integer minor units; booking state machine + inventory decrement enforced server-side; secrets never shipped to clients (Cloudinary uploads backend-signed).
- No Co-author in commit message ever.
- Icons: `lucide-react-native` only. DB is Supabase (no Docker). No Next.js / web-DOM UI / AWS S3 / Redux.



## Setup

```bash
pnpm install
# server/.env needs Supabase DATABASE_URL
pnpm --filter server start:dev   # GET /api/v1/health
pnpm --filter admin start        # or farmer / technician
```

