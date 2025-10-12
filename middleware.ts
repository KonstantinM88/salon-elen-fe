import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Ограждаем всё под /admin
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Нет токена — отправляем на /login с возвратом назад после входа
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(url);
    }

    // Есть токен, но роль не ADMIN — на главную (или 403 страницу, если есть)
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

// Применяем только к /admin/*
export const config = {
  matcher: ['/admin/:path*'],
};




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
