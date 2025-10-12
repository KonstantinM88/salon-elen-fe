// src/app/_components/auth/UserMenu.tsx
"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function UserMenu({
  name,
  email,
}: {
  name: string | null;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const label = name || email || "Профиль";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 hover:bg-muted/40 transition"
        title="Аккаунт"
      >
        <User className="h-4 w-4" />
        <span className="max-w-[180px] truncate">{label}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border bg-background shadow-lg overflow-hidden"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 text-sm opacity-70 border-b">
            {email || name}
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/40 inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
