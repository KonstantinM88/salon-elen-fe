// src/app/admin/users/page.tsx
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import {
  createUser,
  updateUserRole,
  linkUserToMaster,
  unlinkUserFromMaster,
  deleteUser,
} from './actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

/* ───────────────────────── helpers ───────────────────────── */

function roleLabel(r: Role): string {
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'MASTER') return 'MASTER';
  return 'USER';
}

/* ───────────────────────── Page ───────────────────────── */

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const selfId = session?.user?.id ?? '';

  const [users, masters] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { email: 'asc' }],
      select: { id: true, email: true, name: true, role: true },
    }),
    prisma.master.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, userId: true },
    }),
  ]);

  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Пользователи</h1>
        <Link
          href="/admin"
          className="text-sm text-slate-300 hover:text-white transition"
        >
          ← назад в панель
        </Link>
      </div>

      {/* ---------- Создать нового ---------- */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">
          Создать пользователя
        </h2>

        <form action={createUser} className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Имя</label>
            <input
              name="name"
              required
              className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 outline-none text-sm"
              placeholder="Имя"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 outline-none text-sm"
              placeholder="user@example.com"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1">Пароль</label>
            <input
              type="password"
              name="password"
              minLength={8}
              required
              className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 outline-none text-sm"
              placeholder="мин. 8 символов"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1">Роль</label>
            <select
              name="role"
              className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 text-sm"
              defaultValue="USER"
            >
              <option value="USER">USER</option>
              <option value="MASTER">MASTER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs text-slate-400 mb-1">
              Привязать к мастеру (опционально)
            </label>
            <select
              name="masterId"
              className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 text-sm"
              defaultValue=""
            >
              <option value="">— не выбирать —</option>
              {masters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl px-4 h-10 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 ring-1 ring-white/10 hover:brightness-110 transition"
            >
              Создать
            </button>
          </div>
        </form>
      </section>

      {/* ---------- Таблица пользователей ---------- */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-slate-300 border-b border-white/10">
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Имя</div>
          <div className="col-span-2">Роль</div>
          <div className="col-span-3">Мастер</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        <div className="divide-y divide-white/10">
          {users.map((u) => {
            const attached = masters.find((m) => m.userId === u.id) ?? null;
            const canDelete =
              u.id !== selfId && (u.role !== 'ADMIN' || adminsCount > 1);

            return (
              <div
                key={u.id}
                className="grid grid-cols-12 gap-3 px-4 py-3 items-center"
              >
                {/* Email */}
                <div className="col-span-3">
                  <div className="text-sm">{u.email}</div>
                </div>

                {/* Имя */}
                <div className="col-span-2">
                  <div className="text-sm text-slate-300">{u.name ?? '—'}</div>
                </div>

                {/* Роль + сохранить */}
                <div className="col-span-2">
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-xl bg-slate-800/60 border border-white/10 h-9 px-3 text-sm"
                    >
                      <option value="USER">{roleLabel('USER')}</option>
                      <option value="MASTER">{roleLabel('MASTER')}</option>
                      <option value="ADMIN">{roleLabel('ADMIN')}</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl px-3 h-9 text-sm font-medium text-slate-100 border border-white/10 bg-slate-900/60 hover:bg-slate-800/70"
                    >
                      Сохранить
                    </button>
                  </form>
                </div>

                {/* Привязанный мастер (текст) */}
                <div className="col-span-3">
                  <div className="text-sm text-slate-300">
                    {attached ? (
                      <>
                        <span className="text-slate-400">#{attached.id.slice(0, 6)}</span>{' '}
                        — {attached.name}
                      </>
                    ) : (
                      <span className="text-slate-500">не привязан</span>
                    )}
                  </div>

                  {/* Выбор мастера + привязать / отвязать */}
                  <div className="mt-2 flex items-center gap-2">
                    <form action={linkUserToMaster} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="masterId"
                        defaultValue=""
                        className="rounded-xl bg-slate-800/60 border border-white/10 h-9 px-3 text-sm"
                      >
                        <option value="">Выбрать мастера…</option>
                        {masters.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl px-3 h-9 text-sm font-medium text-slate-100 border border-white/10 bg-slate-900/60 hover:bg-slate-800/70"
                      >
                        Привязать
                      </button>
                    </form>

                    <form action={unlinkUserFromMaster}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-xl px-3 h-9 text-sm font-medium text-slate-100 border border-white/10 bg-slate-900/60 hover:bg-slate-800/70"
                        disabled={!attached}
                        title={!attached ? 'Мастер не привязан' : 'Отвязать мастера'}
                      >
                        Отвязать
                      </button>
                    </form>
                  </div>
                </div>

                {/* Действия справа — Удалить */}
                <div className="col-span-2">
                  <div className="flex items-center justify-end gap-2">
                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-full px-3 h-9 text-sm font-medium text-red-200 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:hover:bg-red-500/10"
                        disabled={!canDelete}
                        title={
                          canDelete
                            ? 'Удалить пользователя'
                            : u.id === selfId
                            ? 'Нельзя удалить самих себя'
                            : 'Нельзя удалить единственного администратора'
                        }
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="px-4 py-3 text-xs text-slate-400 border-t border-white/10">
          Для роли <strong className="text-slate-200">MASTER</strong> сначала
          создайте мастера в разделе «Админ → Мастера → Новый», затем привяжите
          пользователя здесь.
        </p>
      </section>
    </div>
  );
}




//---------работало-----
// import { prisma } from '@/lib/db';
// import { requireRole } from '@/lib/rbac';
// import { Role } from '@prisma/client';
// import {
//   updateUserRole,
//   linkUserToMaster,
//   unlinkUserFromMaster,
//   createUser,
// } from './actions';
// import {
//   UserPlus,
//   Shield,
//   Mail,
//   User2,
//   KeyRound,
//   UserCheck,
// } from 'lucide-react';

// export const dynamic = 'force-dynamic';

// export default async function AdminUsersPage() {
//   await requireRole(['ADMIN'] as const);

//   const users = await prisma.user.findMany({
//     orderBy: [{ role: 'asc' }, { email: 'asc' }],
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       master: { select: { id: true, name: true } },
//     },
//   });

//   // подтянем почту привязанного пользователя, чтобы красиво показать список мастеров с доступом
//   const masters = await prisma.master.findMany({
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       userId: true,
//       user: { select: { email: true, name: true } },
//     },
//   });

//   const mastersWithAccess = masters.filter((m) => m.userId);

//   return (
//     <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 space-y-6">
//       {/* Создать пользователя */}
//       <section className="rounded-2xl border p-4">
//         <div className="mb-4 flex items-center gap-2">
//           <div className="h-9 w-9 grid place-items-center rounded-lg ring-2 ring-violet-400/30">
//             <UserPlus className="h-5 w-5 text-violet-400" />
//           </div>
//           <h1 className="text-lg font-semibold">Создать пользователя</h1>
//         </div>

//         <form action={createUser} className="grid gap-3 md:grid-cols-5">
//           <label className="space-y-1 md:col-span-2">
//             <div className="text-sm opacity-70">Email</div>
//             <div className="relative">
//               <input
//                 name="email"
//                 type="email"
//                 required
//                 className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
//                 placeholder="user@example.com"
//               />
//               <Mail className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
//             </div>
//           </label>

//           <label className="space-y-1">
//             <div className="text-sm opacity-70">Имя</div>
//             <div className="relative">
//               <input
//                 name="name"
//                 required
//                 className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
//                 placeholder="Имя"
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

//           <label className="space-y-1">
//             <div className="text-sm opacity-70">Роль</div>
//             <div className="relative">
//               <select
//                 name="role"
//                 className="w-full rounded-xl border bg-transparent px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-violet-500/40"
//                 defaultValue="USER"
//               >
//                 {Object.values(Role).map((r) => (
//                   <option key={r} value={r}>
//                     {r}
//                   </option>
//                 ))}
//               </select>
//               <Shield className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 opacity-60" />
//             </div>
//           </label>

//           <label className="space-y-1 md:col-span-2">
//             <div className="text-sm opacity-70">Мастер (для роли MASTER)</div>
//             <select
//               name="masterId"
//               className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/40"
//               defaultValue=""
//             >
//               <option value="">— не выбирать —</option>
//               {masters.map((m) => (
//                 <option key={m.id} value={m.id} disabled={!!m.userId}>
//                   {m.name} {m.userId ? '(занят)' : ''}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <div className="md:col-span-3 flex items-end">
//             <button
//               type="submit"
//               className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500"
//             >
//               <UserPlus className="h-4 w-4" />
//               Создать
//             </button>
//           </div>

//           <p className="md:col-span-5 text-xs opacity-60">
//             Для роли <b>MASTER</b> рекомендуется выбрать карточку мастера — пользователь будет привязан автоматически.
//           </p>
//         </form>
//       </section>

//       {/* Быстрый список: мастера, у которых уже есть доступ */}
//       <section className="rounded-2xl border p-4">
//         <div className="mb-3 flex items-center gap-2">
//           <div className="h-9 w-9 grid place-items-center rounded-lg ring-2 ring-emerald-400/30">
//             <UserCheck className="h-5 w-5 text-emerald-400" />
//           </div>
//         <h2 className="text-base font-semibold">
//           Мастера с доступом ({mastersWithAccess.length})
//         </h2>
//         </div>

//         <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
//           {mastersWithAccess.map((m) => (
//             <li key={m.id} className="rounded-xl border px-3 py-2">
//               <div className="font-medium">{m.name}</div>
//               <div className="text-xs opacity-70">{m.user?.email}</div>
//             </li>
//           ))}
//           {mastersWithAccess.length === 0 && (
//             <li className="text-sm opacity-70">Пока ни один мастер не имеет доступа.</li>
//           )}
//         </ul>
//       </section>

//       {/* Таблица пользователей (как было) */}
//       <section className="rounded-2xl border overflow-hidden">
//         <div className="bg-gradient-to-r from-sky-500/5 px-4 py-3">
//           <h2 className="text-base font-semibold">Пользователи</h2>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead className="bg-white/[0.02]">
//               <tr className="text-left">
//                 <th className="px-4 py-2">Email</th>
//                 <th className="px-4 py-2">Имя</th>
//                 <th className="px-4 py-2">Роль</th>
//                 <th className="px-4 py-2">Мастер</th>
//                 <th className="px-4 py-2">Действия</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u) => (
//                 <tr key={u.id} className="border-t/50">
//                   <td className="px-4 py-2">{u.email}</td>
//                   <td className="px-4 py-2">{u.name ?? '—'}</td>

//                   <td className="px-4 py-2">
//                     <form action={updateUserRole} className="flex items-center gap-2">
//                       <input type="hidden" name="userId" value={u.id} />
//                       <select
//                         name="role"
//                         defaultValue={u.role}
//                         className="rounded-xl border bg-transparent px-2 py-1"
//                       >
//                         {Object.values(Role).map((r) => (
//                           <option key={r} value={r}>
//                             {r}
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         type="submit"
//                         className="rounded-xl border px-3 py-1 hover:bg-white/5"
//                       >
//                         Сохранить
//                       </button>
//                     </form>
//                   </td>

//                   <td className="px-4 py-2">
//                     {u.master ? `#${u.master.id.slice(0, 6)} — ${u.master.name}` : 'не привязан'}
//                   </td>

//                   <td className="px-4 py-2">
//                     <div className="flex flex-wrap items-center gap-2">
//                       <form action={linkUserToMaster} className="flex items-center gap-2">
//                         <input type="hidden" name="userId" value={u.id} />
//                         <select
//                           name="masterId"
//                           className="rounded-xl border bg-transparent px-2 py-1"
//                           defaultValue=""
//                         >
//                           <option value="" disabled>
//                             Выбрать мастера…
//                           </option>
//                           {masters.map((m) => (
//                             <option key={m.id} value={m.id} disabled={!!m.userId}>
//                               {m.name} {m.userId ? '(занят)' : ''}
//                             </option>
//                           ))}
//                         </select>
//                         <button
//                           type="submit"
//                           className="rounded-xl border px-3 py-1 hover:bg-white/5"
//                         >
//                           Привязать
//                         </button>
//                       </form>

//                       <form action={unlinkUserFromMaster}>
//                         <input type="hidden" name="userId" value={u.id} />
//                         <button
//                           type="submit"
//                           className="rounded-xl border px-3 py-1 hover:bg-white/5 disabled:opacity-50"
//                           disabled={!u.master}
//                           title={u.master ? 'Отвязать' : 'Нет привязки'}
//                         >
//                           Отвязать
//                         </button>
//                       </form>
//                     </div>
//                   </td>
//                 </tr>
//               ))}

//               {users.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-center opacity-60">
//                     Пользователи не найдены.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="px-4 py-3 text-xs opacity-60">
//           Для роли <b>MASTER</b> сначала создайте мастера в разделе «Админ → Мастера → Новый», затем привяжите пользователя здесь.
//         </div>
//       </section>
//     </main>
//   );
// }
