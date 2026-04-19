import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, MapPin, ShieldCheck } from "lucide-react";
import {
  BASE_URL,
  buildAlternates,
  resolveUrlLocale,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

export const dynamic = "force-dynamic";

const PATH = "/permanent-make-up-in-der-naehe";

const content = {
  de: {
    title: "Permanent Make-up in der Nähe",
    metaTitle: "Permanent Make-up in der Nähe von Halle (Saale) — Salon Elen",
    metaDescription:
      "Sie suchen Permanent Make-up in der Nähe? Salon Elen in Halle (Saale) bietet Powder Brows, Härchenzeichnung, Lippenpigmentierung und Wimpernkranzverdichtung in der Lessingstraße 37.",
    intro:
      "Salon Elen in Halle (Saale) ist auf natürliche PMU-Ergebnisse spezialisiert: Powder Brows, Härchenzeichnung, Lippenpigmentierung und Wimpernkranzverdichtung.",
    points: [
      "Lessingstraße 37, 06114 Halle (Saale)",
      "Beratung, Vorzeichnung, Pigmentierung, Aftercare",
      "Online-Terminbuchung rund um die Uhr",
    ],
    whyTitle: "Warum Salon Elen lokal passt",
    whyIntro:
      "Nicht nur nah, sondern bequem und nachvollziehbar: Sie sehen sofort, wo der Salon ist, worauf wir spezialisiert sind und wie Ihr PMU-Termin abläuft.",
    why: [
      "Fester Standort in Halle (Saale)",
      "Klare Spezialisierung auf Permanent Make-up",
      "Gut erreichbar für Halle und Umgebung",
      "Transparenter Ablauf vor und nach dem Termin",
    ],
    whyBenefit:
      "Sie sparen Zeit bei der Suche, bekommen einen klaren lokalen Ansprechpartner und landen direkt bei einer PMU-Seite statt auf einer allgemeinen Sammelseite.",
    processTitle: "So läuft der PMU-Termin ab",
    processIntro:
      "Damit Sie nicht im Unklaren bleiben, ist der Ablauf bewusst ruhig und nachvollziehbar aufgebaut. Sie wissen vor jedem Schritt, was als Nächstes passiert.",
    process: [
      {
        title: "Beratung",
        detail:
          "Wir besprechen Wunschform, Stil, Farbton und welche PMU-Technik am besten zu Ihrem Gesicht und Alltag passt.",
      },
      {
        title: "Vorzeichnung",
        detail:
          "Vor der Behandlung wird die Form vorgezeichnet, damit Sie Proportion und Richtung in Ruhe freigeben können.",
      },
      {
        title: "Pigmentierung",
        detail:
          "Erst nach Ihrer Zustimmung beginnt die präzise Pigmentierung unter hygienischen Standards und mit sauberer Schritt-für-Schritt-Arbeit.",
      },
      {
        title: "Aftercare & Nachbehandlung",
        detail:
          "Sie erhalten klare Pflegehinweise und einen realistischen Plan für Heilung, Kontrolle und mögliche Auffrischung.",
      },
    ],
    processNote:
      "Sie starten nicht blind in die Behandlung: Form, Richtung und Stil werden vorab abgestimmt. Genau das gibt vielen Kundinnen Sicherheit.",
    faqTitle: "Häufige Fragen",
    faq: [
      {
        q: "Bieten Sie Permanent Make-up in Halle (Saale) an?",
        a: "Ja. Unser Salon befindet sich in der Lessingstraße 37 in Halle (Saale).",
      },
      {
        q: "Welche PMU-Techniken führen Sie durch?",
        a: "Powder Brows, Härchenzeichnung, Lippenpigmentierung und Wimpernkranzverdichtung.",
      },
      {
        q: "Kann ich Preise vorher sehen?",
        a: "Ja. Auf der Preiseseite finden Sie aktuelle Leistungen und Preisangaben.",
      },
    ],
    relatedTitle: "Weiterführende Seiten",
    booking: "PMU-Termin buchen",
    contact: "Kontakt & Standort",
    prices: "Preise ansehen",
  },
  en: {
    title: "Permanent make-up near you",
    metaTitle: "Permanent make-up near Halle (Saale) — Salon Elen",
    metaDescription:
      "Looking for permanent make-up near you in Halle (Saale)? Salon Elen offers powder brows, hairstroke brows, lip pigmentation and lashline enhancement at Lessingstrasse 37.",
    intro:
      "Salon Elen in Halle (Saale) focuses on natural PMU results: powder brows, hairstroke brows, lip pigmentation and lashline enhancement.",
    points: [
      "Lessingstrasse 37, 06114 Halle (Saale)",
      "Consultation, pre-draw, treatment, aftercare",
      "Online booking available 24/7",
    ],
    whyTitle: "Why this page is locally relevant",
    whyIntro:
      "Not just nearby, but clear and convenient: you can immediately see where the salon is, what we specialize in and how your PMU appointment works.",
    why: [
      "Real salon in Halle (Saale)",
      "Clear focus on permanent make-up",
      "Easy to reach from Halle and nearby areas",
      "Clear process before and after treatment",
    ],
    whyBenefit:
      "You save time, get a clear local contact point and land on a focused PMU page instead of a generic beauty overview.",
    processTitle: "How your PMU appointment works",
    processIntro:
      "The process is designed to feel calm and transparent. Before each step, you know what comes next and what will be decided together.",
    process: [
      {
        title: "Consultation",
        detail:
          "We discuss shape, style, pigment tone and which PMU technique fits your face, skin and everyday routine best.",
      },
      {
        title: "Pre-draw",
        detail:
          "The shape is mapped first so you can review proportions and direction before the treatment begins.",
      },
      {
        title: "Pigmentation",
        detail:
          "Only after your approval do we start the precise pigmentation under hygienic standards and a clear step-by-step workflow.",
      },
      {
        title: "Aftercare & touch-up",
        detail:
          "You receive practical aftercare guidance and a realistic plan for healing, review and possible refresh or touch-up.",
      },
    ],
    processNote:
      "You do not go into treatment blind: shape and style are agreed beforehand. That alone makes the appointment feel much more relaxed.",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Do you offer permanent make-up in Halle (Saale)?",
        a: "Yes. Our salon is located at Lessingstrasse 37 in Halle (Saale).",
      },
      {
        q: "Which PMU techniques do you offer?",
        a: "Powder brows, hairstroke brows, lip pigmentation and lashline enhancement.",
      },
      {
        q: "Can I see prices before booking?",
        a: "Yes. Our prices page lists current PMU services and pricing.",
      },
    ],
    relatedTitle: "Related pages",
    booking: "Book PMU now",
    contact: "Contact & location",
    prices: "View prices",
  },
  ru: {
    title: "Permanent make-up рядом",
    metaTitle: "Permanent make-up рядом в Halle (Saale) — Salon Elen",
    metaDescription:
      "Ищете permanent make-up рядом в Halle (Saale)? Salon Elen предлагает Powder Brows, волосковую технику, пигментацию губ и межресничку по адресу Lessingstraße 37.",
    intro:
      "Salon Elen в Halle (Saale) специализируется на естественных PMU-результатах: Powder Brows, волосковая техника, пигментация губ и межресничка.",
    points: [
      "Lessingstraße 37, 06114 Halle (Saale)",
      "Консультация, эскиз, процедура, aftercare",
      "Онлайн-запись доступна 24/7",
    ],
    whyTitle: "Почему страница локально релевантна",
    whyIntro:
      "Не просто рядом, а удобно и понятно: здесь сразу видно, где находится салон, на чём он специализируется и как проходит PMU-процедура.",
    why: [
      "Реальный салон в Halle (Saale)",
      "Фокус именно на permanent make-up",
      "Удобно для Halle и окрестностей",
      "Понятный процесс до и после процедуры",
    ],
    whyBenefit:
      "Клиенту не нужно блуждать по общим разделам: здесь сразу есть локальный ориентир, специализация салона и понятный следующий шаг к записи.",
    processTitle: "Как проходит PMU-процедура",
    processIntro:
      "Процесс выстроен спокойно и прозрачно. До каждого этапа клиент понимает, что будет происходить дальше и что согласовывается заранее.",
    process: [
      {
        title: "Консультация",
        detail:
          "Мы обсуждаем форму, стиль, оттенок и подбираем PMU-технику под черты лица, кожу и ваш повседневный образ.",
      },
      {
        title: "Предварительная разметка",
        detail:
          "До процедуры делается эскиз формы, чтобы вы спокойно увидели пропорции и утвердили направление работы.",
      },
      {
        title: "Пигментация",
        detail:
          "Только после согласования начинается аккуратная пигментация с соблюдением гигиены и понятным пошаговым процессом.",
      },
      {
        title: "Уход и коррекция",
        detail:
          "Вы получаете чёткие рекомендации по уходу, понимание периода заживления и план по контролю или коррекции.",
      },
    ],
    processNote:
      "Клиент не идёт в процедуру вслепую: форма и стиль согласовываются заранее. Именно это даёт ощущение спокойствия перед началом.",
    faqTitle: "Частые вопросы",
    faq: [
      {
        q: "Вы делаете permanent make-up в Halle (Saale)?",
        a: "Да. Наш салон находится на Lessingstraße 37 в Halle (Saale).",
      },
      {
        q: "Какие PMU-техники вы предлагаете?",
        a: "Powder Brows, волосковая техника, пигментация губ и межресничка.",
      },
      {
        q: "Можно ли посмотреть цены заранее?",
        a: "Да. На странице цен указаны актуальные услуги и цены.",
      },
    ],
    relatedTitle: "Полезные страницы",
    booking: "Записаться на PMU",
    contact: "Контакты и адрес",
    prices: "Смотреть цены",
  },
} satisfies Record<SeoLocale, {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  points: string[];
  whyTitle: string;
  whyIntro: string;
  why: string[];
  whyBenefit: string;
  processTitle: string;
  processIntro: string;
  process: Array<{ title: string; detail: string }>;
  processNote: string;
  faqTitle: string;
  faq: Array<{ q: string; a: string }>;
  relatedTitle: string;
  booking: string;
  contact: string;
  prices: string;
}>;

