// src/lib/validation/booking.ts
import { z } from "zod";

function isValidISODate(dateISO: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateISO);
}

function toAge(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map((v) => Number(v));
  const bd = new Date(Date.UTC(y, m - 1, d));
  const now = new Date();
  let age = now.getUTCFullYear() - bd.getUTCFullYear();
  const mDiff = now.getUTCMonth() - bd.getUTCMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getUTCDate() < bd.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export const BookingSchema = z
  .object({
    serviceSlug: z.string().min(1, "Выберите услугу"),
    dateISO: z
      .string()
      .refine(isValidISODate, "Дата должна быть в формате YYYY-MM-DD"),
    startMin: z.number().int().min(0, "Выберите время"),
    endMin: z.number().int().min(1, "Выберите время"),
    name: z.string().trim().min(2, "Минимум 2 символа"),
    phone: z
      .string()
      .trim()
      .regex(/^[\d\s+()\-]{6,}$/, "Некорректный телефон"),
    email: z.string().trim().email("Некорректный e-mail"),
    birthDate: z
      .string()
      .refine(isValidISODate, "Дата рождения в формате YYYY-MM-DD")
      .refine((v) => toAge(v) >= 18, "Возраст должен быть 18+"),
    // источник (Facebook вместо «Проходил мимо»)
    source: z.enum(["Google", "Instagram", "Friends", "Facebook", "Other"]).optional(),
    notes: z.string().trim().max(1000, "Слишком длинный комментарий").optional(),
  })
  .refine((v) => v.endMin > v.startMin, {
    message: "Время окончания должно быть позже начала",
    path: ["endMin"],
  });

export type BookingInput = z.infer<typeof BookingSchema>;
