import { z } from "zod";

export const BookingSchema = z.object({
  serviceSlug: z.string().trim().min(1, "Выберите подуслугу"),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат даты YYYY-MM-DD"),
  startMin: z.number().int().nonnegative({
    message: "Не выбрано время. Нажмите на свободный слот.",
  }),
  endMin: z.number().int().positive(),
  name: z.string().trim().min(2, "Введите имя"),
  phone: z.string().trim().min(5, "Введите телефон"),
  email: z.string().trim().email("Неверный e-mail"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат YYYY-MM-DD"),
  source: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(5000).optional(),

  masterId: z.string().cuid("Выберите мастера"), // CHANGED: было staffId → masterId
});

export type BookingInput = z.infer<typeof BookingSchema>;
