// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  ORG_TZ,
  isYmd,
  makeUtcSlot,
  formatWallRangeLabel,
} from "@/lib/orgTime";

/* ============ схема входа ============ */

const BodySchema = z
  .object({
    serviceSlug: z.string().trim().min(1),
    masterId: z.string().trim().min(1),
    dateISO: z.string().refine(isYmd, "dateISO must be YYYY-MM-DD"),
    startMin: z.number().int().nonnegative(),
    endMin: z.number().int().positive(),
    name: z.string().trim().min(1),
    phone: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    notes: z.string().trim().optional(),
    // клиента создаём только если birthDate передан и валиден
    birthDate: z
      .string()
      .refine((v) => !v || isYmd(v), "birthDate must be YYYY-MM-DD")
      .optional(),
  })
  .refine((v) => v.endMin > v.startMin, {
    message: "endMin must be > startMin",
    path: ["endMin"],
  });

type BodyIn = z.infer<typeof BodySchema>;

/* ============ утилиты ============ */

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  // полуоткрытые интервалы [start,end)
  return aStart < bEnd && bStart < aEnd;
}

function norm(s?: string): string | null {
  const t = (s ?? "").trim();
  return t.length ? t : null;
}

/* ============ handler ============ */

export async function POST(req: Request): Promise<Response> {
  try {
    const raw = await req.json();
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body: BodyIn = parsed.data;

    // ---- сервис
    const service = await prisma.service.findUnique({
      where: { slug: body.serviceSlug },
      select: {
        id: true,
        isActive: true,
        durationMin: true,
        masters: { select: { id: true } },
      },
    });
    if (!service || !service.isActive || !service.durationMin) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Требуем совпадение длительности
    const requestedDuration = body.endMin - body.startMin;
    if (requestedDuration !== service.durationMin) {
      return NextResponse.json(
        {
          error: "Duration mismatch",
          expectedMin: service.durationMin,
          gotMin: requestedDuration,
        },
        { status: 400 }
      );
    }

    // ---- мастер оказывает услугу?
    const masterProvides = service.masters.some((m) => m.id === body.masterId);
    if (!masterProvides) {
      return NextResponse.json(
        { error: "This master does not provide the selected service" },
        { status: 400 }
      );
    }

    // ---- UTC интервал слота по тайзоне салона
    const { start, end } = makeUtcSlot(body.dateISO, body.startMin, body.endMin);

    // ---- мягкая проверка конфликтов (PENDING/CONFIRMED)
    const conflict = await prisma.appointment.findFirst({
      where: {
        masterId: body.masterId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: end },
        endAt: { gt: start },
      },
      select: { id: true, startAt: true, endAt: true },
    });

    if (conflict && overlaps(start, end, conflict.startAt, conflict.endAt)) {
      return NextResponse.json(
        { error: "Time slot already taken" },
        { status: 409 }
      );
    }

    // ---- клиент (ищем по phone/email). Создаём ТОЛЬКО если есть birthDate.
    const phoneStr = norm(body.phone);
    const emailStr = norm(body.email);
    const notesStr = norm(body.notes);

    let clientId: string | null = null;

    if (phoneStr || emailStr) {
      const existing = await prisma.client.findFirst({
        where: {
          OR: [
            ...(phoneStr ? [{ phone: phoneStr }] as const : []),
            ...(emailStr ? [{ email: emailStr }] as const : []),
          ],
        },
        select: { id: true },
      });
      if (existing) clientId = existing.id;
    }

    if (!clientId && body.birthDate) {
      // полуночь локального дня birthDate -> UTC (берём start из makeUtcSlot)
      const { start: bdStartUtc } = makeUtcSlot(body.birthDate, 0, 1);
      const createdClient = await prisma.client.create({
        data: {
          name: body.name.trim(),
          phone: phoneStr ?? "",
          email: emailStr ?? "",
          birthDate: bdStartUtc,
        },
        select: { id: true },
      });
      clientId = createdClient.id;
    }

    // ---- создаём запись (спина-в-спину возможна, т.к. [start,end))
    try {
      const created = await prisma.appointment.create({
        data: {
          serviceId: service.id,
          masterId: body.masterId,
          clientId, // может быть null — если поле nullable в схеме
          startAt: start,
          endAt: end,
          status: "PENDING",
          customerName: body.name.trim(),
          phone: phoneStr ?? "",
          email: emailStr ?? "",
          notes: notesStr,
        },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          masterId: true,
          serviceId: true,
        },
      });

      return NextResponse.json(
        {
          ok: true as const,
          booking: created,
          label: formatWallRangeLabel(created.startAt, created.endAt),
          timeZone: ORG_TZ,
        },
        { status: 200 }
      );
    } catch (e) {
      // ловим исключающее ограничение БД на пересечения (Postgres 23P01)
      const err = e as { code?: string; message?: string };
      if (err?.code === "23P01" || String(err?.message ?? "").includes("exclusion constraint")) {
        return NextResponse.json({ error: "Time slot already taken" }, { status: 409 });
      }
      throw e;
    }
  } catch (e) {
    // кривой JSON → 400, а не 500
    if (e instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    console.error("appointments POST error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}





//----------без POST
// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { prisma } from "@/lib/db";
// import {
//   ORG_TZ,
//   isYmd,
//   makeUtcSlot,
//   formatWallRangeLabel,
// } from "@/lib/orgTime";

// /* ============ схема входа ============ */

// const BodySchema = z
//   .object({
//     serviceSlug: z.string().trim().min(1),
//     masterId: z.string().trim().min(1),
//     dateISO: z.string().refine(isYmd, "dateISO must be YYYY-MM-DD"),
//     startMin: z.number().int().nonnegative(),
//     endMin: z.number().int().positive(),
//     name: z.string().trim().min(1),
//     phone: z.string().trim().min(1).optional(),
//     email: z.string().trim().email().optional(),
//     notes: z.string().trim().optional(),
//     // клиента создаём только если birthDate передан и валиден
//     birthDate: z
//       .string()
//       .refine((v) => !v || isYmd(v), "birthDate must be YYYY-MM-DD")
//       .optional(),
//   })
//   .refine((v) => v.endMin > v.startMin, {
//     message: "endMin must be > startMin",
//     path: ["endMin"],
//   });

// type BodyIn = z.infer<typeof BodySchema>;

// /* ============ утилиты ============ */

// function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
//   // полуоткрытые интервалы [start,end)
//   return aStart < bEnd && bStart < aEnd;
// }

// function norm(s?: string): string | null {
//   const t = (s ?? "").trim();
//   return t.length ? t : null;
// }

// /* ============ handler ============ */

// export async function POST(req: Request): Promise<Response> {
//   try {
//     const raw = await req.json();
//     const parsed = BodySchema.safeParse(raw);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Invalid body", details: parsed.error.flatten() },
//         { status: 400 }
//       );
//     }
//     const body = parsed.data as BodyIn;

//     // ---- сервис
//     const service = await prisma.service.findUnique({
//       where: { slug: body.serviceSlug },
//       select: {
//         id: true,
//         isActive: true,
//         durationMin: true,
//         masters: { select: { id: true } },
//       },
//     });
//     if (!service || !service.isActive || !service.durationMin) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Требуем совпадение длительности
//     const requestedDuration = body.endMin - body.startMin;
//     if (requestedDuration !== service.durationMin) {
//       return NextResponse.json(
//         {
//           error: "Duration mismatch",
//           expectedMin: service.durationMin,
//           gotMin: requestedDuration,
//         },
//         { status: 400 }
//       );
//     }

//     // ---- мастер
//     const masterProvides = service.masters.some((m) => m.id === body.masterId);
//     if (!masterProvides) {
//       return NextResponse.json(
//         { error: "This master does not provide the selected service" },
//         { status: 400 }
//       );
//     }

//     // ---- UTC интервал слота по тайзоне салона
//     const { start, end } = makeUtcSlot(body.dateISO, body.startMin, body.endMin);

//     // ---- мягкая проверка конфликтов (PENDING/CONFIRMED)
//     const conflict = await prisma.appointment.findFirst({
//       where: {
//         masterId: body.masterId,
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: end },
//         endAt: { gt: start },
//       },
//       select: { id: true, startAt: true, endAt: true },
//     });

//     if (conflict && overlaps(start, end, conflict.startAt, conflict.endAt)) {
//       return NextResponse.json(
//         { error: "Time slot already taken" },
//         { status: 409 }
//       );
//     }

//     // ---- клиент (ищем по phone/email). Создаём ТОЛЬКО если есть birthDate.
//     const phoneStr = norm(body.phone);
//     const emailStr = norm(body.email);
//     const notesStr = norm(body.notes);

//     let clientId: string | null = null;

//     if (phoneStr || emailStr) {
//       const existing = await prisma.client.findFirst({
//         where: {
//           OR: [
//             ...(phoneStr ? [{ phone: phoneStr }] as const : []),
//             ...(emailStr ? [{ email: emailStr }] as const : []),
//           ],
//         },
//         select: { id: true },
//       });
//       if (existing) clientId = existing.id;
//     }

//     if (!clientId && body.birthDate) {
//       // Возьмём полуночь локального дня birthDate -> UTC (start части makeUtcSlot)
//       const { start: bdStartUtc } = makeUtcSlot(body.birthDate, 0, 1);
//       const createdClient = await prisma.client.create({
//         data: {
//           name: body.name.trim(),
//           phone: phoneStr ?? "",
//           email: emailStr ?? "",
//           birthDate: bdStartUtc,
//         },
//         select: { id: true },
//       });
//       clientId = createdClient.id;
//     }

//     // ---- создаём запись (спина-в-спину возможна, т.к. [start,end))
//     try {
//       const created = await prisma.appointment.create({
//         data: {
//           serviceId: service.id,
//           masterId: body.masterId,
//           clientId, // может быть null — если поле nullable в схеме
//           startAt: start,
//           endAt: end,
//           status: "PENDING",
//           customerName: body.name.trim(),
//           phone: phoneStr ?? "",
//           email: emailStr ?? "",
//           notes: notesStr,
//         },
//         select: {
//           id: true,
//           startAt: true,
//           endAt: true,
//           status: true,
//           masterId: true,
//           serviceId: true,
//         },
//       });

//       return NextResponse.json(
//         {
//           ok: true as const,
//           booking: created,
//           label: formatWallRangeLabel(created.startAt, created.endAt),
//           timeZone: ORG_TZ,
//         },
//         { status: 200 }
//       );
//     } catch (e: unknown) {
//       // ловим исключающее ограничение БД на пересечения (Postgres 23P01)
//       // у Prisma часть таких ошибок идёт как код 23P01 из драйвера
//       const err = e as { code?: string; message?: string };
//       if (err?.code === "23P01" || String(err?.message ?? "").includes("exclusion constraint")) {
//         return NextResponse.json({ error: "Time slot already taken" }, { status: 409 });
//       }
//       throw e;
//     }
//   } catch (e) {
//     console.error("appointments POST error:", e);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }






// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { prisma } from "@/lib/db";
// import {
//   ORG_TZ,
//   isYmd,
//   makeUtcSlot,
//   formatWallRangeLabel,
// } from "@/lib/orgTime";

// /* ============ схема входа ============ */

// const BodySchema = z.object({
//   serviceSlug: z.string().trim().min(1),
//   masterId: z.string().trim().min(1),
//   dateISO: z.string().refine(isYmd, "dateISO must be YYYY-MM-DD"),
//   startMin: z.number().int().nonnegative(),
//   endMin: z.number().int().positive(),
//   name: z.string().trim().min(1),
//   phone: z.string().trim().min(1).optional(),
//   email: z.string().trim().email().optional(),
//   notes: z.string().trim().optional(),
//   // клиента создаём только если birthDate передан и валиден
//   birthDate: z.string().refine((v) => !v || isYmd(v), "birthDate must be YYYY-MM-DD").optional(),
// });

// type BodyIn = z.infer<typeof BodySchema>;

// /* ============ утилиты ============ */

// function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
//   // полуоткрытые интервалы [start,end)
//   return aStart < bEnd && bStart < aEnd;
// }

// function norm(s?: string): string | null {
//   const t = (s ?? "").trim();
//   return t.length ? t : null;
// }

// /* ============ handler ============ */

// export async function POST(req: Request): Promise<Response> {
//   try {
//     const raw = await req.json();
//     const parsed = BodySchema.safeParse(raw);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Invalid body", details: parsed.error.flatten() },
//         { status: 400 }
//       );
//     }
//     const body = parsed.data;

//     // ---- сервис
//     const service = await prisma.service.findUnique({
//       where: { slug: body.serviceSlug },
//       select: { id: true, isActive: true, durationMin: true, masters: { select: { id: true } } },
//     });
//     if (!service || !service.isActive) {
//       return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
//     }

//     // ---- мастер
//     const master = await prisma.master.findUnique({
//       where: { id: body.masterId },
//       select: { id: true },
//     });
//     if (!master) {
//       return NextResponse.json({ error: "Master not found" }, { status: 404 });
//     }
//     // мастер оказывает услугу?
//     const masterProvides = service.masters.some((m) => m.id === master.id);
//     if (!masterProvides) {
//       return NextResponse.json(
//         { error: "This master does not provide the selected service" },
//         { status: 400 }
//       );
//     }

//     // ---- UTC интервал слота
//     const { start, end } = makeUtcSlot(body.dateISO, body.startMin, body.endMin);

//     // ---- мягкая проверка конфликтов (PENDING/CONFIRMED)
//     const conflict = await prisma.appointment.findFirst({
//       where: {
//         masterId: master.id,
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: end },
//         endAt: { gt: start },
//       },
//       select: { id: true, startAt: true, endAt: true },
//     });

//     if (conflict && overlaps(start, end, conflict.startAt, conflict.endAt)) {
//       return NextResponse.json(
//         { error: "Time slot already taken" },
//         { status: 409 }
//       );
//     }

//     // ---- клиент (ищем по phone/email). Создаём ТОЛЬКО если есть birthDate.
//     const phoneStr = norm(body.phone);
//     const emailStr = norm(body.email);

//     let clientId: string | null = null;

//     if (phoneStr || emailStr) {
//       const existing = await prisma.client.findFirst({
//         where: {
//           OR: [
//             ...(phoneStr ? [{ phone: phoneStr }] as const : []),
//             ...(emailStr ? [{ email: emailStr }] as const : []),
//           ],
//         },
//         select: { id: true },
//       });
//       if (existing) clientId = existing.id;
//     }

//     if (!clientId && body.birthDate) {
//       // возьмём полуночь локального дня birthDate -> UTC
//       const { start: bdStartUtc } = makeUtcSlot(body.birthDate, 0, 1);
//       const createdClient = await prisma.client.create({
//         data: {
//           name: body.name.trim(),
//           phone: phoneStr ?? "",
//           email: emailStr ?? "",
//           birthDate: bdStartUtc,
//         },
//         select: { id: true },
//       });
//       clientId = createdClient.id;
//     }

//     // ---- создаём запись
//     try {
//       const created = await prisma.appointment.create({
//         data: {
//           serviceId: service.id,
//           masterId: master.id,
//           clientId, // может остаться null — ок, если поле nullable
//           startAt: start,
//           endAt: end,
//           status: "PENDING",
//           customerName: body.name.trim(),
//           phone: phoneStr ?? "",
//           email: emailStr ?? "",
//           notes: norm(body.notes),
//         },
//         select: {
//           id: true,
//           startAt: true,
//           endAt: true,
//           status: true,
//           masterId: true,
//           serviceId: true,
//         },
//       });

//       return NextResponse.json(
//         {
//           ok: true,
//           booking: created,
//           label: formatWallRangeLabel(created.startAt, created.endAt),
//           timeZone: ORG_TZ,
//         },
//         { status: 200 }
//       );
//     } catch (e) {
//       // ловим исключающее ограничение БД на пересечения (Postgres 23P01)
//       const pgErr = e as { code?: string };
//       if (pgErr?.code === "23P01") {
//         return NextResponse.json({ error: "Time slot already taken" }, { status: 409 });
//       }
//       throw e;
//     }
//   } catch (e) {
//     console.error("appointments POST error:", e);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }







//--------работал после сборки
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { z } from "zod";
// import { makeUtcSlot } from "@/lib/orgTime";

// /** Пауза после каждой записи (мин) — НЕ используем, слоты строго [start,end) */
// // const BREAK_AFTER_MIN = 10;

// /* ───── helpers ───── */

// function isYmd(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// /* ───── схема входных данных ───── */

// const bodySchema = z
//   .object({
//     serviceSlug: z.string().trim().min(1, "serviceSlug required"),
//     masterId: z.string().trim().min(1, "masterId required"),
//     dateISO: z.string().refine(isYmd, "dateISO must be YYYY-MM-DD"),
//     startMin: z.number().int().nonnegative(),
//     endMin: z.number().int().positive(),
//     name: z.string().trim().min(1, "Name required"),
//     phone: z.string().trim().min(3).max(40).optional().nullable(),
//     notes: z.string().trim().min(1).optional().nullable(),
//   })
//   .refine((v) => v.endMin > v.startMin, {
//     message: "Invalid time range",
//     path: ["endMin"],
//   });

// type BodyIn = z.infer<typeof bodySchema>;

// export async function POST(req: Request) {
//   try {
//     const json = await req.json();
//     const parsed = bodySchema.safeParse(json);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Invalid body", details: parsed.error.flatten() },
//         { status: 400 }
//       );
//     }
//     const {
//       serviceSlug,
//       masterId,
//       dateISO,
//       startMin,
//       endMin,
//       name,
//       phone,
//       notes,
//     } = parsed.data as BodyIn;

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // проверим, что мастер существует и умеет эту услугу
//     const masterHasService = await prisma.master.findFirst({
//       where: { id: masterId, services: { some: { id: service.id } } },
//       select: { id: true },
//     });
//     if (!masterHasService) {
//       return NextResponse.json(
//         { error: "Selected master does not provide this service" },
//         { status: 400 }
//       );
//     }

//     // UTC-интервал из локальных минут
//     const { start, end } = makeUtcSlot(dateISO, startMin, endMin);

//     // safety: конфликтов быть не должно из-за БД-ограничения, но заранее проверим и вернём 409
//     const conflict = await prisma.appointment.findFirst({
//       where: {
//         masterId,
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: end },
//         endAt: { gt: start },
//       },
//       select: { id: true },
//     });
//     if (conflict) {
//       return NextResponse.json(
//         { error: "Time slot is already taken" },
//         { status: 409 }
//       );
//     }

