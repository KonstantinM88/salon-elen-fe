import { z } from "zod";

/** YYYY-MM-DD */
const ISODate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Некорректная дата");

function is18Plus(iso: string): boolean {
  const d = new Date(`${iso}T00:00:00Z`);
  if (!Number.isFinite(d.getTime())) return false;
  const now = new Date();
  const y = now.getUTCFullYear() - 18;
  const m = now.getUTCMonth();
  const day = now.getUTCDate();
  const threshold = new Date(Date.UTC(y, m, day));
  return d.getTime() <= threshold.getTime();
}

/** Единая схема (значения приходят строкой из FormData, числа коэрцим) */
export const BookingSchema = z
  .object({
    serviceSlug: z.string().min(1, "Выберите услугу"),
    dateISO: ISODate,
    startMin: z.coerce.number().int().nonnegative(),
    endMin: z.coerce.number().int().nonnegative(),
    name: z.string().trim().min(1, "Укажите имя"),
    phone: z
      .string()
      .trim()
      .regex(/^[\d\s+()\-]{6,}$/, "Укажите корректный телефон"),
    email: z.string().email("Некорректный e-mail"),
    birthDate: ISODate.refine(is18Plus, "Только 18+"),
    source: z.string().optional().default(""),
    notes: z.string().optional().default(""),
  })
  .refine((d) => d.endMin > d.startMin, {
    path: ["endMin"],
    message: "Конец должен быть позже начала",
  });

/** Ключи полей формы */
export type BookingFields = keyof z.infer<typeof BookingSchema>;

/** Преобразование ошибок Zod → плоский словарь field->message */
export function zodToFieldErrors(
  err: z.ZodError
): Partial<Record<BookingFields, string>> {
  const out: Partial<Record<BookingFields, string>> = {};
  for (const issue of err.issues) {
    const k = issue.path[0] as BookingFields | undefined;
    if (k && !out[k]) out[k] = issue.message;
  }
  return out;
}
