// src/app/booking/layout.tsx
import type { ReactNode } from "react";

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container max-w-4xl py-6">
      <div className="rounded-2xl backdrop-blur-md bg-white/60 dark:bg-neutral-900/50 shadow-lg ring-1 ring-black/5 p-4">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Онлайн-запись</h1>
        {children}
      </div>
    </div>
  );
}