//     await prisma.appointment.create({
//       data: {
//         serviceId: service.id,
//         masterId,
//         startAt: start,
//         endAt: end,
//         status: "PENDING",
//         customerName: name,
//         phone: phone ?? "",
//         notes: notes ?? null,
//       },
//     });

//     return NextResponse.json({ ok: true }, { status: 200 });
//   } catch (e) {
//     // если внезапно прилетело от БД (например, exclusion constraint)
//     const text = String(e);
//     if (text.includes("23P01") || text.toLowerCase().includes("exclusion")) {
//       return NextResponse.json(
//         { error: "Time slot is already taken" },
//         { status: 409 }
//       );
//     }
//     console.error("appointments POST error:", e);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

// export const runtime = "nodejs";







// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { addMinutes } from "date-fns";
// import { wallMinutesToUtc } from "@/lib/orgTime";

// type Slot = { start: string; end: string };

// // через сколько минут от «сейчас» ещё показываем слот
// const MIN_LEAD_MIN = 30;
// // шаг, если у услуги нет duration (на всякий случай)
// const STEP_FALLBACK_MIN = 10;
// // технологические буферы вокруг занятости
// const BASE_BREAK_BEFORE_MIN = 10; // базовый минимум «до» записи (далее усилим до длительности)
// const BREAK_AFTER_MIN = 10;       // «после» записи

