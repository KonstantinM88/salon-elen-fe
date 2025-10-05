import { z } from "zod";

/** Разрешённые источники (как узнали о нас) */
export const referralOptions = [
  "google",
  "instagram",
  "friends",
  "walk-in",
  "other",
] as const;

export const BookingClientSchema = z.object({
  serviceSlug: z.string().trim().min(1, "Выберите услугу"),
  dateISO: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Неверная дата")
    .transform((s) => s as `${number}-${number}-${number}`),
  startMin: z.number().int().nonnegative(),
  endMin: z.number().int().positive(),
  name: z.string().trim().min(1, "Укажите имя"),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+()\-]{6,}$/, "Неверный телефон"),
  email: z.string().trim().email("Неверный e-mail"),
  /** YYYY-MM-DD, 18+ */
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Неверная дата рождения")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) return false;
      const now = new Date();
      const age =
        (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18;
    }, "Возраст должен быть 18+"),
  referral: z
    .union([z.enum(referralOptions), z.literal(""), z.undefined()])
    .optional()
    .default(""),
  notes: z.string().trim().optional().default(""),
});

export type BookingClientInput = z.infer<typeof BookingClientSchema>;
