// src/components/site-header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  CalendarCheck,
  Scissors,
  BadgeDollarSign,
  Phone,
  Newspaper,
  Info,
  LayoutDashboard,
  Sparkles,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

/* ───────── helpers ───────── */

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  tone?: string; // кастомный цвет иконки
};

const NAV: NavItem[] = [
  { href: '/', label: 'Главная', icon: Sparkles, tone: 'text-fuchsia-400' },
  { href: '/services', label: 'Услуги', icon: Scissors, tone: 'text-emerald-400' },
  { href: '/prices', label: 'Цены', icon: BadgeDollarSign, tone: 'text-amber-400' },
  { href: '/contacts', label: 'Контакты', icon: Phone, tone: 'text-sky-400' },
  { href: '/news', label: 'Новости', icon: Newspaper, tone: 'text-violet-400' },
  { href: '/about', label: 'О нас', icon: Info, tone: 'text-rose-400' },
  { href: '/admin', label: 'Админ', icon: LayoutDashboard, tone: 'text-teal-300' },
];

/** Красивая «живущая» градиентная кнопка бренда */
function BrandCTA({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        'relative inline-flex items-center justify-center rounded-full px-5 h-10',
        'text-white text-sm font-medium',
        'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
        'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
        'transition-[filter,transform] hover:brightness-110 active:scale-[0.98]',
        'ring-1 ring-white/10',
        'before:absolute before:inset-[-1px] before:rounded-full before:bg-gradient-to-r before:from-fuchsia-400/60 before:via-cyan-400/60 before:to-transparent before:opacity-0 hover:before:opacity-40 before:transition-opacity',
        // лёгкая «жизнь»
        'animate-[pulse_7s_ease-in-out_infinite]',
        className
      )}
    >
      <CalendarCheck className="mr-2 h-4 w-4" />
      {children}
    </Link>
  );
}

/** Переключатель темы */
function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = (resolvedTheme ?? theme) === 'dark';

  return (
    <button
      type="button"
      aria-label="Сменить тему"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cx(
        'inline-flex h-10 w-10 items-center justify-center rounded-full',
        'border border-white/10 bg-slate-900/60 text-slate-200',
        'hover:bg-slate-800/70 transition-colors',
        'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
      )}
      title="Сменить тему"
    >
      {!mounted ? (
        <div className="h-5 w-5" />
      ) : isDark ? (
        <Sun className="h-5 w-5 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.25)]" />
      ) : (
        <Moon className="h-5 w-5 text-sky-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)]" />
      )}
    </button>
  );
}

/* ───────── Header ───────── */

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cx(
        'sticky top-0 z-50',
        'backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 bg-slate-950/80',
        'border-b border-slate-800'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Лого */}
        <Link
          href="/"
          className={cx(
            'group inline-flex items-center gap-2 rounded-full px-3 py-1',
            'ring-1 ring-white/10 bg-slate-900/60',
            'hover:bg-slate-800/70 transition'
          )}
          aria-label="На главную"
        >
          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-sky-500 shadow-[0_0_12px_rgba(99,102,241,0.45)]">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-100">
            Salon&nbsp;Elen
          </span>
        </Link>

        {/* Десктоп-меню */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'group inline-flex items-center gap-2 rounded-full px-3 h-10',
                  'text-sm font-medium',
                  'transition-colors',
                  active
                    ? 'text-white bg-gradient-to-r from-fuchsia-600/25 via-violet-600/20 to-sky-600/20 ring-1 ring-fuchsia-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 ring-1 ring-white/10',
                  'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
                )}
              >
                <item.icon className={cx('h-4 w-4', item.tone)} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Кнопки справа */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            <BrandCTA href="/booking">Записаться</BrandCTA>
          </div>

          {/* Бургер для мобилы */}
          <button
            type="button"
            className={cx(
              'md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full',
              'border border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70 transition'
            )}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className={cx(
          'md:hidden overflow-hidden border-t border-slate-800',
          open ? 'max-h-[80vh]' : 'max-h-0',
          'transition-[max-height] duration-300 ease-out'
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  'flex items-center justify-between rounded-xl px-3 py-3',
                  'ring-1 ring-white/10 bg-slate-900/60',
                  'hover:bg-slate-800/70 transition-colors',
                  active && 'bg-gradient-to-r from-fuchsia-600/20 via-violet-600/15 to-sky-600/15'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cx(
                      'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60',
                      'ring-1 ring-white/10'
                    )}
                  >
                    <item.icon className={cx('h-5 w-5', item.tone)} />
                  </span>
                  <span className="text-sm font-medium text-slate-100">
                    {item.label}
                  </span>
                </div>
                <span
                  className={cx(
                    'h-2 w-2 rounded-full',
                    active ? 'bg-fuchsia-400' : 'bg-white/15'
                  )}
                />
              </Link>
            );
          })}

          {/* CTA в мобильном меню */}
          <div className="pt-1">
            <BrandCTA href="/booking" className="w-full justify-center">
              Записаться
            </BrandCTA>
          </div>
        </div>
      </div>
    </header>
  );
}



// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState } from "react";
// import ThemeToggle from "@/components/theme-toggle";

// const NAV = [
//   { href: "/", label: "Главная" },
//   { href: "/services", label: "Услуги" },
//   { href: "/prices", label: "Цены" },
//   { href: "/contacts", label: "Контакты" },
//   { href: "/news", label: "Новости" },
//   { href: "/about", label: "О нас" },
//   { href: "/admin", label: "Админ панель" },
// ];

// function cx(...cls: Array<string | false | null | undefined>) {
//   return cls.filter(Boolean).join(" ");
// }

// export default function SiteHeader() {
//   const [open, setOpen] = useState(false);
//   const pathname = usePathname();

//   return (
//     <header
//       className={cx(
//         "sticky top-0 z-50 transition-colors border-b backdrop-blur",
//         "bg-white/80 supports-[backdrop-filter]:bg-white/60 border-gray-200/70",
//         "dark:bg-gray-900/80 supports-[backdrop-filter]:dark:bg-gray-900/60 dark:border-gray-800/60"
//       )}
//     >
//       <div className="container flex h-16 items-center justify-between gap-3">
//         {/* left: burger + brand */}
//         <div className="flex items-center gap-3">
//           <button
//             className="md:hidden"
//             onClick={() => setOpen((v) => !v)}
//             aria-label="Toggle menu"
//           >
//             <div className="h-5 w-6 space-y-1.5">
//               <span className={cx("block h-0.5 w-6 bg-current transition", open && "translate-y-2 rotate-45")} />
//               <span className={cx("block h-0.5 w-6 bg-current transition", open && "opacity-0")} />
//               <span className={cx("block h-0.5 w-6 bg-current transition", open && "-translate-y-2 -rotate-45")} />
//             </div>
//           </button>
//           <Link href="/" className="font-semibold tracking-tight">Salon Elen</Link>
//         </div>

//         {/* center: nav pill */}
//         <nav className="hidden md:block">
//           <ul className="mx-auto flex w-max items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 shadow-sm backdrop-blur dark:bg-white/5">
//             {NAV.map((item) => {
//               const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
//               return (
//                 <li key={item.href}>
//                   <Link
//                     href={item.href}
//                     className={cx(
//                       "px-3 py-1.5 text-sm rounded-full transition",
//                       "hover:bg-white/10 hover:text-white",
//                       active ? "bg-white/15 text-white" : "text-gray-300"
//                     )}
//                   >
//                     {item.label}
//                   </Link>
//                 </li>
//               );
//             })}
//           </ul>
//         </nav>

//         {/* right: theme + booking in a pill */}
//         <div className="hidden md:flex items-center">
//           <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-1 backdrop-blur">
//             <ThemeToggle />
//             <Link
//               href="/booking"
//               className="px-3 py-1.5 rounded-full text-sm bg-white/15 text-white hover:bg-white/20 transition"
//             >
//               Записаться
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* mobile panel */}
//       {open && (
//         <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
//           <nav className="container py-3">
//             <ul className="flex flex-col gap-1">
//               {NAV.map((item) => {
//                 const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
//                 return (
//                   <li key={item.href}>
//                     <Link
//                       href={item.href}
//                       className={cx(
//                         "block px-4 py-2 rounded-full transition",
//                         active ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-300"
//                       )}
//                       onClick={() => setOpen(false)}
//                     >
//                       {item.label}
//                     </Link>
//                   </li>
//                 );
//               })}
//               <li className="mt-2">
//                 <Link
//                   href="/booking"
//                   className="block text-center px-4 py-2 rounded-full bg-white/15 text-white hover:bg-white/20 transition"
//                   onClick={() => setOpen(false)}
//                 >
//                   Записаться
//                 </Link>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       )}
//     </header>
//   );
// }
