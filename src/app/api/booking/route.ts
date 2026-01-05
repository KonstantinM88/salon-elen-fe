// src/app/api/booking/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // или "@/lib/db" — оставь как у тебя
import { wallMinutesToUtc } from "@/lib/orgTime";

/* ================ helpers & types ================= */

type BodyStart =
  | {
      // Вариант A: одно поле (ISO)
      startAtISO: string; // если без Z/offset — трактуем как UTC (без сдвигов)
      dateISO?: string;
      startMin?: number;
      startMin2?: number;
    }
  | {
      // Вариант B: пара полей
      startAtISO?: string;
      dateISO: string;   // YYYY-MM-DD
      startMin: number;  // минуты от локальной полуночи
      startMin2?: number;
    };

type PostBody = BodyStart & {
  serviceSlug: string;
  masterId: string;
  customerName: string;
  phone?: string | null;
  email?: string | null;
  birthDate: string; // YYYY-MM-DD (обязателен)
  notes?: string | null;
  durationMin?: number; // игнорируем, берём из услуги
};

function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isOptionalString(v: unknown): v is string | null | undefined {
  return typeof v === "string" || v === null || typeof v === "undefined";
}
function isISODate(d?: string): d is string {
  return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
}
function norm(s?: string | null): string {
  return (s ?? "").trim();
}

/** Если ISO без offset — считаем строку UTC и добавляем Z */
function toUtcDate(iso: string): Date {
  const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(iso);
  const s = hasTZ ? iso : `${iso}Z`;
  const d = new Date(s);
  if (!Number.isFinite(d.getTime())) throw new Error("Invalid startAtISO");
  return d;
}

/* ================= handler ================= */

