// src/lib/seo-locale-server.ts
import "server-only";

import { cookies } from "next/headers";
import { isSeoLocale, type SeoLocale, type SearchParamsPromise } from "@/lib/seo-locale";

async function getLang(searchParams?: SearchParamsPromise): Promise<string | undefined> {
  const sp = searchParams ? await searchParams : undefined;
  const raw = sp?.lang;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/**
 * resolveContentLocale — for page CONTENT rendering.
 * Uses cookie fallback so user sees their preferred language.
 */
export async function resolveContentLocale(
  searchParams?: SearchParamsPromise,
): Promise<SeoLocale> {
  const urlLang = await getLang(searchParams);
  if (isSeoLocale(urlLang)) return urlLang;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (isSeoLocale(cookieLocale)) return cookieLocale;

  return "de";
}
