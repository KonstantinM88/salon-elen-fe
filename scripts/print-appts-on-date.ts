import './_env';
import { assertEnv } from './_env';
assertEnv();

import { prisma } from "@/lib/prisma";
import { wallMinutesToUtc } from "@/lib/orgTime";

const [dateISO, masterId] = process.argv.slice(2); // 2025-10-27 cmg...pxs
if (!dateISO || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !masterId) {
  console.error("Usage: npx tsx scripts/print-appts-on-date.ts 2025-10-27 <masterId>");
  process.exit(1);
}

const dayStartUtc = wallMinutesToUtc(dateISO, 0);
const dayEndUtc = wallMinutesToUtc(dateISO, 24*60);

(async () => {
  const appts = await prisma.appointment.findMany({
    where: {
      masterId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: dayEndUtc },
      endAt: { gt: dayStartUtc },
    },
    select: { id:true, status:true, startAt:true, endAt:true, serviceId:true },
    orderBy: { startAt: "asc" },
  });

  console.log(JSON.stringify({
    dateISO,
    masterId,
    dayStartUtc: dayStartUtc.toISOString(),
    dayEndUtc: dayEndUtc.toISOString(),
    appts: appts.map(a => ({
      id: a.id,
      status: a.status,
      startAt_utc: a.startAt.toISOString(),
      endAt_utc: a.endAt.toISOString(),
    }))
  }, null, 2));
  process.exit(0);
})();