export async function POST(req: Request): Promise<Response> {
  try {
    const raw = await req.json();
    const o = raw as Record<string, unknown>;

    // базовая валидация формы
    if (
      !isString(o.serviceSlug) ||
      !isString(o.masterId) ||
      !isString(o.customerName) ||
      !isString(o.birthDate) ||
      !isOptionalString(o.phone) ||
      !isOptionalString(o.email) ||
      !isOptionalString(o.notes)
    ) {
      return NextResponse.json({ error: "Invalid body shape" }, { status: 400 });
    }

    if (!isISODate(o.birthDate as string)) {
      return NextResponse.json(
        { error: "birthDate должен быть в формате YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const serviceSlug = o.serviceSlug as string;
    const masterId = o.masterId as string;

    // услуга
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
      select: { id: true, isActive: true, durationMin: true },
    });
    if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
      return NextResponse.json(
        { error: "Услуга не найдена или неактивна" },
        { status: 404 }
      );
    }
    const durationMin = service.durationMin!;

    // мастер
    const master = await prisma.master.findUnique({
      where: { id: masterId },
      select: { id: true, services: { select: { id: true } } },
    });
    if (!master) {
      return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
    }
    const masterHasService = master.services.some((s) => s.id === service.id);
    if (!masterHasService) {
      return NextResponse.json(
        { error: "Эта услуга не выполняется выбранным мастером" },
        { status: 400 }
      );
    }

    // вычисляем startAt/endAt в UTC
    let startAt: Date;
    if (isString(o.startAtISO) && o.startAtISO) {
      startAt = toUtcDate(o.startAtISO);
    } else if (isString(o.dateISO) && typeof o.startMin === "number") {
      startAt = wallMinutesToUtc(o.dateISO, o.startMin);
    } else {
      return NextResponse.json(
        { error: "Передай startAtISO или пару {dateISO, startMin}" },
        { status: 400 }
      );
    }
    const endAt = new Date(startAt.getTime() + durationMin * 60_000);

    const conflictError = "SLOT_TAKEN";

    const created = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${masterId} FOR UPDATE`;

      const conflicting = await tx.appointment.findFirst({
        where: {
          masterId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
        select: { id: true },
      });
      if (conflicting) {
        throw new Error(conflictError);
      }

      // клиент
      const phoneStr = norm(o.phone as string | null | undefined);
      const emailStr = norm(o.email as string | null | undefined);

      let clientId: string | null = null;
      if (phoneStr || emailStr) {
        const existing = await tx.client.findFirst({
          where: {
            OR: [
              ...(phoneStr ? [{ phone: phoneStr }] : []),
              ...(emailStr ? [{ email: emailStr }] : []),
            ],
          },
          select: { id: true },
        });
        if (existing) clientId = existing.id;
      }
      if (!clientId) {
        const createdClient = await tx.client.create({
          data: {
            name: norm(o.customerName as string),
            phone: phoneStr,
            email: emailStr,
            // храним полночь по UTC для birthDate
            birthDate: new Date(`${o.birthDate as string}T00:00:00Z`),
          },
          select: { id: true },
        });
        clientId = createdClient.id;
      }

      return tx.appointment.create({
        data: {
          serviceId: service.id,
          clientId,
          masterId,
          startAt,
          endAt,
          customerName: norm(o.customerName as string),
          phone: phoneStr,
          email: emailStr,
          notes: norm(o.notes as string | null | undefined),
          status: "PENDING",
        },
        select: { id: true, startAt: true, endAt: true, status: true },
      });
    });

    return NextResponse.json(created, { status: 200 });
  } catch (e) {
    if (e instanceof Error && e.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Этот слот уже занят у мастера" },
        { status: 409 }
      );
    }
    const msg =
      process.env.NODE_ENV === "development"
        ? `booking error: ${String(e)}`
        : "Internal error";
    console.error(msg);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}




// //src/app/api/booking/route.ts путь этот!!!!!!!!!

// // src/app/api/booking/verify/email/route.ts  ------- это наверное не правильный файл?
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import nodemailer from 'nodemailer';

// // Хранилище OTP кодов (в продакшене использовать Redis)
// const otpStore = new Map<string, { code: string; expiresAt: number }>();

// function generateOTP(): string {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// async function sendOTPEmail(email: string, code: string): Promise<void> {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: 'Код подтверждения - Salon Elen',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h1 style="color: #333;">Код подтверждения</h1>
//         <p>Ваш код для подтверждения записи в Salon Elen:</p>
//         <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
//           <h2 style="font-size: 36px; font-family: monospace; letter-spacing: 8px; margin: 0;">${code}</h2>
//         </div>
//         <p style="color: #666;">Код действует 10 минут.</p>
//         <p style="color: #999; font-size: 12px; margin-top: 30px;">Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
//       </div>
//     `,
//   });
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { email, draftId } = body;

//     if (!email || !draftId) {
//       return NextResponse.json(
//         { error: 'Email и draftId обязательны' },
//         { status: 400 }
//       );
//     }

//     // Проверяем что черновик существует
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: draftId },
//       select: { id: true, email: true, status: true },
//     });

//     if (!appointment) {
//       return NextResponse.json(
//         { error: 'Запись не найдена' },
//         { status: 404 }
//       );
//     }

//     if (appointment.status !== 'PENDING') {
//       return NextResponse.json(
//         { error: 'Запись уже подтверждена' },
//         { status: 400 }
//       );
//     }

//     // Генерируем 6-значный код
//     const code = generateOTP();
//     const expiresAt = Date.now() + 10 * 60 * 1000; // 10 минут

//     // Сохраняем в хранилище (ключ: email+draftId)
//     const key = `${email}:${draftId}`;
//     otpStore.set(key, { code, expiresAt });

//     // Отправляем email через Mailtrap
//     try {
//       await sendOTPEmail(email, code);
//       console.log(`[OTP] Код для ${email}: ${code} (отправлен через Mailtrap)`);
//     } catch (emailError) {
//       console.error('[OTP] Ошибка отправки email:', emailError);
//       // Всё равно возвращаем успех, чтобы код работал в dev режиме
//       console.log(`[OTP] Dev код для ${email}: ${code}`);
//     }

//     // В режиме разработки отправляем код в ответе
//     if (process.env.NODE_ENV === 'development') {
//       return NextResponse.json({
//         ok: true,
//         message: 'Код отправлен на email',
//         devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
//       });
//     }

//     return NextResponse.json({
//       ok: true,
//       message: 'Код отправлен на email',
//     });
//   } catch (error) {
//     console.error('[OTP Send Error]:', error);
//     return NextResponse.json(
//       { error: 'Ошибка отправки кода' },
//       { status: 500 }
//     );
//   }
// }







// // src/app/api/booking/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { Prisma } from "@prisma/client";

// /* ================= helpers & types ================= */

// type PostBody = {
//   serviceSlug: string;
//   masterId: string;
//   /** ISO дата-время начала визита.
//    * Если без суффикса часового пояса — трактуем как UTC и добавляем 'Z'. */
//   startAtISO: string;
//   customerName: string;
//   phone?: string | null;
//   email?: string | null;
//   /** YYYY-MM-DD (обязательно) */
//   birthDate: string;
//   /** произвольный комментарий */
//   notes?: string | null;
//   /** игнорируется — берем из услуги, поле допустимо */
//   durationMin?: number;
// };

// function isString(v: unknown): v is string {
//   return typeof v === "string";
// }
// function isOptionalString(v: unknown): v is string | null | undefined {
//   return typeof v === "string" || v === null || typeof v === "undefined";
// }
// function isPostBody(v: unknown): v is PostBody {
//   if (!v || typeof v !== "object") return false;
//   const o = v as Record<string, unknown>;
//   return (
//     isString(o.serviceSlug) &&
//     isString(o.masterId) &&
//     isString(o.startAtISO) &&
//     isString(o.customerName) &&
//     isString(o.birthDate) &&
//     isOptionalString(o.phone) &&
//     isOptionalString(o.email) &&
//     (typeof o.durationMin === "number" || typeof o.durationMin === "undefined") &&
//     isOptionalString(o.notes)
//   );
// }
// /** YYYY-MM-DD */
// function isISODate(d?: string): d is string {
//   return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
// }
// /** 00:00 UTC для даты YYYY-MM-DD */
// function parseIsoDateToUtcMidnight(d: string): Date {
//   return new Date(`${d}T00:00:00Z`);
// }
// /** Если пришло без offset — считаем строку UTC и добавляем 'Z' */
// function toUtcDate(iso: string): Date {
//   const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(iso);
//   const s = hasTZ ? iso : `${iso}Z`;
//   const d = new Date(s);
//   if (!Number.isFinite(d.getTime())) throw new Error("Invalid startAtISO");
//   return d;
// }
// /** Перекрытие для полуоткрытых интервалов [start,end) */
// function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
//   return aStart < bEnd && aEnd > bStart;
// }
// function norm(s?: string | null): string {
//   return (s ?? "").trim();
// }

// /* ================= handler ================= */

// export async function POST(req: Request): Promise<Response> {
//   try {
//     const raw = await req.json();
//     if (!isPostBody(raw)) {
//       return NextResponse.json({ error: "Invalid body shape" }, { status: 400 });
//     }
//     const body = raw;

//     if (!isISODate(body.birthDate)) {
//       return NextResponse.json(
//         { error: "birthDate должен быть в формате YYYY-MM-DD" },
//         { status: 400 }
//       );
//     }

//     // 1) Нормализуем ко времени UTC
//     const startAt = toUtcDate(body.startAtISO);

//     // 2) Получаем услугу
//     const service = await prisma.service.findUnique({
//       where: { slug: body.serviceSlug },
//       select: { id: true, isActive: true, durationMin: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Услуга не найдена или неактивна" },
//         { status: 404 }
//       );
//     }
//     const durationMin = service.durationMin!;
//     const endAt = new Date(startAt.getTime() + durationMin * 60_000); // [start,end)

//     // 3) Проверяем мастера и что он оказывает услугу
//     const masterHasService = await prisma.master.findFirst({
//       where: {
//         id: body.masterId,
//         services: { some: { id: service.id } },
//       },
//       select: { id: true },
//     });
//     if (!masterHasService) {
//       return NextResponse.json(
//         { error: "Эта услуга не выполняется выбранным мастером" },
//         { status: 400 }
//       );
//     }
//     const masterId = masterHasService.id;

//     // 4) Готовим клиентские данные
//     const phoneStr = norm(body.phone);
//     const emailStr = norm(body.email);
//     const customerName = norm(body.customerName);
//     const notes = norm(body.notes);

//     // 5) Атомарно: повторная проверка конфликта + создание записи.
//     // Используем serializable-транзакцию, чтобы параллельные запросы не проскочили.
//     const created = await prisma.$transaction(
//       async (tx) => {
//         // 5.1) Быстрый поиск конфликтующего аппойнтмента
//         const conflicting = await tx.appointment.findFirst({
//           where: {
//             masterId,
//             status: { in: ["PENDING", "CONFIRMED"] }, // блокирующие статусы
//             startAt: { lt: endAt },
//             endAt: { gt: startAt },
//           },
//           select: { id: true, startAt: true, endAt: true },
//         });

//         if (conflicting && overlaps(startAt, endAt, conflicting.startAt, conflicting.endAt)) {
//           // полуоткрытые интервалы: если существующий заканчивается ровно в startAt — это не конфликт,
//           // но наше условие уже это учитывает (aEnd > bStart), так что тут реальный конфликт.
//           throw new Error("CONFLICT");
//         }

//         // 5.2) Получить/создать клиента
//         let clientId: string | null = null;
//         if (phoneStr || emailStr) {
//           const existing = await tx.client.findFirst({
//             where: {
//               OR: [
//                 ...(phoneStr ? ([{ phone: phoneStr }] as const) : []),
//                 ...(emailStr ? ([{ email: emailStr }] as const) : []),
//               ],
//             },
//             select: { id: true },
//           });
//           if (existing) clientId = existing.id;
//         }
//         if (!clientId) {
//           const createdClient = await tx.client.create({
//             data: {
//               name: customerName,
//               phone: phoneStr,
//               email: emailStr,
//               birthDate: parseIsoDateToUtcMidnight(body.birthDate),
//             },
//             select: { id: true },
//           });
//           clientId = createdClient.id;
//         }

//         // 5.3) Создаём бронь со статусом PENDING
//         return tx.appointment.create({
//           data: {
//             serviceId: service.id,
//             clientId,
//             masterId,
//             startAt,
//             endAt, // ВАЖНО: конец не включён — полуоткрытый слот
//             customerName,
//             phone: phoneStr,
//             email: emailStr,
//             notes,
//             status: "PENDING",
//           },
//           select: {
//             id: true,
//             startAt: true,
//             endAt: true,
//             status: true,
//             masterId: true,
//             serviceId: true,
//           },
//         });
//       },
//       {
//         isolationLevel:
//           (Prisma.TransactionIsolationLevel as unknown as { Serializable: Prisma.TransactionIsolationLevel })
//             .Serializable ?? undefined,
//       }
//     );

//     return NextResponse.json(created, { status: 201 });
//   } catch (e: unknown) {
//     // свои осмысленные ответы
//     if (e instanceof SyntaxError) {
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//     }
//     if (e instanceof Error && e.message === "CONFLICT") {
//       return NextResponse.json(
//         { error: "Этот слот уже занят у мастера" },
//         { status: 409 }
//       );
//     }

//     const message =
//       typeof e === "object" && e !== null && "toString" in e ? String(e) : "Internal error";
//     console.error("booking error:", message);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }







//----------ранее было так:----------
// // src/app/api/booking/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// /* ================= helpers & types ================= */

// type PostBody = {
//   serviceSlug: string;
//   masterId: string;
//   startAtISO: string; // если без Z — трактуем как UTC (без сдвигов)
//   customerName: string;
//   phone?: string | null;
//   email?: string | null;
//   birthDate: string; // YYYY-MM-DD (обязателен)
//   notes?: string | null;
//   // durationMin игнорируем (берём из услуги), но поле допустимо
//   durationMin?: number;
// };

// function isString(v: unknown): v is string {
//   return typeof v === "string";
// }

// function isOptionalString(v: unknown): v is string | null | undefined {
//   return typeof v === "string" || v === null || typeof v === "undefined";
// }

// function isPostBody(v: unknown): v is PostBody {
//   if (!v || typeof v !== "object") return false;
//   const o = v as Record<string, unknown>;
//   return (
//     isString(o.serviceSlug) &&
//     isString(o.masterId) &&
//     isString(o.startAtISO) &&
//     isString(o.customerName) &&
//     isString(o.birthDate) &&
//     isOptionalString(o.phone) &&
//     isOptionalString(o.email) &&
//     (typeof o.durationMin === "number" ||
//       typeof o.durationMin === "undefined") &&
//     isOptionalString(o.notes)
//   );
// }

// /** YYYY-MM-DD */
// function isISODate(d?: string): d is string {
//   return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// /** 00:00 UTC для даты YYYY-MM-DD */
// function parseIsoDateToUtcMidnight(d: string): Date {
//   // всегда добавляем Z, чтобы не было сдвигов
//   return new Date(`${d}T00:00:00Z`);
// }

// /** Если пришло без offset — считаем строку UTC и добавляем Z */
// function toUtcDate(iso: string): Date {
//   const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(iso);
//   const s = hasTZ ? iso : `${iso}Z`;
//   const d = new Date(s);
//   if (!Number.isFinite(d.getTime())) {
//     throw new Error("Invalid startAtISO");
//   }
//   return d;
// }

// function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
//   return aStart < bEnd && aEnd > bStart;
// }

// function norm(s?: string | null): string {
//   return (s ?? "").trim();
// }

// /* ================= handler ================= */

// export async function POST(req: Request): Promise<Response> {
//   try {
//     const raw = await req.json();

//     if (!isPostBody(raw)) {
//       return NextResponse.json(
//         { error: "Invalid body shape" },
//         { status: 400 }
//       );
//     }
//     const body = raw;

//     if (!isISODate(body.birthDate)) {
//       return NextResponse.json(
//         { error: "birthDate должен быть в формате YYYY-MM-DD" },
//         { status: 400 }
//       );
//     }

//     // приводим ко всему UTC (убираем «минус два часа»)
//     const startAt = toUtcDate(body.startAtISO);

//     // услуга
//     const service = await prisma.service.findUnique({
//       where: { slug: body.serviceSlug },
//       select: { id: true, isActive: true, durationMin: true },
//     });
//     if (
//       !service ||
//       !service.isActive ||
//       !Number.isFinite(service.durationMin)
//     ) {
//       return NextResponse.json(
//         { error: "Услуга не найдена или неактивна" },
//         { status: 404 }
//       );
//     }

//     // мастер
//     const master = await prisma.master.findUnique({
//       where: { id: body.masterId },
//       select: { id: true },
//     });
//     if (!master) {
//       return NextResponse.json({ error: "Мастер не найден" }, { status: 404 });
//     }

//     // мастер оказывает услугу?
//     // мастер оказывает услугу?
//     const masterHasService = await prisma.master.findFirst({
//       where: {
//         id: body.masterId,
//         services: { some: { id: service.id } },
//       },
//       select: { id: true },
//     });

//     if (!masterHasService) {
//       return NextResponse.json(
//         { error: "Эта услуга не выполняется выбранным мастером" },
//         { status: 400 }
//       );
//     }

//     const durationMin = service.durationMin!;
//     const endAt = new Date(startAt.getTime() + durationMin * 60_000);

//     // конфликт с существующими заявками
//     const conflicting = await prisma.appointment.findFirst({
//       where: {
//         masterId: master.id,
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: endAt },
//         endAt: { gt: startAt },
//       },
//       select: { id: true, startAt: true, endAt: true },
//     });

