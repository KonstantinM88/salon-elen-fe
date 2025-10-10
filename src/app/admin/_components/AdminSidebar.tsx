"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** цвет акцента и иконки */
  tone?: "violet" | "sky" | "emerald" | "amber";
  /** циферка/метка справа (например, новые заявки) */
  badge?: number | string | null;
};

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function AdminSidebar({
  items,
  title = "ADMIN",
}: {
  items: Item[];
  title?: string;
}) {
  const pathname = usePathname();

  // сворачивание (запоминаем в localStorage)
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved) setCollapsed(saved === "1");
  }, []);
  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem("admin-sidebar-collapsed", v ? "0" : "1");
      return !v;
    });
  };

  return (
    <aside className={cn("sticky top-0 h-dvh p-2 md:p-3", collapsed ? "w-[76px]" : "w-64")}>
      <div className="relative rounded-2xl border bg-[linear-gradient(180deg,rgba(99,102,241,0.06),transparent_40%),linear-gradient(180deg,rgba(56,189,248,0.06),transparent_10%)]">
        {/* header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <span className={cn("text-[11px] uppercase tracking-wider opacity-60", collapsed && "sr-only")}>
            {title}
          </span>
          <button
            onClick={toggle}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl border hover:bg-muted/40 transition"
            aria-label={collapsed ? "Развернуть" : "Свернуть"}
            title={collapsed ? "Развернуть" : "Свернуть"}
          >
            {/* » / « */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              {collapsed ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
            </svg>
          </button>
        </div>

        {/* nav */}
        <nav className="px-2 pb-2">
          {items.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
            const tone =
              {
                violet: "text-violet-400",
                sky: "text-sky-400",
                emerald: "text-emerald-400",
                amber: "text-amber-400",
              }[it.tone ?? "violet"] || "text-violet-400";

            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "group relative my-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  active ? "bg-white/5 ring-1 ring-white/10" : "hover:bg-white/5"
                )}
                title={collapsed ? it.label : undefined}
              >
                {/* активный «рейл» слева */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-violet-400 to-sky-400 transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  )}
                />
                {/* иконка */}
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-lg", tone)}>
                  {it.icon}
                </span>
                {/* подпись */}
                <span className={cn("truncate", collapsed && "hidden")}>{it.label}</span>
                {/* бейдж справа */}
                {!!it.badge && !collapsed && (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-2 py-0.5 text-xs",
                      typeof it.badge === "number"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-300"
                    )}
                  >
                    {it.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
