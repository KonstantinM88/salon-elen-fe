import { Temporal } from "@js-temporal/polyfill";

import { getBookingMethodLabel } from "@/lib/booking/booking-method";
import { ORG_TZ, formatWallRangeLabel } from "@/lib/orgTime";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@/lib/prisma-client";

export type UpcomingAppointmentsDays = 7 | 14 | 30;

export type UpcomingAppointmentItem = {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  serviceName: string;
  masterName: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  bookingMethod: string;
};

export type UpcomingAppointmentsReport = {
  days: number;
  generatedAt: Date;
  rangeEnd: Date;
  total: number;
  appointments: UpcomingAppointmentItem[];
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "В ожидании",
  CONFIRMED: "Подтвержден",
  CANCELED: "Отменен",
  DONE: "Выполнен",
};

const STATUS_EMOJI: Record<AppointmentStatus, string> = {
  PENDING: "🟡",
  CONFIRMED: "✅",
  CANCELED: "❌",
  DONE: "🎉",
};

function addSalonDays(date: Date, days: number): Date {
  const zdt = Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(ORG_TZ);
  return new Date(zdt.add({ days }).toInstant().epochMilliseconds);
}

function serviceNameOf(service: {
  name: string;
  parent?: { name: string } | null;
}): string {
  return service.parent?.name ? `${service.parent.name} / ${service.name}` : service.name;
}

function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ORG_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTitle(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: ORG_TZ,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, "\\$1");
}

function groupByDate(appointments: UpcomingAppointmentItem[]) {
  const groups = new Map<string, UpcomingAppointmentItem[]>();

  for (const appointment of appointments) {
    const key = formatDateKey(appointment.startAt);
    const current = groups.get(key);
    if (current) {
      current.push(appointment);
    } else {
      groups.set(key, [appointment]);
    }
  }

  return Array.from(groups.entries());
}

export async function getUpcomingAppointmentsReport({
  days,
  now = new Date(),
}: {
  days: number;
  now?: Date;
}): Promise<UpcomingAppointmentsReport> {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.min(Math.trunc(days), 60) : 7;
  const rangeEnd = addSalonDays(now, safeDays);

  const appointments = await prisma.appointment.findMany({
    where: {
      deletedAt: null,
      startAt: {
        gte: now,
        lt: rangeEnd,
      },
    },
    orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
    include: {
      service: {
        select: {
          name: true,
          parent: { select: { name: true } },
        },
      },
      master: { select: { name: true } },
    },
  });

  return {
    days: safeDays,
    generatedAt: now,
    rangeEnd,
    total: appointments.length,
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      customerName: appointment.customerName,
      phone: appointment.phone,
      email: appointment.email,
      serviceName: serviceNameOf(appointment.service),
      masterName: appointment.master?.name ?? "Не назначен",
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      status: appointment.status,
      bookingMethod: appointment.bookingMethod,
    })),
  };
}

export function formatUpcomingAppointmentsMarkdown(
  report: UpcomingAppointmentsReport,
  options: { limit?: number } = {},
): string {
  const limit = options.limit ?? 20;
  const visible = report.appointments.slice(0, limit);
  const hidden = Math.max(0, report.total - visible.length);

  if (report.total === 0) {
    return `📅 *Ближайшие термины на ${report.days} дней*\n\nЗаписей нет\\.`;
  }

  const lines: string[] = [
    `📅 *Ближайшие термины на ${report.days} дней*`,
    `Всего: *${report.total}*`,
    "",
  ];

  for (const [, appointments] of groupByDate(visible)) {
    lines.push(`*${escapeMarkdown(formatDateTitle(appointments[0].startAt))}*`);

    for (const appointment of appointments) {
      lines.push(`Способ записи: ${escapeMarkdown(getBookingMethodLabel(appointment.bookingMethod))}`);
      lines.push(
        `${STATUS_EMOJI[appointment.status]} ${escapeMarkdown(formatWallRangeLabel(appointment.startAt, appointment.endAt))} \\— *${escapeMarkdown(STATUS_LABELS[appointment.status])}*`,
      );
      lines.push(`Клиент: ${escapeMarkdown(appointment.customerName)}`);
      lines.push(`Услуга: ${escapeMarkdown(appointment.serviceName)}`);
      lines.push(`Мастер: ${escapeMarkdown(appointment.masterName)}`);
      lines.push(`Телефон: ${escapeMarkdown(appointment.phone || "-")}`);
      lines.push("");
    }
  }

  if (hidden > 0) {
    lines.push(`И еще ${hidden} записей\\. Полный список откройте через меню бота: /admin`);
  }

  return lines.join("\n").trimEnd();
}

export function formatUpcomingAppointmentsHtmlChunks(
  report: UpcomingAppointmentsReport,
  options: { maxChars?: number } = {},
): string[] {
  const maxChars = options.maxChars ?? 3500;

  if (report.total === 0) {
    return [
      [
        `📅 <b>Ближайшие термины на ${report.days} дней</b>`,
        "",
        "Записей нет.",
      ].join("\n"),
    ];
  }

  const header = [
    `📅 <b>Ближайшие термины на ${report.days} дней</b>`,
    `Всего: <b>${report.total}</b>`,
    "",
  ].join("\n");
  const chunks: string[] = [];
  let current = header;

  const pushBlock = (block: string) => {
    if (current.length + block.length + 1 > maxChars && current.trim() !== header.trim()) {
      chunks.push(current.trimEnd());
      current = header;
    }
    current += block;
  };

  for (const [, appointments] of groupByDate(report.appointments)) {
    pushBlock(`<b>${escapeHtml(formatDateTitle(appointments[0].startAt))}</b>\n`);

    for (const appointment of appointments) {
      pushBlock(`Способ записи: ${escapeHtml(getBookingMethodLabel(appointment.bookingMethod))}\n`);
      pushBlock(
        [
          `${STATUS_EMOJI[appointment.status]} <b>${escapeHtml(formatWallRangeLabel(appointment.startAt, appointment.endAt))}</b> - ${escapeHtml(STATUS_LABELS[appointment.status])}`,
          `Клиент: ${escapeHtml(appointment.customerName)}`,
          `Услуга: ${escapeHtml(appointment.serviceName)}`,
          `Мастер: ${escapeHtml(appointment.masterName)}`,
          `Телефон: <code>${escapeHtml(appointment.phone || "-")}</code>`,
          appointment.email ? `Email: ${escapeHtml(appointment.email)}` : null,
          "",
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }

  if (current.trim()) {
    chunks.push(current.trimEnd());
  }

  return chunks;
}

export async function buildUpcomingAppointmentsMarkdownReport(
  days: number,
  options: { limit?: number } = {},
): Promise<string> {
  const report = await getUpcomingAppointmentsReport({ days });
  return formatUpcomingAppointmentsMarkdown(report, options);
}
