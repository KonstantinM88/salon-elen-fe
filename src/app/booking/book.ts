"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { BookingSchema } from "@/lib/validation/booking";
import { addMinutes, parseISO } from "date-fns";
import { AppointmentStatus } from "@prisma/client";

export type BookState = {
  ok: boolean;
  formError?: string;
  fieldErrors?: Partial<Record<keyof typeof formKeys, string>>;
};

const formKeys = {
  serviceSlug: true,
  dateISO: true,
  startMin: true,
  endMin: true,
  name: true,
  phone: true,
  email: true,
  birthDate: true,
  source: true,
  notes: true,
} as const;

export async function book(_: BookState, formData: FormData): Promise<BookState> {
  try {
    const payload = {
      serviceSlug: String(formData.get("serviceSlug") ?? ""),
      dateISO: String(formData.get("dateISO") ?? ""),
      startMin: Number(formData.get("startMin") ?? NaN),
      endMin: Number(formData.get("endMin") ?? NaN),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      source: (formData.get("source") ? String(formData.get("source")) : undefined),
      notes: (formData.get("notes") ? String(formData.get("notes")) : undefined),
    };

    const parsed = BookingSchema.safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path?.[0] ?? "");
        if (k) fe[k] = issue.message;
      }
      return { ok: false, fieldErrors: fe };
    }
    const data = parsed.data;

    // 1) сервис
    const service = await prisma.service.findUnique({
      where: { slug: data.serviceSlug },
      select: { id: true, durationMin: true, isActive: true },
    });
    if (!service || !service.isActive) {
      return { ok: false, fieldErrors: { serviceSlug: "Сервис недоступен" } };
    }

    // 2) расчёт времени
    const day = parseISO(data.dateISO);
    const startAt = addMinutes(day, data.startMin);
    const endAt = addMinutes(day, data.endMin);

    // 3) транзакция: клиент + проверка пересечения + запись
    await prisma.$transaction(async (tx) => {
      // клиент по email/телефону
      const client =
        (await tx.client.findFirst({
          where: {
            OR: [
              { email: data.email.toLowerCase() },
              { phone: data.phone },
            ],
          },
          select: { id: true },
        })) ??
        (await tx.client.create({
          data: {
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: data.email.trim().toLowerCase(),
            birthDate: parseISO(data.birthDate),
            referral: data.source ?? null,
            notes: data.notes ?? null,
          },
          select: { id: true },
        }));

      // пересечения: (startAt < checkEnd) AND (endAt > checkStart)
      const checkStart = startAt;
      const checkEnd = endAt;

      const overlap = await tx.appointment.findFirst({
        where: {
          status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          startAt: { lt: checkEnd },     // было синтаксически неверно
          endAt:   { gt: checkStart },   // было синтаксически неверно
        },
        select: { id: true },
      });

      if (overlap) {
        throw new Error("В это время уже есть запись");
      }

      // создание визита
      await tx.appointment.create({
        data: {
          serviceId: service.id,
          clientId: client.id,
          startAt,
          endAt,
          customerName: data.name.trim(), // сохраняем снимок имени
          phone: data.phone.trim(),
          email: data.email.trim().toLowerCase(),
          notes: data.notes ?? null,
          status: AppointmentStatus.PENDING,
        },
      });
    });

    // Обновим админ-страницы
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/clients");

    return { ok: true };
  } catch (e) {
    const msg =
      process.env.NODE_ENV === "development"
        ? String(e)
        : "Сервер недоступен";
    return { ok: false, formError: msg };
  }
}
