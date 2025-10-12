// src/lib/rbac.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { Role } from "@prisma/client";

/** Проверка роли */
export function hasRole(userRole: Role, allowed: readonly Role[]): boolean {
  return allowed.includes(userRole);
}

/** Бросает ошибку, если у пользователя нет нужной роли. Возвращает сессию при успехе. */
export async function requireRole(allowed: readonly Role[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as Role | undefined;

  if (!role || !hasRole(role, allowed)) {
    throw new Error("Forbidden");
  }
  return session;
}

/** Удобные пресеты */
export const ROLES = {
  ADMIN_ONLY: ["ADMIN"] as const,
  MASTER_OR_ADMIN: ["MASTER", "ADMIN"] as const,
  ANY_AUTHENTICATED: ["USER", "MASTER", "ADMIN"] as const,
};
