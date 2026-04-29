import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeEuro,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  BASE_URL,
  buildAlternates,
  resolveUrlLocale,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import {
  getRelatedSeoLandingPages,
  localizeSeoLandingPage,
  type SeoLandingCategory,
  type SeoLandingPageData,
} from "@/lib/seo-landing-pages";
import {
  SeoHeroVisual,
  SeoReveal,
  SeoScrollProgress,
  SeoStagger,
  SeoStaggerItem,
} from "@/components/seo/SeoScrollEffects";

type MetadataArgs = {
  searchParams?: SearchParamsPromise;
};

const categoryIcons: Record<SeoLandingCategory, LucideIcon> = {
  brows: Eye,
  lips: Heart,
  eyes: Sparkles,
  skin: ShieldCheck,
};

const categoryAccent: Record<
  SeoLandingCategory,
  {
    text: string;
    bg: string;
    border: string;
    band: string;
    button: string;
  }
> = {
  brows: {
    text: "text-rose-700 dark:text-rose-200",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200/70 dark:border-rose-300/15",
    band: "bg-rose-50/70 dark:bg-rose-950/20",
    button: "from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-500",
  },
  lips: {
    text: "text-pink-700 dark:text-pink-200",
    bg: "bg-pink-50 dark:bg-pink-500/10",
    border: "border-pink-200/70 dark:border-pink-300/15",
    band: "bg-pink-50/70 dark:bg-pink-950/20",
    button: "from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-500",
  },
  eyes: {
    text: "text-sky-700 dark:text-sky-200",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200/70 dark:border-sky-300/15",
    band: "bg-sky-50/70 dark:bg-sky-950/20",
    button: "from-sky-700 to-cyan-500 hover:from-sky-600 hover:to-cyan-500",
  },
  skin: {
    text: "text-emerald-700 dark:text-emerald-200",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200/70 dark:border-emerald-300/15",
    band: "bg-emerald-50/70 dark:bg-emerald-950/20",
    button: "from-emerald-700 to-teal-500 hover:from-emerald-600 hover:to-teal-500",
  },
};

const openGraphLocales: Record<SeoLocale, string> = {
  de: "de_DE",
  en: "en_US",
  ru: "ru_RU",
};

const templateCopy: Record<
  SeoLocale,
  {
    book: string;
    viewPrices: string;
    whyEyebrow: string;
    whyTitle: string;
    whyText: string;
    suitableEyebrow: string;
    suitableTitle: string;
    suitableText: string;
    processEyebrow: string;
    processTitle: string;
    processText: string;
    priceEyebrow: string;
    priceText: (serviceName: string) => string;
    priceCta: string;
    proofEyebrow: string;
    contraindicationEyebrow: string;
    contraindicationTitle: string;
    contraindicationText: string;
    feedbackEyebrow: string;
    feedbackTitle: string;
    feedbackText: string;
    faqTitle: string;
    nextEyebrow: string;
    nextTitle: string;
    nextText: string;
    contact: string;
    relatedEyebrow: string;
    overviewEyebrow: string;
    servicesOverview: string;
  }
