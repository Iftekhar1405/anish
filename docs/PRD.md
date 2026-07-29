# PRD.md — Artificial Insemination Management Platform

> Production-grade platform for managing Artificial Insemination (AI) services for **cattle and goats**, intended to scale to thousands of farmers across multiple states.

---

## 1. Project Vision

Build a reliable, scalable platform that connects farmers, AI technicians, and administrators to request, schedule, deliver, and track livestock artificial insemination services — improving conception rates, genetic quality, and breeding record-keeping across cattle and goat populations.

---

## 2. Problem Statement

Livestock breeding in many regions relies on manual coordination between farmers and AI technicians. This leads to:

- No structured semen catalogue with genetic/quality data.
- No centralized booking system; requests happen over phone/word of mouth.
- No traceability of which straw/batch was used on which animal.
- No conception tracking or technician performance visibility.
- No inventory control over semen straws.

The platform digitizes the full lifecycle: catalogue → booking → admin assignment → technician service → completion → breeding history.

---

## 3. Goals

- Provide a single backend serving three applications.
- Give farmers a simple way to manage animals and book AI services.
- Give admins full control over catalogue, inventory, bookings, assignment, and reporting.
- Give technicians a focused mobile workflow for assigned jobs.
- Maintain accurate breeding and conception records.

---

## 4. Business Objectives

- Increase successful conception rates through better genetics matching and traceability.
- Improve technician utilization and route efficiency.
- Enable data-driven decisions via reports and analytics.
- Reduce semen straw wastage through inventory control.
- Establish a scalable foundation for multi-state expansion.

---

## 5. Target Users

- **Admin** — organization/cooperative staff managing the system.
- **Farmer** — owns cattle/goats, books services.
- **AI Technician** — performs insemination in the field.

---

## 6. User Personas

**Admin (Priya, Operations Lead)** — desktop-first user, needs dashboards, assignment control, inventory, and reports.

**Farmer (Ramesh, Dairy Farmer)** — mobile-first, low-to-moderate tech comfort, needs simple animal management and booking with clear status.

**Technician (Suresh, Field AI Technician)** — mobile-first, on the move, needs today's schedule, navigation, and quick service recording.

---

## 7. Applications

Three **independent React Native (Expo) applications** sharing **one backend**.

### 7.1 Admin App
Primary application. Admin controls the complete system.
- Built with Expo and runs **desktop-first as a web build** (`react-native-web` via Expo Web). Optimized for large-screen browser use.

### 7.2 Farmer App
Native mobile (iOS/Android via Expo). Farmers:
- Register, Manage animals, Browse semen catalogue, Book AI services, Track booking status, View breeding history, Receive notifications.

### 7.3 AI Technician App
Native mobile (iOS/Android via Expo). Technicians:
- Receive assigned bookings, View today's schedule, Navigate to farmer location, Record insemination details, Update booking status, Record semen straw used, Submit service completion.

---

## 8. Functional Requirements

### Authentication
- OTP-based login; JWT-based session/authorization.
- Role-based access: Admin / Farmer / Technician.

### Farmer
- Register / manage profile.
- CRUD animals (species: cattle/goat, breed, tag, age, breeding status).
- Browse semen catalogue (filter by species, breed, org, availability).
- Create booking: **Select Animal → Select Bull/Buck Straw → Choose Preferred Date → Submit**.
- Farmer does **NOT** select the technician.
- Track booking status; view breeding history; receive notifications.

### Admin
- Dashboard.
- Manage Farmers, Technicians, Animals, Bookings.
- Assign Technician to a booking.
- Manage Semen Inventory, Bull/Buck Catalogue, Prices.
- Manage Notifications, Districts, Service Areas.
- Reports & Analytics: Inventory, Booking, Technician Performance, Conception Statistics.
- Application Settings.

### Technician
- Receive assignments; view today's schedule.
- Navigate to farmer location (Google Maps).
- Record insemination details, semen straw used, update status, submit completion.

---

## 9. Non-Functional Requirements

- **Scalability** to thousands of farmers, multi-state.
- **Performance**: fast list loading, paginated APIs, cached queries.
- **Reliability**: consistent booking state machine, no lost bookings.
- **Security**: JWT, role checks, input validation, least-privilege.
- **Availability**: stateless backend, horizontally scalable.
- **Observability**: structured logs, error tracking.
- **Accessibility**: readable typography, adequate touch targets.
- **Offline-tolerance (technician)**: graceful handling of poor connectivity during field service (queued submission where feasible).

---

## 10. Booking Flow

```
Farmer
  → Select Animal
  → Select Bull/Buck Semen Straw
  → Choose Preferred Date
  → Submit Booking
  → Booking goes to Admin Dashboard
  → Admin reviews booking
  → Admin assigns AI Technician
  → Technician receives assignment
  → Technician performs service
  → Booking completed
```

---

## 11. Semen Catalogue

**Cattle:** Bull Name, Breed, Organization, Genetic Score, Milk Yield Potential, Fat %, Fertility Rating, Disease Free Status, Straw Price, Availability, Batch Number.

**Goat:** Buck Name, Breed, Growth Index, Fertility Rating, Disease Free Status, Straw Price, Batch Number, Availability.

---

## 12. System Modules

Auth · Farmers · Animals · Catalogue (Bull/Buck) · Inventory (Straws/Batches) · Bookings · Assignment · Technicians · Breeding History · Notifications · Districts · Service Areas · Reports · Analytics · Settings.

---

## 13. User Stories (representative)

- As a **farmer**, I can add my animals so I can book AI for a specific one.
- As a **farmer**, I can browse the catalogue and pick a straw so genetics match my goal.
- As a **farmer**, I can submit a booking with a preferred date and track its status.
- As an **admin**, I can review incoming bookings and assign a technician.
- As an **admin**, I can manage catalogue, prices, and inventory.
- As an **admin**, I can view conception statistics and technician performance.
- As a **technician**, I can see today's schedule and navigate to the farmer.
- As a **technician**, I can record the straw used and submit completion.

---

## 14. Future Scope

(Placeholder for later phases — not in current build scope.) Payment integration, subsidy handling, multi-language, AI-based genetics recommendation, IoT heat-detection integration.

---

## 15. Success Metrics

- Conception rate per technician / per straw batch.
- Booking-to-completion cycle time.
- Straw inventory accuracy.
- Farmer retention / repeat bookings.
- Technician on-time completion rate.