// function isValidISODate(d: string): boolean {
//   // YYYY-MM-DD
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// type UtcIntv = { start: Date; end: Date };
// type DebugInfo = {
//   params: { serviceSlug: string; dateISO: string; masterId?: string };
//   weekday: number;
//   workingHours: { startMin: number; endMin: number };
//   duration: number;
//   step: number;
//   bufferBefore: number;
//   bufferAfter: number;
//   timeOffUtc: { start: string; end: string }[];
//   apptsUtc: { start: string; end: string }[];
//   busyUtc: { start: string; end: string }[];
// };

// function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
//   const out: UtcIntv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start.getTime() <= cur.end.getTime()) {
//       if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
//     } else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();
//     const wantDebug = url.searchParams.get("debug") === "1";

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });

//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // ❗ Локальный weekday вычисляем из самой строки даты (без TZ), чтобы не съехать на день назад в UTC.
//     // Sunday=0 ... Saturday=6 — как в JS Date.
//     const weekday = new Date(`${dateISO}T00:00:00Z`).getUTCDay();

//     // Локальная полуночь и конец суток -> UTC интервалы
//     const dayStartUtc = wallMinutesToUtc(dateISO, 0);
//     const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);

//     // --- рабочие часы (минуты от локальной полуночи)
//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || !wh.startMinutes || !wh.endMinutes || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // --- перерывы/отпуска: локальные минуты → UTC интервалы
//     const timeOffRaw = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const timeOffUtc: UtcIntv[] = timeOffRaw
//       .map(({ startMinutes, endMinutes }) => ({
//         start: wallMinutesToUtc(dateISO, startMinutes),
//         end: wallMinutesToUtc(dateISO, endMinutes),
//       }))
//       .filter((x) => x.end.getTime() > x.start.getTime());

