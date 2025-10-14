import Link from "next/link";
import { prisma } from "@/lib/db";
// import { requireRole } from "@/lib/rbac";
import { changeMasterPassword } from "../[id]/actions";
import { ShieldCheck, Mail, User2, KeyRound, Link2 } from "lucide-react";
import { requireRole } from "@/lib/rbac-guards";

export default async function MasterAccessCard({
  masterId,
}: {
  masterId: string;
}) {
  await requireRole(["ADMIN"] as const);

  const master = await prisma.master.findUnique({
    where: { id: masterId },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { id: true, email: true } },
    },
  });

  const hasLogin = Boolean(master?.userId);
  const email = master?.user?.email ?? null;

  return (
    <section className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold">Доступ к панели</h3>
      </div>

      {!hasLogin ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4" />
            У мастера нет привязанного логина.
          </div>
          <div className="mt-2 text-sm opacity-80">
            Создайте пользователя и привяжите его на странице{" "}
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200"
            >
              Пользователи
              <Link2 className="h-4 w-4" />
            </Link>
            .
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border p-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              <div className="text-sm">
                Привязанный логин: <b>{email ?? "—"}</b>
              </div>
            </div>
          </div>

          <form
            action={changeMasterPassword}
            className="rounded-xl border p-3 flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="masterId" value={masterId} />
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-violet-400" />
              <label className="text-sm opacity-80">Новый пароль</label>
            </div>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              placeholder="не короче 6 символов"
              className="w-full sm:w-64 rounded-md border bg-transparent px-2 py-1"
            />
            <button className="btn btn-sm">Обновить</button>
          </form>
        </div>
      )}
    </section>
  );
}





// import { prisma } from '@/lib/db';
// import { requireRole } from '@/lib/rbac';
// import {
//   createMasterLogin,
//   unlinkMasterLogin,
//   changeMasterPassword,
// } from '../[id]/actions';
// import { ShieldCheck, Mail, User2, KeyRound, Link2 } from 'lucide-react';

// export default async function MasterAccessCard({
//   masterId,
// }: {
//   masterId: string;
// }) {
//   await requireRole(['ADMIN'] as const);

//   const master = await prisma.master.findUnique({
//     where: { id: masterId },
//     select: {
//       id: true,
//       name: true,
//       user: { select: { id: true, email: true, name: true } },
//     },
//   });
//   if (!master) return null;

//   return (
//     <section className="rounded-2xl border p-4 space-y-3">
//       <div className="mb-1 flex items-center gap-2">
//         <div className="h-9 w-9 grid place-items-center rounded-lg ring-2 ring-emerald-400/30">
//           <ShieldCheck className="h-5 w-5 text-emerald-400" />
//         </div>
//         <h2 className="text-base font-semibold">Доступ в панель мастера</h2>
//       </div>

//       {master.user ? (
//         <div className="space-y-3">
//           <div className="rounded-xl border px-3 py-2">
//             <div className="text-sm font-medium">
//               {master.user.name ?? '—'}
//             </div>
//             <div className="text-xs opacity-70">{master.user.email}</div>
//           </div>

//           <form
//             action={changeMasterPassword}
//             className="grid gap-3 sm:grid-cols-[1fr_auto]"
//           >
//             <input type="hidden" name="masterId" value={master.id} />

//             <label className="space-y-1">
//               <div className="text-sm opacity-70">Новый пароль</div>
//               <div className="relative">
//                 <input
//                   name="password"
//                   type="password"
//                   required
//                   minLength={8}
//                   className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
//                   placeholder="Не короче 8 символов"
//                 />
//                 <KeyRound className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
//               </div>
//             </label>

//             <div className="flex items-end">
//               <button
//                 type="submit"
//                 className="rounded-xl border px-4 py-2 hover:bg-white/5"
//               >
//                 Сменить пароль
//               </button>
//             </div>
//           </form>

//           <form action={unlinkMasterLogin}>
//             <input type="hidden" name="masterId" value={master.id} />
//             <button
//               type="submit"
//               className="rounded-xl border px-4 py-2 hover:bg-white/5"
//             >
//               Отвязать логин
//             </button>
//           </form>
//         </div>
//       ) : (
//         <form action={createMasterLogin} className="grid gap-3 md:grid-cols-3">
//           <input type="hidden" name="masterId" value={master.id} />

//           <label className="space-y-1">
//             <div className="text-sm opacity-70">Email</div>
//             <div className="relative">
//               <input
//                 name="email"
//                 type="email"
//                 required
//                 className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
//                 placeholder="master@example.com"
//               />
//               <Mail className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
//             </div>
//           </label>

//           <label className="space-y-1">
//             <div className="text-sm opacity-70">Имя (для учётки)</div>
//             <div className="relative">
//               <input
//                 name="name"
//                 required
//                 defaultValue={master.name}
//                 className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
//                 placeholder={master.name}
//               />
//               <User2 className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
//             </div>
//           </label>

//           <label className="space-y-1">
//             <div className="text-sm opacity-70">Пароль</div>
//             <div className="relative">
//               <input
//                 name="password"
//                 type="password"
//                 required
//                 minLength={8}
//                 className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
//                 placeholder="Минимум 8 символов"
//               />
//               <KeyRound className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
//             </div>
//           </label>

//           <div className="md:col-span-3">
//             <button
//               type="submit"
//               className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500"
//             >
//               <Link2 className="h-4 w-4" />
//               Создать логин и привязать
//             </button>
//           </div>
//         </form>
//       )}
//     </section>
//   );
// }
