import Link from "next/link";
import { ArrowRight, Eye, Heart, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

import {
  localizeSeoLandingPage,
  seoLandingPages,
  type SeoLandingCategory,
} from "@/lib/seo-landing-pages";
import type { SeoLocale } from "@/lib/seo-locale";

const copy: Record<
  SeoLocale,
  {
    eyebrow: string;
    title: string;
    text: string;
    open: string;
  }
> = {
  de: {
    eyebrow: "Passende Behandlungen",
    title: "Mehr Informationen zu unseren Behandlungen in Halle",
    text: "Hier finden Sie Details zu Ergebnis, Ablauf, Preis, Pflege und Buchung.",
    open: "Mehr erfahren",
  },
  ru: {
    eyebrow: "\u041F\u043E\u0445\u043E\u0436\u0438\u0435 \u0443\u0441\u043B\u0443\u0433\u0438",
    title: "\u0411\u043E\u043B\u044C\u0448\u0435 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u043E \u043D\u0430\u0448\u0438\u0445 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u0430\u0445 \u0432 Halle",
    text: "\u0417\u0434\u0435\u0441\u044C \u0435\u0441\u0442\u044C \u0434\u0435\u0442\u0430\u043B\u0438 \u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0435, \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435, \u0446\u0435\u043D\u0435, \u0443\u0445\u043E\u0434\u0435 \u0438 \u0437\u0430\u043F\u0438\u0441\u0438.",
    open: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435",
  },
  en: {
    eyebrow: "Related treatments",
    title: "More information about our treatments in Halle",
    text: "Find details about results, process, pricing, aftercare and booking.",
    open: "Learn more",
  },
};

const categoryIcons: Record<SeoLandingCategory, LucideIcon> = {
  brows: Eye,
  lips: Heart,
  eyes: Sparkles,
  skin: ShieldCheck,
};

function localeHref(path: string, locale: SeoLocale) {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

export default function SeoLandingLinks({ locale }: { locale: SeoLocale }) {
  const t = copy[locale] ?? copy.de;

  return (
    <section className="relative isolate overflow-hidden border-t border-rose-200/50 bg-gradient-to-b from-white via-rose-50/50 to-amber-50/40 px-4 py-14 dark:border-white/10 dark:from-[#09090d] dark:via-[#101018] dark:to-[#09090d] sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-600 dark:text-amber-300">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-playfair text-3xl font-light tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            {t.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
            {t.text}
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seoLandingPages.map((page) => {
            const Icon = categoryIcons[page.category];
            const localizedPage = localizeSeoLandingPage(page, locale);

            return (
              <Link
                key={page.slug}
                href={localeHref(`/${page.slug}`, locale)}
                className="group rounded-2xl border border-rose-200/70 bg-white/88 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-200/25 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-amber-300/25 dark:hover:shadow-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="mt-3 h-4 w-4 text-rose-500 transition group-hover:translate-x-1 dark:text-amber-300" />
                </div>
                <h3 className="mt-5 text-base font-semibold leading-6 text-gray-950 dark:text-white">
                  {localizedPage.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {localizedPage.metaDescription}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-rose-100 pt-4 text-sm dark:border-white/10">
                  <span className="font-semibold text-rose-700 dark:text-amber-300">
                    {localizedPage.price}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {t.open}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
