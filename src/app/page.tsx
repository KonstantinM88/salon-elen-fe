// src/app/page.tsx
import { prisma } from "@/lib/db";
import HomePage from "@/components/home-page";
import type { Metadata } from "next";
import {
  resolveUrlLocale,
  buildAlternates,
  BASE_URL,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";

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

const metaTitles: Record<SeoLocale, string> = {
  de: "Salon Elen — Kosmetiksalon in Halle (Saale) | Permanent Make-up & Nails",
  ru: "Salon Elen — салон красоты в Halle (Saale) | Перманентный макияж и ногти",
  en: "Salon Elen — Beauty Salon in Halle (Saale) | Permanent Make-up & Nails",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Professioneller Kosmetiksalon in Halle (Saale): Permanent Make-up, Wimpernverlängerung, Nageldesign, Microneedling. Jetzt online buchen!",
  ru: "Салон красоты в Halle (Saale): перманентный макияж, наращивание ресниц, маникюр, микронидлинг. Запись онлайн!",
  en: "Professional beauty salon in Halle (Saale): permanent make-up, lash extensions, nail design, microneedling. Book online now!",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/", locale);

  return {
    metadataBase: null,
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: alts,
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      images: [`${BASE_URL}/images/hero.webp`],
      type: "website",
      url: alts.canonical,
      siteName: "Salon Elen",
      locale: locale === "de" ? "de_DE" : locale === "ru" ? "ru_RU" : "en_US",
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





//------работал до 14.02.26 исправляем для SEO
// // // // // //---------полностью рабочий вариант с нормальными canonical/hreflang-------
// // // // // // // src/app/page.tsx
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


//--------версия gpt--------
// src/app/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";
// import HomePage from "@/components/home-page";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";

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

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
// };

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
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

//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   const u = new URL("/", BASE_URL);
//   if (locale !== "de") u.searchParams.set("lang", locale);
//   return u.toString();
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Salon Elen — Kosmetik & Permanent Make-up in Halle",
//   en: "Salon Elen — Beauty salon in Halle",
//   ru: "Salon Elen — салон красоты в Halle",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Kosmetikstudio in Halle: Permanent Make-up, Wimpern, Nägel, Microneedling. Online-Termin 24/7.",
//   en: "Beauty salon in Halle: permanent make-up, lashes, nails, microneedling. Online booking 24/7.",
//   ru: "Салон красоты в Halle: перманентный макияж, ресницы, ногти, микронидлинг. Онлайн-запись 24/7.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   const title = metaTitles[locale];
//   const description = metaDescriptions[locale];

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: ["/images/hero.webp"],
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

// function jsonLdHome(locale: Locale) {
//   const url = pageUrl(locale);

//   // Примечание: если у вас точные часы работы — подставь сюда
//   const openingHours = [
//     "Mo-Fr 10:00-19:00",
//     "Sa 10:00-16:00",
//   ];

//   const data = {
//     "@context": "https://schema.org",
//     "@graph": [
//       {
//         "@type": ["BeautySalon", "LocalBusiness"],
//         name: SALON.name,
//         url,
//         telephone: SALON.phone,
//         email: SALON.email,
//         image: [`${BASE_URL}/images/hero.webp`],
//         address: {
//           "@type": "PostalAddress",
//           streetAddress: SALON.streetAddress,
//           postalCode: SALON.postalCode,
//           addressLocality: SALON.addressLocality,
//           addressCountry: SALON.addressCountry,
//         },
//         openingHours,
//         priceRange: "$$",
//       },
//       {
//         "@type": "WebSite",
//         url,
//         name: SALON.name,
//         inLanguage: locale === "de" ? "de" : locale === "en" ? "en" : "ru",
//       },
//     ],
//   };

//   return JSON.stringify(data);
// }

// export default async function Page({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);
//   const latest = await getLatestArticles();

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: jsonLdHome(locale) }}
//       />
//       <HomePage latest={latest} locale={locale} />
//     </>
//   );
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


// ------test3 если не сработает удалить------
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

// const BASE_URL = "https://permanent-halle.de";

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

//   // ✅ ВАЖНО: absolute canonical с query — это то, что тебе нужно для индексации
//   const canonicalUrl =
//     locale === "de" ? `${BASE_URL}/` : `${BASE_URL}/?lang=${locale}`;

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],

//     // ✅ Оставляем ТОЛЬКО canonical.
//     // hreflang НЕ генерим из Next metadata, потому что он у тебя превращается в /
//     alternates: {
//       canonical: canonicalUrl,
//     },

//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       images: [`${BASE_URL}/images/hero.webp`],
//       type: "website",
//       // url НЕ ставим — чтобы Next не “нормализовал” снова
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
