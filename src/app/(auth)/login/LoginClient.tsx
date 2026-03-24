// src/app/(auth)/login/LoginClient.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

function getSafeCallbackUrl(callbackUrl: string | null): string {
  if (!callbackUrl) {
    return '/admin';
  }

  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }

  try {
    const parsed = new URL(callbackUrl);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || '/admin';
  } catch {
    return '/admin';
  }
}

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(sp.get('callbackUrl'));
  const presetEmail = sp.get('email') ?? '';
  const error = sp.get('error');

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (!result || result.error) {
        setLocalError('credentials');
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {(error || localError) && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Неверный email или пароль
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 outline-none focus:border-fuchsia-400/40"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-300">Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 outline-none focus:border-fuchsia-400/40"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 px-5 text-sm font-medium text-white ring-1 ring-white/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}
