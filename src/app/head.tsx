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

  // Вставляем ТОЛЬКО для главной страницы.
  // Для остальных страниц пусть работает стандартный metadata Next (у тебя там всё ок).
  if (pathname !== "/") return null;

  return (
    <>
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
