// src/app/admin/clients/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Prisma, AppointmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams =
  Promise<{ q?: string | string[]; filter?: string | string[] }>;

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function fmtDateTime(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function nextBirthday(src: Date, from: Date): Date {
  const nb = new Date(from.getFullYear(), src.getMonth(), src.getDate());
  // если в этом году ДР уже прошёл — берем следующий год
  if (nb < new Date(from.getFullYear(), from.getMonth(), from.getDate())) {
    nb.setFullYear(from.getFullYear() + 1);
  }
  return nb;
}

export default async function AdminClientsPage(props: { searchParams: SearchParams }) {
  // Next 15: searchParams — это Promise
  const sp = await props.searchParams;
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const filterRaw = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;

  const query = (qRaw ?? "").trim();
  const isBirthdayFilter = (filterRaw ?? "") === "birthdays";

  // 1) Where для поиска
  const where: Prisma.ClientWhereInput | undefined =
    query.length > 0
      ? {
          OR: [
            { name:  { contains: query, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : undefined;

  // 2) Базовые данные клиентов
  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      birthDate: true,
      referral: true,
      createdAt: true,
    },
  });

  // 2.1) Фильтр «ближайшие именинники 30 дней»
  const filtered = (() => {
    if (!isBirthdayFilter) return clients;
    const today = new Date();
    const horizon = new Date(today);
    horizon.setDate(today.getDate() + 30);
    return clients.filter((c) => {
      const nb = nextBirthday(c.birthDate, today);
      return nb >= today && nb <= horizon;
    });
  })();

  // 3) Метрики по визитам: count(CONFIRMED | DONE) + lastVisit
  const ids = filtered.map((c) => c.id);
  const countMap = new Map<string, number>();
  const lastVisitMap = new Map<string, Date>();

  if (ids.length > 0) {
    const stats = await prisma.appointment.groupBy({
      by: ["clientId"], // OK c TS, это верный литерал поля
      where: {
        clientId: { in: ids },
        status: {
          in: [AppointmentStatus.CONFIRMED, AppointmentStatus.DONE],
        },
      },
      _count: { _all: true },
      _max: { startAt: true },
    });

    for (const s of stats) {
      // clientId может быть null, но мы группируем по where clientId in ids, поэтому здесь строка
      const key = String(s.clientId);
      countMap.set(key, s._count._all);
      if (s._max.startAt) lastVisitMap.set(key, s._max.startAt);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Клиенты</h1>
        <div className="flex gap-2">
          <Link href="/admin/clients" className="btn">Все</Link>
          <Link href="/admin/clients?filter=birthdays" className="btn">Ближайшие ДР</Link>
        </div>
      </div>

      {/* Поисковая форма (без client-side JS — простая GET-форма) */}
      <form className="flex gap-2" action="/admin/clients" method="get">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Поиск: имя, телефон, e-mail"
          className="rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700 w-[360px]"
        />
        {isBirthdayFilter && <input type="hidden" name="filter" value="birthdays" />}
        <button className="btn">Искать</button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-4 opacity-70">
          Клиенты не найдены.
        </div>
      ) : (
        <div className="rounded-2xl border overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm">
            <thead className="text-left opacity-70">
              <tr>
                <th className="py-2 px-3">Имя</th>
                <th className="py-2 px-3">Телефон</th>
                <th className="py-2 px-3">E-mail</th>
                <th className="py-2 px-3">Дата рождения</th>
                <th className="py-2 px-3">Как узнали</th>
                <th className="py-2 px-3">Визитов</th>
                <th className="py-2 px-3">Последний визит</th>
                <th className="py-2 px-3">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((c) => {
                const count = countMap.get(c.id) ?? 0;
                const last = lastVisitMap.get(c.id) ?? null;
                return (
                  <tr key={c.id}>
                    <td className="py-2 px-3">{c.name}</td>
                    <td className="py-2 px-3">{c.phone}</td>
                    <td className="py-2 px-3">{c.email ?? "—"}</td>
                    <td className="py-2 px-3">{fmtDate(c.birthDate)}</td>
                    <td className="py-2 px-3">{c.referral ?? "—"}</td>
                    <td className="py-2 px-3">{count}</td>
                    <td className="py-2 px-3">{last ? fmtDateTime(last) : "—"}</td>
                    <td className="py-2 px-3">
                      <Link href={`/admin/clients/${c.id}`} className="btn btn-sm">
                        Просмотр
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
