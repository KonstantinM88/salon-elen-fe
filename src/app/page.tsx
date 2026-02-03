// ------test3 если не сработает удалить------
// src/app/page.tsx
import { prisma } from "@/lib/db";
import HomePage from "@/components/home-page";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type KnownType = "ARTICLE" | "NEWS" | "PROMO";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  type: KnownType;
};

const SUPPORTED = ["de", "ru", "en"] as const;
type Locale = (typeof SUPPORTED)[number];

type SearchParams = Record<string, string | string[] | undefined>;
type SearchParamsPromise = Promise<SearchParams>;

const BASE_URL = "https://permanent-halle.de";

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
}

async function getLangFromSearchParams(
  searchParams?: SearchParamsPromise,
): Promise<string | undefined> {
  const sp = searchParams ? await searchParams : undefined;
  const raw = sp?.lang;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
  const urlLang = await getLangFromSearchParams(searchParams);
  if (isLocale(urlLang)) return urlLang;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  return "de";
}

const metaTitles: Record<Locale, string> = {
  de: "Salon Elen",
  ru: "Salon Elen — салон красоты в Halle",
  en: "Salon Elen — beauty salon in Halle",
};

const metaDescriptions: Record<Locale, string> = {
  de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
  ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
  en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveLocale(searchParams);

  // ✅ ВАЖНО: absolute canonical с query — это то, что тебе нужно для индексации
  const canonicalUrl =
    locale === "de" ? `${BASE_URL}/` : `${BASE_URL}/?lang=${locale}`;

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],

    // ✅ Оставляем ТОЛЬКО canonical.
    // hreflang НЕ генерим из Next metadata, потому что он у тебя превращается в /
    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      images: [`${BASE_URL}/images/hero.webp`],
      type: "website",
      // url НЕ ставим — чтобы Next не “нормализовал” снова
    },

    twitter: {
      card: "summary_large_image",
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      images: [`${BASE_URL}/images/hero.webp`],
    },
  };
}

async function getLatestArticles(): Promise<ArticleItem[]> {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ createdAt: "desc" }],
    take: 3,
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    cover: r.cover,
    type: (r.type ?? "NEWS") as KnownType,
  }));
}

export default async function Page() {
  const latest = await getLatestArticles();
  return <HomePage latest={latest} />;
}





//---------полностью рабочий вариант с нормальными canonical/hreflang-------
// // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen",
//   ru: "Salon Elen — салон красоты в Halle",
//   en: "Salon Elen — beauty salon in Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
//   ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
//   en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
// };

// const BASE_URL = "https://permanent-halle.de";

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   // Canonical URLs - без trailing slash для query параметров
//   const canonicalUrl = locale === "de" 
//     ? `${BASE_URL}/` 
//     : `${BASE_URL}/?lang=${locale}`;

//   return {
//     // Явно переопределяем metadataBase чтобы избежать нормализации
//     metadataBase: null,
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: canonicalUrl,
//     },
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: [`${BASE_URL}/images/hero.webp`],
//       type: "website",
//       url: canonicalUrl,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: [`${BASE_URL}/images/hero.webp`],
//     },
//   };
// }

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }




//---------почти рабочий вариант если что вернуть-------
// // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen",
//   ru: "Salon Elen — салон красоты в Halle",
//   en: "Salon Elen — beauty salon in Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
//   ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
//   en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
// };

// const BASE_URL = "https://permanent-halle.de";

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   const canonicalUrl = locale === "de" 
//     ? `${BASE_URL}/` 
//     : `${BASE_URL}/?lang=${locale}`;

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: canonicalUrl,
//       // ❗ hreflang добавляется через HomeSeoTags компонент (Next.js баг с query params)
//     },
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: [`${BASE_URL}/images/hero.webp`],
//       type: "website",
//       url: canonicalUrl,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: [`${BASE_URL}/images/hero.webp`],
//     },
//   };
// }

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }





//---------следующий клоуд вариант-------
// // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// // ===== SEO / i18n helpers =====
// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen",
//   ru: "Salon Elen — салон красоты в Halle",
//   en: "Salon Elen — beauty salon in Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
//   ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
//   en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   // Важно: canonical/hreflang для главной страницы делаем вручную через app/head.tsx (План Б),
//   // т.к. Next на "/" выкидывает query и "склеивает" alternates.
//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     // Можно оставить OG/Twitter — они у тебя работают корректно
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: ["https://permanent-halle.de/images/hero.webp"],
//       type: "website",
//       url:
//         locale === "de"
//           ? "https://permanent-halle.de/"
//           : `https://permanent-halle.de/?lang=${locale}`,
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: ["https://permanent-halle.de/images/hero.webp"],
//     },
//   };
// }

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }





// //--------План Б
// // // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// // Главная страница зависит от query (?lang=..) и cookie (locale), поэтому фиксируем
// // динамический рендер, чтобы Next не пытался "статически" нормализовать alternates/hreflang.
// export const dynamic = "force-dynamic";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// // ===== SEO / i18n helpers =====
// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen",
//   ru: "Salon Elen — салон красоты в Halle",
//   en: "Salon Elen — beauty salon in Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
//   ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
//   en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   // Важно: на главной Next иногда "схлопывает" строки canonical/hreflang.
//   // Поэтому здесь отдаём абсолютные URL (URL objects), чтобы query (?lang=) не терялся.
//   const base =
//     process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://permanent-halle.de";

//   const de = new URL("/", base);
//   const ru = new URL("/?lang=ru", base);
//   const en = new URL("/?lang=en", base);

//   const canonical = locale === "de" ? de : locale === "ru" ? ru : en;

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical,
//       languages: {
//         de,
//         ru,
//         en,
//         "x-default": de,
//       },
//     },
//   };
// }

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }





//---------почти как надо но добиваем------
// // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// // Главная страница зависит от query (?lang=..) и cookie (locale), поэтому фиксируем
// // динамический рендер, чтобы Next не пытался "статически" нормализовать alternates/hreflang.
// export const dynamic = "force-dynamic";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// // ===== SEO / i18n helpers =====
// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen",
//   ru: "Salon Elen — салон красоты в Halle",
//   en: "Salon Elen — beauty salon in Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
//   ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
//   en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: locale === "de" ? "/" : `/?lang=${locale}`,
//       languages: {
//         de: "/",
//         ru: "/?lang=ru",
//         en: "/?lang=en",
//         "x-default": "/",
//       },
//     },
//   };
// }

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }




//--------03.02.26-----
// // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// // ===== SEO / i18n helpers =====
// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// function getLangFromSearchParamsObj(sp?: SearchParams): string | undefined {
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const sp = searchParams ? await searchParams : undefined;

//   const urlLang = getLangFromSearchParamsObj(sp);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen",
//   ru: "Salon Elen — салон красоты в Halle",
//   en: "Salon Elen — beauty salon in Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetiksalon in Halle – Leistungen, Preise, Kontakt",
//   ru: "Салон красоты в Halle: услуги, цены, контакты. Онлайн-запись.",
//   en: "Beauty salon in Halle: services, prices, contacts. Online booking.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: "/",
//       languages: {
//         de: "/",
//         ru: "/?lang=ru",
//         en: "/?lang=en",
//         "x-default": "/",
//       },
//     },
//   };
// }

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }






// // src/app/page.tsx
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   alternates: {
//     canonical: '/',
//     languages: {
//       de: '/',
//       ru: '/?lang=ru',
//       en: '/?lang=en',
//       'x-default': '/',
//     },
//   },
// };

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// export default async function Page() {
//   const latest = await getLatestArticles();
//   return <HomePage latest={latest} />;
// }