//     if (
//       conflicting &&
//       overlaps(startAt, endAt, conflicting.startAt, conflicting.endAt)
//     ) {
//       return NextResponse.json(
//         { error: "Этот слот уже занят у мастера" },
//         { status: 409 }
//       );
//     }

//     // клиент: ищем по phone/email; создаём при отсутствии
//     const phoneStr = norm(body.phone);
//     const emailStr = norm(body.email);

//     let clientId: string | null = null;

//     if (phoneStr || emailStr) {
//       const existing = await prisma.client.findFirst({
//         where: {
//           OR: [
//             ...(phoneStr ? ([{ phone: phoneStr }] as const) : []),
//             ...(emailStr ? ([{ email: emailStr }] as const) : []),
//           ],
//         },
//         select: { id: true },
//       });
//       if (existing) clientId = existing.id;
//     }

//     if (!clientId) {
//       const createdClient = await prisma.client.create({
//         data: {
//           // В вашей схеме email/phone — тип string (НЕ null). Поэтому даём строки.
//           name: norm(body.customerName),
//           phone: phoneStr,
//           email: emailStr,
//           birthDate: parseIsoDateToUtcMidnight(body.birthDate),
//         },
//         select: { id: true },
//       });
//       clientId = createdClient.id;
//     }

//     const created = await prisma.appointment.create({
//       data: {
//         serviceId: service.id,
//         clientId: clientId,
//         masterId: master.id,
//         startAt,
//         endAt,
//         customerName: norm(body.customerName),
//         phone: phoneStr,
//         email: emailStr,
//         notes: norm(body.notes),
//         status: "PENDING",
//       },
//       select: {
//         id: true,
//         startAt: true,
//         endAt: true,
//         status: true,
//         masterId: true,
//         serviceId: true,
//       },
//     });

