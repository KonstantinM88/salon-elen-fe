// src/app/booking/success/page.tsx
import { JSX, Suspense } from 'react';
import SuccessClient from './SuccessClient';

export const dynamic = 'force-dynamic'; // чтобы страница не кешировалась на билде

export default function SuccessPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Успех</h2>

      <Suspense fallback={
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          Загружаем данные…
        </div>
      }>
        <SuccessClient />
      </Suspense>
    </div>
  );
}