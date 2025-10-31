'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { JSX } from 'react';

function formatDT(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d);
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
  }).format(d);
}

function formatTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    timeStyle: 'short',
  }).format(d);
}

export default function SuccessClient(): JSX.Element {
  const params = useSearchParams();

  const draftId = params.get('draft');
  const [appointment, setAppointment] = React.useState<{
    id: string;
    startAt: string;
    endAt: string;
    status: string;
    customerName: string;
    email: string;
    phone: string;
    service?: { name: string };
    master?: { name: string };
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!draftId) {
      setLoading(false);
      return;
    }

    async function loadAppointment() {
      try {
        const res = await fetch(`/api/appointments/${encodeURIComponent(draftId)}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Не удалось загрузить данные записи');
        }

        const data = await res.json();
        setAppointment(data);
      } catch (e) {
        console.error('Failed to load appointment:', e);
        setError('Не удалось загрузить данные записи');
      } finally {
        setLoading(false);
      }
    }

    void loadAppointment();
  }, [draftId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-4 text-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Success Icon and Message */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-8">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500 text-3xl text-white">
          ✓
        </div>
        <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
          Запись успешно создана!
        </h2>
        <p className="mt-2 text-center text-emerald-600 dark:text-emerald-400">
          Спасибо за запись. Мы ждём вас!
        </p>
      </div>

      {/* Appointment Details */}
      {appointment && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-lg">Детали записи</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Номер записи:</span>
              <span className="font-mono font-medium">{appointment.id.slice(0, 8)}</span>
            </div>

            {appointment.service && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Услуга:</span>
                <span className="font-medium">{appointment.service.name}</span>
              </div>
            )}

            {appointment.master && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Мастер:</span>
                <span className="font-medium">{appointment.master.name}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата:</span>
              <span className="font-medium">{formatDate(appointment.startAt)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Время:</span>
              <span className="font-medium">
                {formatTime(appointment.startAt)} - {formatTime(appointment.endAt)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус:</span>
              <span className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                {appointment.status === 'CONFIRMED' ? 'Подтверждено' : 'Ожидает подтверждения'}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted p-4 text-sm">
            <p className="text-muted-foreground">
              Подтверждение отправлено на <span className="font-medium text-foreground">{appointment.email}</span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="text-base font-semibold">Запись создана успешно!</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Проверьте вашу почту для получения деталей записи.
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          На главную
        </Link>
        <Link
          href="/booking/services"
          className="flex-1 rounded-xl border border-border px-5 py-3 text-center text-sm font-semibold transition hover:bg-muted"
        >
          Новая запись
        </Link>
      </div>
    </div>
  );
}
