"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/admin",          label: "Дашборд" },
  { href: "/admin/news",     label: "Новости" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/bookings", label: "Заявки" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-3">
      {NAV.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        const base =
          "block w-full rounded-2xl border px-4 py-2 text-sm transition";
        const activeCls =
          "border-slate-600 bg-slate-800 text-white shadow-sm";
        const idleCls =
          "border-slate-800/70 bg-slate-900/40 text-slate-200 hover:bg-slate-800/60";

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${base} ${active ? activeCls : idleCls}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
