// src/app/head.tsx
import { headers } from "next/headers";

export default async function Head() {
  const h = await headers();

  // Мы добавили эти заголовки в middleware
  const pathname = h.get("x-seo-pathname") || "";
  const canonical = h.get("x-seo-canonical") || "";
  const de = h.get("x-seo-hreflang-de") || "";
  const ru = h.get("x-seo-hreflang-ru") || "";
  const en = h.get("x-seo-hreflang-en") || "";

  const faviconIcoHref = "/favicon.ico?v=20260223icons1";
  const icon192Href = "/icon-192x192.png?v=20260223icons1";
  const icon512Href = "/icon-512x512.png?v=20260223icons1";
  const appleTouchHref = "/apple-touch-icon.png?v=20260223icons1";
  const manifestHref = "/site.webmanifest?v=20260223icons1";

  // На всех страницах явно задаём favicon, чтобы браузеры подхватывали новый файл стабильнее.
  if (pathname !== "/") {
    return (
      <>
        <link rel="icon" href={faviconIcoHref} sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href={icon192Href} />
        <link rel="icon" type="image/png" sizes="512x512" href={icon512Href} />
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchHref} />
        <link rel="manifest" href={manifestHref} />
        <link rel="shortcut icon" href={faviconIcoHref} />
      </>
    );
  }

  return (
    <>
      <link rel="icon" href={faviconIcoHref} sizes="any" />
      <link rel="icon" type="image/png" sizes="192x192" href={icon192Href} />
      <link rel="icon" type="image/png" sizes="512x512" href={icon512Href} />
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchHref} />
      <link rel="manifest" href={manifestHref} />
      <link rel="shortcut icon" href={faviconIcoHref} />

      {/* Canonical */}
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {/* hreflang */}
      {de ? <link rel="alternate" hrefLang="de" href={de} /> : null}
      {ru ? <link rel="alternate" hrefLang="ru" href={ru} /> : null}
      {en ? <link rel="alternate" hrefLang="en" href={en} /> : null}
      {de ? <link rel="alternate" hrefLang="x-default" href={de} /> : null}
    </>
  );
}