> = {
  de: {
    book: "Termin buchen",
    viewPrices: "Preise ansehen",
    whyEyebrow: "Warum diese Behandlung",
    whyTitle: "Sichtbarer Effekt, ruhig und typgerecht geplant.",
    whyText:
      "Vor der Buchung sollten Ergebnis, Ablauf, Preis, Pflege und Grenzen klar sein. Deshalb fuehren wir Sie durch die wichtigsten Entscheidungen vor dem Termin.",
    suitableEyebrow: "Geeignet fuer",
    suitableTitle: "Passt diese Behandlung zu Ihnen?",
    suitableText:
      "Die beste Entscheidung entsteht nicht aus einem Trend, sondern aus Haut, Stil, Alltag und einem realistischen Zielbild.",
    processEyebrow: "Ablauf",
    processTitle: "So laeuft Ihr Termin ab",
    processText:
      "Von der Beratung bis zur Nachpflege bleibt der Ablauf transparent. Sie wissen vor jedem Schritt, was passiert.",
    priceEyebrow: "Preis und Planung",
    priceText: (serviceName) =>
      `${serviceName} in Halle (Saale). Der Preis wird vor der Behandlung klar besprochen, damit es keine Ueberraschung gibt.`,
    priceCta: "Beratung oder Termin buchen",
    proofEyebrow: "Bilder und Wirkung",
    contraindicationEyebrow: "Bitte beachten",
    contraindicationTitle: "Wann die Behandlung verschoben werden sollte",
    contraindicationText:
      "Die Liste ersetzt keine medizinische Beratung. Teilen Sie uns relevante Gesundheitsthemen bitte vor der Buchung mit.",
    feedbackEyebrow: "Kundinnenfeedback",
    feedbackTitle: "Was Kundinnen haeufig schaetzen",
    feedbackText:
      "Zusammengefasste Rueckmeldungen aus Beratung und Behandlung, ohne kuenstliche Bewertungssterne.",
    faqTitle: "Haeufige Fragen",
    nextEyebrow: "Naechster Schritt",
    nextTitle: "Erst beraten lassen, dann ruhig entscheiden.",
    nextText:
      "Buchen Sie online einen Termin oder sehen Sie sich weitere Leistungen an. Wenn gesundheitliche Fragen offen sind, klaeren wir diese vor der Behandlung.",
    contact: "Kontakt und Standort",
    relatedEyebrow: "Weitere Behandlung",
    overviewEyebrow: "Uebersicht",
    servicesOverview: "Alle Leistungen ansehen",
  },
  en: {
    book: "Book appointment",
    viewPrices: "View prices",
    whyEyebrow: "Why this treatment",
    whyTitle: "Visible effect, planned calmly and individually.",
    whyText:
      "Before booking, the result, process, price, aftercare and limits should be clear. This page guides you through the key decisions before your appointment.",
    suitableEyebrow: "Suitable for",
    suitableTitle: "Is this treatment right for you?",
    suitableText:
      "The best decision is not based on a trend, but on skin, style, daily routine and a realistic result.",
    processEyebrow: "Process",
    processTitle: "How your appointment works",
    processText:
      "From consultation to aftercare, the process stays transparent. Before each step, you know what happens next.",
    priceEyebrow: "Price and planning",
    priceText: (serviceName) =>
      `${serviceName} in Halle (Saale). The price is discussed clearly before treatment, so there are no surprises.`,
    priceCta: "Book consultation or appointment",
    proofEyebrow: "Images and effect",
    contraindicationEyebrow: "Please note",
    contraindicationTitle: "When the treatment should be postponed",
    contraindicationText:
      "This list does not replace medical advice. Please tell us about relevant health topics before booking.",
    feedbackEyebrow: "Client feedback",
    feedbackTitle: "What clients often appreciate",
    feedbackText:
      "Summarized feedback from consultation and treatment, without artificial star ratings.",
    faqTitle: "Frequently asked questions",
    nextEyebrow: "Next step",
    nextTitle: "Get advice first, then decide calmly.",
    nextText:
      "Book online or view more services. If health questions are open, we clarify them before treatment.",
    contact: "Contact and location",
    relatedEyebrow: "Related treatment",
    overviewEyebrow: "Overview",
    servicesOverview: "View all services",
  },
  ru: {
    book: "Записаться",
    viewPrices: "Смотреть цены",
    whyEyebrow: "Почему эта процедура",
    whyTitle: "Заметный эффект, спокойное и индивидуальное планирование.",
    whyText:
      "До записи важно понимать результат, процесс, цену, уход и ограничения. Поэтому здесь собраны ключевые решения перед процедурой.",
    suitableEyebrow: "Кому подходит",
    suitableTitle: "Подходит ли вам эта процедура?",
    suitableText:
      "Лучшее решение строится не на тренде, а на коже, стиле, повседневности и реалистичной цели.",
    processEyebrow: "Процесс",
    processTitle: "Как проходит ваш термин",
    processText:
      "От консультации до ухода процесс остается прозрачным. Перед каждым шагом вы понимаете, что будет дальше.",
    priceEyebrow: "Цена и планирование",
    priceText: (serviceName) =>
      `${serviceName} в Halle (Saale). Цена обсуждается до процедуры, чтобы не было неприятных сюрпризов.`,
    priceCta: "Консультация или запись",
    proofEyebrow: "Фото и эффект",
    contraindicationEyebrow: "Важно учитывать",
    contraindicationTitle: "Когда процедуру лучше перенести",
    contraindicationText:
      "Этот список не заменяет медицинскую консультацию. Пожалуйста, сообщите нам о важных вопросах здоровья до записи.",
    feedbackEyebrow: "Отзывы клиенток",
    feedbackTitle: "Что клиентки часто ценят",
    feedbackText:
      "Обобщенные впечатления из консультаций и процедур, без искусственных рейтингов.",
    faqTitle: "Частые вопросы",
    nextEyebrow: "Следующий шаг",
    nextTitle: "Сначала консультация, потом спокойное решение.",
    nextText:
      "Запишитесь онлайн или посмотрите другие услуги. Если есть вопросы по здоровью, мы уточним их до процедуры.",
    contact: "Контакты и адрес",
    relatedEyebrow: "Похожая услуга",
    overviewEyebrow: "Обзор",
    servicesOverview: "Смотреть все услуги",
  },
};

