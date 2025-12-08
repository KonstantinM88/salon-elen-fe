// src/app/api/appointments/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type CreatePayload = {
  serviceId?: string; // primary для совместимости
  serviceIds?: string[]; // весь набор услуг
  masterId?: string;
  startAt: string; // ISO
  endAt?: string; // опционально, если не передали — рассчитаем
  customerName: string;
  phone: string;
  email?: string;
  notes?: string;
};

// суммарная длительность по списку услуг
async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
  if (serviceIds.length === 0) return 0;
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { id: true, durationMin: true },
  });
  return services.reduce((acc, s) => acc + (s.durationMin || 0), 0);
}

// мастер должен уметь выполнять все услуги
async function ensureMasterCoversAll(
  masterId: string | undefined,
  serviceIds: string[]
): Promise<boolean> {
  if (!masterId || serviceIds.length === 0) return true;
  const cnt = await prisma.service.count({
    where: {
      id: { in: serviceIds },
      isActive: true,
      masters: { some: { id: masterId } },
    },
  });
  return cnt === serviceIds.length;
}

// проверка пересечений по мастеру
async function hasOverlap(
  masterId: string | undefined,
  startAt: Date,
  endAt: Date
): Promise<boolean> {
  if (!masterId) return false;
  const overlap = await prisma.appointment.findFirst({
    where: {
      masterId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });
  return Boolean(overlap);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePayload;

    // нормализуем вход
    const serviceIds =
      Array.isArray(body.serviceIds) && body.serviceIds.length > 0
        ? body.serviceIds.filter(
            (v): v is string => typeof v === "string" && v.length > 0
          )
        : body.serviceId
        ? [body.serviceId]
        : [];

    const masterId = body.masterId;
    const customerName = String(body.customerName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = body.email ? String(body.email).trim() : undefined;
    const notes = body.notes ? String(body.notes).trim() : undefined;

    if (serviceIds.length === 0) {
      return NextResponse.json({ error: "service_required" }, { status: 400 });
    }
    if (!customerName || !phone) {
      return NextResponse.json({ error: "contact_required" }, { status: 400 });
    }
    if (!body.startAt) {
      return NextResponse.json({ error: "startAt_required" }, { status: 400 });
    }

    const startAt = new Date(body.startAt);
    if (Number.isNaN(startAt.getTime())) {
      return NextResponse.json({ error: "startAt_invalid" }, { status: 400 });
    }

    // Явный запрет записи в прошлое (с учётом текущего момента)
    const now = new Date();
    if (startAt.getTime() < now.getTime()) {
      return NextResponse.json({ error: "start_in_past" }, { status: 400 });
    }

    // запрет прошлого времени (допуская погрешность 1 минута)
    if (startAt.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: "startAt_past" }, { status: 400 });
    }

    // длительность и endAt
    const totalMin = await calcTotalDurationMin(serviceIds);
    if (!totalMin) {
      return NextResponse.json({ error: "duration_invalid" }, { status: 400 });
    }
    const endAt = body.endAt
      ? new Date(body.endAt)
      : new Date(startAt.getTime() + totalMin * 60_000);
    if (Number.isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "endAt_invalid" }, { status: 400 });
    }

    // мастер должен покрывать все услуги
    const covers = await ensureMasterCoversAll(masterId, serviceIds);
    if (!covers) {
      return NextResponse.json({ error: "split_required" }, { status: 400 });
    }

    // проверка пересечений
    const overlapping = await hasOverlap(masterId, startAt, endAt);
    if (overlapping) {
      return NextResponse.json({ error: "time_overlaps" }, { status: 409 });
    }

    // клиент по телефону/почте, если есть — БЕЗ any
    let clientId: string | undefined = undefined;
    if (phone || email) {
      const or: Prisma.ClientWhereInput[] = [];
      if (phone) or.push({ phone });
      if (email) or.push({ email });

      const existing = await prisma.client.findFirst({
        where: or.length > 0 ? { OR: or } : undefined,
        select: { id: true },
      });

      if (existing?.id) {
        clientId = existing.id;
      }
    }

    // primary service для совместимости со схемой
    const primaryServiceId = serviceIds[0];

    // сохраняем состав услуг в notes
    const extraNote =
      serviceIds.length > 1 ? `Набор услуг: ${serviceIds.join(", ")}` : null;
    const composedNotes = [notes, extraNote]
      .filter((v): v is string => Boolean(v))
      .join("\n");

    const created = await prisma.appointment.create({
      data: {
        serviceId: primaryServiceId,
        clientId,
        masterId: masterId || null,
        startAt,
        endAt,
        customerName,
        phone,
        email,
        notes: composedNotes || null,
        status: "PENDING",
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

    return NextResponse.json(created);
  } catch (e) {
    // при необходимости подключите централизованное логирование
    console.error(e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

//-------------до 27.10
// // src/app/api/appointments/route.ts
// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { prisma } from "@/lib/db";
// import { ORG_TZ, isYmd, makeUtcSlot, formatWallRangeLabel } from "@/lib/orgTime";

// /* ───────── helpers ───────── */

// function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
//   // полуоткрытые интервалы [start,end)
//   return aStart < bEnd && bStart < aEnd;
// }

// function norm(s?: string): string | null {
//   const t = (s ?? "").trim();
//   return t ? t : null;
// }

// // очень мягкая проверка «похоже на id»
// const isIdLike = (s: string): boolean => /^[a-z0-9_-]{20,}$/.test(s);

// /* ───────── shared responses ───────── */

// type Ok<T> = { ok: true; booking: T; label: string; timeZone: string };

// function ok<T extends { startAt: Date; endAt: Date }>(data: T, status = 200) {
//   return NextResponse.json<Ok<T>>(
//     {
//       ok: true,
//       booking: data,
//       label: formatWallRangeLabel(data.startAt, data.endAt),
//       timeZone: ORG_TZ,
//     },
//     { status }
//   );
// }

// function bad(message: string, status = 400, details?: unknown) {
//   return NextResponse.json({ error: message, details }, { status });
// }

// /* ───────── legacy body (старый контракт) ───────── */

// const LegacyBody = z
//   .object({
//     serviceSlug: z.string().trim().min(1),
//     masterId: z.string().trim().min(1),
//     dateISO: z.string().refine(isYmd, "dateISO must be YYYY-MM-DD"),
//     startMin: z.coerce.number().int().nonnegative(),
//     endMin: z.coerce.number().int().positive(),
//     name: z.string().trim().min(1),
//     phone: z.string().trim().optional(),
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

// type LegacyBodyT = z.infer<typeof LegacyBody>;

// /* ───────── new body (новый контракт) ───────── */

// const ServiceIdOrSlug = z
//   .object({ serviceId: z.string().min(1), serviceSlug: z.never().optional() })
//   .or(z.object({ serviceSlug: z.string().min(1), serviceId: z.never().optional() }));

// const Iso = z
//   .string()
//   .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid ISO date");

// // durationMin — НЕобязателен (можем взять с услуги)
// const NewBase = z.object({
//   masterId: z.string().min(1),
//   startAt: Iso,
//   durationMin: z.coerce.number().int().positive().optional(),
//   name: z.string().trim().min(1),
//   phone: z.string().trim().optional(),
//   email: z.string().trim().email().optional(),
//   notes: z.string().trim().optional(),
//   // клиента создаём только если birthDate передан и валиден
//   birthDate: z
//     .string()
//     .refine((v) => !v || isYmd(v), "birthDate must be YYYY-MM-DD")
//     .optional(),
// });

// const NewWithDuration = ServiceIdOrSlug.and(NewBase);

// const NewWithEnd = ServiceIdOrSlug.and(
//   NewBase.extend({ endAt: Iso }).refine(
//     (v) => new Date(v.endAt) > new Date(v.startAt),
//     { message: "endAt must be after startAt", path: ["endAt"] }
//   )
// );

// type NewWithDurationT = z.infer<typeof NewWithDuration>;
// type NewWithEndT = z.infer<typeof NewWithEnd>;

// /* ───────── service lookup ───────── */

// async function resolveService(params: { serviceId?: string; serviceSlug?: string }) {
//   if (params.serviceId) {
//     return prisma.service.findUnique({
//       where: { id: params.serviceId },
//       select: {
//         id: true,
//         slug: true,
//         isActive: true,
//         durationMin: true,
//         masters: { select: { id: true } },
//       },
//     });
//   }

//   if (params.serviceSlug) {
//     // основное — по слагу
//     const bySlug = await prisma.service.findUnique({
//       where: { slug: params.serviceSlug },
//       select: {
//         id: true,
//         slug: true,
//         isActive: true,
//         durationMin: true,
//         masters: { select: { id: true } },
//       },
//     });
//     if (bySlug) return bySlug;

//     // пришёл id в поле serviceSlug — поддержим
//     if (isIdLike(params.serviceSlug)) {
//       return prisma.service.findUnique({
//         where: { id: params.serviceSlug },
//         select: {
//           id: true,
//           slug: true,
//           isActive: true,
//           durationMin: true,
//           masters: { select: { id: true } },
//         },
//       });
//     }
//   }

//   return null;
// }

// /* ───────── main handler ───────── */

// export async function POST(req: Request): Promise<Response> {
//   let raw: unknown;
//   try {
//     raw = await req.json();
//   } catch {
//     return bad("Invalid JSON body", 400);
//   }

//   // 1) старый контракт
//   const legacy = LegacyBody.safeParse(raw);
//   if (legacy.success) {
//     return handleLegacy(legacy.data);
//   }

//   // 2) новый контракт — сначала с endAt, затем с duration/auto-duration
//   const vEnd = NewWithEnd.safeParse(raw);
//   if (vEnd.success) return handleNew(vEnd.data, true);

//   const vDur = NewWithDuration.safeParse(raw);
//   if (vDur.success) return handleNew(vDur.data, false);

//   return bad("Invalid body", 400, {
//     legacy: (legacy as { success: false; error: z.ZodError } | { success: true })?.success
//       ? undefined
//       : legacy.error.flatten(),
//     newWithEnd: (vEnd as { success: false; error: z.ZodError } | { success: true })?.success
//       ? undefined
//       : vEnd.error.flatten(),
//     newWithDuration: (vDur as { success: false; error: z.ZodError } | { success: true })?.success
//       ? undefined
//       : vDur.error.flatten(),
//   });
// }

// /* ───────── processors ───────── */

// async function handleLegacy(body: LegacyBodyT): Promise<Response> {
//   // поддержка "serviceSlug = id"
//   const service =
//     (await resolveService({ serviceSlug: body.serviceSlug })) ??
//     (await resolveService({ serviceId: body.serviceSlug }));

//   if (!service || !service.isActive || !service.durationMin) {
//     return bad("Service not found or inactive", 404);
//   }

//   const requestedDuration = body.endMin - body.startMin;
//   if (requestedDuration !== service.durationMin) {
//     return bad("Duration mismatch", 400, {
//       expectedMin: service.durationMin,
//       gotMin: requestedDuration,
//     });
//   }

//   if (!service.masters.some((m) => m.id === body.masterId)) {
//     return bad("This master does not provide the selected service", 400);
//   }

//   const { start, end } = makeUtcSlot(body.dateISO, body.startMin, body.endMin);

//   return createAppointment({
//     serviceId: service.id,
//     masterId: body.masterId,
//     startAt: start,
//     endAt: end,
//     name: body.name,
//     phone: norm(body.phone),
//     email: norm(body.email),
//     notes: norm(body.notes),
//     birthDate: body.birthDate ?? null,
//   });
// }

// async function handleNew(body: NewWithEndT | NewWithDurationT, hasEnd: boolean): Promise<Response> {
//   const service = await resolveService({
//     serviceId: (body as Partial<NewWithEndT>).serviceId,
//     serviceSlug: (body as Partial<NewWithEndT>).serviceSlug,
//   });

//   if (!service || !service.isActive) {
//     return bad("Service not found or inactive", 404);
//   }

//   if (!service.masters.some((m) => m.id === body.masterId)) {
//     return bad("This master does not provide the selected service", 400);
//   }

//   const startAt = new Date(body.startAt);
//   const durationMin =
//     (body as Partial<NewWithDurationT>).durationMin ?? service.durationMin ?? 60;

//   const endAt = hasEnd
//     ? new Date((body as NewWithEndT).endAt)
//     : new Date(startAt.getTime() + durationMin * 60_000);

//   if (hasEnd && service.durationMin) {
//     const gotMin = Math.round((endAt.getTime() - startAt.getTime()) / 60_000);
//     if (gotMin !== service.durationMin) {
//       return bad("Duration mismatch", 400, {
//         expectedMin: service.durationMin,
//         gotMin,
//       });
//     }
//   }

//   return createAppointment({
//     serviceId: service.id,
//     masterId: body.masterId,
//     startAt,
//     endAt,
//     name: body.name,
//     phone: norm((body as Partial<NewWithDurationT>).phone),
//     email: norm((body as Partial<NewWithDurationT>).email),
//     notes: norm((body as Partial<NewWithDurationT>).notes),
//     birthDate: (body as Partial<NewWithDurationT>).birthDate ?? null,
//   });
// }

// /* ───────── DB write + conflicts ───────── */

// type CreateArgs = {
//   serviceId: string;
//   masterId: string;
//   startAt: Date;
//   endAt: Date;
//   name: string;
//   phone: string | null;
//   email: string | null;
//   notes: string | null;
//   birthDate: string | null; // YYYY-MM-DD (локальная), используется только для автосоздания клиента
// };

// async function createAppointment(args: CreateArgs): Promise<Response> {
//   // мягкая проверка конфликтов (PENDING/CONFIRMED)
//   const conflict = await prisma.appointment.findFirst({
//     where: {
//       masterId: args.masterId,
//       status: { in: ["PENDING", "CONFIRMED"] },
//       startAt: { lt: args.endAt },
//       endAt: { gt: args.startAt },
//     },
//     select: { id: true, startAt: true, endAt: true },
//   });

//   if (conflict && overlaps(args.startAt, args.endAt, conflict.startAt, conflict.endAt)) {
//     return bad("Time slot already taken", 409);
//   }

//   // ищем клиента по телефону/почте; создаём ТОЛЬКО если передана валидная birthDate
//   let clientId: string | null = null;

//   if (args.phone || args.email) {
//     const existing = await prisma.client.findFirst({
//       where: {
//         OR: [
//           ...(args.phone ? [{ phone: args.phone }] as const : []),
//           ...(args.email ? [{ email: args.email }] as const : []),
//         ],
//       },
//       select: { id: true },
//     });
//     if (existing) clientId = existing.id;
//   }

//   if (!clientId && args.birthDate) {
//     // полуночь локального дня birthDate -> UTC (берём start из makeUtcSlot)
//     const { start: bdStartUtc } = makeUtcSlot(args.birthDate, 0, 1);
//     const createdClient = await prisma.client.create({
//       data: {
//         name: args.name.trim(),
//         phone: args.phone ?? "",
//         email: args.email ?? "",
//         birthDate: bdStartUtc,
//       },
//       select: { id: true },
//     });
//     clientId = createdClient.id;
//   }

//   try {
//     const created = await prisma.appointment.create({
//       data: {
//         serviceId: args.serviceId,
//         masterId: args.masterId,
//         clientId,
//         startAt: args.startAt,
//         endAt: args.endAt,
//         status: "PENDING",
//         customerName: args.name.trim(),
//         phone: args.phone ?? "",
//         email: args.email ?? "",
//         notes: args.notes,
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

//     return ok(created, 200);
//   } catch (e) {
//     // ловим исключающее ограничение БД на пересечения (Postgres 23P01)
//     const err = e as { code?: string; message?: string };
//     if (err?.code === "23P01" || String(err?.message ?? "").includes("exclusion constraint")) {
//       return bad("Time slot already taken", 409);
//     }
//     console.error("appointments POST error:", e);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

//-----------тиа работал но решил сделать ещё лучше
// // src/app/api/appointments/route.ts
// import { NextResponse } from "next/server";
// import { z } from "zod";
// import { prisma } from "@/lib/db";
// import { ORG_TZ, isYmd, makeUtcSlot, formatWallRangeLabel } from "@/lib/orgTime";

// /* ───────── helpers ───────── */

// function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
//   return aStart < bEnd && bStart < aEnd; // полуоткрытые интервалы [start,end)
// }
// function norm(s?: string): string | null {
//   const t = (s ?? "").trim();
//   return t ? t : null;
// }
// // очень мягкая проверка «похоже на id»
// const isIdLike = (s: string): boolean => /^[a-z0-9_-]{20,}$/.test(s);

// /* ───────── shared responses ───────── */

// type Ok<T> = { ok: true; booking: T; label: string; timeZone: string };

// function ok<T extends { startAt: Date; endAt: Date }>(data: T, status = 201) {
//   return NextResponse.json<Ok<T>>(
//     {
//       ok: true,
//       booking: data,
//       label: formatWallRangeLabel(data.startAt, data.endAt),
//       timeZone: ORG_TZ,
//     },
//     { status }
//   );
// }
// function bad(message: string, status = 400, details?: unknown) {
//   return NextResponse.json({ error: message, details }, { status });
// }

// /* ───────── legacy body (старый контракт) ───────── */

// const LegacyBody = z
//   .object({
//     serviceSlug: z.string().trim().min(1),
//     masterId: z.string().trim().min(1),
//     dateISO: z.string().refine(isYmd, "dateISO must be YYYY-MM-DD"),
//     startMin: z.coerce.number().int().nonnegative(),
//     endMin: z.coerce.number().int().positive(),
//     name: z.string().trim().min(1),
//     phone: z.string().trim().optional(),
//     email: z.string().trim().email().optional(),
//     notes: z.string().trim().optional(),
//     birthDate: z
//       .string()
//       .refine((v) => !v || isYmd(v), "birthDate must be YYYY-MM-DD")
//       .optional(),
//   })
//   .refine((v) => v.endMin > v.startMin, {
//     message: "endMin must be > startMin",
//     path: ["endMin"],
//   });

// type LegacyBodyT = z.infer<typeof LegacyBody>;

// /* ───────── new body (новый контракт) ───────── */

// const ServiceIdOrSlug = z
//   .object({ serviceId: z.string().min(1), serviceSlug: z.never().optional() })
//   .or(z.object({ serviceSlug: z.string().min(1), serviceId: z.never().optional() }));

// const Iso = z
//   .string()
//   .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid ISO date");

// // durationMin делаем НЕОБЯЗАТЕЛЬНЫМ — фронт может его не присылать
// const NewBase = z.object({
//   masterId: z.string().min(1),
//   startAt: Iso,
//   durationMin: z.coerce.number().int().positive().optional(),
//   name: z.string().trim().min(1),
//   phone: z.string().trim().optional(),
//   email: z.string().trim().email().optional(),
//   notes: z.string().trim().optional(),
//   birthDate: z
//     .string()
//     .refine((v) => !v || isYmd(v), "birthDate must be YYYY-MM-DD")
//     .optional(),
// });

// const NewWithDuration = ServiceIdOrSlug.and(NewBase);

// const NewWithEnd = ServiceIdOrSlug.and(
//   NewBase.extend({ endAt: Iso }).refine(
//     (v) => new Date(v.endAt) > new Date(v.startAt),
//     { message: "endAt must be after startAt", path: ["endAt"] }
//   )
// );

// type NewWithDurationT = z.infer<typeof NewWithDuration>;
// type NewWithEndT = z.infer<typeof NewWithEnd>;

// /* ───────── service lookup ───────── */

// async function resolveService(params: {
//   serviceId?: string;
//   serviceSlug?: string;
// }) {
//   if (params.serviceId) {
//     return prisma.service.findUnique({
//       where: { id: params.serviceId },
//       select: {
//         id: true,
//         slug: true,
//         isActive: true,
//         durationMin: true,
//         masters: { select: { id: true } },
//       },
//     });
//   }
//   if (params.serviceSlug) {
//     const bySlug = await prisma.service.findUnique({
//       where: { slug: params.serviceSlug },
//       select: {
//         id: true,
//         slug: true,
//         isActive: true,
//         durationMin: true,
//         masters: { select: { id: true } },
//       },
//     });
//     if (bySlug) return bySlug;

//     // пришёл id в поле serviceSlug — поддержим
//     if (isIdLike(params.serviceSlug)) {
//       return prisma.service.findUnique({
//         where: { id: params.serviceSlug },
//         select: {
//           id: true,
//           slug: true,
//           isActive: true,
//           durationMin: true,
//           masters: { select: { id: true } },
//         },
//       });
//     }
//   }
//   return null;
// }

// /* ───────── main handler ───────── */

// export async function POST(req: Request): Promise<Response> {
//   let raw: unknown;
//   try {
//     raw = await req.json();
//   } catch {
//     return bad("Invalid JSON body", 400);
//   }

//   // 1) старый контракт
//   const legacy = LegacyBody.safeParse(raw);
//   if (legacy.success) {
//     return handleLegacy(legacy.data);
//   }

//   // 2) новый контракт — сначала с endAt, затем duration/auto-duration
//   const vEnd = NewWithEnd.safeParse(raw);
//   if (vEnd.success) return handleNew(vEnd.data, true);

//   const vDur = NewWithDuration.safeParse(raw);
//   if (vDur.success) return handleNew(vDur.data, false);

//   return bad("Invalid body", 400, {
//     legacy: legacy.error?.flatten?.(),
//     newWithEnd: vEnd.error?.flatten?.(),
//     newWithDuration: vDur.error?.flatten?.(),
//   });
// }

// /* ───────── processors ───────── */

// async function handleLegacy(body: LegacyBodyT): Promise<Response> {
//   // поддержка "serviceSlug = id"
//   const service =
//     (await resolveService({ serviceSlug: body.serviceSlug })) ??
//     (await resolveService({ serviceId: body.serviceSlug }));

//   if (!service || !service.isActive || !service.durationMin) {
//     return bad("Service not found or inactive", 404);
//   }

//   const requestedDuration = body.endMin - body.startMin;
//   if (requestedDuration !== service.durationMin) {
//     return bad("Duration mismatch", 400, {
//       expectedMin: service.durationMin,
//       gotMin: requestedDuration,
//     });
//   }

//   if (!service.masters.some((m) => m.id === body.masterId)) {
//     return bad("This master does not provide the selected service", 400);
//   }

//   const { start, end } = makeUtcSlot(body.dateISO, body.startMin, body.endMin);

//   return createAppointment({
//     serviceId: service.id,
//     masterId: body.masterId,
//     startAt: start,
//     endAt: end,
//     name: body.name,
//     phone: norm(body.phone),
//     email: norm(body.email),
//     notes: norm(body.notes),
//     birthDate: body.birthDate ?? null,
//   });
// }

// async function handleNew(
//   body: NewWithEndT | NewWithDurationT,
//   hasEnd: boolean
// ): Promise<Response> {
//   const service = await resolveService({
//     serviceId: (body as NewWithEndT).serviceId,
//     serviceSlug: (body as NewWithEndT).serviceSlug,
//   });
//   if (!service || !service.isActive) {
//     return bad("Service not found or inactive", 404);
//   }

//   if (!service.masters.some((m) => m.id === body.masterId)) {
//     return bad("This master does not provide the selected service", 400);
//   }

//   const startAt = new Date(body.startAt);
//   const durationMin =
//     (body as Partial<NewWithDurationT>).durationMin ??
//     service.durationMin ??
//     60;

//   const endAt = hasEnd
//     ? new Date((body as NewWithEndT).endAt)
//     : new Date(startAt.getTime() + durationMin * 60_000);

//   if (hasEnd && service.durationMin) {
//     const gotMin = Math.round((endAt.getTime() - startAt.getTime()) / 60_000);
//     if (gotMin !== service.durationMin) {
//       return bad("Duration mismatch", 400, {
//         expectedMin: service.durationMin,
//         gotMin,
//       });
//     }
//   }

//   return createAppointment({
//     serviceId: service.id,
//     masterId: body.masterId,
//     startAt,
//     endAt,
//     name: body.name,
//     phone: norm((body as NewWithDurationT).phone),
//     email: norm((body as NewWithDurationT).email),
//     notes: norm((body as NewWithDurationT).notes),
//     birthDate: (body as NewWithDurationT).birthDate ?? null,
//   });
// }

// /* ───────── DB write + conflicts ───────── */

// type CreateArgs = {
//   serviceId: string;
//   masterId: string;
//   startAt: Date;
//   endAt: Date;
//   name: string;
//   phone: string | null;
//   email: string | null;
//   notes: string | null;
//   birthDate: string | null;
// };

// async function createAppointment(args: CreateArgs): Promise<Response> {
//   const conflict = await prisma.appointment.findFirst({
//     where: {
//       masterId: args.masterId,
//       status: { in: ["PENDING", "CONFIRMED"] },
//       startAt: { lt: args.endAt },
//       endAt: { gt: args.startAt },
//     },
//     select: { id: true, startAt: true, endAt: true },
//   });
//   if (conflict && overlaps(args.startAt, args.endAt, conflict.startAt, conflict.endAt)) {
//     return bad("Time slot already taken", 409);
//   }

//   let clientId: string | null = null;
//   if (args.phone || args.email) {
//     const existing = await prisma.client.findFirst({
//       where: {
//         OR: [
//           ...(args.phone ? [{ phone: args.phone }] as const : []),
//           ...(args.email ? [{ email: args.email }] as const : []),
//         ],
//       },
//       select: { id: true },
//     });
//     if (existing) clientId = existing.id;
//   }

//   if (!clientId && args.birthDate) {
//     const { start: bdStartUtc } = makeUtcSlot(args.birthDate, 0, 1);
//     const createdClient = await prisma.client.create({
//       data: {
//         name: args.name.trim(),
//         phone: args.phone ?? "",
//         email: args.email ?? "",
//         birthDate: bdStartUtc,
//       },
//       select: { id: true },
//     });
//     clientId = createdClient.id;
//   }

//   try {
//     const created = await prisma.appointment.create({
//       data: {
//         serviceId: args.serviceId,
//         masterId: args.masterId,
//         clientId,
//         startAt: args.startAt,
//         endAt: args.endAt,
//         status: "PENDING",
//         customerName: args.name.trim(),
//         phone: args.phone ?? "",
//         email: args.email ?? "",
//         notes: args.notes,
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
//     return ok(created, 201);
//   } catch (e) {
//     const err = e as { code?: string; message?: string };
//     if (err?.code === "23P01" || String(err?.message ?? "").includes("exclusion constraint")) {
//       return bad("Time slot already taken", 409);
//     }
//     console.error("appointments POST error:", e);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

//------------работал пока не полез делать новые слоты
// // src/app/api/appointments/route.ts
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
//     const body: BodyIn = parsed.data;

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

//     // ---- мастер оказывает услугу?
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
//       // полуночь локального дня birthDate -> UTC (берём start из makeUtcSlot)
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
//     } catch (e) {
//       // ловим исключающее ограничение БД на пересечения (Postgres 23P01)
//       const err = e as { code?: string; message?: string };
//       if (err?.code === "23P01" || String(err?.message ?? "").includes("exclusion constraint")) {
//         return NextResponse.json({ error: "Time slot already taken" }, { status: 409 });
//       }
//       throw e;
//     }
//   } catch (e) {
//     // кривой JSON → 400, а не 500
//     if (e instanceof SyntaxError) {
//       return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
//     }
//     console.error("appointments POST error:", e);
//     return NextResponse.json({ error: "Internal error" }, { status: 500 });
//   }
// }

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
