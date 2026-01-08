import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import DeleteClientForm from "./DeleteClientForm";
import { updateClient as _updateClient } from "./actions";
import ClientViewClient from "./ClientViewClient";

export const dynamic = "force-dynamic";

// Next 15: params/searchParams — async
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Обёртка для server action: после успешного обновления уходим в список */
async function submitUpdate(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const res = await _updateClient(undefined, formData);
  if (res?.ok) {
    redirect("/admin/clients");
  } else {
    // остаться в режиме редактирования
    redirect(`/admin/clients/${id}?edit=1&err=1`);
  }
}

export default async function AdminClientPage(props: PageProps) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const editMode =
    sp?.edit === "1" || sp?.edit === "true" || (Array.isArray(sp?.edit) && sp?.edit[0] === "1");
  const hasError = sp?.err === "1" || (Array.isArray(sp?.err) && sp?.err[0] === "1");

  const client = await prisma.client.findUnique({
    where: { id },
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
        orderBy: { startAt: "desc" as const },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          service: { 
            select: { 
              id: true,
              slug: true, 
              name: true,  // ✅ Используем name (не title!)
              priceCents: true 
            } 
          },
          master: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        },
      },
    },
  });

  if (!client) return notFound();

  // Активные статусы — CONFIRMED + DONE
  const ACTIVE = new Set<AppointmentStatus>([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.DONE,
  ]);

  const visits = client.appointments.filter((appointment) => ACTIVE.has(appointment.status));
  const lastVisit = visits[0]?.startAt ?? null;
  
  // Подсчёт статистики
  const totalVisits = visits.length;
  const totalSpent = visits.reduce((sum: number, appointment) => {
    return sum + (appointment.service?.priceCents ?? 0);
  }, 0);
  const avgVisitValue = totalVisits > 0 ? totalSpent / totalVisits : 0;

  return (
    <ClientViewClient
      client={client}
      visits={visits}
      lastVisit={lastVisit}
      totalVisits={totalVisits}
      totalSpent={totalSpent}
      avgVisitValue={avgVisitValue}
      editMode={editMode}
      hasError={hasError}
      submitUpdate={submitUpdate}
    />
  );
}




//---------работало до 08.01.26 меняем дизайн--------
// import { notFound, redirect } from "next/navigation";
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus, $Enums } from "@prisma/client";
// import DeleteClientForm from "./DeleteClientForm";
// import { updateClient as _updateClient } from "./actions";

// export const dynamic = "force-dynamic";

// // Next 15: params/searchParams — async
// type PageProps = {
//   params: Promise<{ id: string }>;
//   searchParams: Promise<Record<string, string | string[] | undefined>>;
// };

// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date): string {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// function toInputDate(d: Date | null | undefined): string {
//   if (!d) return "";
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${dd}`;
// }

// /** Обёртка для server action: после успешного обновления уходим в список */
// async function submitUpdate(formData: FormData) {
//   "use server";
//   const id = String(formData.get("id") ?? "");
//   const res = await _updateClient(undefined, formData);
//   if (res?.ok) {
//     redirect("/admin/clients");
//   } else {
//     // остаться в режиме редактирования
//     redirect(`/admin/clients/${id}?edit=1&err=1`);
//   }
// }

// export default async function AdminClientPage(props: PageProps) {
//   const { id } = await props.params;
//   const sp = await props.searchParams;
//   const editMode =
//     sp?.edit === "1" || sp?.edit === "true" || (Array.isArray(sp?.edit) && sp?.edit[0] === "1");
//   const hasError = sp?.err === "1" || (Array.isArray(sp?.err) && sp?.err[0] === "1");

//   const client = await prisma.client.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       phone: true,
//       email: true,
//       birthDate: true,
//       referral: true,
//       notes: true,
//       createdAt: true,
//       updatedAt: true,
//       appointments: {
//         orderBy: { startAt: "desc" },
//         select: {
//           id: true,
//           startAt: true,
//           endAt: true,
//           status: true,
//           service: { select: { slug: true, name: true } },
//         },
//       },
//     },
//   });

//   if (!client) return notFound();

//   // Активные статусы — CONFIRMED + DONE
//   const ACTIVE = new Set<$Enums.AppointmentStatus>([
//     AppointmentStatus.CONFIRMED,
//     AppointmentStatus.DONE,
//   ]);

//   const visits = client.appointments.filter((a) => ACTIVE.has(a.status));
//   const lastVisit = visits[0]?.startAt ?? null;

//   return (
//     <main className="p-6 space-y-6" id="top">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">Клиент: {client.name}</h1>
//         <div className="flex gap-2">
//           <Link href="/admin/clients" className="btn">
//             ← К списку
//           </Link>

//           {/* Включаем режим редактирования только по запросу */}
//           {!editMode && (
//             <Link href={`/admin/clients/${client.id}?edit=1#edit`} className="btn">
//               Редактировать
//             </Link>
//           )}

