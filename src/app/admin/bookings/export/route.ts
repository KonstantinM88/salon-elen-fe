// src/app/admin/bookings/export/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@prisma/client";
import { addDays, startOfDay, startOfMonth, startOfYear } from "date-fns";
import { fmtDT, fmtVisitDate, fmtVisitTime } from "@/lib/time";

function getOne(sp: URLSearchParams, key: string): string | undefined {
  const v = sp.getAll(key);
  return v.length ? v[0] : undefined;
}
function resolveRange(sp: URLSearchParams) {
  const period = getOne(sp, "period") ?? "7d";
  const by = getOne(sp, "by") === "visit" ? "visit" : "created";
  const todayStart = startOfDay(new Date());
  let from = todayStart,
    to = addDays(todayStart, 1);
  switch (period) {
    case "today":
      from = todayStart;
      to = addDays(todayStart, 1);
      break;
    case "7d":
      from = addDays(todayStart, -6);
      to = addDays(todayStart, 1);
      break;
    case "30d":
      from = addDays(todayStart, -29);
      to = addDays(todayStart, 1);
      break;
    case "thisMonth":
      from = startOfMonth(new Date());
      to = startOfMonth(addDays(new Date(), 32));
      break;
    case "thisYear":
      from = startOfYear(new Date());
      to = startOfYear(addDays(new Date(), 370));
      break;
  }
  return { from, to, period, by };
}

type Svc = { name: string; parent?: Svc | null };
function servicePath(s?: Svc | null): string {
  if (!s) return "—";
  const parts: string[] = [];
  let cur: Svc | null | undefined = s;
  while (cur) {
    parts.unshift(cur.name);
    cur = cur.parent ?? null;
  }
  return parts.join(" / ");
}
function csvEscape(v: string | null | undefined) {
  return `"${(v ?? "").replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  const statusParam = (getOne(sp, "status") ?? "all").toLowerCase();
  const masterParam = getOne(sp, "master") ?? "all";
  const { from, to, by } = resolveRange(sp);

  let where: Prisma.AppointmentWhereInput =
    by === "visit"
      ? { startAt: { gte: from, lt: to } }
      : { createdAt: { gte: from, lt: to } };

  type StatusKey = "pending" | "confirmed" | "canceled" | "done" | "all";
  const statusKey = (statusParam as StatusKey) ?? "all";
  if (statusKey !== "all") {
    const map: Record<Exclude<StatusKey, "all">, AppointmentStatus> = {
      pending: AppointmentStatus.PENDING,
      confirmed: AppointmentStatus.CONFIRMED,
      canceled: AppointmentStatus.CANCELED,
      done: AppointmentStatus.DONE,
    };
    where = { ...where, status: map[statusKey] };
  }
  if (masterParam !== "all") where = { ...where, masterId: masterParam };

  const rows = await prisma.appointment.findMany({
    where,
    orderBy: by === "visit" ? { startAt: "desc" } : { createdAt: "desc" },
    select: {
      createdAt: true,
      customerName: true,
      phone: true,
      email: true,
      notes: true,
      startAt: true,
      endAt: true,
      status: true,
      master: { select: { name: true } },
      service: {
        select: {
          name: true,
          parent: {
            select: { name: true, parent: { select: { name: true } } },
          },
        },
      },
    },
  });

  const header = [
    "Когда создано",
    "Клиент",
    "Телефон",
    "Email",
    "Услуга",
    "Мастер",
    "Дата визита",
    "Начало",
    "Конец",
    "Статус",
    "Комментарий",
  ];

  const body = rows.map((r) =>
    [
      fmtDT(r.createdAt),
      r.customerName ?? "",
      r.phone ?? "",
      r.email ?? "",
      servicePath(r.service),
      r.master?.name ?? "",
      fmtVisitDate(r.startAt),
      fmtVisitTime(r.startAt),
      fmtVisitTime(r.endAt),
      r.status,
      r.notes ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const csv =
    "\ufeff" + [header.map(csvEscape).join(","), ...body].join("\r\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
