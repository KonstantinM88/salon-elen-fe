// src/app/booking/book.ts
"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { BookingSchema } from "@/lib/validation/booking";
import { wallMinutesToUtc } from "@/lib/orgTime";

// За сколько минут до начала ещё разрешаем запись (должно совпадать с /api/availability).
const MIN_LEAD_MIN = 30;

export type BookState = {
  ok: boolean;
  formError?: string;
  fieldErrors?: Record<string, string>;
};

export async function book(
  _prev: BookState,
  formData: FormData
): Promise<BookState> {
  try {
    // 1) Собираем данные формы
    const payload = {
      serviceSlug: String(formData.get("serviceSlug") || ""),
      dateISO: String(formData.get("dateISO") || ""),
      startMin: Number(formData.get("startMin")),
      endMin: Number(formData.get("endMin")),
      masterId: String(formData.get("masterId") || ""),
      name: String(formData.get("name") || ""),
      phone: String(formData.get("phone") || ""),
      email: (formData.get("email") as string | null) || "",
      birthDate: (formData.get("birthDate") as string | null) || "",
      source: (formData.get("source") as string | null) || undefined,
      notes: (formData.get("notes") as string | null) || undefined,
    };

    // 2) Валидация Zod
    const parsed = BookingSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path?.[0] ?? "");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, fieldErrors };
    }
    const data = parsed.data;

    // 3) Справочная информация
    const service = await prisma.service.findFirst({
      where: { slug: data.serviceSlug, isActive: true },
      select: { id: true, durationMin: true },
    });
    if (!service) {
      return { ok: false, formError: "Услуга не найдена или отключена." };
    }

    const master = await prisma.master.findUnique({
      where: { id: data.masterId },
      select: { id: true },
    });
    if (!master) {
      return { ok: false, formError: "Мастер не найден." };
    }

    // 4) Пересчёт времени в UTC
    const startAt = wallMinutesToUtc(data.dateISO, data.startMin);
    const endAt = wallMinutesToUtc(data.dateISO, data.endMin);

    // 5) Запрет на прошлое/слишком близкое время (как в /api/availability)
    const threshold = new Date(Date.now() + MIN_LEAD_MIN * 60_000);
    if (startAt < threshold) {
      return {
        ok: false,
        formError:
          MIN_LEAD_MIN > 0
            ? `Нельзя записаться на время раньше чем за ${MIN_LEAD_MIN} мин от текущего. Обновите слоты и выберите доступное время.`
            : "Нельзя записаться на прошедшее время. Обновите слоты и выберите доступное время.",
      };
    }

    // 6) Проверка пересечений: полуоткрытая логика [start, end)
    // Конфликт, если существующая.start < новый.end  И  существующая.end > новый.start
    const overlap = await prisma.appointment.findFirst({
      where: {
        masterId: master.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });
    if (overlap) {
      return {
        ok: false,
        formError:
          "Выбранное время уже занято. Обновите слоты и попробуйте снова.",
      };
    }

    // 7) Клиент (создаём при наличии достаточных данных)
    const emailStr = data.email.trim() || undefined;
    const phoneStr = data.phone.trim();
    const nameStr = data.name.trim();
    const notesStr = (data.notes || "").trim() || null;

    let clientId: string | undefined = undefined;

    if (emailStr && nameStr && phoneStr && data.birthDate) {
      const existing = await prisma.client.findFirst({
        where: { OR: [{ email: emailStr }, { phone: phoneStr }] },
        select: { id: true },
      });

      if (existing) {
        clientId = existing.id;
      } else {
        const birth = new Date(data.birthDate); // строка -> Date
        const created = await prisma.client.create({
          data: {
            id: randomUUID(),
            name: nameStr,
            phone: phoneStr,
            email: emailStr,
            birthDate: birth,
          },
          select: { id: true },
        });
        clientId = created.id;
      }
    }

    // 8) Создаём запись
    await prisma.appointment.create({
      data: {
        id: randomUUID(),
        serviceId: service.id,
        clientId,
        masterId: master.id,
        startAt,
        endAt,
        customerName: nameStr,
        phone: phoneStr,
        email: emailStr,
        notes: notesStr,
        status: "PENDING",
      },
      select: { id: true },
    });

    return { ok: true };
  } catch (e) {
    const msg =
      process.env.NODE_ENV === "development"
        ? `Ошибка при бронировании: ${String(e)}`
        : "Не удалось создать запись. Попробуйте ещё раз.";
    return { ok: false, formError: msg };
  }
}
