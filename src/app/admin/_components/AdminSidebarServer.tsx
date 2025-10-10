import { prisma } from "@/lib/db";
import AdminSidebar from "./AdminSidebar";
import {
  LayoutGrid,
  Newspaper,
  Scissors,
  ClipboardList,
  Users2,
  CalendarDays,
  BarChart3,
} from "lucide-react";

export default async function AdminSidebarServer() {
  // можно добавить любые «живые» цифры
  const [drafts, pending] = await Promise.all([
    prisma.article.count({ where: { publishedAt: null } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
  ]);

  const items = [
    { label: "Дашборд", href: "/admin", icon: <LayoutGrid className="h-4 w-4" />, tone: "violet" as const },
    { label: "Новости", href: "/admin/news", icon: <Newspaper className="h-4 w-4" />, tone: "violet" as const, badge: drafts || null },
    { label: "Услуги", href: "/admin/services", icon: <Scissors className="h-4 w-4" />, tone: "emerald" as const },
    { label: "Заявки", href: "/admin/bookings", icon: <ClipboardList className="h-4 w-4" />, tone: "amber" as const, badge: pending || null },
    { label: "Клиенты", href: "/admin/clients", icon: <Users2 className="h-4 w-4" />, tone: "sky" as const },
    { label: "Календарь", href: "/admin/calendar", icon: <CalendarDays className="h-4 w-4" />, tone: "sky" as const },
    { label: "Статистика", href: "/admin/stats", icon: <BarChart3 className="h-4 w-4" />, tone: "emerald" as const },
  ];

  return <AdminSidebar items={items} title="ADMIN" />;
}
