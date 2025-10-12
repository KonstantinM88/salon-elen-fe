// src/app/_components/auth/AuthButtons.tsx
"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";

/**
 * Если у вас есть собственные страницы /auth/signin и /auth/signup —
 * ссылки сработают. Если нет — кнопка “Войти” откроет встроенную
 * страницу NextAuth через signIn().
 */
export default function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => signIn()}
        className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 hover:bg-muted/40 transition"
        title="Войти"
      >
        <LogIn className="h-4 w-4" />
        Войти
      </button>

      <Link
        href="/auth/signup"
        className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 bg-primary text-primary-foreground hover:opacity-90 transition"
        title="Зарегистрироваться"
      >
        <UserPlus className="h-4 w-4" />
        Sign up
      </Link>
    </div>
  );
}
