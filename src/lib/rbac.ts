// src/lib/rbac.ts
// server-only
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

/** Короткая структура сессии, которой хватает для RBAC */
export type SessionInfo = {
  user: {
    id: string;
    role: Role;
  };
  masterId: string | null;
};

/** Бросает Error, если нет сессии/прав — удобно для server actions */
export async function assertAdminAction(): Promise<SessionInfo> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role as Role | undefined;
  if (role !== "ADMIN") throw new Error("Forbidden");

  return {
    user: { id: session.user.id, role: role },
    masterId: (session.masterId as string | null | undefined) ?? null,
  };
}

/** Для действий, куда допускаем мастера и админа */
export async function assertAdminOrMasterAction(): Promise<SessionInfo> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role as Role | undefined;
  if (role !== "ADMIN" && role !== "MASTER") throw new Error("Forbidden");

  return {
    user: { id: session.user.id, role: role },
    masterId: (session.masterId as string | null | undefined) ?? null,
  };
}

/** Возвращает 401/403 для API-роутов (route handlers). null — если доступ разрешён */
export async function assertAdminApi(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role as Role | undefined;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/** В API допускаем и мастеров, и админов */
export async function assertAdminOrMasterApi(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = session.user.role as Role | undefined;
  if (role !== "ADMIN" && role !== "MASTER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}





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
