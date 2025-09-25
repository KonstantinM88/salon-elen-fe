"use client";

import Image, { ImageProps } from "next/image";
import * as React from "react";

/**
 * Параметры безопасной картинки.
 * Осознанно не пробрасываем `fill` снаружи — управляем им через флаг `cover`.
 */
type SafeImageProps = Omit<ImageProps, "src" | "alt" | "fill" | "width" | "height"> & {
  /** Путь к изображению (локальный или внешний) */
  src: string;
  /** Альтернативный текст */
  alt: string;
  /** Принудительно использовать <img> (обойти next/image) */
  forceImg?: boolean;
  /** Заполнять контейнер (object-cover + fill для next/image) */
  cover?: boolean;
  /** Фиксированные размеры (если не cover). По умолчанию 1200×675 */
  fixedWidth?: number;
  fixedHeight?: number;
  /** Дополнительный className (пробрасывается и в <img>, и в <Image/>) */
  className?: string;
};

/** Проверка: внешний ли URL */
function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * SafeImage:
 * - для локальных путей (или когда домен разрешён) — рендерит `<Image />`;
 * - для внешних (неразрешённых) — рендерит `<img>`, чтобы избежать ошибок next/image.
 */
export default function SafeImage(props: SafeImageProps) {
  const {
    src,
    alt,
    forceImg,
    cover,
    className,
    fixedWidth = 1200,
    fixedHeight = 675,
    // из ImageProps нам пригодятся лишь некоторые поля в ветке <Image/>
    // всё остальное (например, onLoadingComplete) спокойно пробрасываем:
    ...imageOnlyRest
  } = props;

  const external = isExternalUrl(src);
  const useImg = forceImg || external;

  if (useImg) {
    // Фоллбэк на обычный <img> для внешних доменов
    const style: React.CSSProperties | undefined = cover
      ? { width: "100%", height: "100%", objectFit: "cover" }
      : undefined;

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        style={style}
      />
    );
  }

  // Локальный путь — используем next/image.
  if (cover) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className={className}
        {...imageOnlyRest}
      />
    );
    // width/height не нужны при fill
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fixedWidth}
      height={fixedHeight}
      className={className}
      {...imageOnlyRest}
    />
  );
}
