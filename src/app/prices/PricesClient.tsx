"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeEuro,
  CalendarDays,
  Clock3,
  Eye,
  Footprints,
  Gem,
  Hand,
  MapPin,
  Palette,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";

import type { Locale } from "@/i18n/locales";
import { formatPromotionAppointmentPeriod } from "@/lib/promotion-constants";

type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  cover: string | null;
  promotion: {
    id: string;
    title: string;
    percent: number;
    from: string;
    to: string;
    discountedPriceCents: number;
  } | null;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  services: ServiceItem[];
};

type Props = {
  locale: Locale;
  categories: Category[];
};

type Copy = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  discover: string;
  bookAppointment: string;
  categories: string;
  treatments: string;
  clarity: string;
  clarityValue: string;
  editorialKicker: string;
  editorialTitle: string;
  editorialText: string;
  allCategories: string;
  catalogueEyebrow: string;
  searchLabel: string;
  searchPlaceholder: string;
  servicesCount: (count: number) => string;
  minutes: string;
  onRequest: string;
  offer: string;
  details: string;
  book: string;
  noResults: string;
  resetFilters: string;
  finalEyebrow: string;
  finalTitle: string;
  finalText: string;
};

const copy: Record<Locale, Copy> = {
  de: {
    eyebrow: "Salon Elen · Preisliste",
    title: "Preise, die",
    accent: "transparent bleiben.",
    description:
      "Entdecken Sie alle aktuellen Beauty-Behandlungen, Dauer und Preise auf einen Blick — klar kalkuliert und persönlich auf Sie abgestimmt.",
    discover: "Preise entdecken",
    bookAppointment: "Termin buchen",
    categories: "Kategorien",
    treatments: "Behandlungen",
    clarity: "Preisprinzip",
    clarityValue: "Klar & aktuell",
    editorialKicker: "Salon Elen Price Journal",
    editorialTitle: "Qualität beginnt mit einer ehrlichen Beratung.",
    editorialText:
      "Der angezeigte Preis gehört zur gewählten Behandlung. Bei Leistungen ab Preis erläutern wir den individuellen Umfang vor Beginn.",
    allCategories: "Alle Preise",
    catalogueEyebrow: "Aktuelle Preisliste",
    searchLabel: "Preisliste durchsuchen",
    searchPlaceholder: "Behandlung suchen …",
    servicesCount: (count) => `${count} ${count === 1 ? "Leistung" : "Leistungen"}`,
    minutes: "Min.",
    onRequest: "Auf Anfrage",
    offer: "Aktion",
    details: "Details",
    book: "Buchen",
    noResults: "Keine passende Behandlung gefunden.",
    resetFilters: "Filter zurücksetzen",
    finalEyebrow: "Ihr Termin bei Salon Elen",
    finalTitle: "Ihre Behandlung. Ihr Moment. Klar geplant.",
    finalText:
      "Wählen Sie die passende Leistung und buchen Sie Ihren Termin direkt online. Für individuelle Fragen beraten wir Sie persönlich.",
  },
  en: {
    eyebrow: "Salon Elen · Price list",
    title: "Prices, kept",
    accent: "beautifully clear.",
    description:
      "Explore every current beauty treatment, duration and price at a glance — clearly presented and tailored to your needs.",
    discover: "Explore prices",
    bookAppointment: "Book appointment",
    categories: "Categories",
    treatments: "Treatments",
    clarity: "Pricing principle",
    clarityValue: "Clear & current",
    editorialKicker: "Salon Elen Price Journal",
    editorialTitle: "Quality begins with honest advice.",
    editorialText:
      "The displayed price applies to the selected treatment. For services priced from a starting amount, we explain the individual scope before treatment.",
    allCategories: "All prices",
    catalogueEyebrow: "Current price list",
    searchLabel: "Search the price list",
    searchPlaceholder: "Find a treatment …",
    servicesCount: (count) => `${count} ${count === 1 ? "service" : "services"}`,
    minutes: "min.",
    onRequest: "On request",
    offer: "Offer",
    details: "Details",
    book: "Book",
    noResults: "No matching treatment was found.",
    resetFilters: "Reset filters",
    finalEyebrow: "Your appointment at Salon Elen",
    finalTitle: "Your treatment. Your moment. Clearly planned.",
    finalText:
      "Choose the right service and book directly online. We are happy to advise you personally if you have individual questions.",
  },
  ru: {
    eyebrow: "Salon Elen · Прайс-лист",
    title: "Цены, которые",
    accent: "всегда понятны.",
    description:
      "Все актуальные бьюти-процедуры, продолжительность и стоимость на одной странице — прозрачно и с учётом ваших пожеланий.",
    discover: "Смотреть цены",
    bookAppointment: "Записаться",
    categories: "Категории",
    treatments: "Процедуры",
    clarity: "Принцип цен",
    clarityValue: "Честно и актуально",
    editorialKicker: "Прайс-журнал Salon Elen",
    editorialTitle: "Качество начинается с честной консультации.",
    editorialText:
      "Указанная цена относится к выбранной процедуре. Для услуг с начальной стоимостью мы заранее объясняем индивидуальный объём работы.",
    allCategories: "Все цены",
    catalogueEyebrow: "Актуальный прайс-лист",
    searchLabel: "Поиск по прайс-листу",
    searchPlaceholder: "Найти процедуру …",
    servicesCount: (count) => {
      if (count % 10 === 1 && count % 100 !== 11) return `${count} услуга`;
      if (
        [2, 3, 4].includes(count % 10) &&
        ![12, 13, 14].includes(count % 100)
      ) return `${count} услуги`;
      return `${count} услуг`;
    },
    minutes: "мин.",
    onRequest: "По запросу",
    offer: "Акция",
    details: "Подробнее",
    book: "Записаться",
    noResults: "Подходящая процедура не найдена.",
    resetFilters: "Сбросить фильтры",
    finalEyebrow: "Ваш визит в Salon Elen",
    finalTitle: "Ваша процедура. Ваш момент. Всё продумано.",
    finalText:
      "Выберите подходящую услугу и запишитесь онлайн. По индивидуальным вопросам мы с удовольствием проконсультируем вас лично.",
  },
};