//     return NextResponse.json(created, { status: 200 });
//   } catch (e: unknown) {
//     // аккуратное ветвление без any
//     if (e instanceof SyntaxError) {
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//     }

//     const message =
//       typeof e === "object" && e !== null && "toString" in e
//         ? String(e)
//         : "Internal error";

//     console.error("booking error:", message);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus } from "@prisma/client";

// /** Пауза после каждой записи (мин) — как и было */
// const BREAK_AFTER_MIN = 10;

// type BodyInput = {
//   serviceSlug: string;
//   masterId: string;           // целенаправленно: пишем к конкретному мастеру
//   dateISO: string;            // YYYY-MM-DD (локальные сутки)
//   startMin: number;           // минуты от начала локального дня
//   endMin: number;             // минуты от начала локального дня
//   name: string;
//   phone: string;
//   email?: string | null;
//   notes?: string | null;
// };

// /* ───────────── helpers ───────────── */

// /**
//  * Возвращает полночь локального дня.
//  * ВАЖНО: конструируем через числовые компоненты, а не ISO-строку — иначе будет UTC.
//  */
// function localDayStart(dateISO: string): Date {
//   const [y, m, d] = dateISO.split("-").map(Number);
//   return new Date(y, m - 1, d, 0, 0, 0, 0); // локальная полуночь
// }

