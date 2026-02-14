// src/app/admin/news/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteArticle, togglePinArticle } from "./actions";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

async function deleteAction(formData: FormData): Promise<void> {
  "use server";
  await deleteArticle(formData);
  revalidatePath("/admin/news");
}

async function togglePinAction(formData: FormData): Promise<void> {
  "use server";
  const id = formData.get("id")?.toString();
  if (id) await togglePinArticle(id);
}

export default async function Page() {
  const items = await prisma.article.findMany({
    orderBy: [
      { isPinned: "desc" },
      { sortOrder: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
      isPinned: true,
      sortOrder: true,
      videoUrl: true,
      seoTitle: true,
    },
  });

  const baseBtn =
    "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap shadow-sm focus:outline-none focus-visible:ring-2";
  const newBtn =
    `${baseBtn} bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400`;
  const editBtn =
    `${baseBtn} bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-slate-400`;
  const delBtn =
    `${baseBtn} bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400`;
  const pinBtn = (pinned: boolean) =>
    `${baseBtn} ${pinned ? "bg-amber-600 text-white hover:bg-amber-500" : "bg-white/10 text-white/60 hover:bg-white/20"}`;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Новости</h1>
        <Link href="/admin/news/new" className={newBtn}>
          Новая запись
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-3 text-left w-8"></th>
              <th className="p-3 text-left">Заголовок</th>
              <th className="p-3 text-left">SEO</th>
              <th className="p-3 text-left">Публикация</th>
              <th className="p-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr
                key={n.id}
                className={`border-t ${n.isPinned ? "bg-amber-500/5" : ""}`}
              >
                {/* Пин */}
                <td className="p-3 text-center">
                  {n.isPinned && <span title="Закреплено">📌</span>}
                  {n.videoUrl && <span title="С видео">🎬</span>}
                </td>

                {/* Заголовок */}
                <td className="p-3">
                  <div>{n.title}</div>
                  <div className="text-xs opacity-50 mt-0.5">/{n.slug}</div>
                </td>

                {/* SEO-статус */}
                <td className="p-3">
                  {n.seoTitle ? (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">✓</span>
                  ) : (
                    <span className="text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">—</span>
                  )}
                </td>

                {/* Дата */}
                <td className="p-3">{fmt(n.publishedAt ?? n.createdAt)}</td>

                {/* Действия */}
                <td className="p-3 whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <form action={togglePinAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button type="submit" className={pinBtn(n.isPinned)} title={n.isPinned ? "Открепить" : "Закрепить"}>
                        📌
                      </button>
                    </form>

                    <Link href={`/admin/news/${n.id}`} className={editBtn}>
                      Редактировать
                    </Link>

                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button type="submit" className={delBtn}>
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td className="p-4 opacity-70" colSpan={5}>
                  Записей пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}



//--------14.02.26 добаляем возможность загрузки видео
// // src/app/admin/news/page.tsx
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { deleteArticle } from "./actions";
// import { revalidatePath } from "next/cache";

// export const dynamic = "force-dynamic";

// function fmt(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// async function deleteAction(formData: FormData): Promise<void> {
//   "use server";
//   await deleteArticle(formData);
//   revalidatePath("/admin/news");
// }

// export default async function Page() {
//   const items = await prisma.article.findMany({
//     orderBy: [{ createdAt: "desc" }],
//     select: {
//       id: true,
//       title: true,
//       slug: true,
//       publishedAt: true,
//       createdAt: true,
//     },
//   });

//   // Общая «база» для кнопок (одинаковая высота/форма/типографика)
//   const baseBtn =
//     "inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap shadow-sm focus:outline-none focus-visible:ring-2";
//   const newBtn =
//     `${baseBtn} bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400`;
//   const editBtn =
//     `${baseBtn} bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-slate-400`;
//   const delBtn =
//     `${baseBtn} bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400`;

//   return (
//     <main className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Новости</h1>
//         <Link href="/admin/news/new" className={newBtn}>
//           Новая запись
//         </Link>
//       </div>

//       <div className="overflow-x-auto rounded-2xl border">
//         <table className="min-w-full text-sm">
//           <thead className="bg-muted/50 text-muted-foreground">
//             <tr>
//               <th className="p-3 text-left">Заголовок</th>
//               <th className="p-3 text-left">Публикация</th>
//               <th className="p-3 text-left">Действия</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((n) => (
//               <tr key={n.id} className="border-t">
//                 <td className="p-3">{n.title}</td>
//                 <td className="p-3">{fmt(n.publishedAt ?? n.createdAt)}</td>
//                 {/* nowrap + одинаковая высота/поля у кнопок */}
//                 <td className="p-3 whitespace-nowrap">
//                   <div className="flex items-center justify-end gap-3">
//                     <Link href={`/admin/news/${n.id}`} className={editBtn}>
//                       Редактировать
//                     </Link>

//                     <form action={deleteAction}>
//                       <input type="hidden" name="id" value={n.id} />
//                       <button type="submit" className={delBtn}>
//                         Удалить
//                       </button>
//                     </form>
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {items.length === 0 && (
//               <tr>
//                 <td className="p-4 opacity-70" colSpan={3}>
//                   Записей пока нет.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </main>
//   );
// }
