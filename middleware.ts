// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Basic Auth отключён. Доступ к /admin теперь контролируется через NextAuth + RBAC.
 * Middleware оставлен как «проходник», чтобы не менять структуру проекта.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Можно убрать вовсе, но если хочешь сохранить область действия:
export const config = {
  matcher: ["/admin/:path*"],
};
