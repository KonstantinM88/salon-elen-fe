// src/app/services/ServicesClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  Scissors,
  Palette,
  Heart,
  Star,
  ArrowRight,
  X,
  Images,
  ZoomIn,
  Euro,
  Calendar
} from "lucide-react";

// Типы
type GalleryItem = {
  id: string;
  image: string;
  caption: string | null;
};

type ServiceChild = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  durationMin: number;
  cover: string | null;
  gallery: GalleryItem[];
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

type Props = {
  categories: Category[];
  locale: string;
};

// Переводы
const t: Record<string, Record<string, string>> = {
  de: {
    title: "Unsere Leistungen",
    subtitle: "Entdecken Sie die Welt der Schönheit",
    bookNow: "Jetzt buchen",
    from: "ab",
    minutes: "Min.",
    noServices: "Keine Dienstleistungen verfügbar",
    allCategories: "Alle",
    photos: "Fotos",
    close: "Schließen",
    ourWorks: "Unsere Arbeiten",
    services: "Leistungen",
  },
  ru: {
    title: "Наши услуги",
    subtitle: "Откройте мир красоты и ухода",
    bookNow: "Записаться",
    from: "от",
    minutes: "мин.",
    noServices: "Услуги не найдены",
    allCategories: "Все",
    photos: "фото",
    close: "Закрыть",
    ourWorks: "Наши работы",
    services: "услуг",
  },
  en: {
    title: "Our Services",
    subtitle: "Discover the world of beauty",
    bookNow: "Book Now",
    from: "from",
    minutes: "min.",
    noServices: "No services available",
    allCategories: "All",
    photos: "photos",
    close: "Close",
    ourWorks: "Our Works",
    services: "services",
  },
};

// Иконки для категорий
const categoryIcons: Record<string, typeof Scissors> = {
  haircut: Scissors, haare: Scissors, hair: Scissors, frisur: Scissors, стрижка: Scissors,
  manicure: Palette, maniküre: Palette, nails: Palette, nagel: Palette, маникюр: Palette,
  makeup: Heart, "make-up": Heart, kosmetik: Heart, макияж: Heart,
  brows: Star, lashes: Star, permanent: Star, брови: Star, ресницы: Star,
  default: Star,
};

function getCategoryIcon(slug: string) {
  const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
  return categoryIcons[key || "default"];
}

// Форматирование цены
function formatPrice(cents: number | null, locale: string) {
  if (!cents) return null;
  const euros = cents / 100;
  return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(euros);
}

// Градиенты
const gradients = [
  "from-rose-500/30 via-fuchsia-500/30 to-violet-500/30",
  "from-amber-500/30 via-orange-500/30 to-rose-500/30",
  "from-emerald-500/30 via-teal-500/30 to-cyan-500/30",
  "from-blue-500/30 via-indigo-500/30 to-violet-500/30",
  "from-pink-500/30 via-rose-500/30 to-orange-500/30",
];

