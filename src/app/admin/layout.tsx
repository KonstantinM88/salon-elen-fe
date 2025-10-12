// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppointmentStatus, Role } from "@prisma/client";
import AdminShellClient from "./_components/AdminShellClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 1) Получаем сессию
  const session = await getServerSession(authOptions);

  // 2) Если не авторизован — отправляем на логин с возвратом обратно в /admin
  if (!session?.user) {
    const callback = encodeURIComponent("/admin");
    redirect(`/login?callbackUrl=${callback}`);
  }

  // 3) Достаём роль и проверяем доступ (только ADMIN)
  const role = session.user.role as Role | undefined;
  if (role !== "ADMIN") {
    // можно отправлять на главную или на 404 — на твой выбор
    redirect("/");
  }

  // 4) Лёгкий бейдж «заявки»
  const pendingBookings = await prisma.appointment.count({
    where: { status: AppointmentStatus.PENDING },
  });

  return (
    <AdminShellClient role={role} bookingsBadge={pendingBookings}>
      {children}
    </AdminShellClient>
  );
}








// import type { ReactNode } from "react";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus, Role } from "@prisma/client";
// import { getServerSession } from "next-auth";
// // import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
// import AdminShellClient from "./_components/AdminShellClient";
// import { authOptions } from "@/lib/auth";

// export const dynamic = "force-dynamic";

// export default async function AdminLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   // Бейдж «Заявки»
//   const pendingBookings = await prisma.appointment.count({
//     where: { status: AppointmentStatus.PENDING },
//   });

//   // Текущая роль пользователя из сессии
//   const session = await getServerSession(authOptions);
//   const role: Role = (session?.user?.role as Role | undefined) ?? Role.USER;

//   return (
//     <AdminShellClient role={role} bookingsBadge={pendingBookings}>
//       {children}
//     </AdminShellClient>
//   );
// }









// // src/app/admin/layout.tsx
// import type { ReactNode } from "react";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus } from "@prisma/client";
// import { requireRole } from "@/lib/rbac";
// import AdminShellClient from "./_components/AdminShellClient";

// export const dynamic = "force-dynamic";

// export default async function AdminLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   // Доступ только для ADMIN
//   await requireRole(["ADMIN"] as const);

//   // Бейдж для "Заявки" — количество PENDING
//   const pendingBookings = await prisma.appointment.count({
//     where: { status: AppointmentStatus.PENDING },
//   });

//   return (
//     <AdminShellClient bookingsBadge={pendingBookings}>
//       {children}
//     </AdminShellClient>
//   );
// }




// import type { ReactNode } from 'react';
// import AdminNav from '@/components/admin/AdminNav';
// import AdminFooter from './_components/AdminFooter';
// import { prisma } from '@/lib/db'; // или '@/lib/prisma' — как у тебя в проекте
// import { AppointmentStatus } from '@prisma/client';

// export default async function AdminLayout({ children }: { children: ReactNode }) {
//   // бейдж для "Заявки": количество ожидающих
//   const pendingBookings = await prisma.appointment.count({
//     where: { status: AppointmentStatus.PENDING },
//   });

//   return (
//     <div className="container py-6">
//       <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
//         {/* Сайдбар */}
//         <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
//           <div className="mb-3 flex items-center justify-between">
//             <div className="text-xs uppercase tracking-wider text-slate-400">Admin</div>
//           </div>
//           <AdminNav bookingsBadge={pendingBookings} />
//         </aside>

//         {/* Контент */}
//         <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 lg:p-6">
//           {children}
//           <AdminFooter />
//         </section>
//       </div>
//     </div>
//   );
// }
