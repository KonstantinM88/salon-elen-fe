// src/components/site-header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ElementType } from "react";
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
  Images,
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
  | "nav_gallery"
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
  { href: "/", labelKey: "nav_home", icon: Sparkles, tone: "text-fuchsia-500 dark:text-fuchsia-400" },
  { href: "/services", labelKey: "nav_services", icon: Scissors, tone: "text-emerald-600 dark:text-emerald-400" },
  { href: "/prices", labelKey: "nav_prices", icon: BadgeDollarSign, tone: "text-amber-600 dark:text-amber-400" },
  { href: "/gallerie", labelKey: "nav_gallery", icon: Images, tone: "text-pink-500 dark:text-pink-400" },
  { href: "/contacts", labelKey: "nav_contacts", icon: Phone, tone: "text-sky-600 dark:text-sky-400" },
  { href: "/news", labelKey: "nav_news", icon: Newspaper, tone: "text-violet-600 dark:text-violet-400" },
  { href: "/about", labelKey: "nav_about", icon: Info, tone: "text-rose-500 dark:text-rose-400" },
  { href: "/admin", labelKey: "nav_admin", icon: LayoutDashboard, tone: "text-teal-600 dark:text-teal-300" },
];

const LOCALE_OPTIONS: { code: Locale; label: string; file: string }[] = [
  { code: "de", label: "DE", file: "/flags/de.svg" },
  { code: "en", label: "EN", file: "/flags/en.svg" },
  { code: "ru", label: "RU", file: "/flags/ru.svg" },
];

/* ─────────────────── Logo ─────────────────── */

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2 flex-shrink-0">
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 shadow-lg shadow-violet-500/20">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-sm font-semibold tracking-wide text-rose-900 dark:text-slate-100">
        Salon&nbsp;Elen
      </span>
    </Link>
  );
}

/* ─────────────────── Theme Toggle ─────────────────── */

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cx(
        "h-8 w-8 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
        "border-rose-200/60 bg-white/60 text-rose-600 hover:bg-rose-100/60 hover:text-rose-700",
        "dark:border-white/10 dark:bg-slate-900/60 dark:text-amber-300 dark:hover:bg-slate-800"
      )}
    >
      {!mounted ? null : isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

/* ─────────────────── Locale Switcher ─────────────────── */

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
    <div className="relative z-30 flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition",
          "border-rose-200/60 bg-white/60 text-rose-800 hover:bg-rose-100/60",
          "dark:border-white/12 dark:bg-slate-900/80 dark:text-white/80 dark:hover:text-white dark:hover:bg-slate-800"
        )}
      >
        <span className="h-3.5 w-5 rounded-[2px] overflow-hidden border border-rose-200/50 dark:border-white/40 shadow-sm">
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
          "absolute right-0 mt-1 w-28 rounded-xl border shadow-lg backdrop-blur z-40",
          "border-rose-100 bg-white/95 dark:border-white/10 dark:bg-slate-900/95",
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
                  "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-rose-50 text-rose-900 dark:bg-white/10 dark:text-white"
                    : "text-gray-600 hover:bg-rose-50/60 hover:text-rose-800 dark:text-white/75 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span className="h-3.5 w-5 rounded-[2px] overflow-hidden border border-rose-200/50 dark:border-white/40 shadow-sm">
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

