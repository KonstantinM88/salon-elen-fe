// src/components/AuthButtons.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import UserMenu from '@/app/_components/auth/UserMenu';


function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export default function AuthButtons() {
  const { data: session, status } = useSession();

  // Лоадер состояния сессии
  if (status === 'loading') {
    return (
      <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse" aria-hidden />
    );
  }

  // Авторизован → показываем меню пользователя
  if (session?.user) {
    const name = session.user.name ?? null;
    const email = session.user.email ?? null;

    return (
      <div className="flex items-center gap-2">
        {/* если в UserMenu уже есть кнопка выхода — можно убрать этот Button */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cx(
            'inline-flex items-center justify-center rounded-full px-3 h-10',
            'text-sm font-medium text-slate-100',
            'border border-white/10 bg-slate-900/60 hover:bg-slate-800/70 transition-colors'
          )}
          title="Выйти"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </button>

        {/* Собственно меню (аватар/дропдаун). Пробрасываем name/email, как требует тип */}
        <UserMenu name={name} email={email} />
      </div>
    );
  }

  // Не авторизован → Sign In / Sign Up
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => signIn()}
        className={cx(
          'inline-flex items-center justify-center rounded-full px-3 h-10',
          'text-sm font-medium text-slate-100',
          'border border-white/10 bg-slate-900/60 hover:bg-slate-800/70 transition-colors'
        )}
        title="Войти"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Войти
      </button>

      <Link
        href="/auth/signup"
        className={cx(
          'inline-flex items-center justify-center rounded-full px-3 h-10',
          'text-sm font-medium text-white',
          'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
          'ring-1 ring-white/10 hover:brightness-110 transition'
        )}
        title="Регистрация"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Регистрация
      </Link>
    </div>
  );
}
