"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, type CreateClientState } from "./actions";

export const dynamic = "force-dynamic";

const initial: CreateClientState = { ok: false };

export default function AdminClientNewPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createClient, initial);

  
  // редирект на карточку нового клиента
  useEffect(() => {
    if (state.ok && state.id) {
      router.replace(`/admin/clients/${state.id}`);
    }
  }, [state, router]);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Новый клиент</h1>
        <Link href="/admin/clients" className="btn">
          Отмена
        </Link>
      </div>

      {(state.formError) && (
        <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-200">
          {state.formError}
        </div>
      )}

      <form action={formAction} className="rounded-2xl border p-4 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Имя</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            name="name"
            required
            autoFocus
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Телефон</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            name="phone"
            placeholder="+49 ..."
            required
          />
          {state.fieldErrors?.phone && (
            <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Дата рождения</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            type="date"
            name="birthDate"
            required
          />
          {state.fieldErrors?.birthDate && (
            <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.birthDate}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Как узнали</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            name="referral"
            placeholder="Google / Instagram / Знакомые / ... (необязательно)"
          />
          {state.fieldErrors?.referral && (
            <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.referral}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Заметки</label>
          <textarea
            className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px]"
            name="notes"
            placeholder="Комментарий (необязательно)"
          />
          {state.fieldErrors?.notes && (
            <p className="mt-1 text-xs text-rose-400">{state.fieldErrors.notes}</p>
          )}
        </div>

        <div className="sm:col-span-2 flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            {isPending ? "Создаём…" : "Создать клиента"}
          </button>

          <Link href="/admin/clients" className="btn">
            Отмена
          </Link>
        </div>
      </form>
    </main>
  );
}
