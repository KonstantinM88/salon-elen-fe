// src/app/admin/masters/new/page.tsx
import type { ReactElement } from 'react';
import { NewMasterFormClient } from './NewMasterFormClient';
import { createMaster } from '../actions';

export const metadata = { title: 'Новый сотрудник — Админка' } as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewMasterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ReactElement> {
  const sp = await searchParams;
  const rawErr = sp?.error;
  const err = Array.isArray(rawErr) ? rawErr[0] : rawErr;

  let errorText: string | null = null;
  if (err === 'validation')
    errorText = 'Проверьте корректность полей формы.';
  else if (err === 'unique') errorText = 'Email или телефон уже заняты.';
  else if (err === 'save')
    errorText = 'Не удалось сохранить сотрудника. Попробуйте ещё раз.';

  return (
    <main className="space-y-4 sm:space-y-6 max-w-3xl">
      <NewMasterFormClient errorText={errorText} action={createMaster} />
    </main>
  );
}
