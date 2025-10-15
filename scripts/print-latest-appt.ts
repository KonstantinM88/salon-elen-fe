// scripts/print-latest-appt.ts

import './_env';
import { assertEnv } from './_env';
assertEnv();

import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { toZonedTime, format } from "date-fns-tz";

const ORG_TZ =
  process.env.ORG_TZ ||
  process.env.SALON_TZ ||
  process.env.NEXT_PUBLIC_ORG_TZ ||
  "Europe/Berlin";

function fmtOrg(dt: Date) {
  const z = toZonedTime(dt, ORG_TZ);
  return format(z, "dd.MM.yyyy HH:mm", { timeZone: ORG_TZ });
}

async function main() {
  const a = await prisma.appointment.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { name: true } },
      master:  { select: { name: true } },
    },
  });

  if (!a) {
    console.log("Записей нет");
    return;
  }

  // ВАЖНО: колонки в БД — timestamp without time zone, но содержат UTC.
  // 1) «помечаем» как UTC: (ts AT TIME ZONE 'UTC') -> timestamptz
  // 2) приводим к локальному времени салона: (...) AT TIME ZONE $1 -> timestamp (локальный)
  // 3) форматируем в строку на стороне БД, чтобы JS ничего не додумывал.
  const [pg] = await prisma.$queryRawUnsafe<
    Array<{ start_local_txt: string; end_local_txt: string }>
  >(
    `
    select
      to_char(((a."startAt" at time zone 'UTC') at time zone $1), 'DD.MM.YYYY HH24:MI') as start_local_txt,
      to_char(((a."endAt"   at time zone 'UTC') at time zone $1), 'DD.MM.YYYY HH24:MI') as end_local_txt
    from "Appointment" a
    where a."id" = $2
    limit 1
    `,
    ORG_TZ,
    a.id
  );

  const out = {
    id: a.id,
    service: a.service?.name ?? "—",
    master: a.master?.name ?? "—",
    start: {
      utc_iso: a.startAt.toISOString(),
      in_org_tz_by_node: fmtOrg(a.startAt), // надёжно, т.к. указываем timeZone
      in_org_tz_by_pg: pg?.start_local_txt ?? "n/a", // точная строка из БД
    },
    end: {
      utc_iso: a.endAt.toISOString(),
      in_org_tz_by_node: fmtOrg(a.endAt),
      in_org_tz_by_pg: pg?.end_local_txt ?? "n/a",
    },
    org_tz: ORG_TZ,
  };

  console.log(JSON.stringify(out, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