// ====== ЛАЙТБОКС ГАЛЕРЕИ ======
function GalleryLightbox({ 
  images, currentIndex, onClose, onPrev, onNext, serviceName,
}: { 
  images: GalleryItem[]; currentIndex: number; 
  onClose: () => void; onPrev: () => void; onNext: () => void;
  serviceName: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const currentImage = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-50">
        <p className="text-white/80 text-sm">{currentIndex + 1} / {images.length}</p>
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-[95vw] max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-xl sm:rounded-2xl" />
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl sm:rounded-b-2xl">
            <p className="text-white text-center text-sm">{currentImage.caption}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ====== МОДАЛКА ДЕТАЛЕЙ УСЛУГИ ======
function ServiceDetailModal({
  service, categoryName, onClose, onOpenGallery, translations, locale,
}: {
  service: ServiceChild; categoryName: string; onClose: () => void;
  onOpenGallery: (index: number) => void;
  translations: Record<string, string>; locale: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 sm:rounded-3xl rounded-t-3xl shadow-2xl border-t sm:border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
            {service.cover || service.gallery.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-fuchsia-600/40 to-violet-600/40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-white text-xs sm:text-sm font-medium">
                {categoryName}
              </span>
            </div>
            
            {/* Price badge */}
            {service.priceCents && (
              <div className="absolute bottom-4 right-4">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold text-sm sm:text-base shadow-lg">
                  {translations.from} {formatPrice(service.priceCents, locale)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 -mt-6 relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 pr-8">
              {service.name}
            </h2>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm">
                <Clock className="w-4 h-4 text-fuchsia-400" />
                {service.durationMin} {translations.minutes}
              </div>
              {service.priceCents && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm">
                  <Euro className="w-4 h-4 text-emerald-400" />
                  {translations.from} {formatPrice(service.priceCents, locale)}
                </div>
              )}
            </div>

            {/* Description */}
            {service.description && (
              <div className="mb-6">
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            )}

            {/* Gallery */}
            {service.gallery.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                  <Images className="w-4 h-4 text-fuchsia-400" />
                  {translations.ourWorks} ({service.gallery.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {service.gallery.slice(0, 8).map((item, idx) => (
                    <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {idx === 7 && service.gallery.length > 8 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold">+{service.gallery.length - 8}</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
              <Link
                href={`/booking?service=${service.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-xl text-white font-semibold shadow-lg shadow-fuchsia-500/25 transition-all active:scale-[0.98]"
              >
                <Calendar className="w-5 h-5" />
                {translations.bookNow}
              </Link>
              <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
                {translations.close}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ====== КАРТОЧКА УСЛУГИ ======
function ServiceCard({
  service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale
}: {
  service: ServiceChild; categoryName: string; index: number;
  onOpenDetail: () => void; onOpenGallery: (index: number) => void;
  translations: Record<string, string>; locale: string;
}) {
  const hasImage = service.cover || service.gallery.length > 0;
  const imageUrl = service.cover || service.gallery[0]?.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <div 
        onClick={onOpenDetail}
        className={`
          relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer
          bg-gradient-to-br ${gradients[index % gradients.length]}
          border border-white/10 hover:border-fuchsia-500/40
          transition-all duration-500
          hover:shadow-xl hover:shadow-fuchsia-500/10
          active:scale-[0.98] sm:hover:-translate-y-1
        `}
      >
        {/* Image */}
        <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          {/* Price */}
          {service.priceCents && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs sm:text-sm font-bold">
                {translations.from} {formatPrice(service.priceCents, locale)}
              </span>
            </div>
          )}

          {/* Gallery count */}
          {service.gallery.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }}
              className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur flex items-center gap-1 text-white text-xs hover:bg-black/70 transition-colors"
            >
              <Images className="w-3 h-3" />
              {service.gallery.length}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 line-clamp-2 group-hover:text-fuchsia-200 transition-colors">
            {service.name}
          </h3>
          
          {service.description && (
            <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 mb-3">
              {service.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-slate-400 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5" />
              {service.durationMin} {translations.minutes}
            </span>
          </div>

          {/* CTA */}
          <Link
            href={`/booking?service=${service.id}`}
            onClick={(e) => e.stopPropagation()}
            className="
              flex items-center justify-center gap-2 w-full
              px-4 py-2.5 sm:py-3 rounded-xl
              bg-gradient-to-r from-fuchsia-600 to-violet-600
              hover:from-fuchsia-500 hover:to-violet-500
              text-white font-semibold text-sm
              transition-all active:scale-[0.98]
              shadow-lg shadow-fuchsia-500/20
            "
          >
            {translations.bookNow}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ====== MAIN COMPONENT ======
export default function ServicesClient({ categories, locale }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
  const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);
  
  const translations = t[locale] || t.de;

  const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => {
    setSelectedService({ service, categoryName });
  }, []);

  const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => {
    setLightbox({ isOpen: true, images, currentIndex: index, serviceName });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const goToPrev = useCallback(() => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 });
  }, [lightbox]);

  const goToNext = useCallback(() => {
    if (!lightbox) return;
    setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length });
  }, [lightbox]);

  const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox?.isOpen && (
          <GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <ServiceDetailModal
            service={selectedService.service}
            categoryName={selectedService.categoryName}
            onClose={() => setSelectedService(null)}
            onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
            translations={translations}
            locale={locale}
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-6 sm:pt-16 sm:pb-12">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4 sm:mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-400" />
              <span className="text-xs sm:text-sm font-medium text-fuchsia-300">Premium Beauty</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-transparent">
                {translations.title}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-400 mb-6 sm:mb-8 px-4">
              {translations.subtitle}
            </p>

            {/* CTA */}
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg shadow-fuchsia-500/25 transition-all active:scale-95"
            >
              {translations.bookNow}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 z-40 bg-slate-950/90 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeCategory === null
                  ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {translations.allCategories}
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          {filteredCategories.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              className="mb-12 sm:mb-16 last:mb-0"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/20">
                  {(() => {
                    const Icon = getCategoryIcon(category.slug);
                    return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                    {category.name}
                  </h2>
                  <span className="text-xs sm:text-sm text-slate-500">
                    {category.children.length} {translations.services}
                  </span>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {category.children.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    categoryName={category.name}
                    index={index}
                    onOpenDetail={() => openServiceDetail(service, category.name)}
                    onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
                    translations={translations}
                    locale={locale}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {categories.length === 0 && (
            <div className="text-center py-16 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              </div>
              <p className="text-lg sm:text-xl text-slate-500">{translations.noServices}</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 via-violet-600/10 to-fuchsia-600/10" />
        
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              {locale === "de" ? "Bereit für Ihre Verwandlung?" : 
               locale === "ru" ? "Готовы к преображению?" : 
               "Ready for Your Transformation?"}
            </h2>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold text-base sm:text-lg shadow-xl transition-all active:scale-95"
            >
              {translations.bookNow}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}




//--------обновляем дизайн----
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Sparkles, 
//   Clock, 
//   ChevronRight,
//   ChevronLeft,
//   Scissors,
//   Palette,
//   Heart,
//   Star,
//   ArrowRight,
//   X,
//   Images,
//   ZoomIn,
//   Euro,
//   Info,
//   Calendar
// } from "lucide-react";

// // Типы
// type GalleryItem = {
//   id: string;
//   image: string;
//   caption: string | null;
// };

// type ServiceChild = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   priceCents: number | null;
//   durationMin: number;
//   cover: string | null;
//   gallery: GalleryItem[];
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   cover: string | null;
//   gallery: GalleryItem[];
//   children: ServiceChild[];
// };

// type Props = {
//   categories: Category[];
//   locale: string;
// };

// // Переводы
// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Entdecken Sie die Welt der Schönheit und Entspannung",
//     bookNow: "Jetzt buchen",
//     from: "ab",
//     minutes: "Min.",
//     viewAll: "Alle anzeigen",
//     noServices: "Keine Dienstleistungen verfügbar",
//     exploreCategory: "Kategorie erkunden",
//     popularServices: "Beliebte Dienstleistungen",
//     allCategories: "Alle Kategorien",
//     gallery: "Galerie",
//     viewGallery: "Galerie ansehen",
//     photos: "Fotos",
//     close: "Schließen",
//     moreInfo: "Mehr erfahren",
//     duration: "Dauer",
//     price: "Preis",
//     description: "Beschreibung",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Откройте для себя мир красоты и релаксации",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     viewAll: "Смотреть все",
//     noServices: "Услуги не найдены",
//     exploreCategory: "Подробнее",
//     popularServices: "Популярные услуги",
//     allCategories: "Все категории",
//     gallery: "Галерея",
//     viewGallery: "Смотреть галерею",
//     photos: "фото",
//     close: "Закрыть",
//     moreInfo: "Подробнее",
//     duration: "Длительность",
//     price: "Цена",
//     description: "Описание",
//     ourWorks: "Наши работы",
//     services: "услуг",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Discover the world of beauty and relaxation",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     viewAll: "View all",
//     noServices: "No services available",
//     exploreCategory: "Explore",
//     popularServices: "Popular Services",
//     allCategories: "All Categories",
//     gallery: "Gallery",
//     viewGallery: "View Gallery",
//     photos: "photos",
//     close: "Close",
//     moreInfo: "Learn more",
//     duration: "Duration",
//     price: "Price",
//     description: "Description",
//     ourWorks: "Our Works",
//     services: "services",
//   },
// };

// // Иконки для категорий
// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   стрижка: Scissors,
//   manicure: Palette,
//   maniküre: Palette,
//   nails: Palette,
//   nagel: Palette,
//   маникюр: Palette,
//   makeup: Heart,
//   "make-up": Heart,
//   kosmetik: Heart,
//   макияж: Heart,
//   brows: Star,
//   lashes: Star,
//   permanent: Star,
//   default: Star,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => 
//     slug.toLowerCase().includes(k)
//   );
//   return categoryIcons[key || "default"];
// }

// // Форматирование цены
// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   const euros = cents / 100;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(euros);
// }

// // Градиенты для карточек
// const gradients = [
//   "from-rose-500/30 via-fuchsia-500/30 to-violet-500/30",
//   "from-amber-500/30 via-orange-500/30 to-rose-500/30",
//   "from-emerald-500/30 via-teal-500/30 to-cyan-500/30",
//   "from-blue-500/30 via-indigo-500/30 to-violet-500/30",
//   "from-pink-500/30 via-rose-500/30 to-orange-500/30",
// ];

// // Компонент лайтбокса для галереи
// function GalleryLightbox({ 
//   images, 
//   currentIndex, 
//   onClose, 
//   onPrev, 
//   onNext,
//   serviceName,
// }: { 
//   images: GalleryItem[]; 
//   currentIndex: number; 
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       <div className="absolute top-4 left-4 z-50">
//         <h3 className="text-white font-semibold text-lg">{serviceName}</h3>
//         <p className="text-white/60 text-sm">{currentIndex + 1} / {images.length}</p>
//       </div>

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         transition={{ duration: 0.3 }}
//         className="relative max-w-5xl max-h-[80vh] mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={currentImage.image}
//           alt={currentImage.caption || serviceName}
//           className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
//         />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>

//       {images.length > 1 && (
//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur">
//           {images.map((img, idx) => (
//             <div
//               key={img.id}
//               className={`
//                 relative w-12 h-12 rounded-lg overflow-hidden transition-all
//                 ${idx === currentIndex ? "ring-2 ring-fuchsia-500 scale-110" : "opacity-60"}
//               `}
//             >
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img src={img.image} alt="" className="w-full h-full object-cover" />
//             </div>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// }

// // Модальное окно с деталями услуги
// function ServiceDetailModal({
//   service,
//   categoryName,
//   onClose,
//   onOpenGallery,
//   translations,
//   locale,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95, y: 20 }}
//         transition={{ duration: 0.3 }}
//         className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         {/* Header Image */}
//         <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-3xl">
//           {service.cover || service.gallery.length > 0 ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={service.cover || service.gallery[0]?.image}
//               alt={service.name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30">
//               <div className="absolute inset-0" style={{
//                 backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
//                 backgroundSize: "24px 24px"
//               }} />
//             </div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
//           {/* Category badge */}
//           <div className="absolute top-4 left-4">
//             <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm">
//               {categoryName}
//             </span>
//           </div>
          
//           {/* Price badge */}
//           {service.priceCents && (
//             <div className="absolute top-4 right-16">
//               <span className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         <div className="p-6 sm:p-8 -mt-16 relative">
//           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
//             {service.name}
//           </h2>

//           {/* Meta info */}
//           <div className="flex flex-wrap items-center gap-4 mb-6">
//             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
//               <Clock className="w-5 h-5 text-fuchsia-400" />
//               <span className="text-white">
//                 {service.durationMin} {translations.minutes}
//               </span>
//             </div>
//             {service.priceCents && (
//               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
//                 <Euro className="w-5 h-5 text-emerald-400" />
//                 <span className="text-white">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Description */}
//           {service.description && (
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
//                 <Info className="w-5 h-5 text-fuchsia-400" />
//                 {translations.description}
//               </h3>
//               <p className="text-slate-300 leading-relaxed whitespace-pre-line">
//                 {service.description}
//               </p>
//             </div>
//           )}

//           {/* Gallery */}
//           {service.gallery.length > 0 && (
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//                 <Images className="w-5 h-5 text-fuchsia-400" />
//                 {translations.ourWorks} ({service.gallery.length} {translations.photos})
//               </h3>
//               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
//                 {service.gallery.map((item, idx) => (
//                   <button
//                     key={item.id}
//                     onClick={() => onOpenGallery(idx)}
//                     className="relative aspect-square rounded-xl overflow-hidden group"
//                   >
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img
//                       src={item.image}
//                       alt={item.caption || ""}
//                       className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
//                     />
//                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
//                       <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* CTA */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <Link
//               href={`/booking?service=${service.id}`}
//               className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all"
//             >
//               <Calendar className="w-5 h-5" />
//               {translations.bookNow}
//             </Link>
//             <button
//               onClick={onClose}
//               className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
//             >
//               {translations.close}
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // Компонент мини-галереи в карточке услуги
// function ServiceGalleryPreview({ 
//   gallery, 
//   onOpenGallery,
//   translations
// }: { 
//   gallery: GalleryItem[]; 
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
// }) {
//   if (gallery.length === 0) return null;

//   return (
//     <div className="mt-4">
//       <div className="flex items-center gap-2 mb-2">
//         <Images className="w-4 h-4 text-fuchsia-400" />
//         <span className="text-xs text-slate-400">
//           {gallery.length} {translations.photos}
//         </span>
//       </div>
//       <div className="flex gap-1.5">
//         {gallery.slice(0, 4).map((item, idx) => (
//           <button
//             key={item.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               onOpenGallery(idx);
//             }}
//             className="relative group/thumb flex-1 aspect-square rounded-lg overflow-hidden"
//           >
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.caption || ""}
//               className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
//             />
//             <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
//               <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
//             </div>
//             {idx === 3 && gallery.length > 4 && (
//               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//                 <span className="text-white font-semibold">+{gallery.length - 4}</span>
//               </div>
//             )}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{
//     service: ServiceChild;
//     categoryName: string;
//   } | null>(null);
//   const [lightbox, setLightbox] = useState<{
//     isOpen: boolean;
//     images: GalleryItem[];
//     currentIndex: number;
//     serviceName: string;
//   } | null>(null);
  
//   const translations = t[locale] || t.de;

//   // Открыть модалку услуги
//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => {
//     setSelectedService({ service, categoryName });
//   }, []);

//   // Открыть лайтбокс
//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => {
//     setLightbox({ isOpen: true, images, currentIndex: index, serviceName });
//   }, []);

//   // Закрыть лайтбокс
//   const closeLightbox = useCallback(() => {
//     setLightbox(null);
//   }, []);

//   // Навигация в лайтбоксе
//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: lightbox.currentIndex === 0 
//         ? lightbox.images.length - 1 
//         : lightbox.currentIndex - 1
//     });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length
//     });
//   }, [lightbox]);

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
//       {/* Лайтбокс */}
//       <AnimatePresence>
//         {lightbox?.isOpen && (
//           <GalleryLightbox
//             images={lightbox.images}
//             currentIndex={lightbox.currentIndex}
//             onClose={closeLightbox}
//             onPrev={goToPrev}
//             onNext={goToNext}
//             serviceName={lightbox.serviceName}
//           />
//         )}
//       </AnimatePresence>

//       {/* Модалка деталей услуги */}
//       <AnimatePresence>
//         {selectedService && (
//           <ServiceDetailModal
//             service={selectedService.service}
//             categoryName={selectedService.categoryName}
//             onClose={() => setSelectedService(null)}
//             onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//             translations={translations}
//             locale={locale}
//           />
//         )}
//       </AnimatePresence>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         {/* Background Effects */}
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-500/5 via-fuchsia-500/5 to-violet-500/5 rounded-full blur-3xl" />
//         </div>

//         {/* Decorative dots pattern */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
//           <div className="absolute inset-0" style={{
//             backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
//             backgroundSize: "40px 40px"
//           }} />
//         </div>

//         <div className="relative container mx-auto px-4 pt-20 pb-16">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             className="text-center max-w-4xl mx-auto"
//           >
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20 mb-6"
//             >
//               <Sparkles className="w-4 h-4 text-fuchsia-400" />
//               <span className="text-sm font-medium text-fuchsia-300">
//                 Premium Beauty Services
//               </span>
//             </motion.div>

//             {/* Title */}
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
//               <span className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-transparent">
//                 {translations.title}
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
//               {translations.subtitle}
//             </p>

//             {/* CTA Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <Link
//                 href="/booking"
//                 className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-full text-white font-semibold text-lg shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105"
//               >
//                 {translations.bookNow}
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Categories Navigation */}
//       <section className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-xl border-y border-white/5">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
//             <button
//               onClick={() => setActiveCategory(null)}
//               className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
//                 activeCategory === null
//                   ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25"
//                   : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//               }`}
//             >
//               {translations.allCategories}
//             </button>
//             {categories.map((cat) => {
//               const Icon = getCategoryIcon(cat.slug);
//               return (
//                 <button
//                   key={cat.id}
//                   onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                   className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
//                     activeCategory === cat.id
//                       ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25"
//                       : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {cat.name}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Services Grid */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           {categories
//             .filter((cat) => !activeCategory || cat.id === activeCategory)
//             .map((category, catIndex) => (
//               <motion.div
//                 key={category.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: catIndex * 0.1 }}
//                 className="mb-20 last:mb-0"
//               >
//                 {/* Category Header */}
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/10">
//                       {(() => {
//                         const Icon = getCategoryIcon(category.slug);
//                         return <Icon className="w-8 h-8 text-fuchsia-400" />;
//                       })()}
//                     </div>
//                     <div>
//                       <h2 className="text-3xl sm:text-4xl font-bold text-white">
//                         {category.name}
//                       </h2>
//                       {category.description && (
//                         <p className="text-slate-400 mt-2 max-w-xl">{category.description}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     {category.gallery.length > 0 && (
//                       <button
//                         onClick={() => openLightbox(category.gallery, 0, category.name)}
//                         className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-sm"
//                       >
//                         <Images className="w-4 h-4" />
//                         {translations.viewGallery}
//                       </button>
//                     )}
//                     <span className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full">
//                       {category.children.length} {translations.services}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Services Grid */}
//                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                   {category.children.map((service, index) => (
//                     <motion.div
//                       key={service.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.5, delay: index * 0.05 }}
//                       className="group relative cursor-pointer"
//                       onClick={() => openServiceDetail(service, category.name)}
//                     >
//                       <div className={`
//                         relative overflow-hidden rounded-3xl
//                         bg-gradient-to-br ${gradients[index % gradients.length]}
//                         border border-white/10 hover:border-fuchsia-500/30
//                         transition-all duration-500
//                         hover:shadow-2xl hover:shadow-fuchsia-500/10
//                         hover:-translate-y-2
//                       `}>
//                         {/* Cover Image or Gradient */}
//                         <div className="relative h-52 overflow-hidden">
//                           {service.cover || service.gallery.length > 0 ? (
//                             // eslint-disable-next-line @next/next/no-img-element
//                             <img
//                               src={service.cover || service.gallery[0]?.image}
//                               alt={service.name}
//                               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                             />
//                           ) : (
//                             <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
//                               <div className="absolute inset-0 opacity-30">
//                                 <div className="absolute inset-0" style={{
//                                   backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
//                                   backgroundSize: "24px 24px"
//                                 }} />
//                               </div>
//                             </div>
//                           )}
                          
//                           {/* Overlay */}
//                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                          
//                           {/* Price Badge */}
//                           {service.priceCents && (
//                             <div className="absolute top-4 right-4">
//                               <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
//                                 <span className="text-sm font-bold text-white">
//                                   {translations.from} {formatPrice(service.priceCents, locale)}
//                                 </span>
//                               </div>
//                             </div>
//                           )}

//                           {/* Gallery indicator */}
//                           {service.gallery.length > 0 && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 openLightbox(service.gallery, 0, service.name);
//                               }}
//                               className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white text-xs hover:bg-black/60 transition-colors"
//                             >
//                               <Images className="w-3.5 h-3.5" />
//                               {service.gallery.length}
//                             </button>
//                           )}

//                           {/* More info hint */}
//                           <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="px-3 py-1.5 rounded-full bg-fuchsia-500/80 backdrop-blur text-white text-xs font-medium flex items-center gap-1">
//                               <Info className="w-3 h-3" />
//                               {translations.moreInfo}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Content */}
//                         <div className="relative p-6 -mt-6">
//                           <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-200 transition-colors">
//                             {service.name}
//                           </h3>
                          
//                           {service.description && (
//                             <p className="text-slate-400 text-sm line-clamp-2 mb-4">
//                               {service.description}
//                             </p>
//                           )}

//                           {/* Meta Info */}
//                           <div className="flex items-center gap-4 mb-4">
//                             <div className="flex items-center gap-1.5 text-slate-400">
//                               <Clock className="w-4 h-4" />
//                               <span className="text-sm">{service.durationMin} {translations.minutes}</span>
//                             </div>
//                           </div>

//                           {/* Gallery Preview */}
//                           {service.gallery.length > 0 && (
//                             <ServiceGalleryPreview
//                               gallery={service.gallery}
//                               onOpenGallery={(index) => openLightbox(service.gallery, index, service.name)}
//                               translations={translations}
//                             />
//                           )}

//                           {/* CTA Button */}
//                           <Link
//                             href={`/booking?service=${service.id}`}
//                             onClick={(e) => e.stopPropagation()}
//                             className="
//                               inline-flex items-center gap-2 w-full justify-center
//                               px-5 py-3.5 rounded-xl mt-4
//                               bg-gradient-to-r from-fuchsia-600 to-violet-600
//                               hover:from-fuchsia-500 hover:to-violet-500
//                               text-white font-semibold text-sm
//                               transition-all duration-300
//                               shadow-lg shadow-fuchsia-500/20
//                               hover:shadow-fuchsia-500/40
//                               hover:scale-[1.02]
//                             "
//                           >
//                             {translations.bookNow}
//                             <ChevronRight className="w-4 h-4" />
//                           </Link>
//                         </div>

//                         {/* Hover Glow Effect */}
//                         <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-fuchsia-500/5 to-violet-500/5" />
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               </motion.div>
//             ))}

//           {/* Empty State */}
//           {categories.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-20"
//             >
//               <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
//                 <Sparkles className="w-12 h-12 text-slate-500" />
//               </div>
//               <p className="text-2xl text-slate-400 font-medium">{translations.noServices}</p>
//             </motion.div>
//           )}
//         </div>
//       </section>

//       {/* Bottom CTA */}
//       <section className="py-24 relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 via-violet-600/20 to-fuchsia-600/20" />
//           <div className="absolute inset-0 opacity-30">
//             <div className="absolute inset-0" style={{
//               backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
//               backgroundSize: "32px 32px"
//             }} />
//           </div>
//         </div>
        
//         <div className="relative container mx-auto px-4 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
//               <Sparkles className="w-4 h-4 text-fuchsia-300" />
//               <span className="text-sm font-medium text-white/80">
//                 {locale === "de" ? "Jetzt verfügbar" : locale === "ru" ? "Доступно сейчас" : "Available now"}
//               </span>
//             </div>
//             <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
//               {locale === "de" ? "Bereit für Ihre Verwandlung?" : 
//                locale === "ru" ? "Готовы к преображению?" : 
//                "Ready for Your Transformation?"}
//             </h2>
//             <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
//               {locale === "de" ? "Buchen Sie jetzt Ihren Termin und erleben Sie Premium-Schönheitsservice." : 
//                locale === "ru" ? "Запишитесь сейчас и ощутите премиальный сервис красоты." : 
//                "Book your appointment now and experience premium beauty service."}
//             </p>
//             <Link
//               href="/booking"
//               className="
//                 inline-flex items-center gap-3 px-12 py-5
//                 bg-white text-slate-900 hover:bg-slate-100
//                 rounded-full font-bold text-lg
//                 shadow-2xl shadow-white/25
//                 hover:shadow-white/40
//                 transition-all duration-300
//                 hover:scale-105
//               "
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-5 h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>
//     </main>
//   );
// }




// "use client";

// import { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   Sparkles, 
//   Clock, 
//   ChevronRight,
//   ChevronLeft,
//   Scissors,
//   Palette,
//   Heart,
//   Star,
//   ArrowRight,
//   X,
//   Images,
//   ZoomIn
// } from "lucide-react";

// // Типы
// type GalleryItem = {
//   id: string;
//   image: string;
//   caption: string | null;
// };

// type ServiceChild = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   priceCents: number | null;
//   durationMin: number;
//   cover: string | null;
//   gallery: GalleryItem[];
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   cover: string | null;
//   gallery: GalleryItem[];
//   children: ServiceChild[];
// };

// type Props = {
//   categories: Category[];
//   locale: string;
// };

// // Переводы
// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Entdecken Sie die Welt der Schönheit und Entspannung",
//     bookNow: "Jetzt buchen",
//     from: "ab",
//     minutes: "Min.",
//     viewAll: "Alle anzeigen",
//     noServices: "Keine Dienstleistungen verfügbar",
//     exploreCategory: "Kategorie erkunden",
//     popularServices: "Beliebte Dienstleistungen",
//     allCategories: "Alle Kategorien",
//     gallery: "Galerie",
//     viewGallery: "Galerie ansehen",
//     photos: "Fotos",
//     close: "Schließen",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Откройте для себя мир красоты и релаксации",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     viewAll: "Смотреть все",
//     noServices: "Услуги не найдены",
//     exploreCategory: "Подробнее",
//     popularServices: "Популярные услуги",
//     allCategories: "Все категории",
//     gallery: "Галерея",
//     viewGallery: "Смотреть галерею",
//     photos: "фото",
//     close: "Закрыть",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Discover the world of beauty and relaxation",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     viewAll: "View all",
//     noServices: "No services available",
//     exploreCategory: "Explore",
//     popularServices: "Popular Services",
//     allCategories: "All Categories",
//     gallery: "Gallery",
//     viewGallery: "View Gallery",
//     photos: "photos",
//     close: "Close",
//   },
// };

// // Иконки для категорий
// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   manicure: Palette,
//   maniküre: Palette,
//   nails: Palette,
//   nagel: Palette,
//   makeup: Heart,
//   "make-up": Heart,
//   kosmetik: Heart,
//   default: Star,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => 
//     slug.toLowerCase().includes(k)
//   );
//   return categoryIcons[key || "default"];
// }

// // Форматирование цены
// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   const euros = cents / 100;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(euros);
// }

// // Градиенты для карточек
// const gradients = [
//   "from-rose-500/20 via-fuchsia-500/20 to-violet-500/20",
//   "from-amber-500/20 via-orange-500/20 to-rose-500/20",
//   "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
//   "from-blue-500/20 via-indigo-500/20 to-violet-500/20",
//   "from-pink-500/20 via-rose-500/20 to-orange-500/20",
// ];

// // Компонент лайтбокса для галереи
// function GalleryLightbox({ 
//   images, 
//   currentIndex, 
//   onClose, 
//   onPrev, 
//   onNext,
//   serviceName,
//   translations
// }: { 
//   images: GalleryItem[]; 
//   currentIndex: number; 
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
//   translations: Record<string, string>;
// }) {
//   // Обработка клавиатуры
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       {/* Close button */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Service name */}
//       <div className="absolute top-4 left-4 z-50">
//         <h3 className="text-white font-semibold text-lg">{serviceName}</h3>
//         <p className="text-white/60 text-sm">
//           {currentIndex + 1} / {images.length}
//         </p>
//       </div>

//       {/* Navigation arrows */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Main image */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         transition={{ duration: 0.3 }}
//         className="relative max-w-5xl max-h-[80vh] mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={currentImage.image}
//           alt={currentImage.caption || serviceName}
//           className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
//         />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>

//       {/* Thumbnails */}
//       {images.length > 1 && (
//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur">
//           {images.map((img, idx) => (
//             <button
//               key={img.id}
//               onClick={(e) => { e.stopPropagation(); /* setCurrentIndex(idx) handled via onPrev/onNext */ }}
//               className={`
//                 relative w-12 h-12 rounded-lg overflow-hidden transition-all
//                 ${idx === currentIndex ? "ring-2 ring-fuchsia-500 scale-110" : "opacity-60 hover:opacity-100"}
//               `}
//             >
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img
//                 src={img.image}
//                 alt=""
//                 className="w-full h-full object-cover"
//               />
//             </button>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// }

// // Компонент мини-галереи в карточке услуги
// function ServiceGalleryPreview({ 
//   gallery, 
//   onOpenGallery,
//   translations
// }: { 
//   gallery: GalleryItem[]; 
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
// }) {
//   if (gallery.length === 0) return null;

//   return (
//     <div className="mt-4">
//       <div className="flex items-center gap-2 mb-2">
//         <Images className="w-4 h-4 text-fuchsia-400" />
//         <span className="text-xs text-slate-400">
//           {gallery.length} {translations.photos}
//         </span>
//       </div>
//       <div className="flex gap-1.5">
//         {gallery.slice(0, 4).map((item, idx) => (
//           <button
//             key={item.id}
//             onClick={() => onOpenGallery(idx)}
//             className="relative group/thumb flex-1 aspect-square rounded-lg overflow-hidden"
//           >
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.caption || ""}
//               className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
//             />
//             <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
//               <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
//             </div>
//             {idx === 3 && gallery.length > 4 && (
//               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//                 <span className="text-white font-semibold">+{gallery.length - 4}</span>
//               </div>
//             )}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [lightbox, setLightbox] = useState<{
//     isOpen: boolean;
//     images: GalleryItem[];
//     currentIndex: number;
//     serviceName: string;
//   } | null>(null);
  
//   const translations = t[locale] || t.de;

//   // Открыть лайтбокс
//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => {
//     setLightbox({ isOpen: true, images, currentIndex: index, serviceName });
//     document.body.style.overflow = "hidden";
//   }, []);

//   // Закрыть лайтбокс
//   const closeLightbox = useCallback(() => {
//     setLightbox(null);
//     document.body.style.overflow = "";
//   }, []);

//   // Навигация в лайтбоксе
//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: lightbox.currentIndex === 0 
//         ? lightbox.images.length - 1 
//         : lightbox.currentIndex - 1
//     });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length
//     });
//   }, [lightbox]);

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
//       {/* Лайтбокс */}
//       <AnimatePresence>
//         {lightbox?.isOpen && (
//           <GalleryLightbox
//             images={lightbox.images}
//             currentIndex={lightbox.currentIndex}
//             onClose={closeLightbox}
//             onPrev={goToPrev}
//             onNext={goToNext}
//             serviceName={lightbox.serviceName}
//             translations={translations}
//           />
//         )}
//       </AnimatePresence>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         {/* Background Effects */}
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-500/5 via-fuchsia-500/5 to-violet-500/5 rounded-full blur-3xl" />
//         </div>

//         {/* Floating particles */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           {[...Array(30)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute w-1 h-1 bg-gradient-to-r from-fuchsia-400 to-violet-400 rounded-full"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//               }}
//               animate={{
//                 y: [0, -30, 0],
//                 opacity: [0.2, 0.8, 0.2],
//                 scale: [1, 1.5, 1],
//               }}
//               transition={{
//                 duration: 3 + Math.random() * 2,
//                 repeat: Infinity,
//                 delay: Math.random() * 2,
//                 ease: "easeInOut",
//               }}
//             />
//           ))}
//         </div>

//         <div className="relative container mx-auto px-4 pt-20 pb-16">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             className="text-center max-w-4xl mx-auto"
//           >
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20 mb-6"
//             >
//               <Sparkles className="w-4 h-4 text-fuchsia-400" />
//               <span className="text-sm font-medium text-fuchsia-300">
//                 Premium Beauty Services
//               </span>
//             </motion.div>

//             {/* Title */}
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
//               <span className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-transparent">
//                 {translations.title}
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
//               {translations.subtitle}
//             </p>

//             {/* CTA Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <Link
//                 href="/booking"
//                 className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-full text-white font-semibold text-lg shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105"
//               >
//                 {translations.bookNow}
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Categories Navigation */}
//       <section className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-xl border-y border-white/5">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
//             <button
//               onClick={() => setActiveCategory(null)}
//               className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
//                 activeCategory === null
//                   ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25"
//                   : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//               }`}
//             >
//               {translations.allCategories}
//             </button>
//             {categories.map((cat) => {
//               const Icon = getCategoryIcon(cat.slug);
//               return (
//                 <button
//                   key={cat.id}
//                   onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                   className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
//                     activeCategory === cat.id
//                       ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25"
//                       : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {cat.name}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Services Grid */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <AnimatePresence mode="wait">
//             {categories
//               .filter((cat) => !activeCategory || cat.id === activeCategory)
//               .map((category, catIndex) => (
//                 <motion.div
//                   key={category.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.5, delay: catIndex * 0.1 }}
//                   className="mb-20 last:mb-0"
//                 >
//                   {/* Category Header */}
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
//                     <div className="flex items-center gap-4">
//                       <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/10">
//                         {(() => {
//                           const Icon = getCategoryIcon(category.slug);
//                           return <Icon className="w-8 h-8 text-fuchsia-400" />;
//                         })()}
//                       </div>
//                       <div>
//                         <h2 className="text-3xl sm:text-4xl font-bold text-white">
//                           {category.name}
//                         </h2>
//                         {category.description && (
//                           <p className="text-slate-400 mt-2 max-w-xl">{category.description}</p>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       {category.gallery.length > 0 && (
//                         <button
//                           onClick={() => openLightbox(category.gallery, 0, category.name)}
//                           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-sm"
//                         >
//                           <Images className="w-4 h-4" />
//                           {translations.viewGallery}
//                         </button>
//                       )}
//                       <span className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full">
//                         {category.children.length} {locale === "de" ? "Leistungen" : locale === "ru" ? "услуг" : "services"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Services Grid */}
//                   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                     {category.children.map((service, index) => (
//                       <motion.div
//                         key={service.id}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: index * 0.05 }}
//                         className="group relative"
//                       >
//                         <div className={`
//                           relative overflow-hidden rounded-3xl
//                           bg-gradient-to-br ${gradients[index % gradients.length]}
//                           border border-white/10 hover:border-fuchsia-500/30
//                           transition-all duration-500
//                           hover:shadow-2xl hover:shadow-fuchsia-500/10
//                           hover:-translate-y-2
//                         `}>
//                           {/* Cover Image or Gradient */}
//                           <div className="relative h-52 overflow-hidden">
//                             {service.cover ? (
//                               // eslint-disable-next-line @next/next/no-img-element
//                               <img
//                                 src={service.cover}
//                                 alt={service.name}
//                                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                               />
//                             ) : service.gallery.length > 0 ? (
//                               // eslint-disable-next-line @next/next/no-img-element
//                               <img
//                                 src={service.gallery[0].image}
//                                 alt={service.name}
//                                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                               />
//                             ) : (
//                               <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
//                                 <div className="absolute inset-0 opacity-30">
//                                   <div className="absolute inset-0" style={{
//                                     backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
//                                     backgroundSize: "24px 24px"
//                                   }} />
//                                 </div>
//                               </div>
//                             )}
                            
//                             {/* Overlay */}
//                             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                            
//                             {/* Price Badge */}
//                             {service.priceCents && (
//                               <div className="absolute top-4 right-4">
//                                 <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
//                                   <span className="text-sm font-bold text-white">
//                                     {translations.from} {formatPrice(service.priceCents, locale)}
//                                   </span>
//                                 </div>
//                               </div>
//                             )}

//                             {/* Gallery indicator */}
//                             {service.gallery.length > 0 && (
//                               <button
//                                 onClick={() => openLightbox(service.gallery, 0, service.name)}
//                                 className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white text-xs hover:bg-black/60 transition-colors"
//                               >
//                                 <Images className="w-3.5 h-3.5" />
//                                 {service.gallery.length}
//                               </button>
//                             )}
//                           </div>

//                           {/* Content */}
//                           <div className="relative p-6 -mt-6">
//                             <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-200 transition-colors">
//                               {service.name}
//                             </h3>
                            
//                             {service.description && (
//                               <p className="text-slate-400 text-sm line-clamp-2 mb-4">
//                                 {service.description}
//                               </p>
//                             )}

//                             {/* Meta Info */}
//                             <div className="flex items-center gap-4 mb-4">
//                               <div className="flex items-center gap-1.5 text-slate-400">
//                                 <Clock className="w-4 h-4" />
//                                 <span className="text-sm">{service.durationMin} {translations.minutes}</span>
//                               </div>
//                             </div>

//                             {/* Gallery Preview */}
//                             {service.gallery.length > 0 && (
//                               <ServiceGalleryPreview
//                                 gallery={service.gallery}
//                                 onOpenGallery={(index) => openLightbox(service.gallery, index, service.name)}
//                                 translations={translations}
//                               />
//                             )}

//                             {/* CTA Button */}
//                             <Link
//                               href={`/booking?service=${service.id}`}
//                               className="
//                                 inline-flex items-center gap-2 w-full justify-center
//                                 px-5 py-3.5 rounded-xl mt-4
//                                 bg-gradient-to-r from-fuchsia-600 to-violet-600
//                                 hover:from-fuchsia-500 hover:to-violet-500
//                                 text-white font-semibold text-sm
//                                 transition-all duration-300
//                                 shadow-lg shadow-fuchsia-500/20
//                                 hover:shadow-fuchsia-500/40
//                                 hover:scale-[1.02]
//                               "
//                             >
//                               {translations.bookNow}
//                               <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
//                             </Link>
//                           </div>

//                           {/* Hover Glow Effect */}
//                           <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-fuchsia-500/5 to-violet-500/5" />
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </motion.div>
//               ))}
//           </AnimatePresence>

//           {/* Empty State */}
//           {categories.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-20"
//             >
//               <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
//                 <Sparkles className="w-12 h-12 text-slate-500" />
//               </div>
//               <p className="text-2xl text-slate-400 font-medium">{translations.noServices}</p>
//             </motion.div>
//           )}
//         </div>
//       </section>

//       {/* Bottom CTA */}
//       <section className="py-24 relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 via-violet-600/20 to-fuchsia-600/20" />
//           <div className="absolute inset-0 opacity-30">
//             <div className="absolute inset-0" style={{
//               backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
//               backgroundSize: "32px 32px"
//             }} />
//           </div>
//         </div>
        
//         <div className="relative container mx-auto px-4 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
//               <Sparkles className="w-4 h-4 text-fuchsia-300" />
//               <span className="text-sm font-medium text-white/80">
//                 {locale === "de" ? "Jetzt verfügbar" : locale === "ru" ? "Доступно сейчас" : "Available now"}
//               </span>
//             </div>
//             <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
//               {locale === "de" ? "Bereit für Ihre Verwandlung?" : 
//                locale === "ru" ? "Готовы к преображению?" : 
//                "Ready for Your Transformation?"}
//             </h2>
//             <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
//               {locale === "de" ? "Buchen Sie jetzt Ihren Termin und erleben Sie Premium-Schönheitsservice." : 
//                locale === "ru" ? "Запишитесь сейчас и ощутите премиальный сервис красоты." : 
//                "Book your appointment now and experience premium beauty service."}
//             </p>
//             <Link
//               href="/booking"
//               className="
//                 inline-flex items-center gap-3 px-12 py-5
//                 bg-white text-slate-900 hover:bg-slate-100
//                 rounded-full font-bold text-lg
//                 shadow-2xl shadow-white/25
//                 hover:shadow-white/40
//                 transition-all duration-300
//                 hover:scale-105
//               "
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-5 h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>
//     </main>
//   );
// }