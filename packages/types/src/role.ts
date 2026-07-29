export const ROLES = ["ADMIN", "FARMER", "TECHNICIAN"] as const;

export type UserRole = (typeof ROLES)[number];
