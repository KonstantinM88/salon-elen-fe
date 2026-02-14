// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type Locale = "de" | "ru" | "en";

const SUPPORTED: Set<string> = new Set(["de", "ru", "en"]);

function isLocale(value: string): value is Locale {
  return SUPPORTED.has(value);
}

/**
 * pickLocale — for CONTENT rendering (uses cookie fallback).
 */
function pickLocale(req: NextRequest): Locale {
  const q = req.nextUrl.searchParams.get("lang");
  if (q && isLocale(q)) return q;

  const cookieLocale = req.cookies.get("locale")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  return "de";
}

/**
 * pickUrlLocale — for SEO headers (URL-only, NO cookie).
 * 
 * CRITICAL: This ensures canonical is always stable for Googlebot.
 * / → de, /?lang=ru → ru, /?lang=en → en
 */
function pickUrlLocale(req: NextRequest): Locale {
  const q = req.nextUrl.searchParams.get("lang");
  if (q && isLocale(q)) return q;
  return "de"; // No cookie fallback!
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const url = req.nextUrl.clone();
  const locale = pickLocale(req);
  const seoLocale = pickUrlLocale(req);

  // ✅ SEO headers for layout.tsx
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);
  requestHeaders.set("x-pathname", pathname);
  requestHeaders.set("x-seo-locale", seoLocale);

  // Canonical URLs — based on URL only, not cookie
  const cleanPath = pathname === "/" ? "" : pathname;
  const base = `${url.origin}${cleanPath}`;

  // de = clean URL, ru/en = with ?lang= param
  const canonicalDe = cleanPath ? base : `${url.origin}/`;
  const canonicalRu = `${base}${cleanPath ? "?" : "/?"}lang=ru`;
  const canonicalEn = `${base}${cleanPath ? "?" : "/?"}lang=en`;
  
  const canonical = seoLocale === "de" 
    ? canonicalDe 
    : seoLocale === "ru" ? canonicalRu : canonicalEn;

  requestHeaders.set("x-seo-canonical", canonical);
  requestHeaders.set("x-seo-hreflang-de", canonicalDe);
  requestHeaders.set("x-seo-hreflang-ru", canonicalRu);
  requestHeaders.set("x-seo-hreflang-en", canonicalEn);

  // ✅ Set cookie only if ?lang= is present in URL
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const langParam = req.nextUrl.searchParams.get("lang");
  if (langParam && isLocale(langParam)) {
    response.cookies.set("locale", langParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  // ✅ Admin protection
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|images|flags|video|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};




//--------работал до 14.02.26 исправляем для SEO
// // src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// type Locale = "de" | "ru" | "en";

// const SUPPORTED: Set<string> = new Set(["de", "ru", "en"]);

// function isLocale(value: string): value is Locale {
//   return SUPPORTED.has(value);
// }

// function pickLocale(req: NextRequest): Locale {
//   const q = req.nextUrl.searchParams.get("lang");
//   if (q && isLocale(q)) return q;

//   const cookieLocale = req.cookies.get("locale")?.value;
//   if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// export async function middleware(req: NextRequest) {
//   const { pathname, search } = req.nextUrl;
//   const url = req.nextUrl.clone();
//   const locale = pickLocale(req);

//   // ✅ SEO headers для layout.tsx
//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set("x-url", req.url);
//   requestHeaders.set("x-pathname", pathname);
//   requestHeaders.set("x-seo-locale", locale);

//   // Canonical URLs
//   const cleanPath = pathname === "/" ? "" : pathname;
//   const canonical = `${url.origin}${cleanPath}`;
//   const hreflangDe = canonical;
//   const hreflangRu = `${canonical}?lang=ru`;
//   const hreflangEn = `${canonical}?lang=en`;

//   requestHeaders.set("x-seo-canonical", canonical);
//   requestHeaders.set("x-seo-hreflang-de", hreflangDe);
//   requestHeaders.set("x-seo-hreflang-ru", hreflangRu);
//   requestHeaders.set("x-seo-hreflang-en", hreflangEn);

//   // ✅ Устанавливаем cookie если ?lang= присутствует
//   const response = NextResponse.next({
//     request: { headers: requestHeaders },
//   });

//   const langParam = req.nextUrl.searchParams.get("lang");
//   if (langParam && isLocale(langParam)) {
//     response.cookies.set("locale", langParam, {
//       path: "/",
//       maxAge: 60 * 60 * 24 * 365,
//       sameSite: "lax",
//     });
//   }

//   // ✅ Admin protection
//   if (pathname.startsWith("/admin")) {
//     const token = await getToken({
//       req,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     if (!token) {
//       const loginUrl = req.nextUrl.clone();
//       loginUrl.pathname = "/login";
//       loginUrl.searchParams.set("callbackUrl", pathname + search);
//       return NextResponse.redirect(loginUrl);
//     }

//     if (token.role !== "ADMIN") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|uploads|images|flags|video|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
//   ],
// };



//--------клод
// // src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const SUPPORTED = new Set(["de", "ru", "en"]);

// function pickLocale(req: NextRequest): "de" | "ru" | "en" {
//   const q = req.nextUrl.searchParams.get("lang") || "";
//   if (SUPPORTED.has(q)) return q as any;

//   const cookieLocale = req.cookies.get("locale")?.value;
//   if (cookieLocale && SUPPORTED.has(cookieLocale)) return cookieLocale as any;

//   return "de";
// }

// export function middleware(req: NextRequest) {
//   const url = req.nextUrl.clone();
//   const locale = pickLocale(req);

//   // canonical для главной: de = без query, ru/en = с query
//   const canonical =
//     locale === "de"
//       ? `${url.origin}/`
//       : `${url.origin}/?lang=${locale}`;

//   const de = `${url.origin}/`;
//   const ru = `${url.origin}/?lang=ru`;
//   const en = `${url.origin}/?lang=en`;

//   // Прокидываем в request headers, чтобы app/head.tsx мог это прочитать
//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set("x-seo-pathname", url.pathname); // '/'
//   requestHeaders.set("x-seo-locale", locale);
//   requestHeaders.set("x-seo-canonical", canonical);
//   requestHeaders.set("x-seo-hreflang-de", de);
//   requestHeaders.set("x-seo-hreflang-ru", ru);
//   requestHeaders.set("x-seo-hreflang-en", en);

//   return NextResponse.next({
//     request: { headers: requestHeaders },
//   });
// }

// export const config = {
//   matcher: ["/"], // важно: только главная
// };




//----------план Б
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(req: NextRequest) {
//   const { pathname, search } = req.nextUrl;
//   const response = NextResponse.next();

//   // ✅ SEO: Передаём полный URL в headers для layout.tsx
//   // response.headers.set('x-url', req.url);
//   response.headers.set('x-pathname', pathname);

//   // ✅ SEO: Читаем ?lang= и устанавливаем cookie если есть
//   const langParam = req.nextUrl.searchParams.get('lang');
//   if (langParam && ['de', 'ru', 'en'].includes(langParam)) {
//     response.cookies.set('locale', langParam, {
//       path: '/',
//       maxAge: 60 * 60 * 24 * 365, // 1 год
//       sameSite: 'lax',
//     });
//   }

//   // ✅ Admin protection: Ограждаем всё под /admin
//   if (pathname.startsWith('/admin')) {
//     const token = await getToken({
//       req,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     // Нет токена — отправляем на /login с возвратом назад после входа
//     if (!token) {
//       const url = req.nextUrl.clone();
//       url.pathname = '/login';
//       url.searchParams.set('callbackUrl', pathname + search);
//       return NextResponse.redirect(url);
//     }

//     // Есть токен, но роль не ADMIN — на главную (или 403 страницу, если есть)
//     if (token.role !== 'ADMIN') {
//       return NextResponse.redirect(new URL('/', req.url));
//     }
//   }

//   return response;
// }

// // Применяем ко всем страницам кроме статических файлов
// export const config = {
//   matcher: [
//     '/((?!_next/static|_next/image|favicon.ico|uploads|images|flags|video|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
//   ],
// };