// /** Удобно получить Date, соответствующую минутам от локальной полуночи указанного дня. */
// function atMinutesOfLocalDay(dateISO: string, minutesFromStart: number): Date {
//   const base = localDayStart(dateISO).getTime();
//   return new Date(base + minutesFromStart * 60_000);
// }

// /** Простейшая провека формата YYYY-MM-DD */
// function isValidISODate(d: string): boolean {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
//   const [y, m, d2] = d.split("-").map(Number);
//   const test = new Date(y, m - 1, d2, 0, 0, 0, 0);
//   return Number.isFinite(test.getTime());
// }

// /* ───────────── POST /booking ───────────── */

// export async function POST(req: Request): Promise<Response> {
//   let body: BodyInput;
//   try {
//     body = (await req.json()) as BodyInput;
//   } catch {
//     return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
//   }

//   const { serviceSlug, masterId, dateISO, startMin, endMin, name, phone, email, notes } = body;

//   // Валидация входа — оставлено как было по смыслу
//   if (!serviceSlug || !masterId || !isValidISODate(dateISO)) {
//     return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 422 });
//   }
//   if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
//     return NextResponse.json({ ok: false, error: "Invalid time range" }, { status: 422 });
//   }
//   if (!name?.trim()) {
//     return NextResponse.json({ ok: false, error: "Name required" }, { status: 422 });
//   }
//   if (!/^[\d\s+()\-]{6,}$/.test((phone ?? "").trim())) {
//     return NextResponse.json({ ok: false, error: "Phone invalid" }, { status: 422 });
//   }

