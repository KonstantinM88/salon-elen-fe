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

const BASE_URL = "https://permanent-halle.de";

function canonicalFor(locale: Locale): string {
  // / для de, /?lang=xx для ru/en
  return locale === "de" ? `${BASE_URL}/` : `${BASE_URL}/?lang=${locale}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveLocale(searchParams);
  const canonicalUrl = canonicalFor(locale);

  return {
    metadataBase: new URL(BASE_URL),

    title: metaTitles[locale],
    description: metaDescriptions[locale],

    alternates: {
      canonical: canonicalUrl,
      languages: {
        de: `${BASE_URL}/`,
        ru: `${BASE_URL}/?lang=ru`,
        en: `${BASE_URL}/?lang=en`,
        "x-default": `${BASE_URL}/`,
      },
    },

    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: canonicalUrl,
      siteName: "Salon Elen",
      type: "website",
      images: [`${BASE_URL}/images/hero.webp`],
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




//--------новый тест
// //---------полностью рабочий вариант с нормальными canonical/hreflang-------
// // // src/app/page.tsx
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
