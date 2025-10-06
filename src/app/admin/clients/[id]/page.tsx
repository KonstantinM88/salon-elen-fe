// src/app/admin/clients/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentStatus, $Enums } from "@prisma/client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

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

export default async function AdminClientPage({ params }: PageProps) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      birthDate: true,
      referral: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      appointments: {
        orderBy: { startAt: "desc" },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          service: { select: { slug: true, name: true } }, // <-- name вместо title
        },
      },
    },
  });

  if (!client) return notFound();

  // Активные статусы — как Set, чтобы тип аргумента совпадал с $Enums.AppointmentStatus
  const ACTIVE = new Set<$Enums.AppointmentStatus>([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.DONE,
  ]);

  const visits = client.appointments.filter((a) => ACTIVE.has(a.status));
  const lastVisit = visits[0]?.startAt ?? null;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Клиент: {client.name}</h1>
        <Link href="/admin/clients" className="btn">
          ← К списку
        </Link>
      </div>

      {/* Профиль */}
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-medium mb-3">Профиль</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs opacity-60">Телефон</div>
            <div>{client.phone}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">E-mail</div>
            <div>{client.email ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Дата рождения</div>
            <div>{fmtDate(client.birthDate)}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Как узнали</div>
            <div>{client.referral ?? "—"}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs opacity-60">Заметки</div>
            <div className="whitespace-pre-wrap">{client.notes ?? "—"}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Создан</div>
            <div>{fmtDateTime(client.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Обновлён</div>
            <div>{fmtDateTime(client.updatedAt)}</div>
          </div>
        </div>
      </section>

      {/* Быстрые контакты */}
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-medium mb-3">Контакты</h2>
        <div className="flex flex-wrap gap-2">
          {/* Позвонить */}
          <a
            className="btn"
            href={`tel:${client.phone.replace(/[^\d+]/g, "")}`}
          >
            Позвонить
          </a>

          {/* WhatsApp */}
          <a
            className="btn"
            href={`https://wa.me/${client.phone.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать в WhatsApp
          </a>

          {/* Telegram (оставляю твою текущую логику) */}
          <a
            className="btn"
            href={`https://t.me/${client.phone.replace(/[^\d+]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать в Telegram
          </a>

          {client.email && (
            <a className="btn" href={`mailto:${client.email}`}>
              Отправить e-mail
            </a>
          )}
        </div>
      </section>

      {/* Визиты */}
      <section className="rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Визиты</h2>
          <div className="text-sm opacity-70">
            Всего подтверждённых/завершённых: {visits.length}
            {lastVisit && (
              <span className="ml-3">
                Последний визит: <b>{fmtDateTime(lastVisit)}</b>
              </span>
            )}
          </div>
        </div>

        {visits.length === 0 ? (
          <div className="opacity-70">
            Пока нет визитов со статусом подтверждён/завершён.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="py-2 pr-3">Дата</th>
                  <th className="py-2 pr-3">Время</th>
                  <th className="py-2 pr-3">Услуга</th>
                  <th className="py-2 pr-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visits.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 pr-3">{fmtDate(a.startAt)}</td>
                    <td className="py-2 pr-3">
                      {new Intl.DateTimeFormat("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(a.startAt)}
                      {" — "}
                      {new Intl.DateTimeFormat("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(a.endAt)}
                    </td>
                    <td className="py-2 pr-3">{a.service?.name ?? "—"}</td>
                    <td className="py-2 pr-3">
                      {a.status === AppointmentStatus.CONFIRMED
                        ? "Подтверждён"
                        : a.status === AppointmentStatus.DONE
                        ? "Завершён"
                        : a.status === AppointmentStatus.CANCELED
                        ? "Отменён"
                        : "Ожидает"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
