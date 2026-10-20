"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Flower2,
  Footprints,
  HeartHandshake,
  Images,
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

import { formatPromotionAppointmentPeriod } from "@/lib/promotion-constants";

type GalleryItem = { id: string; image: string; caption: string | null };

type ServiceChild = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  durationMin: number;
  cover: string | null;
  gallery: GalleryItem[];
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
  description: string | null;
  cover: string | null;
  gallery: GalleryItem[];
  children: ServiceChild[];
};

type Props = { categories: Category[]; locale: string };

type GalleryLightboxProps = {
  images: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  serviceName: string;
};

type ServiceDetailModalProps = {
  service: ServiceChild;
  categoryName: string;
  onClose: () => void;
  onOpenGallery: (index: number) => void;
  translations: Record<string, string>;
  locale: string;
};

const GalleryLightbox = dynamic<GalleryLightboxProps>(
  () => import("./GalleryLightbox"),
  { ssr: false },
);

const ServiceDetailModal = dynamic<ServiceDetailModalProps>(
  () => import("./ServiceDetailModal"),
  { ssr: false },
);

const copy = {
  de: {
    eyebrow: "Salon Elen · Halle (Saale)",
    title: "Beauty-Behandlungen",
    accent: "für Ihre beste Seite.",
    subtitle:
      "Permanent Make-up, professionelle Fußpflege und ausgewählte Beauty-Behandlungen — persönlich beraten und präzise ausgeführt.",
    discover: "Leistungen entdecken",
    bookNow: "Termin buchen",
    allCategories: "Alle Leistungen",
    searchLabel: "Leistungen durchsuchen",
    searchPlaceholder: "Behandlung suchen …",
    categoriesLabel: "Kategorien",
    treatmentsLabel: "Behandlungen",
    locationLabel: "Halle (Saale)",
    onlineLabel: "Online buchbar",
    services: "Leistungen",
    from: "ab",
    minutes: "Min.",
    details: "Details",
    sale: "Aktion",
    close: "Schließen",
    ourWorks: "Unsere Arbeiten",
    noServices: "Keine passende Behandlung gefunden.",
    resetFilters: "Filter zurücksetzen",
    catalogEyebrow: "Behandlungskatalog",
    finalEyebrow: "Ihr Termin bei Salon Elen",
    finalTitle: "Zeit für ein Ergebnis, das sich nach Ihnen anfühlt.",
    finalText:
      "Wählen Sie Ihre Behandlung online oder lassen Sie sich persönlich beraten. Wir nehmen uns Zeit für Ihre Wünsche.",
  },
  ru: {
    eyebrow: "Salon Elen · Галле (Заале)",
    title: "Бьюти-процедуры",
    accent: "для вашей красоты.",
    subtitle:
      "Перманентный макияж, профессиональный уход за стопами и тщательно подобранные бьюти-процедуры с индивидуальной консультацией.",
    discover: "Смотреть услуги",
    bookNow: "Записаться",
    allCategories: "Все услуги",
    searchLabel: "Поиск услуг",
    searchPlaceholder: "Найти процедуру …",
    categoriesLabel: "Категории",
    treatmentsLabel: "Процедуры",
    locationLabel: "Галле (Заале)",
    onlineLabel: "Онлайн-запись",
    services: "услуг",
    from: "от",
    minutes: "мин.",
    details: "Подробнее",
    sale: "Акция",
    close: "Закрыть",
    ourWorks: "Наши работы",
    noServices: "Подходящая процедура не найдена.",
    resetFilters: "Сбросить фильтры",
    catalogEyebrow: "Каталог процедур",
    finalEyebrow: "Ваш визит в Salon Elen",
    finalTitle: "Время для результата, который подходит именно вам.",
    finalText:
      "Выберите процедуру онлайн или получите персональную консультацию. Мы внимательно относимся к вашим пожеланиям.",
  },
  en: {
    eyebrow: "Salon Elen · Halle (Saale)",
    title: "Beauty treatments",
    accent: "made for you.",
    subtitle:
      "Permanent make-up, professional foot care and selected beauty treatments — individually advised and precisely performed.",
    discover: "Explore treatments",
    bookNow: "Book appointment",
    allCategories: "All treatments",
    searchLabel: "Search treatments",
    searchPlaceholder: "Find a treatment …",
    categoriesLabel: "Categories",
    treatmentsLabel: "Treatments",
    locationLabel: "Halle (Saale)",
    onlineLabel: "Online booking",
    services: "services",
    from: "from",
    minutes: "min.",
    details: "Details",
    sale: "Offer",
    close: "Close",
    ourWorks: "Our work",
    noServices: "No matching treatment was found.",
    resetFilters: "Reset filters",
    catalogEyebrow: "Treatment catalogue",
    finalEyebrow: "Your appointment at Salon Elen",
    finalTitle: "Time for a result that feels entirely yours.",
    finalText:
      "Choose your treatment online or ask for personal advice. We take the time to understand what you want.",
  },
} as const;

