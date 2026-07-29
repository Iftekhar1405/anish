# design.md — AI Management Platform Design System

> Implemented in React Native via **NativeWind** tokens, shared through `packages/ui`. Agriculture-inspired, modern, clean, minimal, fast.

---

## 1. Brand Identity

Trustworthy, agricultural, professional. Green-forward palette evoking pasture/health, with warm earth accents. Neutral, legible surfaces for data-heavy admin screens.

---

## 2. Design Principles

- Clarity over decoration; data legibility first.
- Consistent spacing and rhythm.
- Mobile-first for Farmer/Technician; desktop-first for Admin (Expo Web) using the same component model.
- Every interactive state is designed (default/hover-or-press/disabled/loading).
- Every data view has Loading, Error, Empty, Success states.

---

## 3. Color Palette

**Primary (Pasture Green)**
- `primary-50` #ECFDF5 · `primary-100` #D1FAE5 · `primary-500` #16A34A · `primary-600` #15803D · `primary-700` #166534

**Secondary (Earth/Amber)**
- `secondary-100` #FEF3C7 · `secondary-500` #D97706 · `secondary-700` #B45309

**Neutral**
- `neutral-50` #F9FAFB · `neutral-100` #F3F4F6 · `neutral-300` #D1D5DB · `neutral-500` #6B7280 · `neutral-700` #374151 · `neutral-900` #111827

**Semantic**
- success #16A34A · warning #D97706 · error #DC2626 · info #2563EB

---

## 4. Typography

- Font: system-first (SF/Roboto) with an optional brand sans (e.g., Inter) loaded via Expo fonts.
- **Sizes:** xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36.
- **Weights:** regular 400 · medium 500 · semibold 600 · bold 700.
- Body: base/regular; headings: semibold/bold; captions: sm/medium neutral-500.

---

## 5. Spacing Scale

`0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64` (px). Default gutter 16; section spacing 24–32.

---

## 6. Border Radius

- sm 6 · md 10 · lg 14 · xl 20 · full 9999. Cards md/lg; buttons md; pills full.

---

## 7. Shadow System

- **sm**: subtle list-item elevation.
- **md**: cards.
- **lg**: dialogs/sheets.
- On native use elevation; on Expo Web use box-shadow tokens. Keep shadows soft/low-opacity.

---

## 8. Button Variants

- **Primary**: primary-600 bg, white text.
- **Secondary**: neutral-100 bg, neutral-900 text.
- **Outline**: transparent, primary-600 border/text.
- **Destructive**: error bg, white text.
- **Ghost**: transparent, primary text.
- States: pressed (darken), disabled (opacity 50), loading (spinner + disabled).

---

## 9. Input Variants

- Default (neutral-300 border), focused (primary-500 border), error (error border + message), disabled (neutral-100 bg).
- Types: text, number, select/picker, date, search, textarea. Always paired with label + helper/error text.

---

## 10. Card Styles

- Surface neutral-50/white, radius lg, shadow md, padding 16.
- Variants: stat card (dashboard), list card (mobile bookings/animals), catalogue card (with Cloudinary image).

---

## 11. Tables (Admin)

- Zebra rows (neutral-50), sticky header, sortable columns, pagination, row actions.
- On mobile, tables collapse to stacked list cards.

---

## 12. Dialogs / Sheets

- Center dialog (web/admin), bottom sheet (mobile).
- Radius lg/xl, shadow lg, backdrop scrim. Confirm/cancel actions; destructive uses error button.

---

## 13. Navigation

- **Admin (web)**: persistent left **Sidebar** + top bar.
- **Farmer/Technician (mobile)**: bottom tab navigation + stack (Expo Router).
- Active state uses primary; icons + labels.

---

## 14. Sidebar (Admin)

- Sections: Dashboard, Farmers, Technicians, Animals, Bookings, Catalogue, Inventory, Prices, Districts, Service Areas, Notifications, Reports, Analytics, Settings.
- Collapsible; active item primary-600 highlight.

---

## 15. Icons

- One consistent set (e.g., lucide-react-native). 20–24px default; primary/neutral tinting.

---

## 16. Animations

- Subtle, fast (150–250ms). Press feedback, list transitions, sheet slide-up. Respect reduced-motion.

---

## 17. Dark Mode Strategy

- Token-based theming via NativeWind (light/dark token sets). Neutral-900 surfaces, adjusted primary for contrast. Ship light mode first; dark mode token set defined but enabled in a later phase.

---

## 18. Component Coverage Requirement

Every shared component in `packages/ui` ships with: default, disabled, loading, and (where applicable) error/empty states, and works on both native and Expo Web.
