// src/components/admin/AdminShell.tsx
import AdminNav from "@/components/admin/AdminNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@prisma/client";

type Props = {
  children: React.ReactNode;
  bookingsBadge?: number;
};

export default async function AdminShell({ children, bookingsBadge }: Props) {
  // Серверный компонент: достаём роль сразу на сервере и передаём в клиентский AdminNav
  const session = await getServerSession(authOptions);
  const role: Role = (session?.user?.role as Role) ?? "USER";

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-white/10 bg-slate-950/40 p-4">
        <div className="mb-4">
          <div className="text-sm font-semibold">Admin</div>
          <div className="text-xs opacity-60">панель управления</div>
        </div>

        <AdminNav role={role} bookingsBadge={bookingsBadge} />
      </aside>

      <main className="p-4 lg:p-8">{children}</main>
    </div>
  );
}
