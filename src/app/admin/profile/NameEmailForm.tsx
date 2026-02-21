'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { initialActionState, updateProfile, type ActionState } from './actions';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { SeoLocale } from '@/lib/seo-locale';

type Props = {
  defaultName: string;
  defaultEmail: string;
  locale?: SeoLocale;
  labels?: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    save: string;
  };
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
      {label}
    </button>
  );
}

const DEFAULT_LABELS = {
  nameLabel: 'Имя',
  namePlaceholder: 'Ваше имя',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  save: 'Сохранить',
};

export default function NameEmailForm({
  defaultName,
  defaultEmail,
  locale = 'de',
  labels = DEFAULT_LABELS,
}: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    updateProfile,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm opacity-70">{labels.nameLabel}</div>
          <input
            name="name"
            defaultValue={defaultName}
            className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder={labels.namePlaceholder}
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm opacity-70">{labels.emailLabel}</div>
          <input
            name="email"
            type="email"
            defaultValue={defaultEmail}
            className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder={labels.emailPlaceholder}
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={labels.save} />
        {state.message && (
          <span className={state.ok ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
