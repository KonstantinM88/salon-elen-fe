// src/app/page.tsx
import { prisma } from "@/lib/db";
import HomePage from "@/components/home-page";
import type { Metadata } from "next";
import { cookies } from "next/headers";

// Главная страница зависит от query (?lang=..) и cookie (locale), поэтому фиксируем
// динамический рендер, чтобы Next не пытался "статически" нормализовать alternates/hreflang.
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

// ===== SEO / i18n helpers =====
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveLocale(searchParams);

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: {
      canonical: locale === "de" ? "/" : `/?lang=${locale}`,
      languages: {
        de: "/",
        ru: "/?lang=ru",
        en: "/?lang=en",
        "x-default": "/",
      },
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
