import type { ReactNode } from "react";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Сайдбар */}
        <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="mb-3 text-xs uppercase tracking-wider text-slate-400">
            Admin
          </div>
          <AdminNav />
        </aside>

        {/* Контент */}
        <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 lg:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
