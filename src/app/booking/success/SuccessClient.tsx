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
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export default function SuccessClient(): JSX.Element {
  const params = useSearchParams();

  const apptId = params.get('id');
  const paid = params.get('paid') === '1';
  const start = params.get('start');
  const end = params.get('end');

  const startLabel = formatDT(start);
  const endLabel = formatDT(end);

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-base font-semibold">
          Заявка успешно создана{paid ? ' и оплачена' : ''}.
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {apptId ? <>Номер заявки: <span className="font-medium text-foreground">{apptId}</span>.</> : null}
          {startLabel || endLabel ? (
            <div className="mt-1">
              {startLabel ? <>Начало: <span className="font-medium text-foreground">{startLabel}</span>. </> : null}
              {endLabel ? <>Окончание: <span className="font-medium text-foreground">{endLabel}</span>.</> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          На главную
        </Link>
        <Link
          href="/booking"
          className="rounded-xl border border-border px-5 py-2 text-sm font-semibold hover:bg-white/5"
        >
          Новая запись
        </Link>
      </div>
    </div>
  );
}
