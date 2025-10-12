'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { initialActionState, changePassword, type ActionState } from './actions';
import { Lock, Loader2, KeyRound } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
      Обновить пароль
    </button>
  );
}

export default function PasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    changePassword,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1">
          <div className="text-sm opacity-70">Текущий пароль</div>
          <input
            name="current"
            type="password"
            className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="••••••••"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm opacity-70">Новый пароль</div>
          <input
            name="next"
            type="password"
            className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Минимум 8 символов"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm opacity-70">Повторите новый</div>
          <input
            name="confirm"
            type="password"
            className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="••••••••"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.message && (
          <span className={state.ok ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
            {state.message}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs opacity-70">
        <Lock className="h-3.5 w-3.5" />
        Пароль хранится в виде хеша.
      </div>
    </form>
  );
}
