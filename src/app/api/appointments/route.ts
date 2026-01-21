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

    const conflictError = "SLOT_TAKEN";

    const created = await prisma.$transaction(async (tx) => {
      if (masterId) {
        await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${masterId} FOR UPDATE`;

        const overlapping = await tx.appointment.findFirst({
          where: {
            masterId,
            status: { in: ["PENDING", "CONFIRMED"] },
            startAt: { lt: endAt },
            endAt: { gt: startAt },
          },
          select: { id: true },
        });

        if (overlapping) {
          throw new Error(conflictError);
        }
      }

      // клиент по телефону/почте, если есть — БЕЗ any
      let clientId: string | undefined = undefined;
      if (phone || email) {
        const or: Prisma.ClientWhereInput[] = [];
        if (phone) or.push({ phone });
        if (email) or.push({ email });

        const existing = await tx.client.findFirst({
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

      return tx.appointment.create({
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
    });

    return NextResponse.json(created);
  } catch (e) {
    if (e instanceof Error && e.message === "SLOT_TAKEN") {
      return NextResponse.json({ error: "time_overlaps" }, { status: 409 });
    }
    // при необходимости подключите централизованное логирование
    console.error(e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
