// src/app/master/layout.tsx
import type { ReactNode } from "react";
import { requireRole } from "@/lib/rbac";

export default async function MasterLayout({ children }: { children: ReactNode }) {
  // MASTER и ADMIN
  await requireRole(["MASTER", "ADMIN"] as const);
  return <>{children}</>;
}
