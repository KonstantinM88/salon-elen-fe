// src/app/admin/masters/new/page.tsx
import type { ReactElement } from "react";
import Link from "next/link";
import { createMaster } from "../actions";

export const metadata = { title: "Новый сотрудник — Админка" } as const;

type SearchParams =
  Promise<Record<string, string | string[] | undefined>>;

export default async function NewMasterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ReactElement> {
  const sp = await searchParams;
  const rawErr = sp?.error;
  const err = Array.isArray(rawErr) ? rawErr[0] : rawErr;

  let errorText: string | null = null;
  if (err === "validation") errorText = "Проверьте корректность полей формы.";
  else if (err === "unique") errorText = "Email или телефон уже заняты.";
  else if (err === "save") errorText = "Не удалось сохранить сотрудника. Попробуйте ещё раз.";

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Новый сотрудник</h1>
        <Link href="/admin/masters" className="link">← Назад</Link>
      </div>

      {errorText && (
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {errorText}
        </div>
      )}

      <form action={createMaster} className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm">Имя</label>
          <input name="name" required minLength={2} maxLength={100} className="input" placeholder="Иван Иванов" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">E-mail</label>
          <input name="email" type="email" required className="input" placeholder="name@example.com" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Телефон</label>
          <input name="phone" required className="input" placeholder="+49 123 4567" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Дата рождения</label>
          <input name="birthDate" type="date" required className="input" />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Короткое описание</label>
          <textarea name="bio" rows={4} maxLength={500} className="textarea" placeholder="Опыт, специализация и т.п." />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Сохранить</button>
          <Link href="/admin/masters" className="btn">Отмена</Link>
        </div>
      </form>
    </main>
  );
}
