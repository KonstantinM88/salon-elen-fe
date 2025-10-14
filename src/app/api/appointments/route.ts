// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { orgDayRange } from "@/lib/orgTime";

/** Пауза после каждой записи (мин) */
const BREAK_AFTER_MIN = 10;

/* ───── helpers ───── */

function isValidISODate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const test = new Date(`${d}T00:00:00`);
  return Number.isFinite(test.getTime());
}

function localDayStart(dateISO: string): Date {
  // Локальные сутки организации (Europe/Berlin) → UTC-инстант их полуночи
  return orgDayRange(dateISO).start;
}

/* ───── схема входных данных ───── */

const bodySchema = z
  .object({
    serviceSlug: z.string().trim().min(1, "serviceSlug required"),
    dateISO: z.string().refine(isValidISODate, "dateISO must be YYYY-MM-DD"),
    startMin: z.number().int().nonnegative(),
    endMin: z.number().int().positive(),
    name: z.string().trim().min(1, "Name required"),
    phone: z.string().trim().regex(/^[\d\s+()\-]{6,}$/, "Phone invalid"),
    notes: z.string().trim().min(1).nullish(),
  })
  .refine((v) => v.endMin > v.startMin, {
    message: "Invalid time range",
    path: ["endMin"],
  });

type BodyIn = z.infer<typeof bodySchema>;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { serviceSlug, dateISO, startMin, endMin, name, phone, notes } =
      parsed.data as BodyIn;

    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
      select: { id: true, durationMin: true, isActive: true },
    });
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Вычисляем желаемые времена (локальные сутки → UTC)
    const startOfDay = localDayStart(dateISO);
    const requestedStart = new Date(startOfDay.getTime() + startMin * 60_000);
    const requestedEnd = new Date(startOfDay.getTime() + endMin * 60_000);

    // Окно проверки конфликтов (чуть шире на BREAK_AFTER_MIN)
    const windowStart = new Date(
      requestedStart.getTime() - BREAK_AFTER_MIN * 60_000
    );
    const windowEnd = requestedEnd;

    const result = await prisma.$transaction(async (tx) => {
      const busy = await tx.appointment.findMany({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          startAt: { lt: windowEnd },
          endAt: { gt: windowStart },
        },
        select: { startAt: true, endAt: true },
      });

      const hasConflict = busy.some(({ startAt, endAt }) => {
        const expandedEnd = new Date(endAt.getTime() + BREAK_AFTER_MIN * 60_000);
        return requestedStart < expandedEnd && startAt < requestedEnd;
      });

      if (hasConflict) {
        return {
          ok: false as const,
          status: 409,
          error: "Time slot is already taken",
        };
      }

      await tx.appointment.create({
        data: {
          serviceId: service.id,
          startAt: requestedStart,
          endAt: requestedEnd,
          status: "PENDING",
          customerName: name,
          phone,
          notes: notes ?? null,
        },
      });

      return { ok: true as const };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("appointments POST error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}




//-----------работало до 13.10----------------
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// /** пауза после каждой записи (мин) */
// const BREAK_AFTER_MIN = 10;

// type BodyInput = {
//   serviceSlug: string;
//   dateISO: string;       // YYYY-MM-DD (локально)
//   startMin: number;      // минуты от начала дня
//   endMin: number;        // минуты от начала дня
//   name: string;
//   phone: string;
//   notes?: string | null;
// };

// /* ---------- helpers ---------- */

// function isValidISODate(d: string): boolean {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
//   const test = new Date(`${d}T00:00:00`);
//   return Number.isFinite(test.getTime());
// }

// function localDayStart(dateISO: string): Date {
//   return new Date(`${dateISO}T00:00:00`);
// }

// /* ---------- POST ---------- */

// export async function POST(req: Request): Promise<Response> {
//   let body: BodyInput;
//   try {
//     body = (await req.json()) as BodyInput;
//   } catch {
//     return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
//   }

//   // Валидация входных данных
//   const { serviceSlug, dateISO, startMin, endMin, name, phone, notes } = body;

//   if (!serviceSlug || !isValidISODate(dateISO)) {
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

//   // Услуга и активность
//   const service = await prisma.service.findUnique({
//     where: { slug: serviceSlug },
//     select: { id: true, isActive: true },
//   });
//   if (!service || !service.isActive) {
//     return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });
//   }

//   // Вычисляем запрашиваемые времена (локальные сутки)
//   const startOfDay = localDayStart(dateISO);
//   const requestedStart = new Date(startOfDay.getTime() + startMin * 60000);
//   const requestedEnd = new Date(startOfDay.getTime() + endMin * 60000);

//   // Окно для проверки конфликтов: немного расширим влево на BREAK, чтобы поймать «почти впритык»
//   const windowStart = new Date(requestedStart.getTime() - BREAK_AFTER_MIN * 60000);
//   const windowEnd = requestedEnd;

//   // транзакция: проверка + создание
//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       // берём потенциально конфликтующие записи (любой услуги)
//       const busy = await tx.appointment.findMany({
//         where: {
//           status: { in: ["PENDING", "CONFIRMED"] },
//           startAt: { lt: windowEnd },
//           endAt: { gt: windowStart },
//         },
//         select: { startAt: true, endAt: true },
//       });

//       // конфликт с учётом паузы (расширяем конец каждой существующей записи)
//       const hasConflict = busy.some(({ startAt, endAt }) => {
//         const expandedEnd = new Date(endAt.getTime() + BREAK_AFTER_MIN * 60000);
//         return requestedStart < expandedEnd && startAt < requestedEnd;
//       });

//       if (hasConflict) {
//         return { ok: false as const, status: 409, error: "Time slot is already taken" };
//       }

//       // создаём запись (по умолчанию статус PENDING из схемы)
//       await tx.appointment.create({
//         data: {
//           serviceId: service.id,
//           startAt: requestedStart,
//           endAt: requestedEnd,
//           customerName: name.trim(),
//           phone: phone.trim(),
//           notes: notes?.trim() || null,
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
