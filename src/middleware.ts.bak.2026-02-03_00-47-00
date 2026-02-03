import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const response = NextResponse.next();

  // ✅ SEO: Передаём полный URL в headers для layout.tsx
  // response.headers.set('x-url', req.url);
  response.headers.set('x-pathname', pathname);

  // ✅ SEO: Читаем ?lang= и устанавливаем cookie если есть
  const langParam = req.nextUrl.searchParams.get('lang');
  if (langParam && ['de', 'ru', 'en'].includes(langParam)) {
    response.cookies.set('locale', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 год
      sameSite: 'lax',
    });
  }

  // ✅ Admin protection: Ограждаем всё под /admin
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

  return response;
}

// Применяем ко всем страницам кроме статических файлов
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|uploads|images|flags|video|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
