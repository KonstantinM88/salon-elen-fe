"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, Euro, Heart, Images, X, ZoomIn } from "lucide-react";

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
};

type Props = {
  service: ServiceChild;
  categoryName: string;
  onClose: () => void;
  onOpenGallery: (index: number) => void;
  translations: Record<string, string>;
  locale: string;
};

function formatPrice(cents: number | null, locale: string) {
  if (!cents) return null;
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    },
  ).format(cents / 100);
}

export default function ServiceDetailModal({
  service,
  categoryName,
  onClose,
  onOpenGallery,
  translations,
  locale,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const hasImage = service.cover || service.gallery.length > 0;
  const imageUrl = service.cover || service.gallery[0]?.image;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-0 lg:pt-16 bg-black/70 lg:bg-black/80 backdrop-blur-sm lg:backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full lg:w-auto lg:max-w-5xl xl:max-w-6xl h-screen min-h-screen max-h-screen lg:h-auto lg:max-h-[85vh] lg:mx-4 overflow-hidden bg-white dark:bg-slate-950 rounded-t-3xl lg:rounded-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30 transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl lg:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)",
            }}
          />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
            >
              <Heart
                className={`${i % 2 === 0 ? "w-4 h-4" : "w-3 h-3"} text-rose-400/30`}
                fill="currentColor"
              />
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row h-full max-h-screen lg:max-h-[85vh]">
          <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 p-2 lg:p-2.5 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <div className="relative flex-shrink-0 h-48 sm:h-64 lg:h-auto lg:w-[45%] xl:w-[50%] overflow-hidden bg-black lg:rounded-l-3xl">
            {hasImage ? (
              <Image
                src={imageUrl!}
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white dark:from-slate-950 dark:via-slate-950/30 dark:to-transparent lg:dark:from-transparent lg:dark:via-transparent lg:dark:to-slate-950" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
                {categoryName}
              </span>
            </div>
            {service.priceCents && (
              <div className="absolute bottom-4 right-4 lg:hidden">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30">
                  {translations.from} {formatPrice(service.priceCents, locale)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto lg:overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 lg:pl-6">
              <div className="lg:flex lg:items-start lg:justify-between lg:gap-4 mb-4 lg:mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white pr-8 lg:pr-0 font-playfair">
                  {service.name}
                </h2>
                {service.priceCents && (
                  <div className="hidden lg:block flex-shrink-0 mt-1">
                    <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30">
                      {translations.from}{" "}
                      {formatPrice(service.priceCents, locale)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm lg:text-base">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />
                  {service.durationMin} {translations.minutes}
                </div>
                {service.priceCents && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm lg:text-base lg:hidden">
                    <Euro className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-400" />
                    {translations.from}{" "}
                    {formatPrice(service.priceCents, locale)}
                  </div>
                )}
              </div>
              {service.description && (
                <div className="relative mb-6 lg:mb-8 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none dark:hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={`light-desc-heart-${i}`}
                        className="absolute"
                        style={{
                          left: `${(i * 16) % 100}%`,
                          top: `${(i * 18) % 100}%`,
                        }}
                        animate={{
                          y: [0, -15, 0],
                          x: [0, i % 2 === 0 ? 8 : -8, 0],
                        }}
                        transition={{
                          duration: 8 + (i % 3) * 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart
                          className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60`}
                          fill="currentColor"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="absolute inset-0 pointer-events-none hidden dark:block">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={`dark-desc-heart-${i}`}
                        className="absolute"
                        style={{
                          left: `${(i * 16) % 100}%`,
                          top: `${(i * 18) % 100}%`,
                        }}
                        animate={{
                          y: [0, -12, 0],
                          x: [0, i % 2 === 0 ? 6 : -6, 0],
                        }}
                        transition={{
                          duration: 9 + (i % 3) * 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart
                          className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/30`}
                          fill="currentColor"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <p className="relative z-10 text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              )}
              {service.gallery.length > 0 && (
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-sm lg:text-base font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
                    <Images className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />
                    {translations.ourWorks} ({service.gallery.length})
                  </h3>
                  <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
                    {service.gallery.slice(0, 10).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => onOpenGallery(idx)}
                        className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30"
                      >
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="80px"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4 lg:pb-0">
                <Link
                  href={`/booking?service=${service.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl lg:rounded-2xl text-white font-semibold lg:text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
                  {translations.bookNow}
                </Link>
                <button
                  onClick={onClose}
                  className="sm:w-auto px-6 py-3.5 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium lg:text-lg transition-colors"
                >
                  {translations.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
