import { prisma } from "@/lib/db";
import { setStatus, removeBooking } from "./actions";
import type { Booking } from "@prisma/client";

export const dynamic = "force-dynamic"; // всегда свежие данные

type BookingStatus = Booking["status"]; // "NEW" | "CONFIRMED" | "CANCELED"
const ALLOWED_STATUSES = ["NEW", "CONFIRMED", "CANCELED"] as const;

function isBookingStatus(v: unknown): v is BookingStatus {
  return (
    typeof v === "string" && (ALLOWED_STATUSES as readonly string[]).includes(v)
  );
}

export default async function AdminBookingsPage() {
  const rows = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      customer: true,
      phone: true,
      email: true,
      date: true,
      status: true,
      note: true,
      createdAt: true,
      service: { select: { title: true } },
    },
  });

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Заявки ({rows.length})</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Создана</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Услуга</th>
              <th>Дата</th>
              <th>Статус</th>
              <th>Комментарий</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-black/5">
            {rows.map((b) => (
              <tr key={b.id} className="[&>td]:px-3 [&>td]:py-2 align-top">
                <td>{b.id}</td>
                <td>{b.createdAt.toLocaleString()}</td>
                <td>{b.customer}</td>
                <td>{b.phone}</td>
                <td>{b.email ?? "-"}</td>
                <td>{b.service?.title ?? "-"}</td>
                <td>{b.date.toLocaleString()}</td>

                <td>
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      const id = b.id;

                      const raw = formData.get("status");
                      if (!isBookingStatus(raw)) {
                        // можно залогировать/показать тост
                        return;
                      }

                      await setStatus(id, raw);
                    }}
                  >
                    <label htmlFor={`status-${b.id}`} className="sr-only">Статус заявки</label>
                    <select
                      id={`status-${b.id}`}
                      name="status"
                      defaultValue={b.status as string}
                      className="rounded-md border bg-transparent px-2 py-1"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="CANCELED">CANCELED</option>
                    </select>
                    <button className="ml-2 rounded-md border px-2 py-1">
                      Сохранить
                    </button>
                  </form>
                </td>

                <td className="max-w-[20ch] truncate" title={b.note ?? ""}>
                  {b.note ?? ""}
                </td>

                <td>
                  <form
                    action={async () => {
                      "use server";
                      await removeBooking(b.id);
                    }}
                  >
                    <button className="rounded-md border px-2 py-1">
                      Удалить
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-gray-500"
                >
                  Заявок пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
