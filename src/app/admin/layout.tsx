import Link from "next/link";

export const metadata = {
  title: "Admin · Salon Elen",
};

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-4 py-2 bg-slate-800/70 hover:bg-slate-700 transition-colors border border-slate-700"
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[220px,1fr] gap-6 py-8">
        <aside className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sticky top-6 h-fit">
          <h2 className="text-sm uppercase tracking-wide opacity-70 mb-3">Admin</h2>
          <nav className="flex flex-col gap-2">
            <AdminLink href="/admin" label="Дашборд" />
            <AdminLink href="/admin/news" label="Записи" />
          </nav>
        </aside>

        <section className="rounded-2xl bg-slate-900/40 border border-slate-800 p-4 sm:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
