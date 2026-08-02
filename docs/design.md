# design.md — AI Management Platform Design System

> Implemented in React Native via **NativeWind** tokens, shared through `packages/ui`. Agriculture-inspired, modern, clean, minimal, fast. Applies to all three **native** apps. This document defines not just how the product *looks*, but how it *feels* — the motion, feedback, and micro-decisions that make it feel premium and effortless.

---

## 1. Experience Principles

The product should feel **calm, confident, and quick**. Three guiding feelings:

- **Trust** — clear data, honest states, never a dead-end. A farmer should never wonder "did that work?"
- **Effortless** — the shortest path to the task. One primary action per screen; secondary actions recede.
- **Alive but quiet** — motion and haptics confirm actions without shouting. Nothing bounces for attention.

**Design tenets**
- Clarity over decoration; data legibility first.
- One primary action per screen, visually dominant.
- Every tap gets immediate feedback (visual within 100ms; never a frozen frame).
- No blank screens — every state (loading, empty, error, success) is designed.
- Consistency across the three apps; only density and navigation differ by role.

---

## 2. Role-Tuned Experience

The same design language, tuned to each user's context:

| App | Context | UX priorities |
|-----|---------|---------------|
| **Farmer** | Low-to-moderate tech comfort, outdoors, one-handed | Large touch targets, minimal text, visual/status-led, generous spacing, plain-language microcopy, confidence at every step. |
| **Technician** | On the move, field conditions, gloves, poor signal | High-contrast for sunlight, big tap zones, one-hand reachability, prominent primary action, resilient offline states, quick data entry (pickers over typing). |
| **Admin** | Focused work, phone→tablet, data density | Adaptive layouts (tables ↔ cards), scannable rows, batch-friendly, keyboard-aware on tablet, dense but breathable. |

---

## 3. Brand Identity

Trustworthy, agricultural, professional. Green-forward palette evoking pasture/health, with warm earth accents. Neutral, legible surfaces for data-heavy admin screens. Photography (catalogue sires via Cloudinary) is warm and natural, never stocky.

---

## 4. Color Palette

**Primary (Pasture Green)**
`primary-50` #ECFDF5 · `primary-100` #D1FAE5 · `primary-500` #16A34A · `primary-600` #15803D · `primary-700` #166534

**Secondary (Earth/Amber)**
`secondary-100` #FEF3C7 · `secondary-500` #D97706 · `secondary-700` #B45309

**Neutral**
`neutral-50` #F9FAFB · `neutral-100` #F3F4F6 · `neutral-300` #D1D5DB · `neutral-500` #6B7280 · `neutral-700` #374151 · `neutral-900` #111827

**Semantic**
success #16A34A · warning #D97706 · error #DC2626 · info #2563EB

**Status accents (bookings)** — each booking state gets a consistent color + soft tinted background used on chips, timelines, and cards:
- `PENDING` amber · `ASSIGNED` info blue · `IN_PROGRESS` primary green · `COMPLETED` deep green · `CANCELLED` neutral-500.

**Usage rules:** primary for actions and active states only (never large fills of it); neutrals carry 90% of surfaces; semantic colors reserved strictly for meaning, never decoration. Maintain WCAG AA contrast (≥4.5:1 body, ≥3:1 large text).

---

## 5. Typography

- Font: system-first (SF/Roboto) with an optional brand sans (e.g. Inter) via Expo fonts. Load fonts before first paint to avoid flash.
- **Type scale:** xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36.
- **Weights:** regular 400 · medium 500 · semibold 600 · bold 700.
- **Line-height:** 1.4–1.5 for body, 1.2 for headings. **Letter-spacing:** slight negative (-0.2) on large headings only.
- Body base/regular; screen titles 2xl/semibold; section labels sm/medium uppercase neutral-500; captions sm neutral-500.
- **Numerals:** use tabular figures for tables, prices, and stats so columns align.

---

## 6. Spacing, Radius, Elevation

