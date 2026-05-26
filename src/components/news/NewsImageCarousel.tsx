"use client";

import Image from "next/image";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SeoLocale } from "@/lib/seo-locale";

type NewsImageCarouselProps = {
  images: string[];
  title: string;
  locale: SeoLocale;
};

type CarouselCopy = {
  previous: string;
  next: string;
  goTo: (index: number) => string;
};

const CAROUSEL_COPY: Record<SeoLocale, CarouselCopy> = {
  de: {
    previous: "Vorheriges Bild",
    next: "Naechstes Bild",
    goTo: (index) => `Bild ${index} anzeigen`,
  },
  ru: {
    previous: "Предыдущее фото",
    next: "Следующее фото",
    goTo: (index) => `Показать фото ${index}`,
  },
  en: {
    previous: "Previous image",
    next: "Next image",
    goTo: (index) => `Show image ${index}`,
  },
};

export default function NewsImageCarousel({
  images,
  title,
  locale,
}: NewsImageCarouselProps): React.JSX.Element | null {
  const slides = React.useMemo(
    () => Array.from(new Set(images.map((src) => src.trim()).filter(Boolean))),
    [images],
  );
  const [activeIndex, setActiveIndex] = React.useState(0);
  const copy = CAROUSEL_COPY[locale] ?? CAROUSEL_COPY.de;

  React.useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const activeSrc = slides[activeIndex];
  const hasMany = slides.length > 1;

  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + slides.length) % slides.length);
  };

  return (
    <figure className="mb-6 overflow-hidden rounded-2xl border border-gray-200/70 shadow-sm dark:border-gray-800">
      <div className="relative aspect-[16/9] bg-black">
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={`${title} ${activeIndex + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
          className="object-contain"
          priority={activeIndex === 0}
          unoptimized={activeSrc.startsWith("/uploads/")}
        />

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={copy.previous}
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={copy.next}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-sm transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1}/{slides.length}
            </div>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex items-center justify-center gap-2 bg-white px-3 py-3 dark:bg-gray-950">
          {slides.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={copy.goTo(index + 1)}
              aria-current={index === activeIndex}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-7 bg-rose-600 dark:bg-rose-300"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