//     // --- уже забронированные интервалы (UTC) + буферы ДО/ПОСЛЕ
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         ...(masterId ? { masterId } : {}),
//         startAt: { lt: dayEndUtc },
//         endAt: { gt: dayStartUtc },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const duration = service.durationMin!;
//     const step = duration || STEP_FALLBACK_MIN;

//     // буфер «до» — не меньше длительности услуги (чтобы не строить слоты, врезающиеся «вплотную» в чужую запись)
//     const bufferBefore = Math.max(BASE_BREAK_BEFORE_MIN, duration);
//     const bufferAfter = BREAK_AFTER_MIN;

//     const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({
//       start: addMinutes(startAt, -bufferBefore),
//       end: addMinutes(endAt, bufferAfter),
//     }));

//     // --- объединённые занятые окна
//     const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

//     // --- построение свободных слотов
//     const leadThresholdUtc = new Date(Date.now() + MIN_LEAD_MIN * 60_000);

//     const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = alignUp(startMin, step);
//     const lastStart = endMin - duration;

//     // пересечение: касания считаем конфликтом (<= / >=), чтобы не давать слот «впритык»
//     const overlapsUtc = (a: Date, b: Date): boolean =>
//       busyUtc.some((x) => x.start <= b && a <= x.end);

//     while (s <= lastStart) {
//       const slotStartUtc = wallMinutesToUtc(dateISO, s);
//       const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