function getCategoryIcon(slug: string): LucideIcon {
  const normalized = slug.toLowerCase();
  if (
    normalized.includes("fu-") ||
    normalized.includes("fuss") ||
    normalized.includes("foot") ||
    normalized.includes("pedik")
  ) return Footprints;
  if (normalized.includes("haar") || normalized.includes("hair")) return Scissors;
  if (normalized.includes("nagel") || normalized.includes("nail")) return Palette;
  if (normalized.includes("lash") || normalized.includes("wimper")) return Star;
  if (normalized.includes("permanent") || normalized.includes("make")) return Sparkles;
  if (normalized.includes("massage") || normalized.includes("wellness")) {
    return HeartHandshake;
  }
  return Flower2;
}

function formatPrice(cents: number | null, locale: string): string | null {
  if (cents == null) return null;
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  ).format(cents / 100);
}

function localeHref(path: string, locale: string): string {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

function getServiceImage(service: ServiceChild): string | null {
  return service.cover || service.gallery[0]?.image || null;
}

function isUploadImage(path: string | null): boolean {
  return path?.startsWith("/uploads/") ?? false;
}

function ServiceCard({
  service,
  categoryName,
  index,
  locale,
  translations,
  isPriority,
  onOpenDetail,
  onOpenGallery,
  onPrefetch,
}: {
  service: ServiceChild;
  categoryName: string;
  index: number;
  locale: string;
  translations: (typeof copy)[keyof typeof copy];
  isPriority: boolean;
  onOpenDetail: () => void;
  onOpenGallery: (index: number) => void;
  onPrefetch: (imageUrl?: string | null) => void;
}) {
  const imageUrl = getServiceImage(service);
  const basePrice = formatPrice(service.priceCents, locale);
  const promotionPrice = service.promotion
    ? formatPrice(service.promotion.discountedPriceCents, locale)
    : null;

  return (
    <article
      data-service-card
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#d8b8bd]/45 bg-white/94 shadow-[0_20px_70px_rgba(78,45,55,0.075)] transition duration-500 hover:-translate-y-1.5 hover:border-[#c27d89]/55 hover:shadow-[0_30px_90px_rgba(78,45,55,0.15)] dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-[#dfa1ac]/30"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-[#ead9dc] dark:bg-[#25171c]">
        <button
          type="button"
          onClick={onOpenDetail}
          onPointerEnter={() => onPrefetch(imageUrl)}
          onFocus={() => onPrefetch(imageUrl)}
          className="absolute inset-0 z-[1] w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#8e4e5b]"
          aria-label={`${translations.details}: ${service.name}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={service.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.055]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={72}
              unoptimized={isUploadImage(imageUrl)}
              priority={isPriority}
              loading={isPriority ? "eager" : "lazy"}
              fetchPriority={isPriority ? "high" : "auto"}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.72),transparent_32%),linear-gradient(135deg,#ead3d7,#d6adb5)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_32%),linear-gradient(135deg,#321e25,#1a1014)]">
              <Flower2 className="h-16 w-16 text-[#9f6570]/55 dark:text-[#e2a7b1]/35" />
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-[#2b1820]/78 via-[#2b1820]/5 to-transparent" />
        </button>

        <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-3">
          <span className="max-w-[62%] truncate rounded-full border border-white/20 bg-[#2b1820]/62 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:text-xs">
            {categoryName}
          </span>
          {basePrice ? (
            <span className="rounded-full bg-white/92 px-3 py-1.5 text-right text-xs font-bold text-[#633b45] shadow-lg backdrop-blur-md">
              {service.promotion ? (
                <>
                  <span className="mr-1 text-[10px] font-medium text-[#92767d] line-through">
                    {basePrice}
                  </span>
                  {promotionPrice}
                </>
              ) : (
                <>{translations.from} {basePrice}</>
              )}
            </span>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-end justify-between gap-3 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#24141a]/55 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
            <Clock3 className="h-3.5 w-3.5" />
            {service.durationMin} {translations.minutes}
          </span>
          <span className="font-playfair text-2xl text-white/65" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {service.gallery.length > 0 ? (
          <button
            type="button"
            onClick={() => onOpenGallery(0)}
            className="absolute bottom-4 right-14 z-20 hidden items-center gap-1.5 rounded-full border border-white/20 bg-[#24141a]/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-[#24141a]/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
            aria-label={`${translations.ourWorks}: ${service.name}`}
          >
            <Images className="h-3.5 w-3.5" />
            {service.gallery.length}
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {service.promotion ? (
          <div className="mb-4 rounded-2xl border border-[#e4bbc2]/55 bg-[#fbf0f2] px-3.5 py-3 text-[#7b3e4a] dark:border-[#e4a1ad]/15 dark:bg-[#d68190]/10 dark:text-[#f0bdc6]">
            <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.12em]">
              <span>{translations.sale} · −{service.promotion.percent}%</span>
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            </div>
            <p className="mt-1.5 text-[11px] font-medium leading-4 opacity-75">
              {formatPromotionAppointmentPeriod(
                service.promotion.from,
                service.promotion.to,
                locale,
              )}
            </p>
          </div>
        ) : null}

        <h3 className="break-words font-playfair text-xl font-semibold leading-tight tracking-[-0.015em] text-[#3f2930] transition group-hover:text-[#8d4d59] dark:text-white dark:group-hover:text-[#e3a3ae] sm:text-2xl">
          {service.name}
        </h3>
        {service.description ? (
          <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-[#78666b] dark:text-white/58">
            {service.description}
          </p>
        ) : null}

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 pt-6">
          <Link
            href={localeHref(
              `/booking/services?preselect=${encodeURIComponent(service.id)}`,
              locale,
            )}
            className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full bg-[#8e4e5b] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_26px_rgba(142,78,91,0.2)] transition hover:bg-[#743c48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4e5b] dark:bg-[#ca7988] dark:text-[#251419] dark:hover:bg-[#dc909d]"
          >
            {translations.bookNow}
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          <button
            type="button"
            onClick={onOpenDetail}
            onPointerEnter={() => onPrefetch(imageUrl)}
            onFocus={() => onPrefetch(imageUrl)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#c9a2a9]/60 px-4 py-2.5 text-sm font-semibold text-[#75434d] transition hover:border-[#9b5965] hover:bg-[#f8ecee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4e5b] dark:border-white/15 dark:text-white/75 dark:hover:bg-white/8"
          >
            {translations.details}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ServicesClient({ categories, locale }: Props) {
  const language = locale === "ru" || locale === "en" ? locale : "de";
  const translations = copy[language];
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<{
    service: ServiceChild;
    categoryName: string;
  } | null>(null);
  const [lightbox, setLightbox] = useState<{
    images: GalleryItem[];
    currentIndex: number;
    serviceName: string;
  } | null>(null);

  useEffect(() => {
    const serviceReference = searchParams.get("service");
    if (!serviceReference) return;

    for (const category of categories) {
      const service = category.children.find(
        (candidate) =>
          candidate.id === serviceReference || candidate.slug === serviceReference,
      );
      if (service) {
        setSelectedService({ service, categoryName: category.name });
        return;
      }
    }
  }, [categories, searchParams]);

  const prefetchServiceModal = useCallback((imageUrl?: string | null) => {
    void import("./ServiceDetailModal");
    void import("./GalleryLightbox");
    if (typeof window !== "undefined" && imageUrl) {
      const image = new window.Image();
      image.decoding = "async";
      image.src = imageUrl;
    }
  }, []);

  const openLightbox = useCallback(
    (images: GalleryItem[], index: number, serviceName: string) => {
      setLightbox({ images, currentIndex: index, serviceName });
    },
    [],
  );

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language);
    return categories
      .filter((category) => !activeCategory || category.id === activeCategory)
      .map((category) => ({
        ...category,
        children: category.children.filter((service) => {
          if (!normalizedQuery) return true;
          return `${category.name} ${service.name} ${service.description ?? ""}`
            .toLocaleLowerCase(language)
            .includes(normalizedQuery);
        }),
      }))
      .filter((category) => category.children.length > 0);
  }, [activeCategory, categories, language, query]);

  const totalServices = useMemo(
    () => categories.reduce((total, category) => total + category.children.length, 0),
    [categories],
  );
  const visibleServices = filteredCategories.reduce(
    (total, category) => total + category.children.length,
    0,
  );
  const heroServices = useMemo(
    () =>
      categories
        .flatMap((category) =>
          category.children.map((service) => ({
            service,
            image: getServiceImage(service),
          })),
        )
        .filter((item): item is { service: ServiceChild; image: string } => Boolean(item.image))
        .slice(0, 3),
    [categories],
  );

  const resetFilters = () => {
    setActiveCategory(null);
    setQuery("");
  };

  let globalServiceIndex = 0;

  return (
    <main className="overflow-hidden bg-[#fdf9f7] text-[#3d2b31] dark:bg-[#0b090b] dark:text-white">
      <AnimatePresence>
        {lightbox ? (
          <GalleryLightbox
            images={lightbox.images}
            currentIndex={lightbox.currentIndex}
            onClose={() => setLightbox(null)}
            onPrev={() =>
              setLightbox((current) =>
                current
                  ? {
                      ...current,
                      currentIndex:
                        current.currentIndex === 0
                          ? current.images.length - 1
                          : current.currentIndex - 1,
                    }
                  : null,
              )
            }
            onNext={() =>
              setLightbox((current) =>
                current
                  ? {
                      ...current,
                      currentIndex: (current.currentIndex + 1) % current.images.length,
                    }
                  : null,
              )
            }
            serviceName={lightbox.serviceName}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedService ? (
          <ServiceDetailModal
            service={selectedService.service}
            categoryName={selectedService.categoryName}
            onClose={() => setSelectedService(null)}
            onOpenGallery={(index) =>
              openLightbox(
                selectedService.service.gallery,
                index,
                selectedService.service.name,
              )
            }
            translations={translations}
            locale={language}
          />
        ) : null}
      </AnimatePresence>

      <section className="relative isolate overflow-hidden border-b border-[#cfadb3]/35 bg-[radial-gradient(circle_at_16%_10%,rgba(226,180,187,0.33),transparent_32%),linear-gradient(135deg,#fffaf7_0%,#f4e5e6_56%,#e8cfd3_100%)] pt-20 dark:border-white/10 dark:bg-[radial-gradient(circle_at_16%_10%,rgba(160,84,101,0.2),transparent_34%),linear-gradient(135deg,#0d0a0c_0%,#1a1015_58%,#2a171f_100%)] sm:pt-24">
        <div aria-hidden="true" className="absolute -left-24 top-28 h-72 w-72 rounded-full border border-[#b97984]/20" />
        <div aria-hidden="true" className="absolute -left-4 top-52 h-36 w-36 rounded-full border border-[#b97984]/25" />
        <div aria-hidden="true" className="absolute right-[9%] top-24 h-px w-44 rotate-[-26deg] bg-[#9a5a66]/30" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16 lg:px-10 lg:pb-24 lg:pt-12">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#985560] dark:text-[#e1a8b2]">
              <span className="h-px w-10 bg-current opacity-60" />
              {translations.eyebrow}
            </p>
            <h1 className="mt-6 font-playfair text-[clamp(3.3rem,7.5vw,6.8rem)] font-medium leading-[0.9] tracking-[-0.05em] text-[#39252c] dark:text-white">
              {translations.title}
              <span className="mt-2 block font-light italic text-[#9b5965] dark:text-[#e0a2ad]">
                {translations.accent}
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#6f5960] dark:text-white/68 sm:text-lg">
              {translations.subtitle}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#leistungen"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#854653] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_45px_rgba(133,70,83,0.28)] transition hover:-translate-y-0.5 hover:bg-[#713946] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854653] dark:bg-[#d18190] dark:text-[#271419]"
              >
                {translations.discover}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href={localeHref("/booking/services", language)}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[#b98690]/55 bg-white/48 px-7 py-3.5 text-sm font-bold text-[#67404a] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/78 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#854653] dark:border-white/15 dark:bg-white/5 dark:text-white"
              >
                <CalendarDays className="h-4 w-4" />
                {translations.bookNow}
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-[#b78891]/30 py-5 dark:border-white/10">
              <div className="pr-3">
                <strong className="block font-playfair text-2xl font-semibold text-[#53343d] dark:text-white sm:text-3xl">
                  {categories.length}
                </strong>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7077] dark:text-white/42 sm:text-xs">
                  {translations.categoriesLabel}
                </span>
              </div>
              <div className="border-x border-[#b78891]/25 px-3 dark:border-white/10">
                <strong className="block font-playfair text-2xl font-semibold text-[#53343d] dark:text-white sm:text-3xl">
                  {totalServices}
                </strong>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7077] dark:text-white/42 sm:text-xs">
                  {translations.treatmentsLabel}
                </span>
              </div>
              <div className="pl-3">
                <strong className="flex h-8 items-center font-playfair text-lg font-semibold text-[#53343d] dark:text-white sm:text-xl">
                  24/7
                </strong>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a7077] dark:text-white/42 sm:text-xs">
                  {translations.onlineLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[700px]">
            <div className="grid grid-cols-[minmax(0,1fr)_0.42fr] gap-3 sm:gap-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#d8bbc0] shadow-[0_36px_100px_rgba(72,38,49,0.23)] sm:rounded-[2.8rem]">
                {heroServices[0] ? (
                  <Image
                    src={heroServices[0].image}
                    alt={heroServices[0].service.name}
                    fill
                    priority
                    unoptimized={isUploadImage(heroServices[0].image)}
                    sizes="(max-width: 1024px) 68vw, 38vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#ead2d6] to-[#bd828d]">
                    <Sparkles className="h-20 w-20 text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#29171e]/72 via-transparent to-transparent" />
                <div className="absolute inset-x-6 bottom-6 text-white sm:inset-x-8 sm:bottom-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">
                    Salon Elen
                  </p>
                  <p className="mt-2 max-w-sm font-playfair text-2xl leading-tight sm:text-3xl">
                    {heroServices[0]?.service.name ?? translations.title}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 pt-10 sm:gap-5 sm:pt-16">
                {[heroServices[1], heroServices[2]].map((item, index) => (
                  <div
                    key={item?.service.id ?? `hero-placeholder-${index}`}
                    className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-[#d9bdc2] shadow-[0_18px_55px_rgba(72,38,49,0.16)] sm:rounded-[2rem]"
                  >
                    {item ? (
                      <Image
                        src={item.image}
                        alt={item.service.name}
                        fill
                        unoptimized={isUploadImage(item.image)}
                        sizes="(max-width: 1024px) 28vw, 16vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#eedde0] to-[#c7969f]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#29171e]/52 to-transparent" />
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 left-[8%] z-10 inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/88 px-4 py-2.5 text-xs font-semibold text-[#68424b] shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-[#22151a]/88 dark:text-white/75 sm:left-[12%]">
              <MapPin className="h-4 w-4 text-[#a15c68]" />
              {translations.locationLabel}
            </div>
          </div>
        </div>
      </section>

      <section id="leistungen" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#a15d68] dark:text-[#dda0ab]">
                <span className="h-px w-9 bg-current opacity-55" />
                {translations.catalogEyebrow}
              </p>
              <h2 className="mt-4 max-w-3xl font-playfair text-3xl font-medium leading-[1.08] tracking-[-0.02em] text-[#3a272e] dark:text-white sm:text-4xl lg:text-5xl">
                {translations.allCategories}
              </h2>
            </div>
            <p className="text-sm font-medium text-[#8b7278] dark:text-white/45">
              {visibleServices} {translations.services}
            </p>
          </div>

          <div className="z-30 mb-12 rounded-[1.6rem] border border-[#d6b6bb]/45 bg-white/82 p-3 shadow-[0_16px_55px_rgba(82,50,59,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#151014]/88 md:sticky md:top-20">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative block shrink-0 lg:w-72">
                <span className="sr-only">{translations.searchLabel}</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b6d75] dark:text-white/40" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={translations.searchPlaceholder}
                  className="h-12 w-full rounded-full border border-[#d4b4ba]/55 bg-[#fffaf8] pl-11 pr-10 text-sm text-[#4b3239] outline-none transition placeholder:text-[#a58d93] focus:border-[#a7616d] focus:ring-2 focus:ring-[#a7616d]/15 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#98737a] transition hover:bg-[#f3e3e6] hover:text-[#72414b] dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label={translations.resetFilters}
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
                  {translations.allCategories}
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
                      <span className="opacity-60">{category.children.length}</span>
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
                  <section key={category.id} aria-labelledby={`category-${category.id}`}>
                    <div className="mb-7 grid gap-4 border-b border-[#d6b7bc]/40 pb-6 dark:border-white/10 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cfa7ae]/50 bg-[#f7e9eb] text-[#8c4c58] dark:border-white/10 dark:bg-white/7 dark:text-[#e2a6b0]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a16973] dark:text-[#dda3ad]">
                          {translations.catalogEyebrow}
                        </p>
                        <h3
                          id={`category-${category.id}`}
                          className="mt-1 break-words font-playfair text-3xl font-semibold tracking-[-0.02em] text-[#402a31] dark:text-white sm:text-4xl"
                        >
                          {category.name}
                        </h3>
                        {category.description ? (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d686e] dark:text-white/52">
                            {category.description}
                          </p>
                        ) : null}
                      </div>
                      <span className="w-fit rounded-full border border-[#d1afb5]/45 px-3 py-1.5 text-xs font-semibold text-[#86626a] dark:border-white/10 dark:text-white/48">
                        {category.children.length} {translations.services}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {category.children.map((service, index) => {
                        const currentGlobalIndex = globalServiceIndex++;
                        return (
                          <ServiceCard
                            key={service.id}
                            service={service}
                            categoryName={category.name}
                            index={index}
                            locale={language}
                            translations={translations}
                            isPriority={currentGlobalIndex < 2}
                            onOpenDetail={() =>
                              setSelectedService({ service, categoryName: category.name })
                            }
                            onOpenGallery={(galleryIndex) =>
                              openLightbox(service.gallery, galleryIndex, service.name)
                            }
                            onPrefetch={prefetchServiceModal}
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-[#d8b8bd]/45 bg-white/75 px-6 py-16 text-center shadow-[0_18px_70px_rgba(78,45,55,0.07)] dark:border-white/10 dark:bg-white/[0.035]">
              <Flower2 className="mx-auto h-12 w-12 text-[#aa707a] dark:text-[#dda0aa]" />
              <p className="mt-5 font-playfair text-2xl font-semibold text-[#493039] dark:text-white">
                {translations.noServices}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#8e4e5b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#743c48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e4e5b] dark:bg-[#ca7988] dark:text-[#251419]"
              >
                {translations.resetFilters}
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
              {translations.finalEyebrow}
            </p>
            <h2 className="mt-5 font-playfair text-4xl font-medium leading-[1.06] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
              {translations.finalTitle}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/68">
              {translations.finalText}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/62">
              <ShieldCheck className="h-4 w-4 text-[#efbcc5]" />
              {translations.locationLabel}
            </p>
          </div>
          <Link
            href={localeHref("/booking/services", language)}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#5d3741] shadow-[0_18px_50px_rgba(25,10,15,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f7e9eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CalendarDays className="h-4 w-4" />
            {translations.bookNow}
          </Link>
        </div>
      </section>
    </main>
  );
}