//   // Услуга
//   const service = await prisma.service.findUnique({
//     where: { slug: serviceSlug },
//     select: { id: true, isActive: true },
//   });
//   if (!service || !service.isActive) {
//     return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });
//   }

//   // Мастер существует?
//   const master = await prisma.master.findUnique({
//     where: { id: masterId },
//     select: { id: true },
//   });
//   if (!master) {
//     return NextResponse.json({ ok: false, error: "Master not found" }, { status: 404 });
//   }

//   // Проверим, что мастер оказывает эту услугу (m:n через _MasterServices)
//   const allowed = await prisma.service.findFirst({
//     where: {
//       id: service.id,
//       masters: { some: { id: master.id } },
//     },
//     select: { id: true },
//   });
//   if (!allowed) {
//     return NextResponse.json({ ok: false, error: "Service is not provided by this master" }, { status: 422 });
//   }

//   // Времена: только локальная полуночь + оффсеты (убирает сдвиг на -2 часа)
//   const requestedStart = atMinutesOfLocalDay(dateISO, startMin);
//   const requestedEnd = atMinutesOfLocalDay(dateISO, endMin);

//   // Окно для проверки конфликтов (расширяем влево на BREAK, как и раньше)
//   const windowStart = new Date(requestedStart.getTime() - BREAK_AFTER_MIN * 60_000);
//   const windowEnd = requestedEnd;

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       // Конфликты только у данного мастера (PENDING/CONFIRMED)
//       const busy = await tx.appointment.findMany({
//         where: {
//           masterId: master.id,
//           status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
//           startAt: { lt: windowEnd },
//           endAt: { gt: windowStart },
//         },
//         select: { startAt: true, endAt: true },
//         orderBy: { startAt: "asc" },
//       });