/* ─────────────────── SiteHeader ─────────────────── */

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
    <header
      className={cx(
        "sticky top-0 z-50 w-full backdrop-blur-md border-b transition-colors",
        // Light: розоватый фон
        "bg-gradient-to-r from-rose-50/90 via-pink-50/90 to-rose-50/90 border-rose-200/40",
        // Dark: тёмный
        "dark:from-slate-950/90 dark:via-slate-950/90 dark:to-slate-950/90 dark:border-slate-800"
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-3 sm:px-4 lg:px-5">
        <Logo />

        {/* ── Desktop nav (lg+) ── */}
        <nav className="hidden lg:flex items-center gap-0.5 mx-2 flex-1 justify-center min-w-0">
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
                    "flex items-center gap-1 px-2 xl:px-2.5 h-8 rounded-full text-[13px] xl:text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-rose-200/50 text-rose-900 shadow-sm shadow-rose-200/20 dark:bg-white/10 dark:text-white dark:shadow-none"
                      : "text-rose-800/70 hover:text-rose-900 hover:bg-rose-100/50 dark:text-white/65 dark:hover:text-white dark:hover:bg-white/8"
                  )}
                >
                  <item.icon className={cx("h-3.5 w-3.5 flex-shrink-0", item.tone)} />
                  <span className="truncate">{t(item.labelKey)}</span>
                </Link>
              );
            }
          )}
        </nav>

        {/* ── Desktop right zone (lg+) ── */}
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
          <LocaleSwitcher />
          <ThemeToggle />

          {isAuthed ? (
            <>
              <span className="hidden xl:block text-[11px] text-rose-700/50 dark:text-white/50 max-w-[140px] truncate">
                {email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cx(
                  "px-2.5 h-8 rounded-full border text-[13px] font-medium transition-colors whitespace-nowrap",
                  "border-rose-200/60 bg-white/60 text-rose-800 hover:bg-rose-100/60",
                  "dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-800/80"
                )}
              >
                {t("auth_logout")}
              </button>
              <RainbowCTA
                href="/booking"
                label={t("hero_cta_book")}
                className="h-8 px-4 text-[13px]"
                idle
              />
            </>
          ) : (
            <RainbowCTA
              href="/booking"
              label={t("hero_cta_book")}
              className="h-8 px-4 text-[13px]"
              idle
            />
          )}
        </div>

        {/* ── Mobile menu button (< lg) ── */}
        <button
          className={cx(
            "lg:hidden h-9 w-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
            "border-rose-200/60 bg-white/60 text-rose-700",
            "dark:bg-slate-900/60 dark:border-white/20 dark:text-white"
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* ── Mobile menu (< lg) ── */}
      <div
        className={cx(
          "lg:hidden w-full overflow-hidden border-t transition-[max-height] duration-300",
          "border-rose-100/40 dark:border-slate-800",
          open ? "max-h-[80vh]" : "max-h-0"
        )}
      >
        <div
          className={cx(
            "mx-auto max-w-full px-4 py-3 space-y-1",
            "bg-gradient-to-b from-rose-50/98 to-pink-50/95 dark:from-slate-950/98 dark:to-slate-950/95 backdrop-blur-lg"
          )}
        >
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
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-rose-200/40 text-rose-900 dark:bg-white/10 dark:text-white"
                      : "text-rose-800/80 hover:bg-rose-100/40 dark:text-slate-200 dark:hover:bg-white/5"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className={cx("h-4 w-4", item.tone)} />
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            }
          )}

          <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-rose-200/30 dark:border-slate-800">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <div className="flex flex-col gap-2 pt-3 pb-2">
            {isAuthed ? (
              <>
                <div className="text-xs text-rose-700/50 dark:text-slate-300 truncate">
                  {email}
                </div>
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
                  className={cx(
                    "h-10 w-full rounded-xl border text-sm font-medium transition-colors",
                    "border-rose-200/50 bg-white/70 text-rose-800 hover:bg-rose-100/50",
                    "dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-800/80"
                  )}
                >
                  {t("auth_logout")}
                </button>
              </>
            ) : (
              <RainbowCTA
                href="/booking"
                label={t("hero_cta_book")}
                className="h-10 w-full text-sm justify-center"
                idle
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}



//-------добавляем глаллерею и меняем цвет под тему-------
// // src/components/site-header.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   useEffect,
//   useState,
//   type ElementType,
// } from "react";
// import { useTheme } from "next-themes";
// import { useSession, signIn, signOut } from "next-auth/react";
// import {
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
//     <div className="relative z-30">
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
//           "absolute right-0 mt-1 w-28 rounded-xl border border-white/10 bg-slate-900/95 shadow-lg backdrop-blur z-40",
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
//     <header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur border-b border-slate-800">
//       <div className="container mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6">
//         <Logo />

//         {/* Десктопное меню – только с lg (>=1024px) */}
//         <nav className="hidden lg:flex items-center gap-2">
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

//         {/* Правая часть – только с lg */}
//         <div className="hidden lg:flex items-center gap-2">
//           <LocaleSwitcher />
//           <ThemeToggle />

//           {isAuthed ? (
//             <>
//               <span className="hidden xl:block text-xs text-white/60 max-w-[200px] truncate">
//                 {email}
//               </span>
//               <button
//                 onClick={() => signOut({ callbackUrl: "/" })}
//                 className="px-3 h-10 rounded-full border border-white/10 bg-slate-900/60 text-white text-sm hover:bg-slate-800/80"
//               >
//                 {t("auth_logout")}
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
//                 {t("auth_login")}
//               </button>
//             </>
//           )}
//         </div>

//         {/* Кнопка мобильного меню – до lg */}
//         <button
//           className="lg:hidden h-10 w-10 rounded-full bg-slate-900/60 border border-white/20 flex items-center justify-center text-white"
//           onClick={() => setOpen((v) => !v)}
//           aria-label="Открыть меню"
//         >
//           {open ? <X /> : <Menu />}
//         </button>
//       </div>

//       {/* Мобильное меню – до lg */}
//       <div
//         className={cx(
//           "lg:hidden w-full overflow-hidden border-t border-slate-800 transition-[max-height] duration-300",
//           open ? "max-h-[80vh]" : "max-h-0"
//         )}
//       >
//         <div className="container mx-auto max-w-full px-4 py-3 space-y-2 relative">
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

//           <div className="flex flex-col gap-2 mt-3 pb-2">
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
//                   {t("auth_logout")}
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
//                   {t("auth_login")}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
