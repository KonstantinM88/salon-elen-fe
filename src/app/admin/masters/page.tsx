export const dynamic = "force-dynamic";

import type { ReactElement } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

function fmt(d: Date): string {
  return format(d, "dd.MM.yyyy", { locale: ru });
}

export default async function MastersPage(): Promise<ReactElement> {
  const masters = await prisma.master.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { services: true, appointments: true } } },
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Сотрудники</h1>
        <Link href="/admin/masters/new" className="btn btn-primary">Добавить</Link>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3">Имя</th>
              <th className="p-3">Телефон</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Д.р.</th>
              <th className="p-3">Услуг</th>
              <th className="p-3">Заявок</th>
              <th className="p-3 w-[160px]">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {masters.map((m) => (
              <tr key={m.id} className="align-top">
                <td className="p-3">
                  <div className="font-medium">{m.name}</div>
                  {m.bio && <div className="opacity-60 line-clamp-1">{m.bio}</div>}
                </td>
                <td className="p-3">{m.phone}</td>
                <td className="p-3">{m.email}</td>
                <td className="p-3">{fmt(m.birthDate)}</td>
                <td className="p-3">{m._count.services}</td>
                <td className="p-3">{m._count.appointments}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/masters/${m.id}`} className="btn btn-sm">Открыть</Link>
                    <form action={async (fd) => {
                      "use server";
                      const { deleteMaster } = await import("./actions");
                      fd.set("id", m.id);
                      await deleteMaster(fd);
                    }}>
                      <button type="submit" className="btn btn-sm btn-outline">Удалить</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {masters.length === 0 && (
              <tr>
                <td className="p-4 opacity-70" colSpan={7}>Сотрудников пока нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
