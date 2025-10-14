"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { BookingSchema } from "@/lib/validation/booking";
import { wallMinutesToUtc } from "@/lib/orgTime";

// ----- возвращаемое состояние для useActionState
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
    // ----- собрать данные из формы
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

    // ----- валидация Zod
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

    // ----- справочные сущности
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

    // ----- расчёт времени (строго по TZ салона → в UTC для БД)
    const startAt = wallMinutesToUtc(data.dateISO, data.startMin);
    const endAt = wallMinutesToUtc(data.dateISO, data.endMin);

    // ----- проверка пересечений для мастера (PENDING/CONFIRMED)
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
        formError: "Выбранное время уже занято. Обновите слоты и попробуйте снова.",
      };
    }

    // ===== клиент (создаём при достаточных данных)
    const emailStr = data.email.trim() || undefined; // undefined, не null
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
        const birth = new Date(data.birthDate);
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

    // ===== создаём запись
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





// // src/app/booking/book.ts
// "use server";

// import { randomUUID } from "crypto";
// import { prisma } from "@/lib/prisma";
// import { BookingSchema } from "@/lib/validation/booking";
// import { orgMinutesToUtc } from "@/lib/orgTime";

// // ----- возвращаемое состояние для useActionState
// export type BookState = {
//   ok: boolean;
//   formError?: string;
//   fieldErrors?: Record<string, string>;
// };

// export async function book(
//   _prev: BookState,
//   formData: FormData
// ): Promise<BookState> {
//   try {
//     // ----- собрать данные из формы
//     const payload = {
//       serviceSlug: String(formData.get("serviceSlug") || ""),
//       dateISO: String(formData.get("dateISO") || ""),
//       startMin: Number(formData.get("startMin")),
//       endMin: Number(formData.get("endMin")),
//       masterId: String(formData.get("masterId") || ""),
//       name: String(formData.get("name") || ""),
//       phone: String(formData.get("phone") || ""),
//       email: (formData.get("email") as string | null) || "",
//       birthDate: (formData.get("birthDate") as string | null) || "",
//       source: (formData.get("source") as string | null) || undefined,
//       notes: (formData.get("notes") as string | null) || undefined,
//     };

//     // ----- валидация Zod
//     const parsed = BookingSchema.safeParse(payload);
//     if (!parsed.success) {
//       const fieldErrors: Record<string, string> = {};
//       for (const issue of parsed.error.issues) {
//         const key = String(issue.path?.[0] ?? "");
//         if (!fieldErrors[key]) fieldErrors[key] = issue.message;
//       }
//       return { ok: false, fieldErrors };
//     }
//     const data = parsed.data;

//     // ----- справочные сущности
//     const service = await prisma.service.findFirst({
//       where: { slug: data.serviceSlug, isActive: true },
//       select: { id: true, durationMin: true },
//     });
//     if (!service) {
//       return { ok: false, formError: "Услуга не найдена или отключена." };
//     }

//     const master = await prisma.master.findUnique({
//       where: { id: data.masterId },
//       select: { id: true },
//     });
//     if (!master) {
//       return { ok: false, formError: "Мастер не найден." };
//     }

//     // ----- расчёт времени (КЛЮЧЕВОЕ: через orgMinutesToUtc)
//     const startAt = orgMinutesToUtc(data.dateISO, data.startMin);
//     const endAt = orgMinutesToUtc(data.dateISO, data.endMin);

//     // // Можно раскомментировать, чтобы один раз сверить в логах:
//     // const tz =
//     //   process.env.ORG_TZ || process.env.SALON_TZ || process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";
//     // console.log("DEBUG UTC startAt:", startAt.toISOString());
//     // console.log(
//     //   "DEBUG ORG_TZ startAt:",
//     //   startAt.toLocaleString("ru-RU", { timeZone: tz })
//     // );

//     // ----- проверка пересечений для мастера (PENDING/CONFIRMED)
//     const overlap = await prisma.appointment.findFirst({
//       where: {
//         masterId: master.id,
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: endAt },
//         endAt: { gt: startAt },
//       },
//       select: { id: true },
//     });
//     if (overlap) {
//       return {
//         ok: false,
//         formError: "Выбранное время уже занято. Обновите слоты и попробуйте снова.",
//       };
//     }

//     // ===== клиент (создаём при достаточных данных)
//     const emailStr = data.email.trim() || undefined; // undefined, не null
//     const phoneStr = data.phone.trim();
//     const nameStr = data.name.trim();
//     const notesStr = (data.notes || "").trim() || null;

//     let clientId: string | undefined = undefined;

//     // Создаём клиента только если есть name, phone, email, birthDate
//     if (emailStr && nameStr && phoneStr && data.birthDate) {
//       const existing = await prisma.client.findFirst({
//         where: { OR: [{ email: emailStr }, { phone: phoneStr }] },
//         select: { id: true },
//       });

//       if (existing) {
//         clientId = existing.id;
//       } else {
//         const birth = new Date(data.birthDate);
//         const created = await prisma.client.create({
//           data: {
//             id: randomUUID(),
//             name: nameStr,
//             phone: phoneStr,
//             email: emailStr,
//             birthDate: birth,
//           },
//           select: { id: true },
//         });
//         clientId = created.id;
//       }
//     }

