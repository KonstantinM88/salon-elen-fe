// src/components/AuthButtons.tsx
'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import UserMenu from "@/app/_components/auth/UserMenu";
// import UserMenu from "./UserMenu";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  // Лоадер, чтобы не «скакал» layout
  if (status === "loading") {
    return <div className="h-10 w-[96px] rounded-full bg-white/10 animate-pulse" />;
  }

  if (session?.user) {
    // Показываем меню пользователя (клиентский компонент)
    return <UserMenu session={session} />;
  }

  // Не авторизован — показать Sign In / Sign Up
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium
                   ring-1 ring-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70
                   transition-colors shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="relative inline-flex h-10 items-center justify-center rounded-full px-4
                   text-sm font-medium text-white
                   bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                   ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,0.35)]
                   transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
      >
        Sign up
      </Link>
    </div>
  );
}
