"use server";

import { prisma } from "@/lib/db";
import type { Booking } from "@prisma/client"; // ⬅ тип модели (для статуса)

type ActionResult = { ok: true } | { ok: false; error: string };
type BookingStatus = Booking["status"]; // "NEW" | "CONFIRMED" | "CANCELED"

function parseDateTime(date: string, time: string): Date {
  const d = new Date(`${date}T${time}:00`);
  if (Number.isNaN(d.getTime())) throw new Error("Неверная дата/время");
  return d;
}

function getString(fd: FormData, key: string, required = true): string {
  const v = fd.get(key);
  if (v == null || typeof v !== "string") {
    if (required) throw new Error(`Поле "${key}" обязательно`);
    return "";
  }
  return v.trim();
}

export async function createBooking(formData: FormData): Promise<ActionResult> {
  const customer     = getString(formData, "customer");
  const phone        = getString(formData, "phone");
  const emailRaw     = getString(formData, "email", false);
  const serviceIdStr = getString(formData, "serviceId");
  const date         = getString(formData, "date");
  const time         = getString(formData, "time");
  const noteRaw      = getString(formData, "note", false);

  const email = emailRaw || null;
  const note  = noteRaw  || null;

  const serviceId = Number(serviceIdStr);
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    return { ok: false, error: "Неверная услуга" };
  }

  try {
    const dt = parseDateTime(date, time);

    await prisma.booking.create({
      data: {
        customer,
        phone,
        email,
        serviceId,
        date: dt,
        note,
        status: "NEW" as BookingStatus,   // ✅ типобезопасно во всех версиях
      },
    });

    return { ok: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Неизвестная ошибка";
    return { ok: false, error: message };
  }
}
