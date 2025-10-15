// scripts/scripts/analyze-loss.ts
import '../_env';
import { assertEnv } from '..//_env';
assertEnv();

import { prisma } from '../../src/lib/prisma';
import { wallMinutesToUtc } from '../../src/lib/orgTime';

function isValidISO(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

type DayReport = {
  dateISO: string;
  lostMinBetween: number;
  lostMinTail: number;
  appts: Array<{ startAt_utc: string; endAt_utc: string }>;
};

async function main() {
  const START_ISO = process.argv[2];
  const END_ISO = process.argv[3];
  const MASTER_ID = process.argv[4];
  const BUFFER_AFTER = Number(process.argv[5] ?? 10);

  if (!isValidISO(START_ISO ?? '')) throw new Error('start date invalid');
  if (!isValidISO(END_ISO ?? '')) throw new Error('end date invalid');
  if (!MASTER_ID) throw new Error('MASTER_ID is required');

  const s = new Date(START_ISO);
  const e = new Date(END_ISO);
  const days: string[] = [];
  for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }

  const out: DayReport[] = [];

  for (const dateISO of days) {
    const ds = wallMinutesToUtc(dateISO, 0);
    const de = wallMinutesToUtc(dateISO, 24 * 60);

    const appts = await prisma.appointment.findMany({
      where: {
        masterId: MASTER_ID,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startAt: { lt: de },
        endAt: { gt: ds },
      },
      select: { startAt: true, endAt: true },
      orderBy: { startAt: 'asc' },
    });

    let lostBetween = 0;
    for (let i = 0; i + 1 < appts.length; i++) {
      const a = appts[i];
      const b = appts[i + 1];
      // «потеря» между — это хвост после A (BUFFER_AFTER) до начала B
      const afterA = new Date(a.endAt.getTime() + BUFFER_AFTER * 60000);
      if (afterA < b.startAt) {
        lostBetween += Math.floor((b.startAt.getTime() - afterA.getTime()) / 60000);
      }
    }

    // Потеря в хвосте дня – tail после последнего апойтмента до конца рабочей смены
    // (если нужно — можно тут подставить рабочие часы конкретного мастера)
    const last = appts.at(-1);
    let lostTail = 0;
    if (last) {
      const afterLast = new Date(last.endAt.getTime() + BUFFER_AFTER * 60000);
      if (afterLast < de) {
        lostTail = Math.floor((de.getTime() - afterLast.getTime()) / 60000);
      }
    }

    out.push({
      dateISO,
      lostMinBetween: lostBetween,
      lostMinTail: lostTail,
      appts: appts.map(a => ({
        startAt_utc: a.startAt.toISOString(),
        endAt_utc: a.endAt.toISOString(),
      })),
    });
  }

  const totals = out.reduce(
    (acc, d) => {
      acc.lostBetweenMin += d.lostMinBetween;
      acc.lostTailMin += d.lostMinTail;
      return acc;
    },
    { lostBetweenMin: 0, lostTailMin: 0 }
  );
  const lostAllMin = totals.lostBetweenMin + totals.lostTailMin;

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    masterId: MASTER_ID,
    range: { start: START_ISO, end: END_ISO },
    bufferAfterMin: BUFFER_AFTER,
    totals: {
      lostBetweenMin: totals.lostBetweenMin,
      lostTailMin: totals.lostTailMin,
      lostAllMin,
      lostAllHours: (lostAllMin / 60).toFixed(2),
    },
    days: out,
  }, null, 2));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
