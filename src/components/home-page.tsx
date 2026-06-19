"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gem,
  Heart,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import RainbowCTA from "@/components/RainbowCTA";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/locales";
import styles from "./home-page.module.css";

type KnownType = "ARTICLE" | "NEWS" | "PROMO";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  type: KnownType;
};

type Props = {
  latest: ArticleItem[];
};

const MOBILE_HERO_COPY: Record<
  Locale,
  {
    tag: string;
    title: string;
    accent: string;
    description: string;
    services: string;
    badge: string;
  }
> = {
  de: {
    tag: "Willkommen bei Salon Elen",
    title: "Schönheit",
    accent: "die begeistert",
    description:
      "Professionelle Kosmetik, Permanent Make-up, Hairstroke Augenbrauen und mehr — im Herzen von Halle an der Saale.",
    services: "Alle Leistungen",
    badge: "Online-Termin 24/7",
  },
  en: {
    tag: "Welcome to Salon Elen",
    title: "Beauty",
    accent: "that inspires",
    description:
      "Professional cosmetics, permanent make-up, Hairstroke Brows and more — in the heart of Halle an der Saale.",
    services: "All services",
    badge: "Online booking 24/7",
  },
  ru: {
    tag: "Добро пожаловать в Salon Elen",
    title: "Красота,",
    accent: "которая вдохновляет",
    description:
      "Профессиональная косметология, перманентный макияж, волосковая техника бровей и многое другое — в центре Галле.",
    services: "Все услуги",
    badge: "Онлайн-запись 24/7",
  },
};

type HomeCopy = {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  book: string;
  discover: string;
  openDaily: string;
  locationShort: string;
  stats: Array<{ value: string; label: string }>;
  servicesEyebrow: string;
  servicesTitle: string;
  servicesDescription: string;
  serviceCta: string;
  services: Array<{ title: string; description: string }>;
  signatureEyebrow: string;
  signatureTitle: string;
  signatureDescription: string;
  reasons: Array<{ title: string; description: string }>;
  galleryEyebrow: string;
  galleryTitle: string;
  galleryDescription: string;
  galleryCta: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviews: Array<{ quote: string; author: string }>;
  newsEyebrow: string;
  newsTitle: string;
  newsCta: string;
  newsEmpty: string;
  newsTypes: Record<KnownType, string>;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaDescription: string;
  contactEyebrow: string;
  contactTitle: string;
  address: string;
  hours: string;
  phone: string;
  route: string;
};

