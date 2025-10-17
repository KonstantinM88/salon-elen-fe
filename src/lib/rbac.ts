// src/lib/rbac.ts
// server-only

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

// Реэкспортируем готовые строгие гарды и типы из rbac-guards,
// чтобы импортом "@/lib/rbac" были доступны requireRole и др.
export { requireRole, getSessionStrict, assertAdmin, assertAdminOrOwnMaster, isAdminOrOwnMaster } from "@/lib/rbac-guards";
export type { SessionInfo } from "@/lib/rbac-guards";

/** Локальный тип для минимальной сессии, возвращаемой экшен-гардами */
export type ActionSession = {
  user: {
    id: string;
    role: Role;
  };
  masterId: string | null;
};

/** Узкий type-guard для role */
function isRole(x: unknown): x is Role {
  return x === "ADMIN" || x === "MASTER" || x === "USER";
}

/**
 * Гард для server actions (выполняются на сервере без рендера страниц):
 * — требует наличие авторизованного пользователя
 * — требует роль ADMIN
 * Возвращает минимальную «сессию для действий», чтобы не тянуть всё подряд.
 */
export async function assertAdminAction(): Promise<ActionSession> {
  const session = await getServerSession(authOptions);

  const okUser =
    session?.user &&
    typeof session.user.id === "string" &&
    isRole((session.user as { role?: unknown }).role);

  if (!okUser) {
    throw new Error("Unauthorized");
  }

  const role = (session.user as { role: Role }).role;
  if (role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return {
    user: { id: session.user.id, role },
    // Экшенам иногда нужен masterId — у админа его нет
    masterId: null,
  };
}

/**
 * Пример «action-гарда» для мастера или админа.
 * Если понадобится, можно вызывать из server actions.
 */
export async function assertMasterOrAdminAction(): Promise<ActionSession> {
  const session = await getServerSession(authOptions);

  const okUser =
    session?.user &&
    typeof session.user.id === "string" &&
    isRole((session.user as { role?: unknown }).role);

  if (!okUser) {
    throw new Error("Unauthorized");
  }

  const role = (session.user as { role: Role }).role;
  if (role !== "ADMIN" && role !== "MASTER") {
    throw new Error("Forbidden");
  }

  return {
    user: { id: session.user.id, role },
    // у ADMIN masterId = null, у MASTER — может быть строка
    masterId: (session.user as { masterId?: string | null }).masterId ?? null,
  };
}

/**
 * Middleware helper: запрещает доступ неадминам.
 * Можно использовать в route handlers/middleware для быстрого ответа 403.
 */
export async function ensureAdminResponse(): Promise<Response | null> {
  const session = await getServerSession(authOptions);

  const okUser =
    session?.user &&
    typeof session.user.id === "string" &&
    isRole((session.user as { role?: unknown }).role);

  if (!okUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: Role }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // всё ок
}

/**
 * Middleware helper: админ или мастер сам про себя.
 * Если нужен быстрый ответ 403/401 в хэндлерах.
 */
export async function ensureAdminOrOwnMasterResponse(targetMasterId: string): Promise<Response | null> {
  const session = await getServerSession(authOptions);

  const okUser =
    session?.user &&
    typeof session.user.id === "string" &&
    isRole((session.user as { role?: unknown }).role);

  if (!okUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: Role }).role;
  const masterId = (session.user as { masterId?: string | null }).masterId ?? null;

  const isAdmin = role === "ADMIN";
  const isOwnMaster = role === "MASTER" && masterId && masterId === targetMasterId;

  if (!isAdmin && !isOwnMaster) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/* ───────────────────────── Черновики/утилиты (оставлены закомментированными для справки) ───────────────────────── */

// Ниже — примеры, которые можно быстро реанимировать при необходимости.
// Они оставлены закомментированными, чтобы не менять текущую бизнес-логику,
// но служат шпаргалкой для будущих задач авторизации.

/*
// Универсальная проверка роли
export function hasRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
}

// Пресет-обёртка: только админ
export async function requireAdmin() {
  await requireRole(["ADMIN"] as const);
}

// Пример базового requireRole, если когда-то уйдём от rbac-guards:
import { redirect } from "next/navigation";
export async function requireRoleLocal(allowed: readonly Role[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as Role | undefined;

  if (!role || !allowed.includes(role)) {
    redirect("/login?error=unauthorized");
  }
  return session;
}
*/

/*
// Удобные пресеты
export const ROLES = {
  ADMIN_ONLY: ["ADMIN"] as const,
  MASTER_OR_ADMIN: ["MASTER", "ADMIN"] as const,
  ANY_AUTHENTICATED: ["USER", "MASTER", "ADMIN"] as const,
};
*/







///-------------работал но ругался при деплои 
// // src/lib/rbac.ts
// // server-only

// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";
// import { authOptions } from "@/lib/auth";
// import type { Role } from "@prisma/client";

// // Реэкспортируем готовые строгие гарды и типы из rbac-guards,
// // чтобы импортом "@/lib/rbac" были доступны requireRole и др.
// export {
//   requireRole,
//   getSessionStrict,
//   assertAdmin,
//   assertAdminOrOwnMaster,
//   isAdminOrOwnMaster,
//   type SessionInfo,
// } from "@/lib/rbac-guards";

// /** Локальный тип для минимальной сессии, возвращаемой экшен-гардами */
// export type ActionSession = {
//   user: {
//     id: string;
//     role: Role;
//   };
//   masterId: string | null;
// };

// // Узкий type guard для роли (без any)
// function isRole(v: unknown): v is Role {
//   return v === "USER" || v === "MASTER" || v === "ADMIN";
// }

// /** ADMIN-только: бросает Error для server actions */
// export async function assertAdminAction(): Promise<ActionSession> {
//   const session = await getServerSession(authOptions);

//   const okUser =
//     session?.user &&
//     typeof session.user.id === "string" &&
//     isRole((session.user as { role?: unknown }).role);

//   if (!okUser) {
//     throw new Error("Unauthorized");
//   }

//   const role = (session.user as { role: Role }).role;
//   if (role !== "ADMIN") {
//     throw new Error("Forbidden");
//   }

//   return {
//     user: { id: session.user.id, role },
//     masterId: (session as { masterId?: string | null }).masterId ?? null,
//   };
// }

// /** ADMIN|MASTER: бросает Error для server actions */
// export async function assertAdminOrMasterAction(): Promise<ActionSession> {
//   const session = await getServerSession(authOptions);

//   const okUser =
//     session?.user &&
//     typeof session.user.id === "string" &&
//     isRole((session.user as { role?: unknown }).role);

//   if (!okUser) {
//     throw new Error("Unauthorized");
//   }

//   const role = (session.user as { role: Role }).role;
//   if (role !== "ADMIN" && role !== "MASTER") {
//     throw new Error("Forbidden");
//   }

//   return {
//     user: { id: session.user.id, role },
//     masterId: (session as { masterId?: string | null }).masterId ?? null,
//   };
// }

// /** ADMIN-только: guard для API-роутов. Возвращает Response при отказе, иначе null */
// export async function assertAdminApi(): Promise<NextResponse | null> {
//   const session = await getServerSession(authOptions);

//   const okUser =
//     session?.user &&
//     typeof session.user.id === "string" &&
//     isRole((session.user as { role?: unknown }).role);

//   if (!okUser) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const role = (session.user as { role: Role }).role;
//   if (role !== "ADMIN") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   return null;
// }

// /** ADMIN|MASTER: guard для API-роутов. Возвращает Response при отказе, иначе null */
// export async function assertAdminOrMasterApi(): Promise<NextResponse | null> {
//   const session = await getServerSession(authOptions);

//   const okUser =
//     session?.user &&
//     typeof session.user.id === "string" &&
//     isRole((session.user as { role?: unknown }).role);

//   if (!okUser) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const role = (session.user as { role: Role }).role;
//   if (role !== "ADMIN" && role !== "MASTER") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   return null;
// }





//------------пока спрятл до сборки----------
// // src/lib/rbac.ts
// // server-only
// import { getServerSession } from "next-auth";
// import { NextResponse } from "next/server";
// import { Role } from "@prisma/client";
// import { authOptions } from "@/lib/auth";

// /** Короткая структура сессии, которой хватает для RBAC */
// export type SessionInfo = {
//   user: {
//     id: string;
//     role: Role;
//   };
//   masterId: string | null;
// };

// /** Бросает Error, если нет сессии/прав — удобно для server actions */
// export async function assertAdminAction(): Promise<SessionInfo> {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) throw new Error("Unauthorized");
//   const role = session.user.role as Role | undefined;
//   if (role !== "ADMIN") throw new Error("Forbidden");

//   return {
//     user: { id: session.user.id, role: role },
//     masterId: (session.masterId as string | null | undefined) ?? null,
//   };
// }

// /** Для действий, куда допускаем мастера и админа */
// export async function assertAdminOrMasterAction(): Promise<SessionInfo> {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) throw new Error("Unauthorized");
//   const role = session.user.role as Role | undefined;
//   if (role !== "ADMIN" && role !== "MASTER") throw new Error("Forbidden");

//   return {
//     user: { id: session.user.id, role: role },
//     masterId: (session.masterId as string | null | undefined) ?? null,
//   };
// }

// /** Возвращает 401/403 для API-роутов (route handlers). null — если доступ разрешён */
// export async function assertAdminApi(): Promise<NextResponse | null> {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   const role = session.user.role as Role | undefined;
//   if (role !== "ADMIN") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }
//   return null;
// }

// /** В API допускаем и мастеров, и админов */
// export async function assertAdminOrMasterApi(): Promise<NextResponse | null> {
//   const session = await getServerSession(authOptions);
//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }
//   const role = session.user.role as Role | undefined;
//   if (role !== "ADMIN" && role !== "MASTER") {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }
//   return null;
// }





// // src/lib/rbac.ts
// import { getServerSession } from "next-auth";
// import { authOptions } from "./auth";
// import type { Role } from "@prisma/client";

// /** Проверка роли */
// export function hasRole(userRole: Role, allowed: readonly Role[]): boolean {
//   return allowed.includes(userRole);
// }

// /** Бросает ошибку, если у пользователя нет нужной роли. Возвращает сессию при успехе. */
// export async function requireRole(allowed: readonly Role[]) {
//   const session = await getServerSession(authOptions);
//   const role = session?.user?.role as Role | undefined;

//   if (!role || !hasRole(role, allowed)) {
//     throw new Error("Forbidden");
//   }
//   return session;
// }

// /** Удобные пресеты */
// export const ROLES = {
//   ADMIN_ONLY: ["ADMIN"] as const,
//   MASTER_OR_ADMIN: ["MASTER", "ADMIN"] as const,
//   ANY_AUTHENTICATED: ["USER", "MASTER", "ADMIN"] as const,
// };