//           <DeleteClientForm clientId={client.id} clientName={client.name} />
//         </div>
//       </div>

//       {/* Профиль (read-only) */}
//       <section className="rounded-2xl border p-4">
//         <h2 className="text-lg font-medium mb-3">Профиль</h2>
//         <div className="grid sm:grid-cols-2 gap-3">
//           <div>
//             <div className="text-xs opacity-60">Телефон</div>
//             <div>{client.phone}</div>
//           </div>
//           <div>
//             <div className="text-xs opacity-60">E-mail</div>
//             <div>{client.email ?? "—"}</div>
//           </div>
//           <div>
//             <div className="text-xs opacity-60">Дата рождения</div>
//             <div>{fmtDate(client.birthDate)}</div>
//           </div>
//           <div>
//             <div className="text-xs opacity-60">Как узнали</div>
//             <div>{client.referral ?? "—"}</div>
//           </div>
//           <div className="sm:col-span-2">
//             <div className="text-xs opacity-60">Заметки</div>
//             <div className="whitespace-pre-wrap">{client.notes ?? "—"}</div>
//           </div>
//           <div>
//             <div className="text-xs opacity-60">Создан</div>
//             <div>{fmtDateTime(client.createdAt)}</div>
//           </div>
//           <div>
//             <div className="text-xs opacity-60">Обновлён</div>
//             <div>{fmtDateTime(client.updatedAt)}</div>
//           </div>
//         </div>
//       </section>

//       {/* Контакты */}
//       <section className="rounded-2xl border p-4">
//         <h2 className="text-lg font-medium mb-3">Контакты</h2>
//         <div className="flex flex-wrap gap-2">
//           <a className="btn" href={`tel:${client.phone.replace(/\s+/g, "")}`}>
//             Позвонить
//           </a>
//           <a
//             className="btn"
//             href={`https://wa.me/${client.phone.replace(/[^\d]/g, "")}`}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Написать в WhatsApp
//           </a>
//           <a
//             className="btn"
//             href={`https://t.me/${client.phone.replace(/[^\d+]/g, "")}`}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Написать в Telegram
//           </a>
//           {client.email && (
//             <a className="btn" href={`mailto:${client.email}`}>
//               Отправить e-mail
//             </a>
//           )}
//         </div>
//       </section>

//       {/* Визиты */}
//       <section className="rounded-2xl border p-4">
//         <div className="flex items-center justify-between mb-3">
//           <h2 className="text-lg font-medium">Визиты</h2>
//           <div className="text-sm opacity-70">
//             Всего подтверждённых/завершённых: {visits.length}
//             {lastVisit && (
//               <span className="ml-3">
//                 Последний визит: <b>{fmtDateTime(lastVisit)}</b>
//               </span>
//             )}
//           </div>
//         </div>

