// src/components/site-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type ElementType,
} from "react";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import {
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
  ChevronDown,
} from "lucide-react";

import { useTranslations } from "@/i18n/useTranslations";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/locales";
import RainbowCTA from "@/components/RainbowCTA";

function cx(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

type NavKey =
  | "nav_home"
  | "nav_services"
  | "nav_prices"
  | "nav_contacts"
  | "nav_news"
  | "nav_about"
  | "nav_admin";

type NavItem = {
  href: string;
  labelKey: NavKey;
  icon: ElementType;
  tone?: string;
};

const NAV: NavItem[] = [
  { href: "/", labelKey: "nav_home", icon: Sparkles, tone: "text-fuchsia-400" },
  { href: "/services", labelKey: "nav_services", icon: Scissors, tone: "text-emerald-400" },
  { href: "/prices", labelKey: "nav_prices", icon: BadgeDollarSign, tone: "text-amber-400" },
  { href: "/contacts", labelKey: "nav_contacts", icon: Phone, tone: "text-sky-400" },
  { href: "/news", labelKey: "nav_news", icon: Newspaper, tone: "text-violet-400" },
  { href: "/about", labelKey: "nav_about", icon: Info, tone: "text-rose-400" },
  { href: "/admin", labelKey: "nav_admin", icon: LayoutDashboard, tone: "text-teal-300" },
];

const LOCALE_OPTIONS: { code: Locale; label: string; file: string }[] = [
  { code: "de", label: "DE", file: "/flags/de.svg" },
  { code: "en", label: "EN", file: "/flags/en.svg" },
  { code: "ru", label: "RU", file: "/flags/ru.svg" },
];

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-lg">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-sm font-semibold tracking-wide text-slate-100">
        Salon&nbsp;Elen
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <button
      type="button"
      aria-label="Сменить тему"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-10 w-10 rounded-full border border-white/10 bg-slate-900/60 flex items-center justify-center text-white"
    >
      {!mounted ? null : isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}

function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  const current =
    LOCALE_OPTIONS.find((opt) => opt.code === locale) ?? LOCALE_OPTIONS[0];

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-slate-900/80 px-2.5 py-1 text-xs text-white/80 hover:text-white hover:bg-slate-800 transition"
      >
        <span className="h-3.5 w-5 rounded-[2px] overflow-hidden border border-white/40 shadow-sm">
          <img
            src={current.file}
            alt={current.label}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="uppercase tracking-wide">{current.label}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <div
        className={cx(
          "absolute right-0 mt-1 w-28 rounded-xl border border-white/10 bg-slate-900/95 shadow-lg backdrop-blur z-40",
          "origin-top-right transform transition-all duration-150",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="py-1">
          {LOCALE_OPTIONS.map((opt) => {
            const isActive = opt.code === locale;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={cx(
                  "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="h-3.5 w-5 rounded-[2px] overflow-hidden border border-white/40 shadow-sm">
                  <img
                    src={opt.file}
                    alt={opt.label}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="uppercase tracking-wide">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const t = useTranslations();

  const isAuthed = status === "authenticated";
  const role = session?.user?.role;
  const email = session?.user?.email ?? "";
  const canSeeAdmin = role === "ADMIN" || role === "MASTER";

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="container mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Десктопное меню – только с lg (>=1024px) */}
        <nav className="hidden lg:flex items-center gap-2">
          {NAV.filter((n) => !(n.href === "/admin" && !canSeeAdmin)).map(
            (item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "flex items-center gap-2 px-3 h-10 rounded-full text-sm transition-colors",
                    active
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className={cx("h-4 w-4", item.tone)} />
                  {t(item.labelKey)}
                </Link>
              );
            }
          )}
        </nav>

        {/* Правая часть – только с lg */}
        <div className="hidden lg:flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />

          {isAuthed ? (
            <>
              <span className="hidden xl:block text-xs text-white/60 max-w-[200px] truncate">
                {email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 h-10 rounded-full border border-white/10 bg-slate-900/60 text-white text-sm hover:bg-slate-800/80"
              >
                {t("auth_logout")}
              </button>
              <RainbowCTA
                href="/booking"
                label={t("hero_cta_book")}
                className="h-10 px-5 text-sm"
                idle
              />
            </>
          ) : (
            <>
              <RainbowCTA
                href="/booking"
                label={t("hero_cta_book")}
                className="h-10 px-5 text-sm"
                idle
              />
              <button
                onClick={() => signIn()}
                className="px-3 h-10 rounded-full border border-white/10 bg-slate-900/60 text-white text-sm hover:bg-slate-800/80"
              >
                {t("auth_login")}
              </button>
            </>
          )}
        </div>

        {/* Кнопка мобильного меню – до lg */}
        <button
          className="lg:hidden h-10 w-10 rounded-full bg-slate-900/60 border border-white/20 flex items-center justify-center text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Открыть меню"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Мобильное меню – до lg */}
      <div
        className={cx(
          "lg:hidden w-full overflow-hidden border-t border-slate-800 transition-[max-height] duration-300",
          open ? "max-h-[80vh]" : "max-h-0"
        )}
      >
        <div className="container mx-auto max-w-full px-4 py-3 space-y-2 relative">
          {NAV.filter((n) => !(n.href === "/admin" && !canSeeAdmin)).map(
            (item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cx(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-sm",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-200 hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className={cx("h-4 w-4", item.tone)} />
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            }
          )}

          <div className="flex items-center justify-between gap-3 mt-3">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <div className="flex flex-col gap-2 mt-3 pb-2">
            {isAuthed ? (
              <>
                <div className="text-xs text-slate-300 truncate">{email}</div>
                <RainbowCTA
                  href="/booking"
                  label={t("hero_cta_book")}
                  className="h-10 w-full text-sm justify-center"
                  idle
                />
                <button
                  onClick={() => {
                    setOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80 text-sm"
                >
                  {t("auth_logout")}
                </button>
              </>
            ) : (
              <>
                <RainbowCTA
                  href="/booking"
                  label={t("hero_cta_book")}
                  className="h-10 w-full text-sm justify-center"
                  idle
                />
                <button
                  onClick={() => {
                    setOpen(false);
                    void signIn();
                  }}
                  className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80 text-sm"
                >
                  {t("auth_login")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}




//-------работал
// // src/components/site-header.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   useEffect,
//   useState,
//   type ElementType,
//   type ReactNode,
// } from "react";
// import { useTheme } from "next-themes";
// import { useSession, signIn, signOut } from "next-auth/react";
// import {
//   CalendarCheck,
//   Scissors,
//   BadgeDollarSign,
//   Phone,
//   Newspaper,
//   Info,
//   LayoutDashboard,
//   Sparkles,
//   Menu,
//   X,
//   Sun,
//   Moon,
//   ChevronDown,
// } from "lucide-react";

// import { useTranslations } from "@/i18n/useTranslations";
// import { useI18n } from "@/i18n/I18nProvider";
// import type { Locale } from "@/i18n/locales";
// import RainbowCTA from "@/components/RainbowCTA";

// function cx(...xs: Array<string | false | null | undefined>): string {
//   return xs.filter(Boolean).join(" ");
// }

// type NavKey =
//   | "nav_home"
//   | "nav_services"
//   | "nav_prices"
//   | "nav_contacts"
//   | "nav_news"
//   | "nav_about"
//   | "nav_admin";

// type NavItem = {
//   href: string;
//   labelKey: NavKey;
//   icon: ElementType;
//   tone?: string;
// };

// const NAV: NavItem[] = [
//   { href: "/", labelKey: "nav_home", icon: Sparkles, tone: "text-fuchsia-400" },
//   { href: "/services", labelKey: "nav_services", icon: Scissors, tone: "text-emerald-400" },
//   { href: "/prices", labelKey: "nav_prices", icon: BadgeDollarSign, tone: "text-amber-400" },
//   { href: "/contacts", labelKey: "nav_contacts", icon: Phone, tone: "text-sky-400" },
//   { href: "/news", labelKey: "nav_news", icon: Newspaper, tone: "text-violet-400" },
//   { href: "/about", labelKey: "nav_about", icon: Info, tone: "text-rose-400" },
//   { href: "/admin", labelKey: "nav_admin", icon: LayoutDashboard, tone: "text-teal-300" },
// ];

// const LOCALE_OPTIONS: { code: Locale; label: string; file: string }[] = [
//   { code: "de", label: "DE", file: "/flags/de.svg" },
//   { code: "en", label: "EN", file: "/flags/en.svg" },
//   { code: "ru", label: "RU", file: "/flags/ru.svg" },
// ];

// function Logo() {
//   return (
//     <Link href="/" className="group flex items-center gap-3">
//       <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-lg">
//         <Sparkles className="h-4 w-4 text-white" />
//       </span>
//       <span className="text-sm font-semibold tracking-wide text-slate-100">
//         Salon&nbsp;Elen
//       </span>
//     </Link>
//   );
// }

// function ThemeToggle() {
//   const { theme, setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   const isDark = (resolvedTheme ?? theme) === "dark";

//   return (
//     <button
//       type="button"
//       aria-label="Сменить тему"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="h-10 w-10 rounded-full border border-white/10 bg-slate-900/60 flex items-center justify-center text-white"
//     >
//       {!mounted ? null : isDark ? (
//         <Sun className="h-5 w-5" />
//       ) : (
//         <Moon className="h-5 w-5" />
//       )}
//     </button>
//   );
// }

// function LocaleSwitcher() {
//   const { locale, setLocale } = useI18n();
//   const [open, setOpen] = useState(false);

//   const current =
//     LOCALE_OPTIONS.find((opt) => opt.code === locale) ?? LOCALE_OPTIONS[0];

//   const handleSelect = (code: Locale) => {
//     setLocale(code);
//     setOpen(false);
//   };

//   return (
//     <div className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-slate-900/80 px-2.5 py-1 text-xs text-white/80 hover:text-white hover:bg-slate-800 transition"
//       >
//         <span className="h-3.5 w-5 rounded-[2px] overflow-hidden border border-white/40 shadow-sm">
//           <img
//             src={current.file}
//             alt={current.label}
//             className="h-full w-full object-cover"
//           />
//         </span>
//         <span className="uppercase tracking-wide">{current.label}</span>
//         <ChevronDown className="h-3 w-3" />
//       </button>

//       <div
//         className={cx(
//           "absolute right-0 mt-1 w-28 rounded-xl border border-white/10 bg-slate-900/95 shadow-lg backdrop-blur",
//           "origin-top-right transform transition-all duration-150",
//           open
//             ? "opacity-100 scale-100 pointer-events-auto"
//             : "opacity-0 scale-95 pointer-events-none"
//         )}
//       >
//         <div className="py-1">
//           {LOCALE_OPTIONS.map((opt) => {
//             const isActive = opt.code === locale;
//             return (
//               <button
//                 key={opt.code}
//                 type="button"
//                 onClick={() => handleSelect(opt.code)}
//                 className={cx(
//                   "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs",
//                   isActive
//                     ? "bg-white/10 text-white"
//                     : "text-white/75 hover:bg-white/5 hover:text-white"
//                 )}
//               >
//                 <span className="h-3.5 w-5 rounded-[2px] overflow-hidden border border-white/40 shadow-sm">
//                   <img
//                     src={opt.file}
//                     alt={opt.label}
//                     className="h-full w-full object-cover"
//                   />
//                 </span>
//                 <span className="uppercase tracking-wide">{opt.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function SiteHeader() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);
//   const { data: session, status } = useSession();
//   const t = useTranslations();

//   const isAuthed = status === "authenticated";
//   const role = session?.user?.role;
//   const email = session?.user?.email ?? "";
//   const canSeeAdmin = role === "ADMIN" || role === "MASTER";

//   useEffect(() => setOpen(false), [pathname]);

//   return (
//     <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4">
//         <Logo />

//         {/* Desktop menu */}
//         <nav className="hidden md:flex items-center gap-2">
//           {NAV.filter((n) => !(n.href === "/admin" && !canSeeAdmin)).map(
//             (item) => {
//               const active =
//                 item.href === "/"
//                   ? pathname === "/"
//                   : pathname.startsWith(item.href);

//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={cx(
//                     "flex items-center gap-2 px-3 h-10 rounded-full text-sm transition-colors",
//                     active
//                       ? "text-white bg-white/10"
//                       : "text-white/70 hover:text-white hover:bg-white/10"
//                   )}
//                 >
//                   <item.icon className={cx("h-4 w-4", item.tone)} />
//                   {t(item.labelKey)}
//                 </Link>
//               );
//             }
//           )}
//         </nav>

//         {/* Desktop right side */}
//         <div className="hidden md:flex items-center gap-2">
//           <LocaleSwitcher />
//           <ThemeToggle />

//           {isAuthed ? (
//             <>
//               <span className="text-xs text-white/60 max-w-[200px] truncate">
//                 {email}
//               </span>
//               <button
//                 onClick={() => signOut({ callbackUrl: "/" })}
//                 className="px-3 h-10 rounded-full border border-white/10 bg-slate-900/60 text-white text-sm hover:bg-slate-800/80"
//               >
//                 Выйти
//               </button>
//               <RainbowCTA
//                 href="/booking"
//                 label={t("hero_cta_book")}
//                 className="h-10 px-5 text-sm"
//                 idle
//               />
//             </>
//           ) : (
//             <>
//               <RainbowCTA
//                 href="/booking"
//                 label={t("hero_cta_book")}
//                 className="h-10 px-5 text-sm"
//                 idle
//               />
//               <button
//                 onClick={() => signIn()}
//                 className="px-3 h-10 rounded-full border border-white/10 bg-slate-900/60 text-white text-sm hover:bg-slate-800/80"
//               >
//                 Войти
//               </button>
//             </>
//           )}
//         </div>

//         {/* Mobile menu button */}
//         <button
//           className="md:hidden h-10 w-10 rounded-full bg-slate-900/60 border border-white/20 flex items-center justify-center text-white"
//           onClick={() => setOpen((v) => !v)}
//           aria-label="Открыть меню"
//         >
//           {open ? <X /> : <Menu />}
//         </button>
//       </div>

//       {/* Mobile dropdown */}
//       <div
//         className={cx(
//           "md:hidden overflow-hidden border-t border-slate-800 transition-[max-height] duration-300",
//           open ? "max-h-[80vh]" : "max-h-0"
//         )}
//       >
//         <div className="container px-4 py-3 space-y-2">
//           {NAV.filter((n) => !(n.href === "/admin" && !canSeeAdmin)).map(
//             (item) => {
//               const active =
//                 item.href === "/"
//                   ? pathname === "/"
//                   : pathname.startsWith(item.href);
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   onClick={() => setOpen(false)}
//                   className={cx(
//                     "flex items-center justify-between px-3 py-2 rounded-xl text-sm",
//                     active
//                       ? "bg-white/10 text-white"
//                       : "text-slate-200 hover:bg-white/5"
//                   )}
//                 >
//                   <span className="flex items-center gap-2">
//                     <item.icon className={cx("h-4 w-4", item.tone)} />
//                     {t(item.labelKey)}
//                   </span>
//                 </Link>
//               );
//             }
//           )}

//           <div className="flex items-center justify-between gap-3 mt-3">
//             <LocaleSwitcher />
//             <ThemeToggle />
//           </div>

//           <div className="flex flex-col gap-2 mt-3">
//             {isAuthed ? (
//               <>
//                 <div className="text-xs text-slate-300 truncate">{email}</div>
//                 <RainbowCTA
//                   href="/booking"
//                   label={t("hero_cta_book")}
//                   className="h-10 w-full text-sm justify-center"
//                   idle
//                 />
//                 <button
//                   onClick={() => {
//                     setOpen(false);
//                     void signOut({ callbackUrl: "/" });
//                   }}
//                   className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80 text-sm"
//                 >
//                   Выйти
//                 </button>
//               </>
//             ) : (
//               <>
//                 <RainbowCTA
//                   href="/booking"
//                   label={t("hero_cta_book")}
//                   className="h-10 w-full text-sm justify-center"
//                   idle
//                 />
//                 <button
//                   onClick={() => {
//                     setOpen(false);
//                     void signIn();
//                   }}
//                   className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80 text-sm"
//                 >
//                   Войти
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }





// // src/components/site-header.tsx
// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   useEffect,
//   useState,
//   type ElementType,
//   type ReactNode,
//   type CSSProperties,
// } from 'react';
// import { useTheme } from 'next-themes';
// import { useSession, signIn, signOut } from 'next-auth/react';
// import {
//   CalendarCheck,
//   Scissors,
//   BadgeDollarSign,
//   Phone,
//   Newspaper,
//   Info,
//   LayoutDashboard,
//   Sparkles,
//   Menu,
//   X,
//   Sun,
//   Moon,
// } from 'lucide-react';

// import { useTranslations } from '@/i18n/useTranslations';
// import { useI18n } from '@/i18n/I18nProvider';
// import type { Locale } from '@/i18n/locales';

// function cx(...xs: Array<string | false | null | undefined>): string {
//   return xs.filter(Boolean).join(' ');
// }

// type NavKey =
//   | 'nav_home'
//   | 'nav_services'
//   | 'nav_prices'
//   | 'nav_contacts'
//   | 'nav_news'
//   | 'nav_about'
//   | 'nav_admin';

// type NavItem = {
//   href: string;
//   labelKey: NavKey;
//   icon: ElementType;
//   tone?: string;
// };

// const NAV: NavItem[] = [
//   { href: '/', labelKey: 'nav_home', icon: Sparkles, tone: 'text-fuchsia-400' },
//   { href: '/services', labelKey: 'nav_services', icon: Scissors, tone: 'text-emerald-400' },
//   { href: '/prices', labelKey: 'nav_prices', icon: BadgeDollarSign, tone: 'text-amber-400' },
//   { href: '/contacts', labelKey: 'nav_contacts', icon: Phone, tone: 'text-sky-400' },
//   { href: '/news', labelKey: 'nav_news', icon: Newspaper, tone: 'text-violet-400' },
//   { href: '/about', labelKey: 'nav_about', icon: Info, tone: 'text-rose-400' },
//   { href: '/admin', labelKey: 'nav_admin', icon: LayoutDashboard, tone: 'text-teal-300' },
// ];

// type LocaleOption = {
//   code: Locale;
//   label: string;
// };

// // Статичные мини-флажки через градиенты 🎌 (DE, EN/UK, RU)
// const FLAG_STYLES: Record<Locale, CSSProperties> = {
//   de: {
//     backgroundImage:
//       'linear-gradient(to bottom, #000 0 33%, #dd0000 33% 66%, #ffce00 66% 100%)',
//   },

//   en: {
//     backgroundImage: `
//       /* белые диагональные полосы */
//       linear-gradient(135deg, transparent 45%, #fff 45% 55%, transparent 55%),
//       linear-gradient(45deg, transparent 45%, #fff 45% 55%, transparent 55%),

//       /* красный крест */
//       linear-gradient(#c8102e 0 0),
//       linear-gradient(#c8102e 0 0),

//       /* фон синий */
//       linear-gradient(#012169 0 0)
//     `,
//     backgroundSize: `
//       100% 100%,
//       100% 100%,
//       100% 20%,
//       20% 100%,
//       100% 100%
//     `,
//     backgroundPosition: `
//       center,
//       center,
//       center,
//       center,
//       center
//     `,
//     backgroundRepeat: 'no-repeat',
//   },

//   ru: {
//     backgroundImage:
//       'linear-gradient(to bottom, #fff 0 33%, #0039a6 33% 66%, #d52b1e 66% 100%)',
//   },
// };

// const LOCALE_OPTIONS: LocaleOption[] = [
//   { code: 'de', label: 'DE' },
//   { code: 'en', label: 'EN' },
//   { code: 'ru', label: 'RU' },
// ];

// function Logo() {
//   return (
//     <Link href="/" className="group flex items-center gap-3">
//       <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-[0_0_12px_rgba(99,102,241,0.45)]">
//         <Sparkles className="h-4 w-4 text-white" />
//       </span>
//       <span className="text-sm font-semibold tracking-wide text-slate-100">
//         Salon&nbsp;Elen
//       </span>
//     </Link>
//   );
// }

// function BrandCTA(props: { href: string; children: ReactNode; className?: string }) {
//   const { href, children, className } = props;
//   return (
//     <Link
//       href={href}
//       className={cx(
//         'relative inline-flex items-center justify-center rounded-full px-5 h-10',
//         'text-white text-sm font-medium',
//         'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
//         'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
//         'transition-[filter,transform] hover:brightness-110 active:scale-[0.98]',
//         'ring-1 ring-white/10',
//         className,
//       )}
//     >
//       <CalendarCheck className="mr-2 h-4 w-4" />
//       {children}
//     </Link>
//   );
// }

// function ThemeToggle() {
//   const { theme, setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   const isDark = (resolvedTheme ?? theme) === 'dark';

//   return (
//     <button
//       type="button"
//       aria-label="Сменить тему"
//       onClick={() => setTheme(isDark ? 'light' : 'dark')}
//       className={cx(
//         'inline-flex h-10 w-10 items-center justify-center rounded-full',
//         'border border-white/10 bg-slate-900/60 text-slate-200',
//         'hover:bg-slate-800/70 transition-colors',
//       )}
//     >
//       {!mounted ? <div className="h-5 w-5" /> : isDark ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-sky-500" />}
//     </button>
//   );
// }

// function LocaleSwitcher() {
//   const { locale, setLocale } = useI18n();

//   return (
//     <div
//       className="
//         inline-flex items-center gap-1 rounded-full
//         border border-white/12 bg-slate-950/70
//         px-1 py-0.5 text-[11px] shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
//       "
//     >
//       {LOCALE_OPTIONS.map((option) => {
//         const isActive = option.code === locale;
//         const flagStyle = FLAG_STYLES[option.code];

//         return (
//           <button
//             key={option.code}
//             type="button"
//             onClick={() => setLocale(option.code)}
//             className={cx(
//               'inline-flex items-center gap-2 rounded-full px-2 py-0.5',
//               'uppercase tracking-wide transition-all border border-transparent',
//               isActive
//                 ? 'bg-white text-slate-900 shadow-sm'
//                 : 'text-slate-200/75 hover:text-white hover:bg-white/5 hover:border-white/15',
//             )}
//           >
//             <span
//               className="h-3.5 w-5 rounded-[2px] border border-white/50 shadow-sm"
//               style={flagStyle}
//             />
//             {option.label}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// export default function SiteHeader() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);
//   const { data: session, status } = useSession();
//   const t = useTranslations();

//   const role = session?.user?.role;
//   const email = session?.user?.email ?? '';
//   const isAuthed = status === 'authenticated';
//   const canSeeAdmin = role === 'ADMIN' || role === 'MASTER';

//   useEffect(() => setOpen(false), [pathname]);

//   return (
//     <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/80 border-b border-slate-800">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         <Logo />

//         {/* Desktop menu */}
//         <nav className="hidden md:flex items-center gap-1">
//           {NAV.filter((i) => !(i.href === '/admin' && !canSeeAdmin)).map((item) => {
//             const active =
//               item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cx(
//                   'group inline-flex items-center gap-2 rounded-full px-3 h-10 text-sm transition',
//                   active
//                     ? 'text-white bg-fuchsia-500/20 ring-1 ring-fuchsia-400/30'
//                     : 'text-slate-300 hover:text-white hover:bg-white/5',
//                 )}
//               >
//                 <item.icon className={cx('h-4 w-4', item.tone)} />
//                 {t(item.labelKey)}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="hidden md:flex items-center gap-2">
//           <LocaleSwitcher />
//           <ThemeToggle />

//           {status === 'loading' ? (
//             <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse" />
//           ) : isAuthed ? (
//             <>
//               <span className="hidden lg:block text-xs text-slate-300">{email}</span>
//               <button
//                 onClick={() => signOut({ callbackUrl: '/' })}
//                 className="px-3 h-10 rounded-full border border-white/10 bg-slate-900/60 text-slate-100 hover:bg-slate-800/70 text-sm"
//               >
//                 Выйти
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 onClick={() => signIn()}
//                 className="px-3 h-10 rounded-xl border border-white/10 bg-slate-900/60 text-slate-100 hover:bg-slate-800/70 text-sm"
//               >
//                 Войти
//               </button>
//               <BrandCTA href="/booking">{t('hero_cta_book')}</BrandCTA>
//             </>
//           )}
//         </div>

//         {/* Mobile menu button */}
//         <button
//           type="button"
//           className="md:hidden h-10 w-10 flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 text-white"
//           onClick={() => setOpen(!open)}
//         >
//           {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//         </button>
//       </div>

//       {/* Mobile dropdown */}
//       <div
//         className={cx(
//           'md:hidden overflow-hidden border-t border-slate-800 transition-[max-height] duration-300',
//           open ? 'max-h-[80vh]' : 'max-h-0',
//         )}
//       >
//         <div className="container px-4 py-3 space-y-2">
//           {NAV.filter((i) => !(i.href === '/admin' && !canSeeAdmin)).map((item) => {
//             const active =
//               item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setOpen(false)}
//                 className={cx(
//                   'flex items-center justify-between px-3 py-2 rounded-xl text-sm',
//                   active ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5',
//                 )}
//               >
//                 <span className="flex items-center gap-2">
//                   <item.icon className={cx('h-4 w-4', item.tone)} />
//                   {t(item.labelKey)}
//                 </span>
//               </Link>
//             );
//           })}

//           <div className="flex items-center justify-between mt-3">
//             <LocaleSwitcher />
//             <ThemeToggle />
//           </div>

//           <div className="flex flex-col gap-2 mt-3">
//             {isAuthed ? (
//               <>
//                 <div className="text-xs text-slate-300">{email}</div>
//                 <button
//                   onClick={() => {
//                     setOpen(false);
//                     void signOut({ callbackUrl: '/' });
//                   }}
//                   className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60 text-slate-100"
//                 >
//                   Выйти
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => {
//                     setOpen(false);
//                     void signIn();
//                   }}
//                   className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/60 text-slate-100"
//                 >
//                   Войти
//                 </button>
//                 <BrandCTA href="/booking" className="w-full justify-center">
//                   {t('hero_cta_book')}
//                 </BrandCTA>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }





//------добавляем языковую метку в шапку сайта------
// // src/components/site-header.tsx
// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useTheme } from 'next-themes';
// import { useSession, signIn, signOut } from 'next-auth/react';
// import {
//   CalendarCheck, Scissors, BadgeDollarSign, Phone, Newspaper, Info,
//   LayoutDashboard, Sparkles, Menu, X, Sun, Moon,
// } from 'lucide-react';

// function cx(...xs: Array<string | false | null | undefined>) {
//   return xs.filter(Boolean).join(' ');
// }

// type NavItem = { href: string; label: string; icon: React.ElementType; tone?: string };

// const NAV: NavItem[] = [
//   { href: '/',         label: 'Главная',  icon: Sparkles,        tone: 'text-fuchsia-400' },
//   { href: '/services', label: 'Услуги',   icon: Scissors,        tone: 'text-emerald-400' },
//   { href: '/prices',   label: 'Цены',     icon: BadgeDollarSign, tone: 'text-amber-400' },
//   { href: '/contacts', label: 'Контакты', icon: Phone,           tone: 'text-sky-400' },
//   { href: '/news',     label: 'Новости',  icon: Newspaper,       tone: 'text-violet-400' },
//   { href: '/about',    label: 'О нас',    icon: Info,            tone: 'text-rose-400' },
//   { href: '/admin',    label: 'Админ',    icon: LayoutDashboard, tone: 'text-teal-300' },
// ];

// function BrandCTA(props: { href: string; children: React.ReactNode; className?: string }) {
//   const { href, children, className } = props;
//   return (
//     <Link
//       href={href}
//       className={cx(
//         'relative inline-flex items-center justify-center rounded-full px-5 h-10',
//         'text-white text-sm font-medium',
//         'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
//         'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
//         'transition-[filter,transform] hover:brightness-110 active:scale-[0.98]',
//         'ring-1 ring-white/10',
//         'before:absolute before:inset-[-1px] before:rounded-full before:bg-gradient-to-r before:from-fuchsia-400/60 before:via-cyan-400/60 before:to-transparent before:opacity-0 hover:before:opacity-40 before:transition-opacity',
//         'animate-[pulse_7s_ease-in-out_infinite]',
//         className
//       )}
//     >
//       <CalendarCheck className="mr-2 h-4 w-4" />
//       {children}
//     </Link>
//   );
// }

// function ThemeToggle() {
//   const { theme, setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   const isDark = (resolvedTheme ?? theme) === 'dark';
//   return (
//     <button
//       type="button"
//       aria-label="Сменить тему"
//       onClick={() => setTheme(isDark ? 'light' : 'dark')}
//       className={cx(
//         'inline-flex h-10 w-10 items-center justify-center rounded-full',
//         'border border-white/10 bg-slate-900/60 text-slate-200',
//         'hover:bg-slate-800/70 transition-colors',
//         'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
//       )}
//       title="Сменить тему"
//     >
//       {!mounted ? <div className="h-5 w-5" /> :
//         (isDark
//           ? <Sun className="h-5 w-5 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.25)]" />
//           : <Moon className="h-5 w-5 text-sky-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)]" />)}
//     </button>
//   );
// }

// export default function SiteHeader() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);
//   const { data: session, status } = useSession();

//   const role = session?.user?.role; // 'ADMIN' | 'MASTER' | 'USER' | undefined
//   const email = session?.user?.email ?? '';
//   const isAuthed = status === 'authenticated' && !!session?.user;
//   const canSeeAdmin = role === 'ADMIN' || role === 'MASTER';

//   useEffect(() => setOpen(false), [pathname]);

//   return (
//     <header
//       className={cx(
//         'sticky top-0 z-50',
//         'backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 bg-slate-950/80',
//         'border-b border-slate-800'
//       )}
//     >
//       <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         {/* Лого */}
//         <Link
//           href="/"
//           className={cx(
//             'group inline-flex items-center gap-2 rounded-full px-3 py-1',
//             'ring-1 ring-white/10 bg-slate-900/60',
//             'hover:bg-slate-800/70 transition'
//           )}
//           aria-label="На главную"
//         >
//           <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-sky-500 shadow-[0_0_12px_rgba(99,102,241,0.45)]">
//             <Sparkles className="h-3.5 w-3.5 text-white" />
//           </span>
//           <span className="text-sm font-semibold tracking-wide text-slate-100">
//             Salon&nbsp;Elen
//           </span>
//         </Link>

//         {/* Десктоп-меню */}
//         <nav className="hidden md:flex items-center gap-1">
//           {NAV.filter(i => !(i.href === '/admin' && !canSeeAdmin)).map((item) => {
//             const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 aria-current={active ? 'page' : undefined}
//                 className={cx(
//                   'group inline-flex items-center gap-2 rounded-full px-3 h-10',
//                   'text-sm font-medium',
//                   active
//                     ? 'text-white bg-gradient-to-r from-fuchsia-600/25 via-violet-600/20 to-sky-600/20 ring-1 ring-fuchsia-400/30'
//                     : 'text-slate-300 hover:text-white hover:bg-white/5 ring-1 ring-white/10',
//                   'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
//                 )}
//               >
//                 <item.icon className={cx('h-4 w-4', item.tone)} />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Кнопки справа (desktop) */}
//         <div className="hidden md:flex items-center gap-2">
//           <ThemeToggle />
//           <BrandCTA href="/booking">Записаться</BrandCTA>

//           {status === 'loading' ? (
//             <div className="h-10 w-24 rounded-full bg-white/10 animate-pulse" />
//           ) : isAuthed ? (
//             <>
//               <span className="mx-1 hidden lg:block text-xs text-slate-300">{email}</span>
//               <button
//                 onClick={() => signOut({ callbackUrl: '/' })}
//                 className={cx(
//                   'inline-flex items-center justify-center rounded-full px-3 h-10',
//                   'text-sm font-medium text-slate-100',
//                   'border border-white/10 bg-slate-900/60 hover:bg-slate-800/70',
//                   'transition-colors'
//                 )}
//               >
//                 Выйти
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 onClick={() => signIn()}
//                 className={cx(
//                   'inline-flex items-center justify-center rounded-full px-3 h-10',
//                   'text-sm font-medium text-slate-100',
//                   'border border-white/10 bg-slate-900/60 hover:bg-slate-800/70',
//                   'transition-colors'
//                 )}
//               >
//                 Войти
//               </button>
//               <Link
//                 href="/auth/signup"
//                 className={cx(
//                   'inline-flex items-center justify-center rounded-full px-3 h-10',
//                   'text-sm font-medium text-white',
//                   'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
//                   'ring-1 ring-white/10 hover:brightness-110 transition'
//                 )}
//               >
//                 Регистрация
//               </Link>
//             </>
//           )}
//         </div>

//         {/* Бургер (mobile) */}
//         <div className="md:hidden flex items-center gap-2">
//           <ThemeToggle />
//           <button
//             type="button"
//             className={cx(
//               'inline-flex h-10 w-10 items-center justify-center rounded-full',
//               'border border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70 transition'
//             )}
//             aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
//             onClick={() => setOpen(v => !v)}
//           >
//             {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </button>
//         </div>
//       </div>

//       {/* Мобильное меню */}
//       <div
//         className={cx(
//           'md:hidden overflow-hidden border-t border-slate-800',
//           open ? 'max-h-[80vh]' : 'max-h-0',
//           'transition-[max-height] duration-300 ease-out'
//         )}
//       >
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
//           {NAV.filter(i => !(i.href === '/admin' && !canSeeAdmin)).map((item) => {
//             const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 aria-current={active ? 'page' : undefined}
//                 className={cx(
//                   'flex items-center justify-between rounded-xl px-3 py-3',
//                   'ring-1 ring-white/10 bg-slate-900/60',
//                   'hover:bg-slate-800/70 transition-colors',
//                   active && 'bg-gradient-to-r from-fuchsia-600/20 via-violet-600/15 to-sky-600/15'
//                 )}
//               >
//                 <div className="flex items-center gap-3">
//                   <span className={cx('inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60','ring-1 ring-white/10')}>
//                     <item.icon className={cx('h-5 w-5', item.tone)} />
//                   </span>
//                   <span className="text-sm font-medium text-slate-100">{item.label}</span>
//                 </div>
//                 <span className={cx('h-2 w-2 rounded-full', active ? 'bg-fuchsia-400' : 'bg-white/15')} />
//               </Link>
//             );
//           })}

//           <div className="pt-1">
//             <BrandCTA href="/booking" className="w-full justify-center">Записаться</BrandCTA>
//           </div>

//           <div className="grid grid-cols-2 gap-2 pt-2">
//             {status === 'loading' ? (
//               <div className="col-span-2 h-10 rounded-xl bg-white/10 animate-pulse" />
//             ) : isAuthed ? (
//               <>
//                 <div className="col-span-2 text-xs text-slate-300 px-1">Вошли как {email}</div>
//                 <button
//                   onClick={() => signOut({ callbackUrl: '/' })}
//                   className={cx(
//                     'col-span-2 inline-flex items-center justify-center rounded-xl px-3 h-10',
//                     'text-sm font-medium text-slate-100',
//                     'border border-white/10 bg-slate-900/60 hover:bg-slate-800/70 transition'
//                   )}
//                 >
//                   Выйти
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => signIn()}
//                   className={cx(
//                     'inline-flex items-center justify-center rounded-xl px-3 h-10',
//                     'text-sm font-medium text-slate-100',
//                     'border border-white/10 bg-slate-900/60 hover:bg-slate-800/70 transition'
//                   )}
//                 >
//                   Войти
//                 </button>
//                 <Link
//                   href="/auth/signup"
//                   className={cx(
//                     'inline-flex items-center justify-center rounded-xl px-3 h-10',
//                     'text-sm font-medium text-white',
//                     'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
//                     'ring-1 ring-white/10 hover:brightness-110 transition'
//                   )}
//                 >
//                   Регистрация
//                 </Link>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }






// // src/components/site-header.tsx
// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useTheme } from 'next-themes';
// import {
//   CalendarCheck,
//   Scissors,
//   BadgeDollarSign,
//   Phone,
//   Newspaper,
//   Info,
//   LayoutDashboard,
//   Sparkles,
//   Menu,
//   X,
//   Sun,
//   Moon,
// } from 'lucide-react';

// /* ───────── helpers ───────── */

// function cx(...xs: Array<string | false | null | undefined>) {
//   return xs.filter(Boolean).join(' ');
// }

// type NavItem = {
//   href: string;
//   label: string;
//   icon: React.ElementType;
//   tone?: string; // кастомный цвет иконки
// };

// const NAV: NavItem[] = [
//   { href: '/', label: 'Главная', icon: Sparkles, tone: 'text-fuchsia-400' },
//   { href: '/services', label: 'Услуги', icon: Scissors, tone: 'text-emerald-400' },
//   { href: '/prices', label: 'Цены', icon: BadgeDollarSign, tone: 'text-amber-400' },
//   { href: '/contacts', label: 'Контакты', icon: Phone, tone: 'text-sky-400' },
//   { href: '/news', label: 'Новости', icon: Newspaper, tone: 'text-violet-400' },
//   { href: '/about', label: 'О нас', icon: Info, tone: 'text-rose-400' },
//   { href: '/admin', label: 'Админ', icon: LayoutDashboard, tone: 'text-teal-300' },
// ];

// /** Красивая «живущая» градиентная кнопка бренда */
// function BrandCTA({
//   href,
//   children,
//   className,
// }: {
//   href: string;
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <Link
//       href={href}
//       className={cx(
//         'relative inline-flex items-center justify-center rounded-full px-5 h-10',
//         'text-white text-sm font-medium',
//         'bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500',
//         'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
//         'transition-[filter,transform] hover:brightness-110 active:scale-[0.98]',
//         'ring-1 ring-white/10',
//         'before:absolute before:inset-[-1px] before:rounded-full before:bg-gradient-to-r before:from-fuchsia-400/60 before:via-cyan-400/60 before:to-transparent before:opacity-0 hover:before:opacity-40 before:transition-opacity',
//         // лёгкая «жизнь»
//         'animate-[pulse_7s_ease-in-out_infinite]',
//         className
//       )}
//     >
//       <CalendarCheck className="mr-2 h-4 w-4" />
//       {children}
//     </Link>
//   );
// }

// /** Переключатель темы */
// function ThemeToggle() {
//   const { theme, setTheme, resolvedTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   const isDark = (resolvedTheme ?? theme) === 'dark';

//   return (
//     <button
//       type="button"
//       aria-label="Сменить тему"
//       onClick={() => setTheme(isDark ? 'light' : 'dark')}
//       className={cx(
//         'inline-flex h-10 w-10 items-center justify-center rounded-full',
//         'border border-white/10 bg-slate-900/60 text-slate-200',
//         'hover:bg-slate-800/70 transition-colors',
//         'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
//       )}
//       title="Сменить тему"
//     >
//       {!mounted ? (
//         <div className="h-5 w-5" />
//       ) : isDark ? (
//         <Sun className="h-5 w-5 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.25)]" />
//       ) : (
//         <Moon className="h-5 w-5 text-sky-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)]" />
//       )}
//     </button>
//   );
// }

// /* ───────── Header ───────── */

// export default function SiteHeader() {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   useEffect(() => setOpen(false), [pathname]);

//   return (
//     <header
//       className={cx(
//         'sticky top-0 z-50',
//         'backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 bg-slate-950/80',
//         'border-b border-slate-800'
//       )}
//     >
//       <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//         {/* Лого */}
//         <Link
//           href="/"
//           className={cx(
//             'group inline-flex items-center gap-2 rounded-full px-3 py-1',
//             'ring-1 ring-white/10 bg-slate-900/60',
//             'hover:bg-slate-800/70 transition'
//           )}
//           aria-label="На главную"
//         >
//           <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 to-sky-500 shadow-[0_0_12px_rgba(99,102,241,0.45)]">
//             <Sparkles className="h-3.5 w-3.5 text-white" />
//           </span>
//           <span className="text-sm font-semibold tracking-wide text-slate-100">
//             Salon&nbsp;Elen
//           </span>
//         </Link>

//         {/* Десктоп-меню */}
//         <nav className="hidden md:flex items-center gap-1">
//           {NAV.map((item) => {
//             const active =
//               item.href === '/'
//                 ? pathname === '/'
//                 : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cx(
//                   'group inline-flex items-center gap-2 rounded-full px-3 h-10',
//                   'text-sm font-medium',
//                   'transition-colors',
//                   active
//                     ? 'text-white bg-gradient-to-r from-fuchsia-600/25 via-violet-600/20 to-sky-600/20 ring-1 ring-fuchsia-400/30'
//                     : 'text-slate-300 hover:text-white hover:bg-white/5 ring-1 ring-white/10',
//                   'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
//                 )}
//               >
//                 <item.icon className={cx('h-4 w-4', item.tone)} />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Кнопки справа */}
//         <div className="flex items-center gap-2">
//           <ThemeToggle />
//           <div className="hidden md:block">
//             <BrandCTA href="/booking">Записаться</BrandCTA>
//           </div>

//           {/* Бургер для мобилы */}
//           <button
//             type="button"
//             className={cx(
//               'md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full',
//               'border border-white/10 bg-slate-900/60 text-slate-200 hover:bg-slate-800/70 transition'
//             )}
//             aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
//             onClick={() => setOpen((v) => !v)}
//           >
//             {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </button>
//         </div>
//       </div>

//       {/* Мобильное меню */}
//       <div
//         className={cx(
//           'md:hidden overflow-hidden border-t border-slate-800',
//           open ? 'max-h-[80vh]' : 'max-h-0',
//           'transition-[max-height] duration-300 ease-out'
//         )}
//       >
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
//           {NAV.map((item) => {
//             const active =
//               item.href === '/'
//                 ? pathname === '/'
//                 : pathname.startsWith(item.href);
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cx(
//                   'flex items-center justify-between rounded-xl px-3 py-3',
//                   'ring-1 ring-white/10 bg-slate-900/60',
//                   'hover:bg-slate-800/70 transition-colors',
//                   active && 'bg-gradient-to-r from-fuchsia-600/20 via-violet-600/15 to-sky-600/15'
//                 )}
//               >
//                 <div className="flex items-center gap-3">
//                   <span
//                     className={cx(
//                       'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60',
//                       'ring-1 ring-white/10'
//                     )}
//                   >
//                     <item.icon className={cx('h-5 w-5', item.tone)} />
//                   </span>
//                   <span className="text-sm font-medium text-slate-100">
//                     {item.label}
//                   </span>
//                 </div>
//                 <span
//                   className={cx(
//                     'h-2 w-2 rounded-full',
//                     active ? 'bg-fuchsia-400' : 'bg-white/15'
//                   )}
//                 />
//               </Link>
//             );
//           })}

//           {/* CTA в мобильном меню */}
//           <div className="pt-1">
//             <BrandCTA href="/booking" className="w-full justify-center">
//               Записаться
//             </BrandCTA>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }



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