function localeHref(path: string, locale: SeoLocale) {
  return locale === "de" ? path : `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

function pageUrl(page: SeoLandingPageData, locale: SeoLocale) {
  return buildAlternates(`/${page.slug}`, locale).canonical;
}

function buildJsonLd(basePage: SeoLandingPageData, locale: SeoLocale) {
  const page = localizeSeoLandingPage(basePage, locale);
  const url = pageUrl(page, locale);
  const service: Record<string, unknown> = {
    "@type": "Service",
    name: page.serviceName,
    description: page.metaDescription,
    areaServed: "Halle (Saale)",
    provider: {
      "@type": "BeautySalon",
      name: "Salon Elen",
      telephone: "+49 177 899 51 06",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Lessingstrasse 37",
        postalCode: "06114",
        addressLocality: "Halle (Saale)",
        addressCountry: "DE",
      },
    },
  };

  if (page.priceCents) {
    service.offers = {
      "@type": "Offer",
      price: (page.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url,
    };
  }

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["BeautySalon", "LocalBusiness"],
        name: "Salon Elen",
        url: BASE_URL,
        image: `${BASE_URL}${page.heroImage}`,
        telephone: "+49 177 899 51 06",
        email: "elen69@web.de",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Lessingstrasse 37",
          postalCode: "06114",
          addressLocality: "Halle (Saale)",
          addressCountry: "DE",
        },
        areaServed: ["Halle (Saale)", "Saalekreis"],
      },
      service,
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Salon Elen",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
        position: 2,
        name: page.title,
            item: url,
          },
        ],
      },
    ],
  });
}

export async function createCommercialLandingMetadata(
  basePage: SeoLandingPageData,
  searchParams?: SearchParamsPromise,
): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const page = localizeSeoLandingPage(basePage, locale);
  const alts = buildAlternates(`/${basePage.slug}`, locale);

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: alts,
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: alts.canonical,
      images: [`${BASE_URL}${page.heroImage}`],
      siteName: "Salon Elen",
      type: "website",
      locale: openGraphLocales[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [`${BASE_URL}${page.heroImage}`],
    },
  };
}

function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <SeoReveal className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-600 dark:text-amber-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-playfair text-3xl font-light tracking-tight text-gray-950 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {text ? (
        <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
          {text}
        </p>
      ) : null}
    </SeoReveal>
  );
}

function FactPill({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}

export default function CommercialLandingPage({
  page: basePage,
  locale,
}: {
  page: SeoLandingPageData;
  locale: SeoLocale;
}) {
  const page = localizeSeoLandingPage(basePage, locale);
  const t = templateCopy[locale] ?? templateCopy.de;
  const accent = categoryAccent[page.category];
  const CategoryIcon = categoryIcons[page.category];
  const related = getRelatedSeoLandingPages(basePage).map((item) =>
    localizeSeoLandingPage(item, locale),
  );

  return (
    <main className="overflow-hidden bg-white text-gray-950 dark:bg-[#09090d] dark:text-white">
      <SeoScrollProgress />
      <section className="relative isolate min-h-[76svh] overflow-hidden">
        <SeoHeroVisual>
          <Image
            src={page.heroImage}
            alt={page.heroImageAlt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </SeoHeroVisual>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/30" />

        <div className="relative z-10 mx-auto flex min-h-[76svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:px-8">
          <SeoReveal className="max-w-3xl" amount={0.4} initialVisible>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
              <CategoryIcon className="h-4 w-4" />
              {page.eyebrow}
            </div>
            <h1 className="font-playfair text-4xl font-light tracking-tight text-white sm:text-6xl lg:text-7xl">
              {page.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/86 sm:text-lg">
              {page.heroText}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <FactPill icon={BadgeEuro}>{page.price}</FactPill>
              <FactPill icon={Clock3}>{page.duration}</FactPill>
              <FactPill icon={MapPin}>Halle (Saale)</FactPill>
            </div>

            <div className="mt-5 grid max-w-2xl gap-2 sm:grid-cols-3">
              {page.facts.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-sm leading-6 text-white/82"
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-white" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={localeHref(page.bookingHref, locale)}
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r ${accent.button} px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-black/20 transition`}
              >
                {t.book}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={localeHref("/prices", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/12 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18"
              >
                {t.viewPrices}
              </Link>
            </div>
          </SeoReveal>
        </div>
      </section>

      <section className="border-b border-gray-200/70 bg-white py-12 dark:border-white/10 dark:bg-[#09090d] sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <SeoReveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-600 dark:text-amber-300">
              {t.whyEyebrow}
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-light tracking-tight sm:text-4xl">
              {t.whyTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              {t.whyText}
            </p>
          </SeoReveal>

          <SeoStagger className="grid gap-4 sm:grid-cols-2">
            {page.outcomes.map((item, index) => (
              <SeoStaggerItem key={item} className="h-full">
                <article
                  className={`h-full rounded-2xl border ${accent.border} ${accent.bg} p-5 transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200/30 dark:hover:shadow-black/30`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-900 shadow-sm dark:bg-white/10 dark:text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                      {item}
                    </p>
                  </div>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className={`${accent.band} py-14 sm:py-20`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t.suitableEyebrow}
            title={t.suitableTitle}
            text={t.suitableText}
          />
          <SeoStagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {page.suitableFor.map((item) => (
              <SeoStaggerItem key={item} className="h-full">
                <article className="h-full rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200/30 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-black/30">
                  <CheckCircle2 className={`mb-4 h-5 w-5 ${accent.text}`} />
                  <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {item}
                  </p>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-[#09090d] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t.processEyebrow}
            title={t.processTitle}
            text={t.processText}
          />
          <SeoStagger className="grid gap-4 lg:grid-cols-4">
            {page.process.map((step, index) => (
              <SeoStaggerItem key={step.title} className="h-full">
                <article className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-black/30">
                  <div
                    className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${accent.bg} ${accent.text}`}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold text-gray-950 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {step.text}
                  </p>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="border-y border-gray-200/70 bg-gray-950 py-14 text-white dark:border-white/10 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SeoReveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-300">
              {t.priceEyebrow}
            </p>
            <h2 className="mt-3 font-playfair text-4xl font-light tracking-tight">
              {page.price}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              {t.priceText(page.serviceName)}
            </p>
            <Link
              href={localeHref(page.bookingHref, locale)}
              className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r ${accent.button} px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition`}
            >
              {t.priceCta}
              <CalendarDays className="h-4 w-4" />
            </Link>
          </SeoReveal>

          <SeoStagger className="grid gap-4 sm:grid-cols-3">
            {page.priceDetails.map((item) => (
              <SeoStaggerItem key={item} className="h-full">
                <article className="h-full rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition duration-500 hover:-translate-y-1 hover:bg-white/[0.09]">
                  <BadgeEuro className="mb-4 h-5 w-5 text-amber-300" />
                  <p className="text-sm leading-6 text-white/82">{item}</p>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-[#09090d] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t.proofEyebrow}
            title={page.proof.title}
            text={page.proof.intro}
          />

          <SeoStagger className="grid gap-5 lg:grid-cols-2">
            {[
              {
                label: page.proof.beforeLabel,
                image: page.proof.beforeImage,
              },
              {
                label: page.proof.afterLabel,
                image: page.proof.afterImage,
              },
            ].map((item) => (
              <SeoStaggerItem key={item.label} className="h-full" direction="scale">
                <article className="group h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-black/30">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.image}
                      alt={`${page.title}: ${item.label}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-5">
                    <p className={`text-sm font-semibold ${accent.text}`}>{item.label}</p>
                  </div>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>

          <SeoReveal className="mx-auto mt-5 max-w-3xl text-center text-sm leading-6 text-gray-600 dark:text-gray-300" delay={0.08}>
            {page.proof.note}
          </SeoReveal>

          <SeoStagger className="mt-8 grid gap-4 md:grid-cols-3" delay={0.08}>
            {page.gallery.map((item, index) => (
              <SeoStaggerItem key={`${item.src}-${item.label}-${index}`} className="h-full" direction="scale">
                <article className="group h-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-black/30">
                  <div className="relative aspect-[5/4]">
                    {item.mediaType === "video" ? (
                      <video
                        aria-label={item.alt}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={item.poster}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      >
                        <source src={item.src} type="video/webm" />
                      </video>
                    ) : (
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                  </div>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className={`${accent.band} py-14 sm:py-20`}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SeoReveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-600 dark:text-amber-300">
              {t.contraindicationEyebrow}
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-light tracking-tight sm:text-4xl">
              {t.contraindicationTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              {t.contraindicationText}
            </p>
          </SeoReveal>

          <SeoStagger className="grid gap-3 sm:grid-cols-2">
            {page.contraindications.map((item) => (
              <SeoStaggerItem key={item}>
                <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 text-sm leading-6 text-gray-700 shadow-sm transition duration-500 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
                  <ShieldCheck className={`mt-0.5 h-4 w-4 shrink-0 ${accent.text}`} />
                  <span>{item}</span>
                </div>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="bg-white py-14 dark:bg-[#09090d] sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow={t.feedbackEyebrow}
            title={t.feedbackTitle}
            text={t.feedbackText}
          />
          <SeoStagger className="grid gap-4 md:grid-cols-3">
            {page.feedback.map((item) => (
              <SeoStaggerItem key={item} className="h-full">
                <article className="h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/70 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-black/30">
                  <MessageCircle className={`mb-4 h-5 w-5 ${accent.text}`} />
                  <p className="text-sm leading-7 text-gray-700 dark:text-gray-300">
                    {item}
                  </p>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className={`${accent.band} py-14 sm:py-20`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title={t.faqTitle} />
          <SeoStagger className="grid gap-4 md:grid-cols-2">
            {page.faq.map((item) => (
              <SeoStaggerItem key={item.question} className="h-full">
                <article className="h-full rounded-2xl border border-white/70 bg-white/88 p-6 shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200/30 dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-black/30">
                  <HelpCircle className={`mb-4 h-5 w-5 ${accent.text}`} />
                  <h3 className="text-base font-semibold text-gray-950 dark:text-white">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </p>
                </article>
              </SeoStaggerItem>
            ))}
          </SeoStagger>
        </div>
      </section>

      <section className="bg-gray-950 py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8">
          <SeoReveal direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-300">
              {t.nextEyebrow}
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-light tracking-tight sm:text-4xl">
              {t.nextTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
              {t.nextText}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={localeHref(page.bookingHref, locale)}
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r ${accent.button} px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition`}
              >
                {t.book}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={localeHref("/contacts", locale)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                {t.contact}
              </Link>
            </div>
          </SeoReveal>

          <SeoStagger className="grid gap-3">
            {related.map((item) => (
              <SeoStaggerItem key={item.slug}>
                <Link
                  href={localeHref(`/${item.slug}`, locale)}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition duration-500 hover:-translate-y-0.5 hover:bg-white/[0.1]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                        {t.relatedEyebrow}
                      </p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-white">
                        {item.title}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-amber-300 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              </SeoStaggerItem>
            ))}
            <SeoStaggerItem>
              <Link
                href={localeHref("/services", locale)}
                className="group block rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition duration-500 hover:-translate-y-0.5 hover:bg-white/[0.1]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      {t.overviewEyebrow}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-white">
                      {t.servicesOverview}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-amber-300 transition group-hover:translate-x-1" />
                </div>
              </Link>
            </SeoStaggerItem>
          </SeoStagger>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLd(basePage, locale) }}
      />
    </main>
  );
}

export function CommercialLandingRoute({
  page,
  locale,
}: {
  page: SeoLandingPageData;
  locale: SeoLocale;
}) {
  return <CommercialLandingPage page={page} locale={locale} />;
}

export async function generateCommercialLandingMetadata(
  page: SeoLandingPageData,
  { searchParams }: MetadataArgs,
) {
  return createCommercialLandingMetadata(page, searchParams);
}
