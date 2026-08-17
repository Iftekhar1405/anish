import { z } from "zod";
import type { SpeciesRef } from "./masters";

export const BOOKING_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface Booking {
  id: string;
  animalId: string;
  animal?: { id: string; tag: string; species?: SpeciesRef | null } | null;
  farmerId: string;
  farmer?: {
    id: string;
    name: string;
    phone: string;
    address?: string | null;
    district?: { id: string; name: string; state: string } | null;
  } | null;
  batchId: string;
  batch?: {
    id: string;
    batchNumber: string;
    sire?: {
      id: string;
      name: string;
      species?: SpeciesRef | null;
      strawPriceMinor: number;
    } | null;
  } | null;
  technicianId: string | null;
  technician?: { id: string; name: string; phone: string } | null;
  status: BookingStatus;
  preferredDate: string;
  /** Where this visit happens — per booking, defaulting to the farmer's address. */
  location: string | null;
  notes: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  serviceNotes: string | null;
  createdAt: string;
}

export interface ListBookingsQuery {
  page?: number;
  pageSize?: number;
  farmerId?: string;
  animalId?: string;
  technicianId?: string;
  status?: BookingStatus;
}

export const assignBookingFormSchema = z.object({
  technicianId: z.string().min(1, "Technician is required"),
});
export type AssignBookingFormValues = z.infer<typeof assignBookingFormSchema>;

export const completeBookingFormSchema = z.object({
  serviceNotes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});
export type CompleteBookingFormInput = z.input<typeof completeBookingFormSchema>;
export type CompleteBookingFormValues = z.output<typeof completeBookingFormSchema>;

export const createBookingFormSchema = z.object({
  // A farmer usually presents several animals on the same visit, so one trip
  // through the wizard can cover many — one booking is created per animal.
  animalIds: z.array(z.string().min(1)).min(1, "Select at least one animal"),
  batchId: z.string().min(1, "Straw batch is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  location: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});
export type CreateBookingFormInput = z.input<typeof createBookingFormSchema>;
export type CreateBookingFormValues = z.output<typeof createBookingFormSchema>;
