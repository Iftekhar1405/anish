# PRD — Artificial Insemination (AI) Management Platform

> Production-grade platform for managing Artificial Insemination services for **cattle and goats**, built to scale to thousands of farmers across multiple states.

---

## 1. Vision

Connect **farmers, AI technicians, and administrators** on a single platform to request, schedule, deliver, and track livestock artificial insemination — improving conception rates, genetic quality, and breeding record-keeping across cattle and goat populations.

The platform digitizes the full lifecycle:

```
catalogue → booking → admin assignment → technician service → completion → breeding history
```

---

## 2. Problem Statement

Livestock breeding in many regions relies on manual coordination between farmers and AI technicians, which causes:

- No structured semen catalogue with genetic/quality data.
- No centralized booking system — requests happen over phone or word of mouth.
- No traceability of which straw/batch was used on which animal.
- No conception tracking or technician performance visibility.
- No inventory control over semen straws.

---

## 3. Goals

- One backend serving three role-scoped native mobile applications.
- Farmers get a simple way to manage animals and book AI services.
- Admins get full control over catalogue, inventory, bookings, assignment, and reporting.
- Technicians get a focused mobile workflow for assigned jobs.
- Accurate breeding and conception records maintained throughout.

---

## 4. Business Objectives

- Increase successful conception rates through better genetics matching and traceability.
- Improve technician utilization and route efficiency.
- Enable data-driven decisions via reports and analytics.
- Reduce semen straw wastage through inventory control.
- Establish a scalable foundation for multi-state expansion.

---

## 5. Target Users & Personas

| Role | Persona | Context |
|------|---------|---------|
| **Admin** | Priya, Operations Lead | Native mobile/tablet admin; needs dashboards, assignment control, inventory, and reports in an **adaptive layout** that scales from phone to tablet. |
| **Farmer** | Ramesh, Dairy Farmer | Mobile-first, low-to-moderate tech comfort; needs simple animal management and booking with clear status. |
| **Technician** | Suresh, Field AI Technician | Mobile-first, on the move; needs today's schedule, navigation, and quick service recording. |

---

## 6. Applications

Three **independent native mobile React Native (Expo) applications** for **iOS and Android**, sharing **one backend**.

- **Admin App** — the primary control surface. A **native mobile app** designed with an **adaptive admin experience**: tablet/large-screen aware, data tables collapse to list/card views on phones, and dashboards and reports are optimized for touch. Manage farmers, technicians, animals, bookings, assignment, catalogue, inventory, prices, districts, service areas, notifications, reports, analytics, and settings.
- **Farmer App** — native mobile. Register, manage animals, browse the semen catalogue, book AI services, track status, view breeding history, receive notifications.
- **AI Technician App** — native mobile. Receive assignments, view today's schedule, navigate to the farmer, record insemination details and straw used, submit completion.

All three apps are built with the same React Native (Expo) stack and share frontend logic (API client, types, UI primitives) across the monorepo.

---

## 7. Functional Requirements

### Authentication
- **Phone + password login** with JWT-based session/authorization (day one).
- **OTP login is added in the final phase** as an additional method.
- Role-based access: Admin / Farmer / Technician.

### Farmer
- Register / manage profile.
- CRUD animals (species: cattle/goat; breed, tag, age, breeding status).
- Browse the semen catalogue (filter by species, breed, organization, availability).
- Create a booking: **Select Animal → Select Bull/Buck Straw → Choose Preferred Date → Submit**.
- **Farmer does NOT select the technician.**
- Track booking status; view breeding history; receive notifications.

### Admin
- Dashboard.
- Manage Farmers, Technicians, Animals, Bookings.
- **Assign a technician to a booking.**
- Manage semen inventory, Bull/Buck catalogue, and prices.
- Manage notifications, districts, and service areas.
- Reports & analytics: inventory, booking, technician performance, conception statistics.
- Application settings.

### Technician
- Receive assignments; view today's schedule.
- Navigate to the farmer location (Google Maps).
- Record insemination details and semen straw used, update status, submit completion.

---

## 8. Booking Flow

```
Farmer
  → Select Animal
  → Select Bull/Buck Semen Straw
  → Choose Preferred Date
  → Submit Booking            (booking becomes PENDING)
  → Booking appears on Admin Dashboard
Admin
  → Reviews booking
  → Assigns AI Technician     (PENDING → ASSIGNED)
Technician
  → Receives assignment
  → Starts service            (ASSIGNED → IN_PROGRESS)
  → Records straw + details, submits completion  (IN_PROGRESS → COMPLETED)
  → Breeding history updated; inventory decremented
```

The booking state machine (`PENDING → ASSIGNED → IN_PROGRESS → COMPLETED`, or `CANCELLED`) is enforced server-side. Only Admin can assign; only the assigned Technician can advance a booking through service.

---

## 9. Semen Catalogue

**Cattle (Bull):** Bull Name, Breed, Organization, Genetic Score, Milk Yield Potential, Fat %, Fertility Rating, Disease-Free Status, Straw Price, Availability, Batch Number.

**Goat (Buck):** Buck Name, Breed, Growth Index, Fertility Rating, Disease-Free Status, Straw Price, Batch Number, Availability.

---

## 10. System Modules

Auth · Farmers · Animals · Catalogue (Bull/Buck) · Inventory (Straws/Batches) · Bookings · Assignment · Technicians · Breeding History · Notifications · Districts · Service Areas · Reports · Analytics · Settings.

---

## 11. Non-Functional Requirements

- **Scalability** to thousands of farmers, multi-state.
- **Performance**: fast list loading, paginated APIs, cached queries.
- **Reliability**: consistent booking state machine, no lost bookings.
- **Security**: JWT, role checks, input validation, least-privilege.
- **Availability**: stateless backend, horizontally scalable.
- **Observability**: structured logs, error tracking.
- **Accessibility**: readable typography, adequate touch targets, system font scaling.
- **Offline tolerance (technician)**: graceful handling of poor connectivity during field service (queued submission where feasible).

---

## 12. Representative User Stories

- As a **farmer**, I can add my animals so I can book AI for a specific one.
- As a **farmer**, I can browse the catalogue and pick a straw so genetics match my goal.
- As a **farmer**, I can submit a booking with a preferred date and track its status.
- As an **admin**, I can review incoming bookings and assign a technician.
- As an **admin**, I can manage catalogue, prices, and inventory.
- As an **admin**, I can view conception statistics and technician performance.
- As a **technician**, I can see today's schedule and navigate to the farmer.
- As a **technician**, I can record the straw used and submit completion.

---

## 13. Success Metrics

- Conception rate per technician / per straw batch.
- Booking-to-completion cycle time.
- Straw inventory accuracy.
- Farmer retention / repeat bookings.
- Technician on-time completion rate.

---

## 14. Delivery Roadmap

The platform is built **phase by phase** — each phase verified and tested before the next begins — as detailed in `phases.md`. The build sequences foundation and infrastructure, authentication and access control, the design system and admin core, master data (catalogue, inventory, animals, districts, service areas), the farmer app and booking creation, admin assignment and the technician field workflow, breeding history and notifications, reporting/analytics/settings/hardening, and production deployment.

Platform services: **media uploads via Cloudinary**, push notifications via **Firebase Cloud Messaging (FCM)**, and navigation/geocoding via **Google Maps**.

---

## 15. Future Scope

Out of current build scope: payment integration, subsidy handling, multi-language, AI-based genetics recommendation, IoT heat-detection integration.
