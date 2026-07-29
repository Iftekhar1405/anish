# rules.md — AI Management Platform

---

## 1. Development Rules

- Work **only phase by phase**. Never build everything together.
- Read all markdown files before implementing. Update docs first, then code.
- Verify architecture impact before adding a feature.
- Implement only the requested feature. Update `memory.md` after each session.
- Never create placeholder pages/screens. Every screen is production-ready.
- Verify, test, and confirm each step before proceeding to the next.

---

## 2. Coding Rules

- TypeScript strict; **no `any`**.
- Every API properly typed; shared types from `packages/types`.
- No duplicated code; extract shared logic.
- Feature-based architecture on client and server.
- Small, focused functions and components.

---

## 3. Component Rules (React Native / Expo)

- Reusable components only; app-agnostic primitives live in `packages/ui`.
- Use **NativeWind** (Tailwind-style utilities for RN) for styling — consistent tokens across apps.
- **No Server Components / RSC** — they do not exist in React Native. Data fetching is via TanStack Query hooks, not server components.
- Admin (Expo Web) may use responsive/desktop layouts but must use the same RN component model (no separate web-only DOM stack).
- Every form must implement: **Validation, Loading, Error, Success, Empty** states.

---

## 4. Folder Rules

- Group by **feature**, not by type.
- Screens in `features/<feature>/screens`; routes wired via Expo Router in `app/`.
- No cross-feature deep imports; go through a feature's public surface or shared packages.

---

## 5. Error Handling Standards

- Backend: global exception filter; consistent error envelope.
- Client: TanStack Query error states surfaced in UI; user-friendly messages.
- No swallowed errors; log with context on the server.
- Field service (technician) submissions handle connectivity failures gracefully (retry/queue where feasible).

---

## 6. Validation Standards

- **Zod** on the client (RHF resolver) and `class-validator` on the backend DTOs.
- Validate at the boundary; never trust client input.
- Money as integer minor units; validate ranges/enums explicitly.

---

## 7. API Standards

- REST, versioned `/api/v1`, resource-oriented.
- Pagination/filtering/sorting on list endpoints.
- Explicit endpoints for booking state transitions.
- Consistent status codes and error shape.

---

## 8. Database Standards

- Prisma migrations for every schema change; never edit the DB manually.
- Transactions for multi-step writes (e.g., completion + inventory decrement).
- Local Postgres via Docker; production uses managed Postgres.
- No floats for money.

---

## 9. Security Rules

- JWT auth + roles guard on every protected route.
- OTP verification for login; refresh-token rotation.
- Least-privilege role scoping (Admin/Farmer/Technician).
- Secrets only on the backend; **Cloudinary uploads use backend-signed params** — never ship API secrets to clients.
- Store tokens in SecureStore (native) / secure storage (web).
- Validate and sanitize all inputs.

---

## 10. Performance Rules

- Paginated, cached queries (TanStack Query); avoid over-fetching.
- FlatList/virtualization for long lists.
- Optimize images via Cloudinary transformations.
- Memoize expensive components; avoid unnecessary re-renders.

---

## 11. Accessibility Rules

- Adequate touch targets and contrast.
- Accessible labels/roles on interactive elements.
- Readable typography scale; support system font scaling where feasible.

---

## 12. Testing Rules

- Unit tests for services and critical business logic (booking state machine, inventory).
- Component tests for shared UI primitives.
- E2E for core flows where feasible (booking → assignment → completion).
- **Each phase is verified and tested before proceeding.**

---

## 13. Libraries Allowed

- **Frontend**: Expo, Expo Router, React Native, TypeScript, NativeWind, React Hook Form, TanStack Query, Zod, Zustand (only if needed), react-native-maps (Google Maps), Cloudinary SDK (client upload), Expo SecureStore, Expo Notifications/FCM.
- **Backend**: NestJS, TypeScript, Prisma, class-validator/class-transformer, JWT, Cloudinary Node SDK, firebase-admin (FCM).

---

## 14. Libraries NOT Allowed

- **Shadcn UI / Tailwind DOM components** (web-DOM only — replaced by NativeWind + `packages/ui`).
- **Next.js** (replaced by Expo across all apps).
- **AWS S3 SDK** (replaced by Cloudinary).
- Redux / Redux Toolkit.
- Any unmaintained or unnecessary dependency; no duplicate solutions for the same problem.

---

## 15. AI Boundaries

- Do not generate code during the documentation phase.
- Do not add features outside the defined scope.
- Do not assume or merge unconfirmed features; document only confirmed details.
- Do not skip documentation or the phase-by-phase process.

---

## 16. Things to Never Do

- Never let the farmer select a technician (admin assigns).
- Never store money as float.
- Never ship secrets to clients.
- Never build multiple phases at once.
- Never create placeholder/non-production screens.
- Never use `any`.
- Never bypass validation or the booking state machine.