function localeHref(path: string, locale: Locale): string {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

function formatPrice(cents: number | null, locale: Locale): string {
  if (cents == null || cents <= 0) return copy[locale].onRequest;
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(cents / 100);
}

function getCategoryIcon(slug: string): LucideIcon {
  const normalized = slug.toLowerCase();
  if (normalized.includes("permanent") || normalized.includes("make")) return Eye;
  if (normalized.includes("micro") || normalized.includes("kosmetik")) return Sparkles;
  if (
    normalized.includes("fu-") ||
    normalized.includes("fuss") ||
    normalized.includes("foot") ||
    normalized.includes("pedik")
  ) return Footprints;
  if (normalized.includes("wimper") || normalized.includes("lash")) return Star;
  if (normalized.includes("nagel") || normalized.includes("nail")) return Palette;
  if (normalized.includes("haar") || normalized.includes("hair")) return Scissors;
  if (normalized.includes("hand")) return Hand;
  return Gem;
}

function isUploadImage(path: string): boolean {
  return path.startsWith("/uploads/");
}

function PriceCard({
  service,
  categorySlug,
  index,
  locale,
}: {
  service: ServiceItem;
  categorySlug: string;
  index: number;
  locale: Locale;
}) {
  const t = copy[locale];
  const Icon = getCategoryIcon(categorySlug);
  const hasPrice = service.priceCents != null && service.priceCents > 0;

  return (
    <article
      data-price-card
      className="group flex h-full min-w-0 flex-col rounded-[1.6rem] border border-[#d8b8bd]/45 bg-white/92 p-5 shadow-[0_18px_65px_rgba(78,45,55,0.065)] transition duration-500 hover:-translate-y-1 hover:border-[#c27d89]/55 hover:shadow-[0_26px_80px_rgba(78,45,55,0.13)] dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-[#dfa1ac]/30 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#cfa7ae]/50 bg-[#f7e9eb] text-[#8c4c58] dark:border-white/10 dark:bg-white/7 dark:text-[#e2a6b0]">
            <Icon className="h-4.5 w-4.5" />
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#866d74] dark:text-white/48">
            <Clock3 className="h-3.5 w-3.5" />
            {service.durationMin} {t.minutes}
          </span>
        </div>
        <span className="font-playfair text-xl text-[#c8a3aa] dark:text-white/18" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-5 flex-1">
        {service.promotion ? (
          <span className="mb-3 inline-flex rounded-full bg-[#8e4e5b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white dark:bg-[#ce7d8c] dark:text-[#28151b]">
            {t.offer} · −{service.promotion.percent}%
          </span>
        ) : null}
        <h3 className="break-words font-playfair text-xl font-semibold leading-tight tracking-[-0.015em] text-[#3f2930] transition group-hover:text-[#8d4d59] dark:text-white dark:group-hover:text-[#e3a3ae] sm:text-2xl">
          {service.name}
        </h3>
        {service.description ? (
          <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-[#78666b] dark:text-white/58">
            {service.description}
          </p>
        ) : null}
      </div>

      <div className="mt-6 border-t border-[#d9bcc1]/40 pt-5 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {service.promotion && service.priceCents != null ? (
              <>
                <p className="text-xs font-medium text-[#9a7f85] line-through decoration-[#b75465] decoration-2 dark:text-white/38">
                  {formatPrice(service.priceCents, locale)}
                </p>
                <p className="mt-0.5 font-playfair text-3xl font-semibold text-[#8a4351] dark:text-[#edaebb]">
                  {formatPrice(service.promotion.discountedPriceCents, locale)}
                </p>
              </>
            ) : (
              <p
                className={`font-playfair font-semibold text-[#70414b] dark:text-[#e9bac2] ${
                  hasPrice ? "text-2xl" : "text-lg italic"
                }`}
              >
                {formatPrice(service.priceCents, locale)}
              </p>
            )}
          </div>
          <Link
            href={localeHref(
              `/booking/services?preselect=${encodeURIComponent(service.id)}`,
              locale,
            )}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#8e4e5b] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(142,78,91,0.2)] transition hover:bg-[#743c48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4e5b] dark:bg-[#ca7988] dark:text-[#251419] dark:hover:bg-[#dc909d]"
          >
            {t.book}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {service.promotion ? (
          <div className="mt-4 rounded-2xl border border-[#e4bbc2]/55 bg-[#fbf0f2] px-3.5 py-3 text-[#7b3e4a] dark:border-[#e4a1ad]/15 dark:bg-[#d68190]/10 dark:text-[#f0bdc6]">
            <p className="truncate text-[11px] font-bold">{service.promotion.title}</p>
            <p className="mt-1 flex items-start gap-1.5 text-[10px] font-medium leading-4 opacity-75">
              <CalendarDays className="mt-px h-3 w-3 shrink-0" />
              {formatPromotionAppointmentPeriod(
                service.promotion.from,
                service.promotion.to,
                locale,
              )}
            </p>
          </div>
        ) : null}

        <Link
          href={localeHref(`/services?service=${encodeURIComponent(service.id)}`, locale)}
          rel="nofollow"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#8c4c58] transition hover:text-[#68343e] dark:text-[#e0a0ab] dark:hover:text-[#f0c3ca]"
        >
          {t.details}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export default function PricesClient({ locale, categories }: Props) {
  const t = copy[locale];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const totalServices = useMemo(
    () => categories.reduce((total, category) => total + category.services.length, 0),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    return categories
      .filter((category) => !activeCategory || category.id === activeCategory)
      .map((category) => ({
        ...category,
        services: category.services.filter((service) => {
          if (!normalizedQuery) return true;
          return `${category.name} ${service.name} ${service.description ?? ""}`
            .toLocaleLowerCase(locale)
            .includes(normalizedQuery);
        }),
      }))
      .filter((category) => category.services.length > 0);
  }, [activeCategory, categories, locale, query]);

  const visibleServices = filteredCategories.reduce(
    (total, category) => total + category.services.length,
    0,
  );

  const heroImages = useMemo(
    () =>
      categories
        .flatMap((category) => category.services)
        .filter((service): service is ServiceItem & { cover: string } => Boolean(service.cover))
        .slice(0, 3),
    [categories],
  );

  const resetFilters = () => {
    setActiveCategory(null);
    setQuery("");
  };

  let visibleIndex = 0;

  return (
    <main className="overflow-hidden bg-[#fdf9f7] text-[#3d2b31] dark:bg-[#0b090b] dark:text-white">
      <section className="relative isolate overflow-hidden border-b border-[#cfadb3]/35 bg-[radial-gradient(circle_at_16%_10%,rgba(226,180,187,0.33),transparent_32%),linear-gradient(135deg,#fffaf7_0%,#f4e5e6_56%,#e8cfd3_100%)] pt-20 dark:border-white/10 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(160,84,101,0.2),transparent_34%),linear-gradient(135deg,#0d0a0c_0%,#1a1015_58%,#2a171f_100%)] sm:pt-24">
        <div aria-hidden="true" className="absolute -left-24 top-28 h-72 w-72 rounded-full border border-[#b97984]/20" />
        <div aria-hidden="true" className="absolute -left-4 top-52 h-36 w-36 rounded-full border border-[#b97984]/25" />
        <div aria-hidden="true" className="absolute right-[8%] top-24 h-px w-44 rotate-[-26deg] bg-[#9a5a66]/30" />

        <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-center lg:gap-16 lg:px-10 lg:pb-24 lg:pt-12">
          <div className="min-w-0">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#985560] dark:text-[#e1a8b2]">
              <span className="h-px w-10 bg-current opacity-60" />
              {t.eyebrow}
            </p>
            <h1 className="mt-6 font-playfair text-[clamp(3.4rem,7.5vw,6.9rem)] font-medium leading-[0.88] tracking-[-0.052em] text-[#39252c] dark:text-white">
              {t.title}
              <span className="mt-2 block font-light italic text-[#9b5965] dark:text-[#e0a2ad]">
                {t.accent}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#6f5960] dark:text-white/68 sm:text-lg">
              {t.description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#preisliste"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#854653] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_45px_rgba(133,70,83,0.28)] transition hover:-translate-y-0.5 hover:bg-[#713946] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854653] dark:bg-[#d18190] dark:text-[#271419]"
              >
                <BadgeEuro className="h-4 w-4" />
                {t.discover}
              </a>
              <Link
                href={localeHref("/booking/services", locale)}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#b98690]/55 bg-white/48 px-7 py-3.5 text-sm font-bold text-[#67404a] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/78 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854653] dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                <CalendarDays className="h-4 w-4" />
                {t.bookAppointment}
              </Link>
            </div>

            <div className="mt-10 grid min-w-0 max-w-xl grid-cols-3 border-y border-[#b78891]/30 py-5 dark:border-white/10">
              <div className="min-w-0 pr-3">
                <strong className="block font-playfair text-2xl font-semibold text-[#53343d] dark:text-white sm:text-3xl">
                  {categories.length}
                </strong>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7077] dark:text-white/42 sm:text-xs">
                  {t.categories}
                </span>
              </div>
              <div className="min-w-0 border-x border-[#b78891]/25 px-3 dark:border-white/10">
                <strong className="block font-playfair text-2xl font-semibold text-[#53343d] dark:text-white sm:text-3xl">
                  {totalServices}
                </strong>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7077] dark:text-white/42 sm:text-xs">
                  {t.treatments}
                </span>
              </div>
              <div className="min-w-0 pl-3">
                <strong className="block min-h-8 break-words font-playfair text-base font-semibold leading-5 text-[#53343d] dark:text-white sm:text-xl sm:leading-8">
                  {t.clarityValue}
                </strong>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7077] dark:text-white/42 sm:text-xs">
                  {t.clarity}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto min-w-0 w-full max-w-[680px]">
            <div className="relative overflow-hidden rounded-[2.2rem] bg-[#4b3039] px-6 py-8 text-white shadow-[0_38px_105px_rgba(72,38,49,0.28)] dark:bg-[#2b1a21] sm:rounded-[3rem] sm:px-10 sm:py-11">
              <div aria-hidden="true" className="absolute -right-16 -top-20 font-playfair text-[15rem] font-semibold leading-none text-white/[0.055] sm:text-[19rem]">
                €
              </div>
              <div className="relative">
                <div className="flex items-start justify-between gap-5">
                  <p className="max-w-[65%] text-[10px] font-bold uppercase tracking-[0.2em] text-[#efc1c9] sm:text-xs">
                    {t.editorialKicker}
                  </p>
                  <span className="font-playfair text-sm italic text-white/45">01 / Salon Elen</span>
                </div>
                <h2 className="mt-12 max-w-lg font-playfair text-3xl font-medium leading-[1.08] tracking-[-0.025em] sm:mt-16 sm:text-5xl">
                  {t.editorialTitle}
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/66 sm:text-base">
                  {t.editorialText}
                </p>

                <div className="mt-9 flex items-center justify-between gap-4 border-t border-white/12 pt-6">
                  <div className="flex -space-x-3">
                    {heroImages.map((service) => (
                      <div
                        key={service.id}
                        className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#4b3039] bg-[#d6afb7] dark:border-[#2b1a21] sm:h-14 sm:w-14"
                      >
                        <Image
                          src={service.cover}
                          alt={service.name}
                          fill
                          unoptimized={isUploadImage(service.cover)}
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {heroImages.length === 0 ? (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#4b3039] bg-[#d6afb7] text-[#603b45] dark:border-[#2b1a21]">
                        <Sparkles className="h-5 w-5" />
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-playfair text-2xl font-semibold sm:text-3xl">{totalServices}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/48 sm:text-xs">
                      {t.treatments}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 left-[8%] z-10 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/90 px-4 py-2.5 text-xs font-semibold text-[#68424b] shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-[#22151a]/90 dark:text-white/75 sm:left-[12%]">
              <MapPin className="h-4 w-4 text-[#a15c68]" />
              Lessingstraße 37 · Halle
            </div>
          </div>
        </div>
      </section>

      <section id="preisliste" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#a15d68] dark:text-[#dda0ab]">
                <span className="h-px w-9 bg-current opacity-55" />
                {t.catalogueEyebrow}
              </p>
              <h2 className="mt-4 font-playfair text-3xl font-medium leading-[1.08] tracking-[-0.02em] text-[#3a272e] dark:text-white sm:text-4xl lg:text-5xl">
                {t.allCategories}
              </h2>
            </div>
            <p className="text-sm font-medium text-[#8b7278] dark:text-white/45">
              {t.servicesCount(visibleServices)}
            </p>
          </div>

          <div className="z-30 mb-12 rounded-[1.6rem] border border-[#d6b6bb]/45 bg-white/82 p-3 shadow-[0_16px_55px_rgba(82,50,59,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#151014]/88 md:sticky md:top-20">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative block shrink-0 lg:w-72">
                <span className="sr-only">{t.searchLabel}</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b6d75] dark:text-white/40" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="h-12 w-full rounded-full border border-[#d4b4ba]/55 bg-[#fffaf8] pl-11 pr-10 text-sm text-[#4b3239] outline-none transition placeholder:text-[#a58d93] focus:border-[#a7616d] focus:ring-2 focus:ring-[#a7616d]/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#98737a] transition hover:bg-[#f3e3e6] hover:text-[#72414b] dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={t.resetFilters}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </label>

              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide lg:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  aria-pressed={activeCategory === null}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                    activeCategory === null
                      ? "bg-[#8e4e5b] text-white shadow-[0_8px_22px_rgba(142,78,91,0.22)] dark:bg-[#cc7c8b] dark:text-[#271419]"
                      : "border border-[#d7b8bd]/55 bg-white/65 text-[#73515a] hover:border-[#b77d87] hover:bg-[#fbf0f2] dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:bg-white/10"
                  }`}
                >
                  {t.allCategories}
                </button>
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.slug);
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(isActive ? null : category.id)}
                      aria-pressed={isActive}
                      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold transition sm:px-5 sm:text-sm ${
                        isActive
                          ? "bg-[#8e4e5b] text-white shadow-[0_8px_22px_rgba(142,78,91,0.22)] dark:bg-[#cc7c8b] dark:text-[#271419]"
                          : "border border-[#d7b8bd]/55 bg-white/65 text-[#73515a] hover:border-[#b77d87] hover:bg-[#fbf0f2] dark:border-white/10 dark:bg-white/5 dark:text-white/65 dark:hover:bg-white/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                      <span className="opacity-60">{category.services.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="space-y-16 sm:space-y-20">
              {filteredCategories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                return (
                  <section key={category.id} aria-labelledby={`price-category-${category.id}`}>
                    <div className="mb-7 grid gap-4 border-b border-[#d6b7bc]/40 pb-6 dark:border-white/10 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cfa7ae]/50 bg-[#f7e9eb] text-[#8c4c58] dark:border-white/10 dark:bg-white/7 dark:text-[#e2a6b0]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a16973] dark:text-[#dda3ad]">
                          {t.catalogueEyebrow}
                        </p>
                        <h3
                          id={`price-category-${category.id}`}
                          className="mt-1 break-words font-playfair text-3xl font-semibold tracking-[-0.02em] text-[#402a31] dark:text-white sm:text-4xl"
                        >
                          {category.name}
                        </h3>
                      </div>
                      <span className="w-fit rounded-full border border-[#d1afb5]/45 px-3 py-1.5 text-xs font-semibold text-[#86626a] dark:border-white/10 dark:text-white/48">
                        {t.servicesCount(category.services.length)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {category.services.map((service) => (
                        <PriceCard
                          key={service.id}
                          service={service}
                          categorySlug={category.slug}
                          index={visibleIndex++}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#d8b8bd]/45 bg-white/75 px-6 py-16 text-center shadow-[0_18px_70px_rgba(78,45,55,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
              <BadgeEuro className="mx-auto h-12 w-12 text-[#aa707a] dark:text-[#dda0aa]" />
              <p className="mt-5 font-playfair text-2xl font-semibold text-[#493039] dark:text-white">
                {t.noResults}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#8e4e5b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#743c48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4e5b] dark:bg-[#ca7988] dark:text-[#251419]"
              >
                {t.resetFilters}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#4b3039] py-20 text-white dark:bg-[#28191f] sm:py-28">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-20 left-[8%] h-56 w-56 rounded-full border border-white/10" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#f0c8cf]">
              <span className="h-px w-9 bg-current opacity-60" />
              {t.finalEyebrow}
            </p>
            <h2 className="mt-5 font-playfair text-4xl font-medium leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              {t.finalTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
              {t.finalText}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/62">
              <ShieldCheck className="h-4 w-4 text-[#efbcc5]" />
              Lessingstraße 37 · Halle (Saale)
            </p>
          </div>
          <Link
            href={localeHref("/booking/services", locale)}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#5d3741] shadow-[0_18px_50px_rgba(25,10,15,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f7e9eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CalendarDays className="h-4 w-4" />
            {t.bookAppointment}
          </Link>
        </div>
      </section>
    </main>
  );
}
