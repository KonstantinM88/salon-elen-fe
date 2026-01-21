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