import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const SUPPORTED = new Set(["de", "ru", "en"]);
  const urlLang = req.nextUrl.searchParams.get("lang");
  const cookieLocale = req.cookies.get("locale")?.value;

  // ✅ 1) если lang валиден — сохраняем его в cookie
  if (urlLang && SUPPORTED.has(urlLang)) {
    const res = NextResponse.next();
    res.cookies.set("locale", urlLang, { path: "/", maxAge: 31536000 });
    return res;
  }

  // ✅ 2) если lang нет, но cookie ru/en — редиректим в URL с lang=
  if (!urlLang && cookieLocale && SUPPORTED.has(cookieLocale) && cookieLocale !== "de") {
    const url = req.nextUrl.clone();
    url.searchParams.set("lang", cookieLocale);
    return NextResponse.redirect(url);
  }

  // --- Админ защита ---
  if (pathname.startsWith(ADMIN_PREFIX)) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  response.headers.set("x-locale", cookieLocale || "de");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};





// -------03.02.26-------
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function middleware(req: NextRequest) {
//   const { pathname, search } = req.nextUrl;

//   // Ограждаем всё под /admin
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

//   return NextResponse.next();
// }

// // Применяем только к /admin/*
// export const config = {
//   matcher: ['/admin/:path*'],
// };




// // src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// /**
//  * Basic Auth отключён. Доступ к /admin теперь контролируется через NextAuth + RBAC.
//  * Middleware оставлен как «проходник», чтобы не менять структуру проекта.
//  */
// export function middleware(_req: NextRequest) {
//   return NextResponse.next();
// }

// // Можно убрать вовсе, но если хочешь сохранить область действия:
// export const config = {
//   matcher: ["/admin/:path*"],
// };