const COPY: Record<Locale, HomeCopy> = {
  de: {
    eyebrow: "Beauty Studio in Halle (Saale)",
    heroTitle: "Salon Elen",
    heroSubtitle: "Ihre Schönheit. Ihre Handschrift.",
    heroDescription:
      "Permanent Make-up, Wimpern, Hairstroke Augenbrauen und moderne Kosmetik in einer Atmosphäre, die Ruhe und Präzision verbindet.",
    book: "Termin buchen",
    discover: "Leistungen entdecken",
    openDaily: "Online buchbar, rund um die Uhr",
    locationShort: "Lessingstraße 37, Halle",
    stats: [
      { value: "8+", label: "Jahre Erfahrung" },
      { value: "2.500+", label: "zufriedene Kundinnen" },
      { value: "50+", label: "Beauty-Leistungen" },
      { value: "4,9", label: "durchschnittliche Bewertung" },
    ],
    servicesEyebrow: "Unsere Expertise",
    servicesTitle: "Behandlungen, die Ihre Persönlichkeit unterstreichen",
    servicesDescription:
      "Präzise Techniken, hochwertige Produkte und Ergebnisse, die zu Ihrem Gesicht, Ihrem Stil und Ihrem Alltag passen.",
    serviceCta: "Mehr erfahren",
    services: [
      {
        title: "Permanent Make-up",
        description: "Augenbrauen, Lippen und Lidstrich mit harmonischer Form und natürlicher Farbwirkung.",
      },
      {
        title: "Wimpernverlängerung",
        description: "Individuelle Looks von natürlich bis ausdrucksstark, passend zu Augenform und Stil.",
      },
      {
        title: "Hairstroke Augenbrauen",
        description: "Fein gezeichnete Härchen für natürlich vollere, klar geformte und dauerhaft gepflegte Augenbrauen.",
      },
      {
        title: "Microneedling",
        description: "Gezielte Hautpflege für ein ebenmäßigeres, frisches und sichtbar vitales Hautbild.",
      },
    ],
    signatureEyebrow: "Salon Elen Standard",
    signatureTitle: "Schönheit beginnt mit Vertrauen",
    signatureDescription:
      "Jede Behandlung startet mit einer ehrlichen Beratung. Wir nehmen uns Zeit, erklären jeden Schritt und entwickeln ein Ergebnis, das nicht aufgesetzt wirkt, sondern selbstverständlich zu Ihnen gehört.",
    reasons: [
      {
        title: "Zertifizierte Expertise",
        description: "Erfahrung, regelmäßige Weiterbildung und sichere Behandlungstechniken.",
      },
      {
        title: "Premium-Materialien",
        description: "Ausgewählte Pigmente, Produkte und Einwegmaterialien in geprüfter Qualität.",
      },
      {
        title: "Hygiene ohne Kompromisse",
        description: "Klare Abläufe und hohe Standards für ein sicheres, ruhiges Behandlungserlebnis.",
      },
      {
        title: "Individuelle Ästhetik",
        description: "Keine Schablonen: Form, Farbe und Intensität werden persönlich abgestimmt.",
      },
    ],
    galleryEyebrow: "Echte Ergebnisse",
    galleryTitle: "Arbeiten, die für sich sprechen",
    galleryDescription:
      "Einblicke in Permanent Make-up, Hairstroke Augenbrauen, Wimpern und kosmetische Behandlungen aus unserem Studio.",
    galleryCta: "Zur Galerie",
    reviewsEyebrow: "Kundenstimmen",
    reviewsTitle: "Wie sich ein Besuch bei uns anfühlt",
    reviews: [
      {
        quote:
          "Mein Permanent Make-up wirkt so natürlich, dass ich jeden Morgen Zeit spare und mich trotzdem wie ich selbst fühle.",
        author: "Anna M.",
      },
      {
        quote:
          "Sehr saubere Arbeit, ruhige Beratung und ein Ergebnis, das genau zu meinen Vorstellungen passt.",
        author: "Maria K.",
      },
      {
        quote:
          "Die Wimpern sehen leicht und elegant aus. Man merkt sofort, wie viel Erfahrung hinter der Arbeit steckt.",
        author: "Sophie L.",
      },
    ],
    newsEyebrow: "Journal",
    newsTitle: "Pflege, Trends und Neuigkeiten",
    newsCta: "Alle Beiträge",
    newsEmpty: "Neue Beiträge erscheinen in Kürze.",
    newsTypes: {
      ARTICLE: "Ratgeber",
      NEWS: "Neuigkeit",
      PROMO: "Aktion",
    },
    ctaEyebrow: "Zeit für Sie",
    ctaTitle: "Bereit für Ihren nächsten Beauty-Moment?",
    ctaDescription:
      "Wählen Sie Ihre Behandlung, Ihren Wunschtermin und buchen Sie bequem online.",
    contactEyebrow: "Besuchen Sie uns",
    contactTitle: "Salon Elen im Herzen von Halle",
    address: "Lessingstraße 37, 06114 Halle (Saale)",
    hours: "Mo–Fr 10:00–19:00 · Sa 10:00–16:00",
    phone: "+49 177 899 51 06",
    route: "Route öffnen",
  },
  en: {
    eyebrow: "Beauty studio in Halle (Saale)",
    heroTitle: "Salon Elen",
    heroSubtitle: "Your beauty. Your signature.",
    heroDescription:
      "Permanent make-up, lashes, Hairstroke Brows and modern cosmetics in an atmosphere shaped by calm and precision.",
    book: "Book appointment",
    discover: "Explore services",
    openDaily: "Online booking, around the clock",
    locationShort: "Lessingstrasse 37, Halle",
    stats: [
      { value: "8+", label: "years of experience" },
      { value: "2,500+", label: "happy clients" },
      { value: "50+", label: "beauty services" },
      { value: "4.9", label: "average rating" },
    ],
    servicesEyebrow: "Our expertise",
    servicesTitle: "Treatments that enhance your personality",
    servicesDescription:
      "Precise techniques, premium products and results tailored to your face, style and everyday life.",
    serviceCta: "Learn more",
    services: [
      {
        title: "Permanent Make-up",
        description: "Brows, lips and eyeliner with harmonious shape and natural-looking colour.",
      },
      {
        title: "Lash Extensions",
        description: "Personalised looks from subtle to expressive, designed for your eye shape.",
      },
      {
        title: "Hairstroke Brows",
        description: "Fine hair-like strokes for naturally fuller, carefully shaped and long-lasting brows.",
      },
      {
        title: "Microneedling",
        description: "Focused skin care for a smoother, fresher and visibly revitalised complexion.",
      },
    ],
    signatureEyebrow: "The Salon Elen standard",
    signatureTitle: "Beauty starts with trust",
    signatureDescription:
      "Every treatment begins with honest consultation. We take our time, explain each step and create a result that feels naturally yours.",
    reasons: [
      {
        title: "Certified expertise",
        description: "Experience, ongoing education and reliable treatment techniques.",
      },
      {
        title: "Premium materials",
        description: "Selected pigments, products and disposables with verified quality.",
      },
      {
        title: "Hygiene without compromise",
        description: "Clear processes and high standards for a safe, calm experience.",
      },
      {
        title: "Personal aesthetics",
        description: "No templates: shape, colour and intensity are tailored to you.",
      },
    ],
    galleryEyebrow: "Real results",
    galleryTitle: "Work that speaks for itself",
    galleryDescription:
      "A closer look at permanent make-up, Hairstroke Brows, lashes and cosmetic treatments from our studio.",
    galleryCta: "View gallery",
    reviewsEyebrow: "Client stories",
    reviewsTitle: "How a visit with us feels",
    reviews: [
      {
        quote:
          "My permanent make-up looks so natural. I save time every morning and still feel completely like myself.",
        author: "Anna M.",
      },
      {
        quote:
          "Immaculate work, calm consultation and a result that matches exactly what I wanted.",
        author: "Maria K.",
      },
      {
        quote:
          "The lashes look light and elegant. You immediately notice the experience behind the work.",
        author: "Sophie L.",
      },
    ],
    newsEyebrow: "Journal",
    newsTitle: "Care, trends and studio news",
    newsCta: "All articles",
    newsEmpty: "New articles are coming soon.",
    newsTypes: {
      ARTICLE: "Guide",
      NEWS: "News",
      PROMO: "Offer",
    },
    ctaEyebrow: "Time for you",
    ctaTitle: "Ready for your next beauty moment?",
    ctaDescription:
      "Choose your treatment and preferred time, then book online in just a few steps.",
    contactEyebrow: "Visit us",
    contactTitle: "Salon Elen in the heart of Halle",
    address: "Lessingstrasse 37, 06114 Halle (Saale)",
    hours: "Mon–Fri 10:00–19:00 · Sat 10:00–16:00",
    phone: "+49 177 899 51 06",
    route: "Open directions",
  },
  ru: {
    eyebrow: "Бьюти-студия в Галле",
    heroTitle: "Salon Elen",
    heroSubtitle: "Ваша красота. Ваш почерк.",
    heroDescription:
      "Перманентный макияж, ресницы, волосковая техника бровей и современная косметология в атмосфере спокойствия и точности.",
    book: "Записаться",
    discover: "Смотреть услуги",
    openDaily: "Онлайн-запись круглосуточно",
    locationShort: "Lessingstraße 37, Halle",
    stats: [
      { value: "8+", label: "лет опыта" },
      { value: "2 500+", label: "довольных клиентов" },
      { value: "50+", label: "бьюти-услуг" },
      { value: "4,9", label: "средняя оценка" },
    ],
    servicesEyebrow: "Наша экспертиза",
    servicesTitle: "Процедуры, которые подчеркивают вашу индивидуальность",
    servicesDescription:
      "Точные техники, качественные материалы и результат, подходящий вашему лицу, стилю и образу жизни.",
    serviceCta: "Подробнее",
    services: [
      {
        title: "Перманентный макияж",
        description: "Брови, губы и межресничная линия с гармоничной формой и естественным цветом.",
      },
      {
        title: "Наращивание ресниц",
        description: "Индивидуальный эффект от натурального до выразительного с учетом формы глаз.",
      },
      {
        title: "Hairstroke брови",
        description: "Тонкие прорисованные волоски для естественно густых, аккуратно оформленных и выразительных бровей.",
      },
      {
        title: "Микронидлинг",
        description: "Направленный уход для более ровной, свежей и визуально обновленной кожи.",
      },
    ],
    signatureEyebrow: "Стандарт Salon Elen",
    signatureTitle: "Красота начинается с доверия",
    signatureDescription:
      "Каждая процедура начинается с честной консультации. Мы спокойно объясняем этапы и создаем результат, который выглядит естественной частью вашего образа.",
    reasons: [
      {
        title: "Сертифицированный опыт",
        description: "Практика, постоянное обучение и безопасные техники работы.",
      },
      {
        title: "Премиальные материалы",
        description: "Проверенные пигменты, продукты и одноразовые расходные материалы.",
      },
      {
        title: "Гигиена без компромиссов",
        description: "Четкие процессы и высокие стандарты для спокойной и безопасной процедуры.",
      },
      {
        title: "Персональная эстетика",
        description: "Без шаблонов: форма, цвет и интенсивность подбираются индивидуально.",
      },
    ],
    galleryEyebrow: "Реальные результаты",
    galleryTitle: "Работы, которые говорят сами за себя",
    galleryDescription:
      "Перманентный макияж, Hairstroke брови, ресницы и косметологические процедуры из нашего салона.",
    galleryCta: "Открыть галерею",
    reviewsEyebrow: "Отзывы клиентов",
    reviewsTitle: "Каким запоминается визит к нам",
    reviews: [
      {
        quote:
          "Перманентный макияж выглядит настолько естественно, что утром я экономлю время и остаюсь собой.",
        author: "Анна М.",
      },
      {
        quote:
          "Очень аккуратная работа, спокойная консультация и результат точно по моему запросу.",
        author: "Мария К.",
      },
      {
        quote:
          "Ресницы получились легкими и элегантными. Сразу чувствуется большой опыт мастера.",
        author: "Софи Л.",
      },
    ],
    newsEyebrow: "Журнал",
    newsTitle: "Уход, тренды и новости салона",
    newsCta: "Все публикации",
    newsEmpty: "Новые публикации скоро появятся.",
    newsTypes: {
      ARTICLE: "Полезное",
      NEWS: "Новости",
      PROMO: "Акция",
    },
    ctaEyebrow: "Время для себя",
    ctaTitle: "Готовы к своему следующему бьюти-моменту?",
    ctaDescription:
      "Выберите процедуру и удобное время, а затем запишитесь онлайн за несколько шагов.",
    contactEyebrow: "Приходите к нам",
    contactTitle: "Salon Elen в центре Галле",
    address: "Lessingstraße 37, 06114 Halle (Saale)",
    hours: "Пн–Пт 10:00–19:00 · Сб 10:00–16:00",
    phone: "+49 177 899 51 06",
    route: "Открыть маршрут",
  },
};

