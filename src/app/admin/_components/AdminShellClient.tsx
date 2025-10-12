"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronLeft } from "lucide-react";
import type { Role } from "@prisma/client";

import AdminNav from "@/components/admin/AdminNav";
import AdminFooter from "../_components/AdminFooter";

type AdminShellClientProps = {
  children: ReactNode;
  bookingsBadge: number;
  role: Role; // ← добавили
};

export default function AdminShellClient({
  children,
  bookingsBadge,
  role,
}: AdminShellClientProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Сайдбар */}
      <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        {/* Хедер сайдбара */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Admin
          </div>

          {/* Тогглер (мобилка) */}
          <div className="flex items-center gap-2 lg:hidden">
            {!open ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Открыть меню"
                title="Открыть меню"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
              >
                <Menu className="h-5 w-5 text-slate-200" />
                <span className="sr-only">Открыть меню</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Свернуть меню"
                title="Свернуть меню"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
              >
                <ChevronLeft className="h-5 w-5 text-slate-200" />
                <span className="sr-only">Свернуть меню</span>
              </button>
            )}
          </div>
        </div>

        {/* Навигация */}
        <div className="lg:block">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="overflow-hidden lg:hidden"
              >
                <AdminNav role={role} bookingsBadge={bookingsBadge} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Десктоп */}
          <div className="hidden lg:block">
            <AdminNav role={role} bookingsBadge={bookingsBadge} />
          </div>
        </div>
      </aside>

      {/* Контент */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 lg:p-6">
        {children}
        <AdminFooter />
      </section>
    </div>
  );
}

