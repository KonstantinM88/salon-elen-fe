// src/app/booking/confirmation/page.tsx
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmationContent(): React.JSX.Element {
  const params = useSearchParams();
  const appointmentId = params.get('id');

  if (!appointmentId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8">
          <div className="mb-4 text-4xl text-center">⚠️</div>
          <h1 className="text-xl font-semibold text-center mb-2">Ошибка</h1>
          <p className="text-center text-muted-foreground mb-6">
            ID записи не указан
          </p>
          <div className="text-center">
            <Link
              href="/booking"
              className="inline-block rounded-md border px-6 py-2 hover:bg-muted"
            >
              Создать новую запись
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-lg border bg-card p-8">
        {/* Иконка успеха */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Запись создана!</h1>
          <p className="text-muted-foreground">
            Ваша запись успешно создана. Мы свяжемся с вами для подтверждения.
          </p>
        </div>

        {/* Детали записи */}
        <div className="space-y-4 border-t pt-6">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Номер записи</h2>
            <p className="font-mono text-sm break-all">{appointmentId}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-1">Статус</h2>
            <p className="font-medium text-yellow-600">
              Ожидает подтверждения
            </p>
          </div>
        </div>

        {/* Действия */}
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block w-full rounded-md bg-primary px-6 py-3 text-center text-primary-foreground hover:bg-primary/90"
          >
            Вернуться на главную
          </Link>
          <Link
            href="/booking"
            className="block w-full rounded-md border px-6 py-3 text-center hover:bg-muted"
          >
            Создать новую запись
          </Link>
        </div>

        {/* Информация */}
        <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
          <p className="text-muted-foreground">
            <strong>Обратите внимание:</strong> Мы свяжемся с вами в ближайшее время для
            подтверждения записи. Если у вас возникнут вопросы, пожалуйста, позвоните нам или
            напишите на электронную почту.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border p-4 text-center">
          Загрузка...
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}