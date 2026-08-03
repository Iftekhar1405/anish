import { z } from "zod";
import type { UserRole } from "./role";

export const NOTIFICATION_EVENTS = [
  "BOOKING_ASSIGNED",
  "BOOKING_STARTED",
  "BOOKING_COMPLETED",
  "ADMIN_BROADCAST",
] as const;
export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export interface AppNotification {
  id: string;
  userId: string;
  user?: { id: string; name: string; role: UserRole } | null;
  event: NotificationEvent;
  title: string;
  body: string;
  bookingId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ListNotificationsQuery {
  page?: number;
  pageSize?: number;
  event?: NotificationEvent;
  unreadOnly?: boolean;
}

export const broadcastFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Message is required").max(500),
  role: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});
export type BroadcastFormInput = z.input<typeof broadcastFormSchema>;
export type BroadcastFormValues = z.output<typeof broadcastFormSchema>;
