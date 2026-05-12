"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/locales";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  dispatchCookieConsentChange,
  getStoredCookieConsent,
  setStoredCookieConsent,
  type CookieConsentValue,
} from "@/components/analytics/clarityConsent";

type ConsentCopy = {
  badge: string;
  title: string;
  body: string;
  statusLabel: string;
  acceptedStatus: string;
  rejectedStatus: string;
  accept: string;
  reject: string;
  privacy: string;
  settings: string;
};

const copyByLocale: Record<Locale, ConsentCopy> = {
  de: {
    badge: "Datenschutz",
    title: "Cookie-Einstellungen",
    body:
      "Wir verwenden notwendige Cookies fuer Sprache und technische Funktionen. Microsoft Clarity fuer Analyse-Cookies, Heatmaps und Sitzungsaufzeichnungen laden wir nur, wenn Sie zustimmen.",
    statusLabel: "Aktuelle Auswahl:",
    acceptedStatus: "Analyse-Cookies erlaubt",
    rejectedStatus: "Nur notwendige Cookies",
    accept: "Analyse erlauben",
    reject: "Nur notwendige",
    privacy: "Datenschutzerklaerung",
    settings: "Cookie-Einstellungen",
  },
  en: {
    badge: "Privacy",
    title: "Cookie settings",
    body:
      "We use necessary cookies for language and technical features. Microsoft Clarity for analytics cookies, heatmaps, and session recordings is loaded only if you consent.",
    statusLabel: "Current choice:",
    acceptedStatus: "Analytics cookies allowed",
    rejectedStatus: "Necessary cookies only",
    accept: "Allow analytics",
    reject: "Necessary only",
    privacy: "Privacy policy",
    settings: "Cookie settings",
  },
  ru: {
    badge: "Datenschutz",
    title: "Настройки cookies",
    body:
      "Мы используем необходимые cookies для языка и технических функций. Microsoft Clarity для аналитики, тепловых карт и записей сессий загружается только после вашего согласия.",
    statusLabel: "Текущий выбор:",
    acceptedStatus: "Аналитика разрешена",
    rejectedStatus: "Только необходимые cookies",
    accept: "Разрешить аналитику",
    reject: "Только необходимые",
    privacy: "Политика конфиденциальности",
    settings: "Настройки cookies",
  },
};

export default function CookieConsentBanner(): React.JSX.Element | null {
  const { locale } = useI18n();
  const copy = copyByLocale[locale] ?? copyByLocale.de;
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

  useEffect(() => {
    if (!clarityProjectId) {
      return;
    }

    const storedConsent = getStoredCookieConsent();
    setConsent(storedConsent);
    setVisible(storedConsent === null);
    setMounted(true);

    const handleOpenSettings = () => {
      setVisible(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);

    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    };
  }, [clarityProjectId]);

  if (!clarityProjectId || !mounted) {
    return null;
  }

  const chooseConsent = (nextConsent: CookieConsentValue) => {
    setStoredCookieConsent(nextConsent);
    setConsent(nextConsent);
    dispatchCookieConsentChange(nextConsent);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <section
        aria-labelledby="cookie-consent-title"
        className="mx-auto max-w-4xl rounded-2xl border border-rose-200/80 bg-white/95 p-4 text-rose-950 shadow-2xl shadow-rose-950/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-black/40 sm:p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-600 dark:text-sky-300">
              {copy.badge}
            </p>
            <h2 id="cookie-consent-title" className="text-base font-semibold sm:text-lg">
              {copy.title}
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-rose-900/75 dark:text-slate-300">
              {copy.body}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-rose-900/65 dark:text-slate-400">
              {consent && (
                <span>
                  {copy.statusLabel}{" "}
                  <strong className="font-semibold text-rose-900 dark:text-slate-200">
                    {consent === "accepted" ? copy.acceptedStatus : copy.rejectedStatus}
                  </strong>
                </span>
              )}
              <Link href="/datenschutz" className="underline-offset-4 hover:underline">
                {copy.privacy}
              </Link>
            </div>
          </div>

          <div className="grid gap-2 sm:flex sm:flex-none sm:items-center">
            <button
              type="button"
              onClick={() => chooseConsent("rejected")}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-900 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-white/15 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-sky-400/60 dark:hover:bg-slate-800 dark:focus-visible:ring-sky-400/70"
            >
              {copy.reject}
            </button>
            <button
              type="button"
              onClick={() => chooseConsent("accepted")}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-rose-600 bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-700/20 transition hover:border-rose-700 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950 dark:shadow-sky-500/20 dark:hover:border-sky-300 dark:hover:bg-sky-400 dark:focus-visible:ring-sky-400/70"
            >
              {copy.accept}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