- **Spacing (8pt-based):** `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Default gutter 16; section spacing 24–32. Consistent rhythm > pixel-perfect novelty.
- **Radius:** sm 6 · md 10 · lg 14 · xl 20 · full 9999. Cards md/lg; buttons md; inputs md; pills/avatars full. One radius family throughout — no mixed corner styles.
- **Elevation (depth ladder):** flat (page) → sm (list items/chips) → md (cards) → lg (sheets/dialogs) → xl (menus/toasts). Native `elevation` on Android, soft low-opacity shadow on iOS. Depth signals interactivity — don't elevate static content.

---

## 7. Motion & Micro-interactions

Motion confirms cause-and-effect. It is **fast, subtle, and purposeful** — never blocking.

- **Durations:** micro 120ms (press, toggle) · standard 200ms (transitions, fades) · entrance 260ms (sheets, dialogs). Nothing over 300ms.
- **Easing:** standard `ease-out` for entrances, `ease-in` for exits; springs (low tension, high friction) for sheets and pressables so they feel physical, not floaty.
- **Press feedback:** primary buttons scale to 0.98 + slight darken on press; cards scale to 0.99. Immediate, within one frame.
- **Screen transitions:** native stack push/pop; shared-element transition for catalogue card → detail where feasible.
- **Sheets:** slide up with a spring; draggable handle; backdrop fades in parallel.
- **List motion:** subtle stagger/fade on first load only (not on every re-render); animate layout changes (add/remove) with `LayoutAnimation`.
- **Success moments:** on booking submit / service complete, a brief check-mark animation + haptic — a small, earned reward.
- **Respect reduced-motion:** honor the OS setting; degrade to instant fades.

---

## 8. Haptics

Tactile confirmation, used sparingly (Expo Haptics):
- **Light** on selection/toggle. · **Medium** on primary action commit (submit booking, assign, complete). · **Success/Warning/Error** notification haptics tied to the matching toast. Never haptic on scroll or navigation.

---

## 9. Feedback & State System

Every data view designs four states. The *quality* of these states is what makes the app feel premium.

- **Loading — skeletons, not spinners.** Show shimmering skeletons that match the final layout (card lists, table rows, detail headers). Spinners only for button-level or full-screen blocking waits. Skeletons appear after ~150ms to avoid flicker on fast responses.
- **Optimistic UI.** Where safe (e.g. status toggles, list adds), update immediately and reconcile on server response; roll back with a toast on failure. Makes the app feel instant.
- **Empty — helpful, never barren.** A friendly line-illustration or `lucide` glyph, one plain-language sentence, and a primary CTA ("Add your first animal"). Empty states teach the next step.
- **Error — recoverable.** Human-readable message (never a raw code), a **Retry** action, and preserved user input. Distinguish network vs. validation vs. server errors.
- **Success — confirmed.** Toast/snackbar with an icon + optional undo; or a success screen for major flows (booking submitted) with the next step surfaced.

**Toasts/snackbars:** bottom-anchored, auto-dismiss 3–4s, swipe to dismiss, one at a time (queue the rest), color + icon by semantic type, optional action ("Undo", "View").

**Inline form feedback:** validate on blur and on submit (not on every keystroke); show error text + red border + error icon; clear the error the moment it's fixed. Disable the submit button only while submitting, never to "punish" incomplete forms — instead show what's missing.

---

## 10. Offline & Connectivity (Technician-critical)

- Persistent **offline banner** when disconnected; actions queue and show a "will sync" indicator.
- Completion submissions **queue and auto-retry** on reconnect; the technician gets a clear "saved locally / synced" state.
- Cached data (today's schedule, assignment details) remains readable offline via TanStack Query persistence.

---

## 11. Components (`packages/ui`)

**Buttons** — Primary (primary-600/white), Secondary (neutral-100/neutral-900), Outline (primary border/text), Destructive (error/white), Ghost. States: default, pressed (scale 0.98 + darken), disabled (opacity 50), loading (inline spinner, label→"…", non-shifting width). Min height 48; full-width primary on mobile forms.

**Inputs** — default (neutral-300 border), focused (primary-500 border + subtle ring), error (error border + message + icon), disabled (neutral-100). Types: text, number, select/picker, date, search, textarea. Always with label + helper/error text. Large hit area; clear button on search; numeric keyboards for numeric fields; pickers preferred over free text for field use.

**Cards** — surface white/neutral-50, radius lg, shadow md, padding 16. Variants: **stat card** (dashboard KPIs, big tabular number + label + trend), **list card** (booking/animal — leading icon/avatar, title, meta, status chip, chevron), **catalogue card** (Cloudinary image with rounded top, name, breed, price, availability badge).

**Status chip** — pill with status accent color + soft tint background + dot; consistent across app.

**Booking timeline** — vertical stepper (Pending → Assigned → In progress → Completed) with the current step in primary and future steps muted; the emotional core of the farmer's tracking screen.

**Adaptive data view** — tablet/large: **table** (zebra rows, sticky sortable header, pagination, row actions, tabular numerals); phone: **stacked list cards**. One component, responsive — drives the admin experience.

**Dialogs / Sheets** — center dialog on large screens, bottom sheet on phones (draggable handle, snap points). Radius lg/xl, shadow lg, scrim backdrop; confirm/cancel; destructive uses error button and a confirmation step.

**Pull-to-refresh** on all primary lists; **swipe actions** on list cards where useful (e.g. cancel booking) with clear color coding.

Every shared component ships with default, disabled, loading, and (where applicable) error/empty states, and is documented in a component gallery screen.

---

## 12. Imagery & Iconography

- **Icons:** one consistent set across all apps — **`lucide-react-native`**. 20–24px default; 1.5–2px stroke; primary/neutral tinting; always paired with a label in navigation and standalone actions. No mixing icon libraries.
- **Catalogue imagery (Cloudinary):** consistent aspect ratio (4:3), rounded corners, `neutral-100` placeholder with a subtle shimmer while loading, graceful fallback glyph if missing. Serve responsive/optimized transforms per device.
- **Illustrations:** simple, line-based, agriculture-themed for empty/onboarding states; monochromatic in primary/neutral, never clip-arty.

---

## 13. Data Visualization (Admin analytics)

- Restrained charts: line (trends over time), bar (comparisons), donut (composition). Use the palette; primary for the key series, neutrals for the rest.
- Always label axes and units; show empty/insufficient-data states; tabular numerals in legends and tooltips.
- Charts adapt: full charts on tablet, simplified sparkline/stat summaries on phone.

---

## 14. Navigation & Layout

- **Admin (adaptive):** drawer/rail + top bar on large screens; bottom tabs + stack on phones (Expo Router). Sections: Dashboard, Farmers, Technicians, Animals, Bookings, Catalogue, Inventory, Prices, Breeds, Organizations, Districts, Service Areas, Notifications, Reports, Analytics, Settings.
- **Farmer / Technician:** bottom tab navigation (3–5 items max) + stack. Primary action reachable in the thumb zone.
- Active state uses primary-600; icon + label. Preserve scroll position and state across tab switches.
- **Responsive breakpoints (admin):** phone <600 · tablet 600–1024 · large ≥1024. Content max-width and multi-column layouts kick in on tablet+.
- **Thumb ergonomics:** primary actions and tab bars in the lower reachable zone; destructive actions never adjacent to primary.

---

## 15. Onboarding & First-Run

- Minimal, skippable: 2–3 value slides max, then straight to phone+password login.
- **Progressive disclosure:** ask for only what's needed now; defer optional profile fields.
- First empty states double as onboarding ("Add your first animal to start booking").

---

## 16. Microcopy & Voice

- Plain, warm, direct. Short sentences. Verbs for buttons ("Book AI", "Assign technician", "Mark complete").
- No jargon for farmers; precise terms for admin/technician.
- Errors are helpful and blameless ("Couldn't reach the server. Check your connection and retry.").
- Confirmations state the outcome ("Booking submitted — we'll notify you when a technician is assigned.").

---

## 17. Accessibility

- WCAG AA contrast throughout; never rely on color alone (pair status color with icon/label).
- Touch targets ≥44×44. Accessible labels/roles on every interactive element; logical focus order.
- Support Dynamic Type / system font scaling without breaking layouts (test at large sizes).
- VoiceOver/TalkBack labels for icons and status; announce toasts and state changes.
- Honor reduced-motion and increased-contrast OS settings.

---

## 18. Dark Mode

- Token-based theming via NativeWind (light/dark token sets). Elevated surfaces lighten (not just neutral-900 flat); adjust primary for contrast on dark. Ship light mode first; dark token set defined, enabled later. No pure-black — use `neutral-900`/elevated grays to reduce smear on OLED.

---

## 19. Performance-as-Experience

Speed *is* UX. Enforce: skeletons within 150ms, virtualized lists (`FlatList`), image transforms via Cloudinary, memoized rows, no layout jank on scroll, prefetch on navigation intent, and cached queries so returning to a screen is instant. Target 60fps interactions and sub-second perceived loads.