//         {visits.length === 0 ? (
//           <div className="opacity-70">
//             Пока нет визитов со статусом подтверждён/завершён.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-[640px] w-full text-sm">
//               <thead className="text-left opacity-70">
//                 <tr>
//                   <th className="py-2 pr-3">Дата</th>
//                   <th className="py-2 pr-3">Время</th>
//                   <th className="py-2 pr-3">Услуга</th>
//                   <th className="py-2 pr-3">Статус</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/10">
//                 {visits.map((a) => (
//                   <tr key={a.id}>
//                     <td className="py-2 pr-3">{fmtDate(a.startAt)}</td>
//                     <td className="py-2 pr-3">
//                       {new Intl.DateTimeFormat("ru-RU", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       }).format(a.startAt)}{" "}
//                       —{" "}
//                       {new Intl.DateTimeFormat("ru-RU", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       }).format(a.endAt)}
//                     </td>
//                     <td className="py-2 pr-3">{a.service?.name ?? "—"}</td>
//                     <td className="py-2 pr-3">
//                       {a.status === AppointmentStatus.CONFIRMED
//                         ? "Подтверждён"
//                         : a.status === AppointmentStatus.DONE
//                         ? "Завершён"
//                         : a.status === AppointmentStatus.CANCELED
//                         ? "Отменён"
//                         : "Ожидает"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>

//       {/* ===== Редактирование профиля (только когда edit=1) ===== */}
//       {editMode && (
//         <section id="edit" className="rounded-2xl border p-4">
//           <h2 className="text-lg font-medium mb-3">Редактировать профиль</h2>

//           {hasError && (
//             <div className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-200 text-sm">
//               Не удалось сохранить изменения. Проверьте поля и попробуйте снова.
//             </div>
//           )}

//           <form action={submitUpdate} className="grid sm:grid-cols-2 gap-3">
//             <input type="hidden" name="id" value={client.id} />

//             <div>
//               <label className="block text-sm mb-1">Имя</label>
//               <input
//                 name="name"
//                 defaultValue={client.name ?? ""}
//                 className="w-full rounded-lg border bg-transparent px-3 py-2"
//                 autoComplete="name"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm mb-1">Телефон</label>
//               <input
//                 name="phone"
//                 defaultValue={client.phone ?? ""}
//                 className="w-full rounded-lg border bg-transparent px-3 py-2"
//                 autoComplete="tel"
//                 inputMode="tel"
//                 placeholder="+49 ..."
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm mb-1">E-mail</label>
//               <input
//                 type="email"
//                 name="email"
//                 defaultValue={client.email ?? ""}
//                 className="w-full rounded-lg border bg-transparent px-3 py-2"
//                 autoComplete="email"
//                 placeholder="you@example.com"
//               />
//             </div>

//             <div>
//               <label className="block text-sm mb-1">Дата рождения</label>
//               <input
//                 type="date"
//                 name="birthDate"
//                 defaultValue={toInputDate(client.birthDate)}
//                 className="w-full rounded-lg border bg-transparent px-3 py-2"
//                 required
//               />
//             </div>

//             <div className="sm:col-span-2">
//               <label className="block text-sm mb-1">Как узнали о нас</label>
//               <input
//                 name="referral"
//                 defaultValue={client.referral ?? ""}
//                 className="w-full rounded-lg border bg-transparent px-3 py-2"
//                 placeholder="Google / Instagram / Рекомендации …"
//               />
//             </div>

//             <div className="sm:col-span-2">
//               <label className="block text-sm mb-1">Заметки</label>
//               <textarea
//                 name="notes"
//                 defaultValue={client.notes ?? ""}
//                 rows={4}
//                 className="w-full rounded-lg border bg-transparent px-3 py-2"
//               />
//             </div>

//             <div className="sm:col-span-2 flex flex-wrap gap-2">
//               <button className="btn">Сохранить</button>
//               <Link href={`/admin/clients/${client.id}`} className="btn">
//                 Отмена
//               </Link>
//             </div>
//           </form>
//         </section>
//       )}
//     </main>
//   );
// }