const treatmentNames: Record<SeoLocale, string[]> = {
  de: ["Powder Brows", "Härchenzeichnung", "Lippenpigmentierung", "Wimpernkranzverdichtung"],
  en: ["Powder Brows", "Hairstroke Brows", "Lip Pigmentation", "Lashline Enhancement"],
  ru: ["Powder Brows", "Волосковая техника", "Пигментация губ", "Межресничка"],
};

const whySectionMeta = {
  de: {
    badge: "Lokal in Halle (Saale)",
    noteTitle: "Was das für Sie praktisch bedeutet",
  },
  en: {
    badge: "Local in Halle (Saale)",
    noteTitle: "What that means in practice",
  },
  ru: {
    badge: "Локально в Halle (Saale)",
    noteTitle: "Что это даёт клиенту на практике",
  },
} satisfies Record<SeoLocale, { badge: string; noteTitle: string }>;

const processSectionMeta = {
  de: {
    badge: "Ihr Ablauf",
    noteTitle: "Sicherheit vor dem Start",
    stepLabel: "Schritt",
  },
  en: {
    badge: "Your journey",
    noteTitle: "Confidence before treatment",
    stepLabel: "Step",
  },
  ru: {
    badge: "Ваш сценарий",
    noteTitle: "Спокойствие до начала",
    stepLabel: "Шаг",
  },
} satisfies Record<SeoLocale, { badge: string; noteTitle: string; stepLabel: string }>;

