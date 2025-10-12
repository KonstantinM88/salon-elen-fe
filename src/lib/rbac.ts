// src/lib/rbac.ts
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import type { AppRole } from "@/types/next-auth";

export function hasRole(userRole: AppRole, allowed: readonly AppRole[]): boolean {
  return allowed.includes(userRole);
}

/**
 * Server-only guard — вызывает redirect('/login') если роли недостаточно.
 * Используй в layout'ах разделов /admin и /master.
 */
export async function requireRole(allowed: readonly AppRole[]) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!role || !allowed.includes(role)) {
    redirect("/login");
  }
  return session;
}
