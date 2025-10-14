#!/usr/bin/env tsx
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/** Europe/Berlin helpers (локальные сутки → UTC-диапазон) */
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
  // offset = at - asUTC
  return at.getTime() - asUTC;
}
function orgDayRange(dateISO: string, tz = "Europe/Berlin"): { start: Date; end: Date } {
  const utcMidnight = new Date(`${dateISO}T00:00:00Z`);
  const offset = tzOffsetMs(tz, utcMidnight);
  const start = new Date(utcMidnight.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const [, , dateISO, masterId] = process.argv;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateISO))) {
    console.error("Usage:");
    console.error("  tsx scripts/clear-timeoff.ts <dateISO YYYY-MM-DD> [masterId]");
    process.exit(1);
  }
  const { start, end } = orgDayRange(dateISO);

  if (masterId) {
    const res = await prisma.masterTimeOff.deleteMany({
      where: { masterId, date: { gte: start, lt: end } },
    });
    console.log(`MasterTimeOff removed: ${res.count}`);
  } else {
    const res = await prisma.timeOff.deleteMany({
      where: { date: { gte: start, lt: end } },
    });
    console.log(`Salon TimeOff removed: ${res.count}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
