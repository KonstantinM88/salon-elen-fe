//src/app/admin/clients/archived/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RestoreClientButton from "./RestoreClientButton";
import PermanentDeleteButton from "./PermanentDeleteButton";

export const dynamic = "force-dynamic";

export default async function ArchivedClientsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // ✅ Получаем ТОЛЬКО удалённых клиентов
  const archivedClients = await prisma.client.findMany({
    where: {
      deletedAt: { not: null },  // ← Только удалённые
    },
    orderBy: { deletedAt: "desc" },
    include: {
      _count: {
        select: { appointments: true },
      },
    },
  });

  const fmtDate = (d: Date) => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
            >
              ← К активным клиентам
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              🗑️ Архив клиентов
            </h1>
            <p className="text-gray-400 mt-2">
              Удалённые клиенты сохраняются здесь и могут быть восстановлены
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Всего в архиве</div>
                <div className="text-2xl font-bold text-white">{archivedClients.length}</div>
              </div>
              <div className="text-red-400">🗑️</div>
            </div>
          </div>
        </div>

        {/* Список удалённых клиентов */}
        {archivedClients.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-12 backdrop-blur-xl text-center">
            <div className="text-6xl mb-4">✨</div>
            <div className="text-xl font-semibold text-white mb-2">Архив пуст</div>
            <div className="text-gray-400">Удалённых клиентов нет</div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-700/50">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Клиент</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Контакты</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Визитов</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Удалён</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {archivedClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{client.name}</div>
                        <div className="text-sm text-gray-400">
                          {new Intl.DateTimeFormat("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }).format(client.birthDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{client.phone}</div>
                        <div className="text-sm text-gray-400">{client.email || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{client._count.appointments}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-red-400">
                          {client.deletedAt ? fmtDate(client.deletedAt) : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <RestoreClientButton clientId={client.id} clientName={client.name} />
                          <PermanentDeleteButton clientId={client.id} clientName={client.name} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
