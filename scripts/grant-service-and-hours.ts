#!/usr/bin/env tsx
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hhmmToMin(hhmm: string): number {
  const [hhStr, mmStr] = hhmm.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    throw new Error(`Bad time: ${hhmm}`);
  }
  return hh * 60 + mm;
}

/** weekday: 0=Sun..6=Sat */
async function main(): Promise<void> {
  const [, , masterId, serviceSlug, weekdayStr, startHHMM, endHHMM] = process.argv;

  if (!masterId || !serviceSlug || !weekdayStr || !startHHMM || !endHHMM) {
    console.error("Usage:");
    console.error("  tsx scripts/grant-service-and-hours.ts <masterId> <serviceSlug> <weekday 0..6> <startHH:MM> <endHH:MM>");
    process.exit(1);
  }

  const weekday = Number(weekdayStr);
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new Error("weekday must be integer 0..6");
  }
  const startMinutes = hhmmToMin(startHHMM);
  const endMinutes = hhmmToMin(endHHMM);
  if (endMinutes <= startMinutes) {
    throw new Error("end must be greater than start");
  }

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { id: true, isActive: true },
  });
  if (!service || !service.isActive) {
    throw new Error(`Service not found or inactive: ${serviceSlug}`);
  }

  // m:n: подключаем услугу мастеру
  await prisma.master.update({
    where: { id: masterId },
    data: { services: { connect: { id: service.id } } },
  });

  // часы работы на заданный weekday
  await prisma.masterWorkingHours.upsert({
    where: { masterId_weekday: { masterId, weekday } },
    update: { isClosed: false, startMinutes, endMinutes },
    create: { masterId, weekday, isClosed: false, startMinutes, endMinutes },
  });

  console.log("OK: service connected & hours set");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
