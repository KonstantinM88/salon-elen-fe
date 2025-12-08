"use client";

import Link from "next/link";
import Image from "next/image";
import Section from "@/components/section";
import RainbowCTA from "@/components/RainbowCTA";
import { useTranslations } from "@/i18n/useTranslations";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/locales";

type KnownType = "ARTICLE" | "NEWS" | "PROMO";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  type: KnownType;
};

const TYPE_LABEL_BY_LOCALE: Record<
  Locale,
  Record<KnownType, string>
> = {
  ru: {
    ARTICLE: "Статья",
    NEWS: "Новость",
    PROMO: "Акция",
  },
  de: {
    ARTICLE: "Artikel",
    NEWS: "News",
    PROMO: "Aktion",
  },
  en: {
    ARTICLE: "Article",
    NEWS: "News",
    PROMO: "Promo",
  },
};

type HomePageProps = {
  latest: ArticleItem[];
};

export default function HomePage({ latest }: HomePageProps) {
  const t = useTranslations();
  const { locale } = useI18n();
  const typeLabel = TYPE_LABEL_BY_LOCALE[locale];

  return (
    <main>
      {/* HERO */}
      <section className="relative isolate w-full">
        {/* MOBILE */}
        <div className="md:hidden">
          <div className="container pt-4">
            <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-[#F5F3EE]">
              {t("hero_tagline")}
            </h1>
          </div>

          <div className="relative w-full mt-2">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 blur-2xl opacity-50"
              style={{
                backgroundImage: 'url("/images/hero-mobile.webp")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                transform: "scale(1.05)",
                filter: "blur(40px)",
              }}
            />
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/hero-mobile.webp"
                alt="Salon Elen"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="container pb-6 mt-4">
            <p className="text-[14px] leading-relaxed text-[#F5F3EE]/95">
              {t("hero_subtitle")}
            </p>
            <div className="mt-4 flex gap-3">
              <RainbowCTA
                href="/booking"
                label={t("hero_cta_book")}
                className="h-10 px-5 text-[14px]"
                idle
              />
              <Link
                href="/services"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#F5F3EE] border border-white/25 hover:bg-white/10 transition"
              >
                {t("hero_cta_services")}
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block relative w-full overflow-hidden h-[560px] lg:h-[600px] xl:h-[640px]">
          <Image
            src="/images/hero.webp"
            alt="Salon Elen — стильная студия парикмахерских услуг"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1280px"
            className="object-cover object-[68%_50%]"
          />

          <div className="absolute inset-y-0 left-0 z-[1] w-[clamp(36%,42vw,48%)] bg-gradient-to-r from-black/85 via-black/55 to-transparent [mask-image:linear-gradient(to_right,black,black,transparent)]" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/35 via-black/10 to-transparent pointer-events-none" />

          <div className="relative z-10 h-full">
            <div className="container h-full">
              <div className="flex h-full items-center">
                <div className="max-w-[620px]">
                  <h1 className="text-[#F5F3EE] font-semibold tracking-tight leading-[1.06] max-w-[14ch] text-[clamp(40px,6vw,64px)]">
                    {t("hero_tagline")}
                  </h1>

                  <p className="mt-5 text-[#F5F3EE]/90 text-[19px] leading-relaxed max-w-[50ch]">
                    {t("hero_subtitle")}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <RainbowCTA
                      href="/booking"
                      label={t("hero_cta_book")}
                      className="h-12 px-7 text-[15px]"
                      idle
                    />
                    <Link
                      href="/services"
                      className="inline-flex h-12 px-7 items-center justify-center rounded-full border border-white/70 text-white hover:bg-white/10 transition"
                    >
                      {t("hero_cta_services")}
                    </Link>
                  </div>

                  <div className="mt-4 text-white/70 text-sm">
                    {t("hero_badge")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Популярные услуги */}
      <Section
        title={t("home_services_title")}
        subtitle={t("home_services_subtitle")}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1: Стрижка */}
          <Link
            href="/coming-soon"
            className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/images/services/haircut.webp"
                alt={t("home_services_card1_title")}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium">{t("home_services_card1_title")}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("home_services_card1_text")}
              </p>
            </div>
          </Link>

          {/* 2: Маникюр */}
          <Link
            href="/coming-soon"
            className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/images/services/manicure.webp"
                alt={t("home_services_card2_title")}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium">{t("home_services_card2_title")}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("home_services_card2_text")}
              </p>
            </div>
          </Link>

          {/* 3: Make-up */}
          <Link
            href="/coming-soon"
            className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/images/services/makeup.webp"
                alt={t("home_services_card3_title")}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium">{t("home_services_card3_title")}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {t("home_services_card3_text")}
              </p>
            </div>
          </Link>
        </div>
      </Section>

      {/* Новости и статьи */}
      <Section
        title={t("home_news_title")}
        subtitle={t("home_news_subtitle")}
      >
        {latest.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            {t("home_news_empty")}
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {latest.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block rounded-2xl border hover:shadow-md transition overflow-hidden bg-white/70 dark:bg-slate-900/60"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                      —
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">
                    {typeLabel[item.type]}
                  </div>
                  <h3 className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Нижний CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-8 sm:px-10 sm:py-10 text-white">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
              {t("home_cta_title")}
            </h2>
            <p className="text-sm sm:text-base text-white/90 mb-4">
              {t("home_cta_text")}
            </p>
            <RainbowCTA
              href="/booking"
              label={t("home_cta_button")}
              className="h-11 px-6 text-[15px]"
            />
          </div>
          <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
        </div>
      </Section>
    </main>
  );
}