//     // ===== создаём запись
//     await prisma.appointment.create({
//       data: {
//         id: randomUUID(),
//         serviceId: service.id,
//         clientId, // может быть undefined
//         masterId: master.id,
//         startAt,
//         endAt,
//         customerName: nameStr,
//         phone: phoneStr,
//         email: emailStr, // в Appointment email? => можно undefined
//         notes: notesStr,
//         status: "PENDING",
//       },
//       select: { id: true },
//     });

//     return { ok: true };
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `Ошибка при бронировании: ${String(e)}`
//         : "Не удалось создать запись. Попробуйте ещё раз.";
//     return { ok: false, formError: msg };
//   }
// }





//---------------был
// "use server";

// import { prisma } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { z } from "zod";
// import { BookingSchema } from "@/lib/validation/booking";

// export type BookState = {
//   ok: boolean;
//   formError?: string;
//   fieldErrors?: Partial<Record<keyof z.infer<typeof BookingSchema>, string>>;
// };

// const initial: BookState = { ok: false };

// function minsToDate(dateISO: string, minutes: number): Date {
//   const d = new Date(`${dateISO}T00:00:00.000Z`);
//   d.setUTCMinutes(d.getUTCMinutes() + minutes);
//   return d;
// }

// export async function book(
//   _prev: BookState = initial,
//   formData: FormData
// ): Promise<BookState> {
//   const raw = {
//     serviceSlug: String(formData.get("serviceSlug") ?? ""),
//     dateISO: String(formData.get("dateISO") ?? ""),
//     startMin: Number(formData.get("startMin") ?? NaN),
//     endMin: Number(formData.get("endMin") ?? NaN),

//     name: String(formData.get("name") ?? ""),
//     phone: String(formData.get("phone") ?? ""),
//     email: String(formData.get("email") ?? ""),
//     birthDate: String(formData.get("birthDate") ?? ""),
//     source: (formData.get("source") ?? "") as string,
//     notes: (formData.get("notes") ?? "") as string,

//     // выбратый мастер в форме
//     masterId: String(formData.get("masterId") ?? ""),
//   };

//   const parsed = BookingSchema.safeParse(raw);
//   if (!parsed.success) {
//     const fieldErrors: BookState["fieldErrors"] = {};
//     for (const issue of parsed.error.issues) {
//       const key = issue.path[0] as keyof z.infer<typeof BookingSchema>;
//       if (!fieldErrors[key]) fieldErrors[key] = issue.message;
//     }
//     return { ok: false, fieldErrors };
//   }
//   const data = parsed.data;

//   // Находим услугу и мастера
//   const [service, master] = await Promise.all([
//     prisma.service.findUnique({
//       where: { slug: data.serviceSlug },
//       select: { id: true, isActive: true, durationMin: true, priceCents: true },
//     }),
//     prisma.master.findUnique({
//       where: { id: data.masterId },
//       select: { id: true, services: { select: { slug: true } } },
//     }),
//   ]);

//   if (!service || !service.isActive) {
//     return { ok: false, formError: "Услуга недоступна" };
//   }
//   if (!master) {
//     return { ok: false, formError: "Мастер не найден" };
//   }
//   if (!master.services.some((s) => s.slug === data.serviceSlug)) {
//     return { ok: false, formError: "Мастер не выполняет выбранную подуслугу" };
//   }

//   const startAt = minsToDate(data.dateISO, data.startMin);
//   const endAt = minsToDate(data.dateISO, data.endMin);

//   // Проверка пересечений для выбранного мастера
//   const overlap = await prisma.appointment.findFirst({
//     where: {
//       masterId: master.id,
//       startAt: { lt: endAt },
//       endAt: { gt: startAt },
//       status: { in: ["CONFIRMED", "PENDING"] },
//     },
//     select: { id: true },
//   });
//   if (overlap) {
//     return {
//       ok: false,
//       formError:
//         "Выбранное время занято. Обновите слоты и повторите выбор.",
//     };
//   }

//   // Клиент: ищем по телефону или e-mail, иначе создаём
//   const clientFound = await prisma.client.findFirst({
//     where: {
//       OR: [{ phone: data.phone }, { email: data.email }],
//     },
//     select: { id: true },
//   });

//   const clientId =
//     clientFound?.id ??
//     (
//       await prisma.client.create({
//         data: {
//           name: data.name,
//           phone: data.phone,
//           email: data.email,
//           birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
//           referral: data.source || null,
//           notes: data.notes || null,
//         },
//         select: { id: true },
//       })
//     ).id;

//   // Создание записи (БЕЗ priceCents — такого поля нет в модели Appointment)
//   await prisma.appointment.create({
//     data: {
//       clientId,
//       masterId: master.id,      // связь с мастером
//       serviceId: service.id,    // связь с услугой
//       startAt,
//       endAt,
//       status: "PENDING",

//       // сохраняем ввод клиента
//       customerName: data.name,
//       phone: data.phone,
//       email: data.email,
//       notes: data.notes || null,
//     },
//   });

//   revalidatePath("/admin");
//   return { ok: true };
// }
