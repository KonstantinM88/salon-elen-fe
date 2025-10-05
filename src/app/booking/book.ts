// src/app/booking/book.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BookingSchema } from "@/lib/validation/booking";

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
    // 1) собираем payload из FormData
    const raw = {
      serviceSlug: String(formData.get("serviceSlug") ?? ""),
      dateISO: String(formData.get("dateISO") ?? ""),
      startMin: Number(formData.get("startMin")),
      endMin: Number(formData.get("endMin")),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      source: formData.get("source")
        ? String(formData.get("source"))
        : undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    };

    // 2) серверная валидация (зеркалит клиентскую)
    const parsed = BookingSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path?.[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { ok: false, fieldErrors };
    }
    const data = parsed.data;

    // 3) проверяем услугу
    const service = await prisma.service.findUnique({
      where: { slug: data.serviceSlug },
      select: { id: true, isActive: true },
    });
    if (!service || !service.isActive) {
      return { ok: false, formError: "Услуга недоступна" };
    }

    // 4) считаем UTC время начала/конца
    const dayStartUTC = new Date(`${data.dateISO}T00:00:00.000Z`);
    const startAt = new Date(dayStartUTC.getTime() + data.startMin * 60000);
    const endAt = new Date(dayStartUTC.getTime() + data.endMin * 60000);

    // 5) анти-гонка: проверка пересечений с буфером 10 минут ко всем записям
    const GAP_MIN = 10;
    const gStart = new Date(startAt.getTime() - GAP_MIN * 60000);
    const gEnd = new Date(endAt.getTime() + GAP_MIN * 60000);

    const conflict = await prisma.appointment.findFirst({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: gEnd },
        endAt: { gt: gStart },
      },
      select: { id: true },
    });
    if (conflict) {
      return {
        ok: false,
        formError:
          "Этот интервал успели занять. Обновите слоты и выберите другое время.",
      };
    }

    // 6) создаём запись
    await prisma.appointment.create({
      data: {
        serviceId: service.id,
        startAt,
        endAt,
        customerName: data.name,
        phone: data.phone,
        email: data.email,
        // сохраним вспомогательную инфу в notes
        notes: [
          data.notes?.trim() || null,
          data.source ? `Источник: ${data.source}` : null,
          data.birthDate ? `ДР: ${data.birthDate}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
        status: "PENDING",
      },
    });

    // 7) обновим админку
    revalidatePath("/admin/bookings");

    return { ok: true };
  } catch (e) {
    console.error("book action error:", e);
    return { ok: false, formError: "Сервер недоступен" };
  }
}