const whyCardStyles = [
  {
    icon: MapPin,
    iconWrap: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    ring: "border-rose-200/70 dark:border-rose-500/20",
  },
  {
    icon: ShieldCheck,
    iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    ring: "border-emerald-200/70 dark:border-emerald-500/20",
  },
  {
    icon: CheckCircle2,
    iconWrap: "bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
    ring: "border-sky-200/70 dark:border-sky-500/20",
  },
  {
    icon: Clock3,
    iconWrap: "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    ring: "border-amber-200/70 dark:border-amber-500/20",
  },
] as const;

function localeHref(path: string, locale: SeoLocale) {
  return locale === "de" ? path : `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

function buildJsonLd(locale: SeoLocale) {
  const page = content[locale];
  const alts = buildAlternates(PATH, locale);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["BeautySalon", "LocalBusiness"],
        name: "Salon Elen",
        url: alts.canonical,
        telephone: "+49 177 899 51 06",
        email: "elen69@web.de",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Lessingstraße 37",
          postalCode: "06114",
          addressLocality: "Halle (Saale)",
          addressCountry: "DE",
        },
        areaServed: ["Halle (Saale)", "Saalekreis"],
        knowsAbout: treatmentNames[locale],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const page = content[locale];
  const alts = buildAlternates(PATH, locale);

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: alts,
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: alts.canonical,
      images: [`${BASE_URL}/images/hero.webp`],
      siteName: "Salon Elen",
      type: "website",
      locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [`${BASE_URL}/images/hero.webp`],
    },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  const page = content[locale];

  return (
    <main className="bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-[#0b0b10] dark:via-[#0d0d14] dark:to-[#0a0a10]">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-rose-200/40 bg-white/85 p-6 shadow-lg shadow-rose-100/20 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:p-8">
          <h1 className="font-playfair text-4xl font-light tracking-tight text-gray-950 dark:text-white sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-700 dark:text-gray-300">{page.intro}</p>
          <ul className="mt-6 space-y-3">
            {page.points.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-500 dark:text-amber-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={localeHref("/booking", locale)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200/30 dark:from-amber-600 dark:to-amber-500 dark:text-gray-950 dark:shadow-amber-500/10">
              {page.booking}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={localeHref("/contacts", locale)} className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/80 px-6 py-3 text-sm font-semibold text-rose-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
              {page.contact}
            </Link>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-rose-200/40 shadow-lg shadow-rose-100/20 dark:border-white/10 dark:shadow-none">
          <Image src="/images/hero.webp" alt={page.metaTitle} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-sm text-white sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 backdrop-blur">
              <MapPin className="h-4 w-4" />
              Halle (Saale)
            </div>
            <div className="mt-3 font-semibold">Salon Elen • Lessingstraße 37</div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 pt-2 sm:pb-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/40 bg-white/80 p-6 shadow-md shadow-rose-100/10 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.08),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.08),transparent_40%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <MapPin className="h-3.5 w-3.5" />
              {whySectionMeta[locale].badge}
            </div>

            <h2 className="mt-5 font-playfair text-3xl font-light tracking-tight text-gray-950 dark:text-white">
              {page.whyTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-700 dark:text-gray-300 sm:text-base">
              {page.whyIntro}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {treatmentNames[locale].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-rose-200/60 bg-white/85 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {page.why.map((item, index) => {
                const style = whyCardStyles[index];
                const Icon = style.icon;

                return (
                  <article
                    key={item}
                    className={`group rounded-2xl border bg-white/85 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.03] ${style.ring}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconWrap}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 dark:text-gray-500">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-700 dark:text-gray-300">
                      {item}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50 via-white to-amber-50/70 p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500 dark:text-amber-300">
                    {whySectionMeta[locale].noteTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:text-base">
                    {page.whyBenefit}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={localeHref("/booking", locale)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/30 dark:from-amber-600 dark:to-amber-500 dark:text-gray-950 dark:shadow-amber-500/10"
                  >
                    {page.booking}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={localeHref("/contacts", locale)}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/85 px-5 py-2.5 text-sm font-semibold text-rose-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  >
                    {page.contact}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-rose-200/40 bg-white/80 p-6 shadow-md shadow-rose-100/10 dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(244,114,182,0.08),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.07),transparent_42%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <Clock3 className="h-3.5 w-3.5" />
              {processSectionMeta[locale].badge}
            </div>

            <h2 className="mt-5 font-playfair text-3xl font-light tracking-tight text-gray-950 dark:text-white">
              {page.processTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-700 dark:text-gray-300 sm:text-base">
              {page.processIntro}
            </p>

            <div className="mt-8 space-y-4">
              {page.process.map((item, index) => (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-rose-100/70 bg-white/85 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {index + 1}
                      </div>
                      {index < page.process.length - 1 && (
                        <div className="mt-2 h-10 w-px bg-gradient-to-b from-rose-200 to-transparent dark:from-amber-500/30" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                        {processSectionMeta[locale].stepLabel} {index + 1}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-gray-950 dark:text-white sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-rose-200/60 bg-gradient-to-r from-white via-rose-50/60 to-amber-50/70 p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500 dark:text-amber-300">
                    {processSectionMeta[locale].noteTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300 sm:text-base">
                    {page.processNote}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={localeHref("/prices", locale)} className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white px-5 py-2.5 text-sm font-semibold text-rose-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                    {page.prices}
                  </Link>
                  <Link
                    href={localeHref("/booking", locale)}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/30 dark:from-amber-600 dark:to-amber-500 dark:text-gray-950 dark:shadow-amber-500/10"
                  >
                    {page.booking}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-2 sm:pb-10">
        <div className="rounded-3xl border border-rose-200/40 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
          <h2 className="font-playfair text-3xl font-light tracking-tight text-gray-950 dark:text-white">{page.relatedTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: treatmentNames[locale][0], href: "/news/powder-brows-in-halle-saale-natuerliche-pmu-augenbrauen-im-salon-elen" },
              { label: treatmentNames[locale][1], href: "/news/haerchenzeichnung-in-halle-saale-natuerliche-augenbrauen-im-salon-elen" },
              { label: "PMU Overview", href: "/news/permanent-make-up-in-halle-saale-powder-brows-lippenpigmentierung-wimpernkranzverdichtung-natuerlich" },
              { label: page.prices, href: "/prices" },
            ].map((item) => (
              <Link key={item.href} href={localeHref(item.href, locale)} className="group rounded-2xl border border-rose-100/70 bg-rose-50/40 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">{item.label}</div>
                  <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-rose-500 transition-transform group-hover:translate-x-1 dark:text-amber-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-2 sm:pb-20 sm:pt-4">
        <div className="rounded-3xl border border-rose-200/40 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
          <h2 className="font-playfair text-3xl font-light tracking-tight text-gray-950 dark:text-white">{page.faqTitle}</h2>
          <div className="mt-6 space-y-4">
            {page.faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-rose-100/60 bg-rose-50/50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <h3 className="text-base font-semibold text-gray-950 dark:text-white">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: buildJsonLd(locale) }} />
    </main>
  );
}
