"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BookingSchema } from "@/lib/validation/booking";

export type BookState = {
  ok: boolean;
  formError?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof BookingSchema>, string>>;
};

const initial: BookState = { ok: false };

function minsToDate(dateISO: string, minutes: number): Date {
  const d = new Date(`${dateISO}T00:00:00.000Z`);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d;
}

export async function book(
  _prev: BookState = initial,
  formData: FormData
): Promise<BookState> {
  const raw = {
    serviceSlug: String(formData.get("serviceSlug") ?? ""),
    dateISO: String(formData.get("dateISO") ?? ""),
    startMin: Number(formData.get("startMin") ?? NaN),
    endMin: Number(formData.get("endMin") ?? NaN),

    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    source: (formData.get("source") ?? "") as string,
    notes: (formData.get("notes") ?? "") as string,

    // выбратый мастер в форме
    masterId: String(formData.get("masterId") ?? ""),
  };

  const parsed = BookingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: BookState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof BookingSchema>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }
  const data = parsed.data;

  // Находим услугу и мастера
  const [service, master] = await Promise.all([
    prisma.service.findUnique({
      where: { slug: data.serviceSlug },
      select: { id: true, isActive: true, durationMin: true, priceCents: true },
    }),
    prisma.master.findUnique({
      where: { id: data.masterId },
      select: { id: true, services: { select: { slug: true } } },
    }),
  ]);

  if (!service || !service.isActive) {
    return { ok: false, formError: "Услуга недоступна" };
  }
  if (!master) {
    return { ok: false, formError: "Мастер не найден" };
  }
  if (!master.services.some((s) => s.slug === data.serviceSlug)) {
    return { ok: false, formError: "Мастер не выполняет выбранную подуслугу" };
  }

  const startAt = minsToDate(data.dateISO, data.startMin);
  const endAt = minsToDate(data.dateISO, data.endMin);

  // Проверка пересечений для выбранного мастера
  const overlap = await prisma.appointment.findFirst({
    where: {
      masterId: master.id,
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    select: { id: true },
  });
  if (overlap) {
    return {
      ok: false,
      formError:
        "Выбранное время занято. Обновите слоты и повторите выбор.",
    };
  }

  // Клиент: ищем по телефону или e-mail, иначе создаём
  const clientFound = await prisma.client.findFirst({
    where: {
      OR: [{ phone: data.phone }, { email: data.email }],
    },
    select: { id: true },
  });

  const clientId =
    clientFound?.id ??
    (
      await prisma.client.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
          referral: data.source || null,
          notes: data.notes || null,
        },
        select: { id: true },
      })
    ).id;

  // Создание записи (БЕЗ priceCents — такого поля нет в модели Appointment)
  await prisma.appointment.create({
    data: {
      clientId,
      masterId: master.id,      // связь с мастером
      serviceId: service.id,    // связь с услугой
      startAt,
      endAt,
      status: "PENDING",

      // сохраняем ввод клиента
      customerName: data.name,
      phone: data.phone,
      email: data.email,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin");
  return { ok: true };
}
