// src/app/admin/masters/page.tsx
export const dynamic = "force-dynamic";

import type { ReactElement } from "react";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MastersListClient } from "./MastersListClient";

function fmt(d: Date): string {
  return format(d, "dd.MM.yyyy", { locale: ru });
}

export default async function MastersPage(): Promise<ReactElement> {
  const masters = await prisma.master.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { services: true, appointments: true } } },
  });

  // Сериализуем данные для клиентского компонента
  const serializedMasters = masters.map((m) => ({
    id: m.id,
    name: m.name,
    bio: m.bio,
    phone: m.phone,
    email: m.email,
    birthDate: m.birthDate ? fmt(m.birthDate) : null,
    _count: m._count,
  }));

  return (
    <main className="space-y-4 sm:space-y-6">
      <MastersListClient masters={serializedMasters} />
    </main>
  );
}
