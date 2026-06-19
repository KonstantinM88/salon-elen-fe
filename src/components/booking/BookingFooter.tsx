"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Monitor, Moon, Phone, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useI18n } from "@/i18n/I18nProvider";

type Copy = {
  themeLabel: string;
  system: string;
  light: string;
  dark: string;
  footerText: string;
  services: string;
  prices: string;
  contact: string;
  privacy: string;
};

const copy: Record<string, Copy> = {
  de: {
    themeLabel: "Design",
    system: "System",
    light: "Hell",
    dark: "Dunkel",
    footerText: "Sichere Online-Terminbuchung bei Salon Elen in Halle.",
    services: "Leistungen",
    prices: "Preise",
    contact: "Kontakt",
    privacy: "Datenschutz",
  },
  ru: {
    themeLabel: "Тема",
    system: "Система",
    light: "Светлая",
    dark: "Тёмная",
    footerText: "Безопасная онлайн-запись в Salon Elen в Halle.",
    services: "Услуги",
    prices: "Цены",
    contact: "Контакты",
    privacy: "Защита данных",
  },
  en: {
    themeLabel: "Theme",
    system: "System",
    light: "Light",
    dark: "Dark",
    footerText: "Secure online appointment booking at Salon Elen in Halle.",
    services: "Services",
    prices: "Prices",
    contact: "Contact",
    privacy: "Privacy",
  },
};

function getCopy(locale: string): Copy {
  return copy[locale] ?? copy.de;
}

const themeOptions = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

export function BookingThemeControl({
  compact = false,
}: {
  compact?: boolean;
}): React.JSX.Element | null {
  const { locale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const labels = getCopy(locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={
        compact
          ? "booking-theme-control fixed right-3 top-[calc(env(safe-area-inset-top,0px)+112px)] z-[60] rounded-full border border-rose-200/75 bg-white/82 p-1 shadow-[0_18px_52px_rgba(126,76,91,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-black/45 dark:shadow-[0_18px_52px_rgba(0,0,0,0.35)] md:right-6 md:top-[calc(env(safe-area-inset-top,0px)+124px)]"
          : "booking-theme-control rounded-full border border-rose-200/75 bg-white/74 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
      }
      aria-label={labels.themeLabel}
    >
      <div className="flex items-center gap-1">
        {!compact && (
          <span className="pl-3 pr-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7d4e5b]/70 dark:text-white/55">
            {labels.themeLabel}
          </span>
        )}

        {themeOptions.map((option) => {
          const Icon = option.icon;
          const active = (theme ?? "system") === option.value;
          const label =
            option.value === "system"
              ? labels.system
              : option.value === "light"
                ? labels.light
                : labels.dark;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              aria-label={label}
              aria-pressed={active}
              title={label}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-xs font-semibold transition ${
                active
                  ? "bg-[#7d4e5b] text-white shadow-[0_10px_24px_rgba(126,76,91,0.22)] dark:bg-amber-300 dark:text-black dark:shadow-[0_10px_24px_rgba(251,191,36,0.25)]"
                  : "text-[#7d4e5b] hover:bg-rose-50 dark:text-white/70 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {!compact && <span className="ml-1.5 hidden sm:inline">{label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingFooter(): React.JSX.Element {
  const { locale } = useI18n();
  const labels = getCopy(locale);

  return (
    <footer className="booking-footer relative z-20 border-t border-rose-200/70 bg-[#fff8f8]/92 text-[#38272d] shadow-[0_-20px_70px_rgba(126,76,91,0.10)] backdrop-blur dark:border-white/10 dark:bg-black/88 dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(126,76,91,0),rgba(184,91,117,0.72),rgba(240,182,110,0.72),rgba(126,76,91,0))] dark:bg-[linear-gradient(90deg,rgba(251,191,36,0),rgba(251,191,36,0.68),rgba(236,72,153,0.58),rgba(251,191,36,0))]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-9 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9b5368] via-[#d97891] to-[#f0b66e] text-white shadow-[0_16px_34px_rgba(184,91,117,0.25)] dark:from-fuchsia-500 dark:via-amber-300 dark:to-cyan-300 dark:text-black">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Salon Elen</span>
          </Link>

          <p className="mt-4 text-sm leading-6 text-[#6f5860] dark:text-white/65">
            {labels.footerText}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6f5860] dark:text-white/62">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#9b5368] dark:text-amber-300" />
              Lessingstrasse 37, Halle
            </span>
            <a className="inline-flex items-center gap-1.5 hover:text-[#7d4e5b] dark:hover:text-amber-200" href="tel:+4934568657460">
              <Phone className="h-4 w-4 text-[#9b5368] dark:text-amber-300" />
              +49 345 68657460
            </a>
            <a className="inline-flex items-center gap-1.5 hover:text-[#7d4e5b] dark:hover:text-amber-200" href="mailto:info@permanent-halle.de">
              <Mail className="h-4 w-4 text-[#9b5368] dark:text-amber-300" />
              info@permanent-halle.de
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:items-end">
          <BookingThemeControl />

          <nav className="flex flex-wrap gap-3 text-sm font-medium text-[#7d4e5b] dark:text-white/70">
            <Link className="hover:text-[#38272d] dark:hover:text-amber-200" href="/services">
              {labels.services}
            </Link>
            <Link className="hover:text-[#38272d] dark:hover:text-amber-200" href="/prices">
              {labels.prices}
            </Link>
            <Link className="hover:text-[#38272d] dark:hover:text-amber-200" href="/contacts">
              {labels.contact}
            </Link>
            <Link className="hover:text-[#38272d] dark:hover:text-amber-200" href="/datenschutz">
              {labels.privacy}
            </Link>
          </nav>

          <div className="inline-flex items-center gap-2 text-xs text-[#6f5860]/78 dark:text-white/46">
            <ShieldCheck className="h-4 w-4 text-[#9b5368] dark:text-amber-300" />
            <span>© 2026 Salon Elen</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
