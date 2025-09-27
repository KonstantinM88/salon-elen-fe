"use client";

import Image, { ImageProps } from "next/image";
import { memo } from "react";

/**
 * Безопасный показ изображений:
 * - поддерживает пустой src (рендерит встроенный SVG-плейсхолдер);
 * - не требует настройки доменов (unoptimized: true);
 * - аккуратно работает с fill/width/height.
 */
type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

const PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630' role='img' aria-label='no image'>
      <rect width='1200' height='630' fill='#111827'/>
      <rect x='24' y='24' width='1152' height='582' rx='24' fill='#1f2937'/>
      <path d='M200 450L380 300l140 120 180-160 220 190H200z' fill='#374151'/>
      <circle cx='360' cy='260' r='36' fill='#374151'/>
    </svg>`
  );

function normalizeSrc(src?: string | null): string {
  if (!src || src.trim() === "") return PLACEHOLDER;
  return src;
}

function SafeImageBase({ src, alt, ...rest }: Props) {
  const finalSrc = normalizeSrc(src);
  return (
    <Image
      unoptimized
      src={finalSrc}
      alt={alt}
      {...rest}
    />
  );
}

const SafeImage = memo(SafeImageBase);
export default SafeImage;
