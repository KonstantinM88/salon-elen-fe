// src/lib/seo-locale.ts
// Shared SEO locale resolver — URL-only, NO cookie fallback.
// Use this for generateMetadata to ensure stable canonical/hreflang.

const SUPPORTED = ["de", "ru", "en"] as const;
export type SeoLocale = (typeof SUPPORTED)[number];

type SearchParams = Record<string, string | string[] | undefined>;
export type SearchParamsPromise = Promise<SearchParams>;

export function isSeoLocale(v: unknown): v is SeoLocale {
  return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
}

async function getLang(searchParams?: SearchParamsPromise): Promise<string | undefined> {
  const sp = searchParams ? await searchParams : undefined;
  const raw = sp?.lang;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/**
 * resolveUrlLocale — for SEO metadata (canonical, hreflang, og:url).
 * Based on URL ?lang= param ONLY. No cookie fallback.
 * 
 * / → de
 * /?lang=ru → ru  
 * /?lang=en → en
 */
export async function resolveUrlLocale(searchParams?: SearchParamsPromise): Promise<SeoLocale> {
  const urlLang = await getLang(searchParams);
  if (isSeoLocale(urlLang)) return urlLang;
  return "de";
}

/**
 * Server-side content locale resolver (with cookie fallback) lives in:
 * `@/lib/seo-locale-server`
 */

export const BASE_URL = "https://permanent-halle.de";

/**
 * Generate alternates object for a given path.
 * e.g. buildAlternates("/services") → { canonical, languages }
 */
export function buildAlternates(path: string, locale: SeoLocale) {
  const cleanPath = path === "/" ? "" : path;
  const base = `${BASE_URL}${cleanPath}`;
  const sep = cleanPath ? "?" : "/?";

  const canonical = locale === "de"
    ? (cleanPath ? base : `${BASE_URL}/`)
    : `${base}${sep}lang=${locale}`;

  return {
    canonical,
    languages: {
      "de": cleanPath ? base : `${BASE_URL}/`,
      "ru": `${base}${sep}lang=ru`,
      "en": `${base}${sep}lang=en`,
      "x-default": cleanPath ? base : `${BASE_URL}/`,
    },
  };
}
