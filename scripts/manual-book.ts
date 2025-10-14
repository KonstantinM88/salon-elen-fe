#!/usr/bin/env tsx
import "dotenv/config";
import { PrismaClient, AppointmentStatus } from "@prisma/client";

/** Europe/Berlin helpers */
function tzOffsetMs(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
  const asUTC = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    Number(map.hour), Number(map.minute), Number(map.second),
  );
  return at.getTime() - asUTC; // ключевой знак
}
function orgDayRange(dateISO: string, tz = "Europe/Berlin"): { start: Date; end: Date } {
  const utcMidnight = new Date(`${dateISO}T00:00:00Z`);
  const offset = tzOffsetMs(tz, utcMidnight);
  const start = new Date(utcMidnight.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}
function localMinsToUtc(dateISO: string, minutes: number, tz = "Europe/Berlin"): Date {
  const { start } = orgDayRange(dateISO, tz);
  return new Date(start.getTime() + minutes * 60_000);
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Настрой под себя:
  const serviceSlug = process.env.SVC_SLUG ?? "manikur-02";
  const masterId    = process.env.MASTER_ID ?? "cmgie5olu0000v6cw5sykjpxs";
  const dateISO     = process.env.DATE_ISO  ?? "2025-10-24";
  const startMin    = Number(process.env.START_MIN ?? "540"); // 09:00
  const durationMin = Number(process.env.DUR_MIN   ?? "30");  // если не знаешь — 30

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { id: true, isActive: true, durationMin: true },
  });
  if (!service || !service.isActive) throw new Error("service not found/inactive");

  const endMin = startMin + (service.durationMin ?? durationMin);
  const startAt = localMinsToUtc(dateISO, startMin);
  const endAt   = localMinsToUtc(dateISO, endMin);

  // завести/найти клиента (по твоей схеме поля обязательны)
  const clientEmail = "test@example.com";
  const clientPhone = "+491111111111";

  const client = await prisma.client.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      name: "Тест Клиент",
      phone: clientPhone,
      email: clientEmail,
      birthDate: new Date("1990-01-01T00:00:00Z"),
    },
    select: { id: true },
  });

  // связи через connect, без scalar id-полей
  await prisma.appointment.create({
    data: {
      service: { connect: { id: service.id } },
      master:  { connect: { id: masterId } },
      client:  { connect: { id: client.id } },
      startAt, endAt,
      status: AppointmentStatus.PENDING,
      customerName: "Тест Клиент",
      phone: clientPhone,
      email: clientEmail,
      notes: "manual-book demo",
    },
  });

  console.log("Appointment created at local minutes:", startMin, "→", endMin, "on", dateISO);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
