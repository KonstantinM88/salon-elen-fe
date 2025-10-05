// src/app/admin/bookings/page.tsx
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { setStatus, remove } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const rows = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      customerName: true,
      phone: true,
      email: true,
      notes: true,
      startAt: true,
      endAt: true,
      status: true,
      service: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Заявки (онлайн-запись)</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="px-3 py-2 text-left">Когда создано</th>
              <th className="px-3 py-2 text-left">Клиент</th>
              <th className="px-3 py-2 text-left">Услуга</th>
              <th className="px-3 py-2 text-left">Время</th>
              <th className="px-3 py-2 text-left">Статус</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.createdAt.toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.customerName}</div>
                  <div className="text-xs text-gray-500">{r.phone}{r.email ? ` • ${r.email}` : ""}</div>
                </td>
                <td className="px-3 py-2">
                  <div>{r.service?.name ?? "—"}</div>
                </td>
                <td className="px-3 py-2">
                  {r.startAt.toLocaleString()} — {r.endAt.toLocaleTimeString()}
                </td>
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">
                  <form action={async (formData) => {
                    "use server";
                    await setStatus(r.id, AppointmentStatus.CONFIRMED);
                  }}>
                    <button className="rounded-full px-3 py-1 text-xs bg-emerald-600 text-white mr-2">
                      Подтвердить
                    </button>
                  </form>

                  <form action={async () => {
                    "use server";
                    await setStatus(r.id, AppointmentStatus.CANCELED);
                  }}>
                    <button className="rounded-full px-3 py-1 text-xs bg-amber-600 text-white mr-2">
                      Отменить
                    </button>
                  </form>

                  <form action={async () => {
                    "use server";
                    await remove(r.id);
                  }}>
                    <button className="rounded-full px-3 py-1 text-xs bg-rose-600 text-white">
                      Удалить
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={6}>
                  Записей пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
