import { z } from "zod";

export interface AppSettings {
  id: string;
  lowStockThreshold: number;
  supportPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  lowStockThreshold?: number;
  supportPhone?: string;
}

export const updateSettingsFormSchema = z.object({
  lowStockThreshold: z
    .string()
    .trim()
    .min(1, "Required")
    .refine((v) => /^\d+$/.test(v), "Must be a whole number")
    .transform((v) => Number(v)),
  supportPhone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});
export type UpdateSettingsFormInput = z.input<typeof updateSettingsFormSchema>;
export type UpdateSettingsFormValues = z.output<typeof updateSettingsFormSchema>;
