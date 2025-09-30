"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/services", label: "Услуги" },
  { href: "/prices", label: "Цены" },
  { href: "/contacts", label: "Контакты" },
  { href: "/news", label: "Новости" },
  { href: "/about", label: "О нас" },
  { href: "/admin", label: "Админ панель" },
];

function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header
      className={cx(
        "sticky top-0 z-50 transition-colors border-b backdrop-blur",
        "bg-white/80 supports-[backdrop-filter]:bg-white/60 border-gray-200/70",
        "dark:bg-gray-900/80 supports-[backdrop-filter]:dark:bg-gray-900/60 dark:border-gray-800/60"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-3">
        {/* left: burger + brand */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <div className="h-5 w-6 space-y-1.5">
              <span className={cx("block h-0.5 w-6 bg-current transition", open && "translate-y-2 rotate-45")} />
              <span className={cx("block h-0.5 w-6 bg-current transition", open && "opacity-0")} />
              <span className={cx("block h-0.5 w-6 bg-current transition", open && "-translate-y-2 -rotate-45")} />
            </div>
          </button>
          <Link href="/" className="font-semibold tracking-tight">Salon Elen</Link>
        </div>

        {/* center: nav pill */}
        <nav className="hidden md:block">
          <ul className="mx-auto flex w-max items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 shadow-sm backdrop-blur dark:bg-white/5">
            {NAV.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cx(
                      "px-3 py-1.5 text-sm rounded-full transition",
                      "hover:bg-white/10 hover:text-white",
                      active ? "bg-white/15 text-white" : "text-gray-300"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* right: theme + booking in a pill */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-1 backdrop-blur">
            <ThemeToggle />
            <Link
              href="/booking"
              className="px-3 py-1.5 rounded-full text-sm bg-white/15 text-white hover:bg-white/20 transition"
            >
              Записаться
            </Link>
          </div>
        </div>
      </div>

      {/* mobile panel */}
      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <nav className="container py-3">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx(
                        "block px-4 py-2 rounded-full transition",
                        active ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-300"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2">
                <Link
                  href="/booking"
                  className="block text-center px-4 py-2 rounded-full bg-white/15 text-white hover:bg-white/20 transition"
                  onClick={() => setOpen(false)}
                >
                  Записаться
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
