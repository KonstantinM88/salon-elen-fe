import Link from "next/link";
import type { ReactNode } from "react";

import {
  type ClientAppointmentAction,
  isClientAppointmentAction,
  verifyClientAppointmentActionToken,
} from "@/lib/booking/client-appointment-links";
import {
  getAppointmentRescheduleDateOptions,
  getAppointmentRescheduleSlots,
} from "@/lib/booking/reschedule-appointment";
import { formatWallRangeLabel, ORG_TZ } from "@/lib/orgTime";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@/lib/prisma-client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function statusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    PENDING: "В ожидании",
    CONFIRMED: "Подтверждена",
    DONE: "Выполнена",
    CANCELED: "Отменена",
  };
  return labels[status] ?? status;
}

function dateTitle(dateISO: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: ORG_TZ,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateISO}T12:00:00.000Z`));
}

function isManageable(status: AppointmentStatus, startAt: Date): boolean {
  return (status === "PENDING" || status === "CONFIRMED") && startAt > new Date();
}

function manageHref({
  appointmentId,
  action,
  token,
  dateISO,
}: {
  appointmentId: string;
  action: ClientAppointmentAction;
  token: string;
  dateISO?: string;
}): string {
  const params = new URLSearchParams({ action, token });
  if (dateISO) params.set("date", dateISO);
  return `/appointments/${encodeURIComponent(appointmentId)}/manage?${params.toString()}`;
}

function MessageBox({ tone, children }: { tone: "ok" | "error" | "info"; children: ReactNode }) {
  const styles = {
    ok: "border-emerald-300 bg-emerald-50 text-emerald-900",
    error: "border-red-300 bg-red-50 text-red-900",
    info: "border-sky-300 bg-sky-50 text-sky-900",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </div>
  );
}

export default async function AppointmentManagePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const rawAction = firstParam(query.action);
  const action = isClientAppointmentAction(rawAction) ? rawAction : null;
  const token = firstParam(query.token);
  const selectedDate = firstParam(query.date);
  const result = firstParam(query.result);
  const error = firstParam(query.error);

  if (!action || !verifyClientAppointmentActionToken({ appointmentId: id, action, token })) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-12">
        <MessageBox tone="error">
          Ссылка недействительна или устарела. Пожалуйста, свяжитесь с Salon Elen для изменения записи.
        </MessageBox>
      </main>
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      service: { select: { name: true, parent: { select: { name: true } } } },
      master: { select: { name: true } },
    },
  });

  if (!appointment || appointment.deletedAt) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-12">
        <MessageBox tone="error">Запись не найдена.</MessageBox>
      </main>
    );
  }

  const serviceName = appointment.service.parent?.name
    ? `${appointment.service.parent.name} / ${appointment.service.name}`
    : appointment.service.name;
  const canManage = isManageable(appointment.status, appointment.startAt);
  const dateOptions =
    action === "reschedule" && canManage
      ? await getAppointmentRescheduleDateOptions({ appointmentId: id, limit: 10 })
      : null;
  const slotOptions =
    action === "reschedule" && canManage && selectedDate
      ? await getAppointmentRescheduleSlots({ appointmentId: id, dateISO: selectedDate })
      : null;

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-3xl px-4 py-10">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase text-violet-600">Salon Elen</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            {action === "cancel" ? "Отмена записи" : "Перенос записи"}
          </h1>
        </div>

        {result === "canceled" ? (
          <div className="mb-5">
            <MessageBox tone="ok">Запись отменена. Мы отправили уведомление администратору.</MessageBox>
          </div>
        ) : null}
        {result === "rescheduled" ? (
          <div className="mb-5">
            <MessageBox tone="ok">Запись перенесена. Подтверждение отправлено администратору.</MessageBox>
          </div>
        ) : null}
        {error ? (
          <div className="mb-5">
            <MessageBox tone="error">Не удалось выполнить действие: {error}</MessageBox>
          </div>
        ) : null}

        <section className="mb-6 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-800 sm:grid-cols-2">
          <div>
            <span className="block text-slate-500">Клиент</span>
            <strong>{appointment.customerName}</strong>
          </div>
          <div>
            <span className="block text-slate-500">Статус</span>
            <strong>{statusLabel(appointment.status)}</strong>
          </div>
          <div>
            <span className="block text-slate-500">Услуга</span>
            <strong>{serviceName}</strong>
          </div>
          <div>
            <span className="block text-slate-500">Мастер</span>
            <strong>{appointment.master?.name ?? "-"}</strong>
          </div>
          <div className="sm:col-span-2">
            <span className="block text-slate-500">Текущее время</span>
            <strong>{formatWallRangeLabel(appointment.startAt, appointment.endAt)}</strong>
          </div>
        </section>

        {!canManage ? (
          <MessageBox tone="info">
            Эта запись уже не доступна для самостоятельной отмены или переноса. Пожалуйста, свяжитесь с нами напрямую.
          </MessageBox>
        ) : null}

        {canManage && action === "cancel" ? (
          <form
            method="POST"
            action={`/api/appointments/${encodeURIComponent(id)}/client/cancel`}
            className="space-y-4"
          >
            <input type="hidden" name="token" value={token ?? ""} />
            <MessageBox tone="info">
              После отмены администратор получит уведомление, а выбранное время снова станет доступным.
            </MessageBox>
            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
            >
              Отменить запись
            </button>
          </form>
        ) : null}

        {canManage && action === "reschedule" ? (
          <section className="space-y-5">
            {dateOptions?.ok ? (
              <div>
                <h2 className="mb-3 text-base font-semibold text-slate-950">Выберите свободную дату</h2>
                <div className="flex flex-wrap gap-2">
                  {dateOptions.dates.map((date) => (
                    <Link
                      key={date.dateISO}
                      href={manageHref({
                        appointmentId: id,
                        action,
                        token: token ?? "",
                        dateISO: date.dateISO,
                      })}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        selectedDate === date.dateISO
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-violet-300"
                      }`}
                    >
                      {dateTitle(date.dateISO)} · {date.slotsCount}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <MessageBox tone="error">Свободные даты сейчас не найдены.</MessageBox>
            )}

            {selectedDate && slotOptions?.ok ? (
              <div>
                <h2 className="mb-3 text-base font-semibold text-slate-950">Выберите время</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {slotOptions.slots.map((slot) => (
                    <form
                      key={slot.time}
                      method="POST"
                      action={`/api/appointments/${encodeURIComponent(id)}/client/reschedule`}
                    >
                      <input type="hidden" name="token" value={token ?? ""} />
                      <input type="hidden" name="date" value={selectedDate} />
                      <input type="hidden" name="time" value={slot.time} />
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-violet-400 hover:bg-violet-50"
                      >
                        {slot.displayTime}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
