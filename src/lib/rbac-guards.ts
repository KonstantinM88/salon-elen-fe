// src/lib/rbac-guards.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

/** Удобный алиас для роли из расширённой сессии */
type Role = NonNullable<Session["user"]>["role"];

/** То, что возвращаем из гардов на сервере */
export type SessionInfo = {
  user: {
    id: string;
    role: Role;
  };
  /** masterId пользователя (если он мастер), иначе null */
  masterId: string | null;
};

/** Бросает ошибку, если сессии нет; возвращает минимальную сессию */
export async function getSessionStrict(): Promise<SessionInfo> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Unauthorized");
  }

  return {
    user: { id: session.user.id, role: session.user.role as Role },
    masterId: session.masterId ?? null,
  };
}

/** Разрешает доступ только админам */
export async function assertAdmin(): Promise<SessionInfo> {
  const s = await getSessionStrict();
  if (s.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return s;
}

/** Универсальный гард по ролям */
export async function requireRole(roles: readonly Role[]): Promise<SessionInfo> {
  const s = await getSessionStrict();
  if (!roles.includes(s.user.role)) {
    throw new Error("Forbidden");
  }
  return s;
}

/**
 * Разрешает действие админам ИЛИ мастеру, который работает сам с собой
 * (по своему masterId).
 */
export async function assertAdminOrOwnMaster(targetMasterId: string): Promise<SessionInfo> {
  const s = await getSessionStrict();
  if (s.user.role === "ADMIN") return s;
  if (s.user.role === "MASTER" && s.masterId && s.masterId === targetMasterId) return s;
  throw new Error("Forbidden");
}

/** Проверка без исключений, если где-то так удобнее */
export function isAdminOrOwnMaster(s: SessionInfo, targetMasterId: string): boolean {
  return s.user.role === "ADMIN" || (s.user.role === "MASTER" && s.masterId === targetMasterId);
}




// // src/lib/rbac-guards.ts
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import type { AppRole } from "@/types/next-auth";

// export type SessionInfo = {
//   user: {
//     id: string;
//     role: AppRole;
//   };
//   masterId: string | null;
// };

// export async function getSessionStrict(): Promise<SessionInfo> {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || !session.user.role) {
//     throw new Error("Unauthorized");
//   }
//   return {
//     user: { id: session.user.id, role: session.user.role },
//     masterId: (session as { masterId?: string | null }).masterId ?? null,
//   };
// }

// export async function assertAdmin(): Promise<SessionInfo> {
//   const s = await getSessionStrict();
//   if (s.user.role !== "ADMIN") {
//     throw new Error("Forbidden");
//   }
//   return s;
// }

// /** Разрешает действие админам или мастеру над своим masterId */
// export async function assertAdminOrOwnMaster(targetMasterId: string): Promise<SessionInfo> {
//   const s = await getSessionStrict();
//   if (s.user.role === "ADMIN") return s;
//   if (s.user.role === "MASTER" && s.masterId && s.masterId === targetMasterId) return s;
//   throw new Error("Forbidden");
// }
