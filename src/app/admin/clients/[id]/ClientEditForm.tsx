"use client";

import { useActionState, useState } from "react";
import { updateClient, type UpdateClientState } from "./actions";

type Props = {
  initial: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    birthDate: Date;
    referral: string | null;
    notes: string | null;
  };
};

export default function ClientEditForm({ initial }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<UpdateClientState, FormData>(
    updateClient,
    { ok: false }
  );

  const toISO = (d: Date) => new Date(d).toISOString().slice(0, 10);

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Редактирование профиля</h2>
        <button type="button" className="btn" onClick={() => setOpen((v) => !v)}>
          {open ? "Скрыть" : "Редактировать"}
        </button>
      </div>

      {open && (
        <form action={formAction} className="grid sm:grid-cols-2 gap-3">
          <input type="hidden" name="id" defaultValue={initial.id} />

          <div>
            <label className="block text-sm mb-1">Имя</label>
            <input
              name="name"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              defaultValue={initial.name}
              required
            />
            {state.fieldErrors?.name && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Телефон</label>
            <input
              name="phone"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              defaultValue={initial.phone}
              required
            />
            {state.fieldErrors?.phone && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">E-mail</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              defaultValue={initial.email ?? ""}
              placeholder="you@example.com"
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Дата рождения</label>
            <input
              type="date"
              name="birthDate"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              defaultValue={toISO(initial.birthDate)}
              required
            />
            {state.fieldErrors?.birthDate && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.birthDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Как узнали</label>
            <input
              name="referral"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              defaultValue={initial.referral ?? ""}
              placeholder="Google / Instagram / ..." />
            {state.fieldErrors?.referral && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.referral}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Заметки</label>
            <textarea
              name="notes"
              className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[110px]"
              defaultValue={initial.notes ?? ""}
            />
            {state.fieldErrors?.notes && (
              <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.notes}</p>
            )}
          </div>

          {state.formError && (
            <div className="sm:col-span-2 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-200">
              {state.formError}
            </div>
          )}

          <div className="sm:col-span-2">
            <button className="btn" type="submit" disabled={pending}>
              {pending ? "Сохраняем…" : "Сохранить"}
            </button>
            {state.ok && (
              <span className="ml-3 text-sm text-emerald-400">Сохранено</span>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