//       const hasConflict = busy.some(({ startAt, endAt }) => {
//         const expandedEnd = new Date(endAt.getTime() + BREAK_AFTER_MIN * 60_000);
//         return requestedStart < expandedEnd && startAt < requestedEnd;
//       });

//       if (hasConflict) {
//         return { ok: false as const, status: 409, error: "Time slot is already taken" };
//       }

//       // Найдём/сопоставим клиента (по телефону/почте)
//       const existingClient = await tx.client.findFirst({
//         where: {
//           OR: [
//             { phone: phone.trim() },
//             ...(email?.trim() ? [{ email: email.trim() }] : []),
//           ],
//         },
//         select: { id: true },
//       });

//       // Создание записи
//       await tx.appointment.create({
//         data: {
//           serviceId: service.id,
//           clientId: existingClient?.id ?? null,
//           masterId: master.id,
//           startAt: requestedStart,
//           endAt: requestedEnd,
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email?.trim() || null,
//           notes: notes?.trim() || null,
//           status: AppointmentStatus.PENDING,
//         },
//       });

//       return { ok: true as const, status: 201 };
//     });

//     if (!result.ok) {
//       return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
//     }
//     return NextResponse.json({ ok: true }, { status: 201 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `create error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ ok: false, error: msg }, { status: 500 });
//   }
// }