//       if (slotStartUtc.getTime() < leadThresholdUtc.getTime()) {
//         s += step;
//         continue;
//       }

//       if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
//         out.push({
//           start: slotStartUtc.toISOString(),
//           end: slotEndUtc.toISOString(),
//         });
//       }
//       s += step;
//     }

//     if (wantDebug) {
//       const payload: { slots: Slot[]; debug: DebugInfo } = {
//         slots: out,
//         debug: {
//           params: { serviceSlug, dateISO, masterId: masterId || undefined },
//           weekday,
//           workingHours: { startMin, endMin },
//           duration,
//           step,
//           bufferBefore,
//           bufferAfter,
//           timeOffUtc: timeOffUtc.map((t) => ({
//             start: t.start.toISOString(),
//             end: t.end.toISOString(),
//           })),
//           apptsUtc: apptsUtc.map((a) => ({
//             start: a.start.toISOString(),
//             end: a.end.toISOString(),
//           })),
//           busyUtc: busyUtc.map((b) => ({
//             start: b.start.toISOString(),
//             end: b.end.toISOString(),
//           })),
//         },
//       };
//       const res = NextResponse.json(payload, { status: 200 });
//       res.headers.set("Cache-Control", "no-store");
//       return res;
//     }

//     const res = NextResponse.json<Slot[]>(out, { status: 200 });
//     res.headers.set("Cache-Control", "no-store");
//     return res;
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }




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