const SERVICE_IMAGES = [
  "/images/gallery/beauty_8.webp",
  "/images/gallery/beauty_3.webp",
  "/images/gallery/brow_2.webp",
  "/images/gallery/injection_1.webp",
];

const SERVICE_HREFS = [
  "/permanent-make-up-in-der-naehe",
  "/services",
  "/microblading-halle",
  "/microneedling-halle",
];

const GALLERY_IMAGES = [
  { src: "/images/gallery/pmu_2.webp", className: "md:col-span-7 md:row-span-2" },
  { src: "/images/gallery/beauty_3.webp", className: "md:col-span-5" },
  { src: "/images/seo-pages/Permanent_Make-up_Brows_1.webp", className: "md:col-span-5" },
  { src: "/images/gallery/brow_1.webp", className: "md:col-span-4" },
  { src: "/images/gallery/beauty_7.webp", className: "md:col-span-4" },
  { src: "/images/gallery/injection_2.webp", className: "md:col-span-4" },
];

const REASON_ICONS = [Award, Gem, ShieldCheck, Heart];

function localeHref(path: string, locale: Locale): string {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] ${
          light ? "text-[#f0cfd4]" : "text-[#9c5965]"
        }`}
      >
        <span
          className={`h-px w-9 shrink-0 ${
            light ? "bg-[#f0cfd4]/65" : "bg-[#9c5965]/65"
          }`}
        />
        {eyebrow}
      </p>
      <h2
        className={`font-playfair text-3xl font-medium leading-[1.08] sm:text-4xl md:text-5xl ${
          light ? "text-white" : "text-[#38272d]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${
            light ? "text-white/72" : "text-[#765f66]"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function HomePage({ latest }: Props) {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const mobileHero = MOBILE_HERO_COPY[locale];
  const reduceMotion = useReducedMotion();

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.1,
        delayChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };
  const staggerItem = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.62, ease: "easeOut" as const },
    },
  };

  return (
    <main className="overflow-hidden bg-[#f8f2f2] text-[#38272d] dark:bg-[#1b1518] dark:text-[#f8eeee]">
      <section className="relative flex min-h-[100svh] items-end overflow-hidden md:hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-mobile.webp"
            alt="Salon Elen"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 0px"
            className="object-cover object-[50%_30%]"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover object-[50%_30%] animate-[fadeIn_1s_ease_0.5s_both]"
          >
            <source src="/images/hero-video.webm" type="video/webm" />
          </video>
        </div>

        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-white/90 via-white/30 to-transparent" />

        <div className="relative z-10 w-full px-5 pb-10 pt-[60svh] sm:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-50/60 px-3 py-1 text-[11px] font-medium tracking-wide text-rose-700 backdrop-blur-sm"
          >
            <Sparkles className="h-3 w-3 text-rose-500" />
            {mobileHero.tag}
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="font-playfair text-[clamp(34px,8vw,80px)] font-light leading-[0.95] tracking-tight text-gray-900"
          >
            {mobileHero.title}
            <br />
            <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              {mobileHero.accent}
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-3 line-clamp-2 max-w-lg font-cormorant text-sm leading-relaxed tracking-wide text-gray-600"
          >
            {mobileHero.description}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-5 flex flex-wrap gap-3"
          >
            <RainbowCTA
              href={localeHref("/booking", locale)}
              label={copy.book}
              className="h-11 px-6 text-sm"
              idle
            />
            <Link
              href={localeHref("/services", locale)}
              className="group inline-flex h-11 items-center gap-2 rounded-full border border-rose-300/50 px-5 text-sm font-medium text-rose-700 transition-all duration-300 hover:bg-rose-50"
            >
              {mobileHero.services}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-4 flex items-center gap-2 text-xs text-gray-400"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {mobileHero.badge}
          </motion.div>
        </div>
      </section>

      <section className="relative hidden min-h-[82svh] overflow-hidden md:block">
        <motion.div
          initial={reduceMotion ? false : { scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className={`absolute inset-0 ${styles.heroImage}`}
        >
          <Image
            src="/images/hero.webp"
            alt="Salon Elen Beauty Studio"
            fill
            priority
            sizes="(max-width: 767px) 0px, 100vw"
            className="object-cover object-center"
          />
        </motion.div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(40,25,31,0.94)_0%,rgba(67,39,49,0.79)_38%,rgba(117,74,84,0.3)_70%,rgba(117,74,84,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(39,24,29,0.1)_45%,rgba(39,24,29,0.72)_100%)]" />
        <div className={styles.heroSweep} />
        <div className={styles.heroGrain} />

        <div className="relative mx-auto flex min-h-[82svh] max-w-7xl items-center px-8 py-20 lg:px-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -34 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#f0cfd4]">
              <span className="h-px w-10 bg-[#f0cfd4]/70" />
              {copy.eyebrow}
            </p>
            <h1 className="font-playfair text-8xl font-medium leading-[0.9] text-white lg:text-9xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 font-cormorant text-3xl font-medium text-[#f7e6e8]">
              {copy.heroSubtitle}
            </p>
            <p className="mt-5 max-w-xl text-lg leading-7 text-white/75">
              {copy.heroDescription}
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href={localeHref("/booking", locale)}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#d99aa5] px-6 text-sm font-semibold text-[#2f2025] shadow-[0_14px_36px_rgba(20,9,13,0.25)] transition hover:bg-[#efc1c8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${styles.primaryCta}`}
              >
                <CalendarDays className="h-4 w-4" />
                {copy.book}
              </Link>
              <Link
                href={localeHref("/services", locale)}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/35 bg-white/8 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${styles.secondaryCta}`}
              >
                {copy.discover}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/68">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#e6b5bd]" />
                {copy.openDaily}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#e6b5bd]" />
                {copy.locationShort}
              </span>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.72 }}
              className="mt-7 flex items-center gap-5 border-t border-white/14 pt-5 text-xs text-white/72"
            >
              <span className="inline-flex items-center gap-2">
                <span className="flex gap-0.5 text-[#efbdc5]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </span>
                <strong className="font-semibold text-white">{copy.stats[3].value}</strong>
              </span>
              <span className="inline-flex items-center gap-2 border-l border-white/16 pl-5">
                <CheckCircle2 className="h-4 w-4 text-[#efbdc5]" />
                {copy.reasons[0].title}
              </span>
            </motion.div>
          </motion.div>
        </div>

        <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 ${styles.scrollCue}`}>
          <span />
        </div>
      </section>

      <section className={`border-b border-[#c79aa2]/25 bg-[#ead5d8] dark:border-white/10 dark:bg-[#432f36] ${styles.trustStrip}`}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-10">
          {copy.stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`py-6 sm:py-8 ${
                index % 2 === 0 ? "pr-4" : "border-l border-[#b98590]/25 pl-4"
              } ${styles.statItem} lg:border-l lg:border-[#b98590]/25 lg:px-7 lg:first:border-l-0 lg:first:pl-0`}
            >
              <p className="font-playfair text-3xl font-semibold text-[#553941] sm:text-4xl dark:text-[#f5dfe2]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#795d64] sm:text-sm dark:text-white/64">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="services-overview"
        className={`scroll-mt-16 py-20 sm:py-28 ${styles.roseCanvas}`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow={copy.servicesEyebrow}
              title={copy.servicesTitle}
              description={copy.servicesDescription}
            />
            <Link
              href={localeHref("/services", locale)}
              className="inline-flex items-center gap-2 self-start border-b border-[#9c5965] pb-1 text-sm font-semibold text-[#824854] transition hover:text-[#542c35] lg:self-auto dark:border-[#e2aeb7] dark:text-[#e8bec5]"
            >
              {copy.discover}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.12 }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {copy.services.map((service, index) => (
              <motion.div key={service.title} variants={staggerItem} className="h-full">
                <Link
                  href={localeHref(SERVICE_HREFS[index], locale)}
                  className={`group flex h-full flex-col overflow-hidden rounded-md bg-[#fffafa] shadow-[0_18px_55px_rgba(91,57,67,0.08)] ring-1 ring-[#b88a93]/15 transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(91,57,67,0.16)] dark:bg-[#2a2024] dark:ring-white/10 ${styles.premiumCard}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={SERVICE_IMAGES[index]}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={`object-cover transition duration-700 group-hover:scale-[1.055] ${styles.imageMotion}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#321f26]/78 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 text-xs font-semibold text-white/70">
                      0{index + 1}
                    </span>
                    <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full border border-white/30 bg-[#4b3039]/65 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-playfair text-2xl font-semibold text-[#432e35] dark:text-white">
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#806a70] dark:text-white/62">
                      {service.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#9c5965] dark:text-[#e4aeba]">
                      {copy.serviceCta}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        className={`relative overflow-hidden bg-[#704b57] py-20 text-white sm:py-28 dark:bg-[#35262c] ${styles.signatureSection}`}
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-10">
          <div className={`relative min-h-[420px] overflow-hidden rounded-md sm:min-h-[540px] ${styles.editorialImage}`}>
            <Image
              src="/images/gallery/beauty_1.webp"
              alt="Salon Elen consultation"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className={`object-cover ${styles.imageMotion}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d2830]/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 border-l-2 border-[#e7b8c0] pl-4">
              <p className="font-cormorant text-xl text-white/88">
                Halle (Saale) · Lessingstraße 37
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow={copy.signatureEyebrow}
              title={copy.signatureTitle}
              description={copy.signatureDescription}
              light
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2"
            >
              {copy.reasons.map((reason, index) => {
                const Icon = REASON_ICONS[index];
                return (
                  <motion.div
                    key={reason.title}
                    variants={staggerItem}
                    className={`border-t border-white/18 pt-5 ${styles.reasonItem}`}
                  >
                    <span className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-[#efc3ca]" />
                      <span className="font-cormorant text-lg text-white/30">0{index + 1}</span>
                    </span>
                    <h3 className="mt-4 font-playfair text-xl font-semibold">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/64">
                      {reason.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="results" className="scroll-mt-16 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow={copy.galleryEyebrow}
              title={copy.galleryTitle}
              description={copy.galleryDescription}
            />
            <Link
              href={localeHref("/gallerie", locale)}
              className="inline-flex items-center gap-2 self-start rounded-md bg-[#543842] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#774c59] lg:self-auto"
            >
              {copy.galleryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            className="mt-12 grid auto-rows-[220px] gap-3 md:grid-cols-12 md:auto-rows-[245px]"
          >
            {GALLERY_IMAGES.map((image, index) => (
              <motion.div key={image.src} variants={staggerItem} className={image.className}>
                <Link
                  href={localeHref("/gallerie", locale)}
                  className={`group relative block h-full overflow-hidden rounded-md ${styles.galleryItem}`}
                  aria-label={`${copy.galleryCta} ${index + 1}`}
                >
                  <Image
                    src={image.src}
                    alt={`${copy.galleryTitle} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover transition duration-700 group-hover:scale-[1.055] ${styles.imageMotion}`}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_48%,rgba(57,35,43,0.72)_100%)] opacity-55 transition duration-300 group-hover:opacity-90" />
                  <span className="absolute bottom-4 left-4 translate-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Salon Elen · 0{index + 1}
                  </span>
                  <span className="absolute bottom-3 right-3 grid h-9 w-9 scale-90 place-items-center rounded-full border border-white/35 bg-white/12 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="reviews"
        className={`scroll-mt-16 border-y border-[#bb8d96]/20 bg-[#efe0e2] py-20 sm:py-24 dark:border-white/10 dark:bg-[#2a2024] ${styles.reviewSection}`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9c5965] dark:text-[#dfabb4]">
              {copy.reviewsEyebrow}
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl font-playfair text-3xl font-medium leading-tight text-[#38272d] sm:text-4xl md:text-5xl dark:text-white">
              {copy.reviewsTitle}
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            className="mt-12 grid gap-4 md:grid-cols-3"
          >
            {copy.reviews.map((review, reviewIndex) => (
              <motion.article
                key={review.author}
                variants={staggerItem}
                className={`relative rounded-md bg-[#fffafa] p-6 shadow-[0_14px_44px_rgba(91,57,67,0.07)] ring-1 ring-[#b88a93]/15 dark:bg-[#20181b] dark:ring-white/10 ${styles.reviewCard} ${
                  reviewIndex === 1 ? "md:-translate-y-3" : ""
                }`}
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-[#c99ca5]/28" />
                <div className="flex gap-1 text-[#b16e7b]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 font-cormorant text-xl leading-8 text-[#58434a] dark:text-white/80">
                  “{review.quote}”
                </blockquote>
                <p className="mt-6 border-t border-[#caa5ac]/25 pt-4 text-sm font-semibold text-[#7d515b] dark:text-[#e3b5bd]">
                  {review.author}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {latest.length > 0 ? (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
              <SectionHeading eyebrow={copy.newsEyebrow} title={copy.newsTitle} />
              <Link
                href={localeHref("/news", locale)}
                className="inline-flex items-center gap-2 self-start border-b border-[#9c5965] pb-1 text-sm font-semibold text-[#824854] sm:self-auto dark:border-[#e2aeb7] dark:text-[#e8bec5]"
              >
                {copy.newsCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.16 }}
              className="mt-12 grid gap-5 md:grid-cols-3"
            >
              {latest.slice(0, 3).map((article) => (
                <motion.div key={article.id} variants={staggerItem}>
                  <Link
                    href={localeHref(`/news/${article.slug}`, locale)}
                    className={`group block h-full rounded-md bg-[#fffafa] shadow-[0_16px_50px_rgba(91,57,67,0.07)] ring-1 ring-[#b88a93]/15 dark:bg-[#2a2024] dark:ring-white/10 ${styles.premiumCard}`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-md bg-[#e9d8da]">
                      <Image
                        src={article.cover || "/images/gallery/beauty_4.webp"}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className={`object-cover transition duration-700 group-hover:scale-[1.055] ${styles.imageMotion}`}
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a2606d] dark:text-[#dca7b0]">
                        {copy.newsTypes[article.type]}
                      </p>
                      <h3 className="mt-3 font-playfair text-2xl font-semibold leading-tight text-[#402c33] dark:text-white">
                        {article.title}
                      </h3>
                      {article.excerpt ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#806a70] dark:text-white/62">
                          {article.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#9c5965] dark:text-[#e4aeba]">
                        {copy.serviceCta}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      ) : null}

      <section
        id="booking-cta"
        className={`relative min-h-[560px] scroll-mt-16 overflow-hidden ${styles.finalCta}`}
      >
        <motion.div
          initial={reduceMotion ? false : { scale: 1.07 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src="/images/gallery/pmu_1.webp"
            alt="Salon Elen treatment"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(55,34,42,0.94)_0%,rgba(76,48,58,0.79)_48%,rgba(76,48,58,0.2)_100%)]" />
        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-20 sm:px-8 lg:px-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#efbdc5]">
              {copy.ctaEyebrow}
            </p>
            <h2 className="mt-4 font-playfair text-4xl font-medium leading-[1.06] text-white sm:text-5xl md:text-6xl">
              {copy.ctaTitle}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
              {copy.ctaDescription}
            </p>
            <Link
              href={localeHref("/booking", locale)}
              className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#e2a8b2] px-6 text-sm font-semibold text-[#321f25] transition hover:bg-[#f0c8ce] ${styles.primaryCta}`}
            >
              <CalendarDays className="h-4 w-4" />
              {copy.book}
            </Link>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/65">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#efbdc5]" />
                {copy.openDaily}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#efbdc5]" />
                {copy.reasons[2].title}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#39282e] py-14 text-white dark:bg-[#171114]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:items-end lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dba6af]">
              {copy.contactEyebrow}
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-semibold sm:text-4xl">
              {copy.contactTitle}
            </h2>
          </div>

          <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <a
              href="https://maps.google.com/?q=Lessingstrasse+37+06114+Halle"
              target="_blank"
              rel="noreferrer"
              className={`flex items-start gap-3 border-t border-white/14 pt-3 transition hover:text-white ${styles.contactLink}`}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e2a8b2]" />
              <span>
                {copy.address}
                <strong className="mt-1 block text-white">{copy.route}</strong>
              </span>
            </a>
            <a
              href="tel:+491778995106"
              className={`flex items-start gap-3 border-t border-white/14 pt-3 transition hover:text-white ${styles.contactLink}`}
            >
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#e2a8b2]" />
              <span>
                {copy.phone}
                <strong className="mt-1 block text-white">{copy.hours}</strong>
              </span>
            </a>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
