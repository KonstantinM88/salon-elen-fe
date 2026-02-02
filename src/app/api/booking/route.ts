// src/app/api/booking/client/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';

type SubmitBody = {
  customerName: string;
  phone: string;
  email?: string;
  birthDateISO?: string;
  referral?: 'google' | 'facebook' | 'instagram' | 'friends' | 'other';
  notes?: string;
};

type ApiResponse =
  | {
      draftId: string;
    }
  | {
      error: string;
    };

const MS_IN_MIN = 60_000;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const url = new URL(req.url);
    const serviceIds = url.searchParams.getAll('s');
    const masterId = url.searchParams.get('m');
    const startISO = url.searchParams.get('start');
    const endISO = url.searchParams.get('end');

    // Валидация параметров
    if (!serviceIds.length || !masterId || !startISO || !endISO) {
      return NextResponse.json(
        { error: 'Некорректные параметры запроса' },
        { status: 400 }
      );
    }

    // Парсинг тела запроса
    let body: SubmitBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Некорректный формат данных' },
        { status: 400 }
      );
    }

    const { customerName, phone, email, birthDateISO, referral, notes } = body;

    // Валидация обязательных полей
    if (!customerName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      );
    }

    const startAt = new Date(startISO);
    const endAt = new Date(endISO);

    // Проверка корректности дат
    if (
      !(startAt instanceof Date) ||
      isNaN(startAt.getTime()) ||
      !(endAt instanceof Date) ||
      isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      return NextResponse.json(
        { error: 'Интервал времени некорректен' },
        { status: 422 }
      );
    }

    // Проверка: запись не раньше чем через 60 минут
    const now = new Date();
    const cutoff = new Date(now.getTime() + 60 * MS_IN_MIN);
    if (startAt < cutoff) {
      return NextResponse.json(
        {
          error:
            'Запись возможна не ранее чем через 60 минут от текущего времени',
        },
        { status: 422 }
      );
    }

    // Проверка занятости мастера (только активные статусы) — по реальным appointment'ам
    const overlapping = await prisma.appointment.findFirst({
      where: {
        masterId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Выбранный слот уже занят' },
        { status: 409 }
      );
    }

    // Проверка существования услуги и мастера
    const serviceId = serviceIds[0];

    const [serviceExists, masterExists] = await Promise.all([
      prisma.service.findFirst({
        where: {
          id: serviceId,
          isActive: true,
          isArchived: false,
        },
        select: { id: true },
      }),
      prisma.master.findFirst({
        where: { id: masterId },
        select: { id: true },
      }),
    ]);

    if (!serviceExists) {
      return NextResponse.json(
        { error: 'Услуга не найдена или недоступна' },
        { status: 404 }
      );
    }

    if (!masterExists) {
      return NextResponse.json(
        { error: 'Мастер не найден' },
        { status: 404 }
      );
    }

    // ───── На этом шаге СОЗДАЁМ ТОЛЬКО ЧЕРНОВИК, не реальную запись ─────
    // Получаем locale из cookies
    const localeCookie = req.cookies.get('locale')?.value;
    const locale = ['de', 'ru', 'en'].includes(localeCookie || '') ? localeCookie : 'de';

    const draft = await prisma.bookingDraft.create({
      data: {
        serviceId,
        masterId,
        startAt,
        endAt,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email?.trim() ?? '',
        birthDate: birthDateISO ? new Date(birthDateISO) : null,
        referral: referral ?? null,
        notes: notes ?? null,
        locale, // Сохраняем язык клиента
      },
    });

    // Возвращаем ID черновика — реальное бронирование будет после верификации
    return NextResponse.json({ draftId: draft.id }, { status: 201 });
  } catch (e) {
    console.error('[api/booking/client] Error:', e);

    const errorMessage = e instanceof Error ? e.message : 'internal_error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

//---------31.01.26
 // src/app/api/booking/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // или "@/lib/db" — оставь как у тебя
// import { wallMinutesToUtc } from "@/lib/orgTime";

// /* ================ helpers & types ================= */

// type BodyStart =
//   | {
//       // Вариант A: одно поле (ISO)
//       startAtISO: string; // если без Z/offset — трактуем как UTC (без сдвигов)
//       dateISO?: string;
//       startMin?: number;
//       startMin2?: number;
//     }
//   | {
//       // Вариант B: пара полей
//       startAtISO?: string;
//       dateISO: string;   // YYYY-MM-DD
//       startMin: number;  // минуты от локальной полуночи
//       startMin2?: number;
//     };

// type PostBody = BodyStart & {
//   serviceSlug: string;
//   masterId: string;
//   customerName: string;
//   phone?: string | null;
//   email?: string | null;
//   birthDate: string; // YYYY-MM-DD (обязателен)
//   notes?: string | null;
//   durationMin?: number; // игнорируем, берём из услуги
// };

// function isString(v: unknown): v is string {
//   return typeof v === "string";
// }
// function isOptionalString(v: unknown): v is string | null | undefined {
//   return typeof v === "string" || v === null || typeof v === "undefined";
// }
// function isISODate(d?: string): d is string {
//   return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
// }
// function norm(s?: string | null): string {
//   return (s ?? "").trim();
// }

// /** Если ISO без offset — считаем строку UTC и добавляем Z */
// function toUtcDate(iso: string): Date {
//   const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(iso);
//   const s = hasTZ ? iso : `${iso}Z`;
//   const d = new Date(s);
//   if (!Number.isFinite(d.getTime())) throw new Error("Invalid startAtISO");
//   return d;
// }

// /* ================= handler ================= */

// export async function POST(req: Request): Promise<Response> {
//   try {
//     const raw = await req.json();
//     const o = raw as Record<string, unknown>;

//     // базовая валидация формы
//     if (
//       !isString(o.serviceSlug) ||
//       !isString(o.masterId) ||
//       !isString(o.customerName) ||
//       !isString(o.birthDate) ||
//       !isOptionalString(o.phone) ||
//       !isOptionalString(o.email) ||
//       !isOptionalString(o.notes)
//     ) {
//       return NextResponse.json({ error: "Invalid body shape" }, { status: 400 });
//     }

//     if (!isISODate(o.birthDate as string)) {
//       return NextResponse.json(
//         { error: "birthDate должен быть в формате YYYY-MM-DD" },
//         { status: 400 }
//       );
//     }

//     const serviceSlug = o.serviceSlug as string;
//     const masterId = o.masterId as string;

//     // услуга
//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: {
//         id: true,
//         isActive: true,
//         durationMin: true,
//         name: true,
//         parent: { select: { name: true } },
//       },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Услуга не найдена или неактивна" },
//         { status: 404 }
//       );
//     }
//     const durationMin = service.durationMin!;

//     // мастер
//     const master = await prisma.master.findUnique({
//       where: { id: masterId },
//       select: { id: true, name: true, services: { select: { id: true } } },
//     });
//     if (!master) {
//       return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
//     }
//     const masterHasService = master.services.some((s) => s.id === service.id);
//     if (!masterHasService) {
//       return NextResponse.json(
//         { error: "Эта услуга не выполняется выбранным мастером" },
//         { status: 400 }
//       );
//     }

//     // вычисляем startAt/endAt в UTC
//     let startAt: Date;
//     if (isString(o.startAtISO) && o.startAtISO) {
//       startAt = toUtcDate(o.startAtISO);
//     } else if (isString(o.dateISO) && typeof o.startMin === "number") {
//       startAt = wallMinutesToUtc(o.dateISO, o.startMin);
//     } else {
//       return NextResponse.json(
//         { error: "Передай startAtISO или пару {dateISO, startMin}" },
//         { status: 400 }
//       );
//     }
//     const endAt = new Date(startAt.getTime() + durationMin * 60_000);
//     const customerName = norm(o.customerName as string);
//     const phoneStr = norm(o.phone as string | null | undefined);
//     const emailStr = norm(o.email as string | null | undefined);
//     const notes = norm(o.notes as string | null | undefined);

//     const conflictError = "SLOT_TAKEN";

//     const created = await prisma.$transaction(async (tx) => {
//       await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${masterId} FOR UPDATE`;

//       const conflicting = await tx.appointment.findFirst({
//         where: {
//           masterId,
//           status: { in: ["PENDING", "CONFIRMED"] },
//           startAt: { lt: endAt },
//           endAt: { gt: startAt },
//         },
//         select: { id: true },
//       });
//       if (conflicting) {
//         throw new Error(conflictError);
//       }

//       let clientId: string | null = null;
//       if (phoneStr || emailStr) {
//         const existing = await tx.client.findFirst({
//           where: {
//             OR: [
//               ...(phoneStr ? [{ phone: phoneStr }] : []),
//               ...(emailStr ? [{ email: emailStr }] : []),
//             ],
//           },
//           select: { id: true },
//         });
//         if (existing) clientId = existing.id;
//       }
//       if (!clientId) {
//         const createdClient = await tx.client.create({
//           data: {
//             name: customerName,
//             phone: phoneStr,
//             email: emailStr,
//             // храним полночь по UTC для birthDate
//             birthDate: new Date(`${o.birthDate as string}T00:00:00Z`),
//           },
//           select: { id: true },
//         });
//         clientId = createdClient.id;
//       }

//       return tx.appointment.create({
//         data: {
//           serviceId: service.id,
//           clientId,
//           masterId,
//           startAt,
//           endAt,
//           customerName,
//           phone: phoneStr,
//           email: emailStr,
//           notes,
//           status: "PENDING",
//         },
//         select: { id: true, startAt: true, endAt: true, status: true },
//       });
//     });

//     return NextResponse.json(created, { status: 200 });
//   } catch (e) {
//     if (e instanceof Error && e.message === "SLOT_TAKEN") {
//       return NextResponse.json(
//         { error: "Этот слот уже занят у мастера" },
//         { status: 409 }
//       );
//     }
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `booking error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }