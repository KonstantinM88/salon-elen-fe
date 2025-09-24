"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

const items: Item[] = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/bookings", label: "Записи" },
  { href: "/admin/news", label: "Новости/Акции" },
  // { href: "/admin/media", label: "Медиа" }, // добавишь позже
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`rounded-xl px-3 py-2 text-sm transition
              ${active ? "bg-black text-white" : "hover:bg-neutral-100"}`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
