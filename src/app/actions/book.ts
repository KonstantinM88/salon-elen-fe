// src/app/actions/book.ts
"use server";

import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/** Результат серверного действия */
type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Данные формы бронирования */
export type BookForm = {
  serviceSlug: string;
  date: string;     // yyyy-mm-dd
  time: string;     // HH:mm
  name: string;
  phone: string;
  email?: string;
  notes?: string;
};

/** Парсинг локальной даты+времени в Date (UTC сохранится корректно) */
function toDate(dateISO: string, time: string): Date {
  // "2025-10-04" + "14:30" -> Date
  return new Date(`${dateISO}T${time}:00`);
}

/** Создать запись клиента */
export async function book(form: BookForm): Promise<ActionResult> {
  // базовая валидация
  if (!form.serviceSlug || !form.date || !form.time || !form.name || !form.phone) {
    return { ok: false, error: "Заполните обязательные поля" };
  }

  // находим услугу
  const service = await prisma.service.findUnique({
    where: { slug: form.serviceSlug },
    select: { id: true, durationMin: true, isActive: true },
  });

  if (!service || !service.isActive) {
    return { ok: false, error: "Услуга недоступна" };
  }

  // вычисляем интервал
  const startAt = toDate(form.date, form.time);
  const endAt = new Date(startAt.getTime() + service.durationMin * 60_000);

  // проверяем пересечение с существующими записями
  const conflict = await prisma.appointment.findFirst({
    where: {
      serviceId: service.id,
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      // есть пересечение временных интервалов
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });

  if (conflict) {
    return { ok: false, error: "Этот слот уже занят, попробуйте другое время" };
  }

  // создаём запись
  await prisma.appointment.create({
    data: {
      serviceId: service.id,
      startAt,
      endAt,
      customerName: form.name,
      phone: form.phone,
      email: form.email ?? null,
      notes: form.notes ?? null,
      status: AppointmentStatus.PENDING,
    },
  });

  // обновим админ-список
  revalidatePath("/admin/bookings");
  return { ok: true };
}
