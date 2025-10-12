import { prisma } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { Role } from '@prisma/client';
import {
  updateUserRole,
  linkUserToMaster,
  unlinkUserFromMaster,
  createUser,
} from './actions';
import {
  UserPlus,
  Shield,
  Mail,
  User2,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireRole(['ADMIN'] as const);

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      master: { select: { id: true, name: true } },
    },
  });

  // подтянем почту привязанного пользователя, чтобы красиво показать список мастеров с доступом
  const masters = await prisma.master.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { email: true, name: true } },
    },
  });

  const mastersWithAccess = masters.filter((m) => m.userId);

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 space-y-6">
      {/* Создать пользователя */}
      <section className="rounded-2xl border p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-9 w-9 grid place-items-center rounded-lg ring-2 ring-violet-400/30">
            <UserPlus className="h-5 w-5 text-violet-400" />
          </div>
          <h1 className="text-lg font-semibold">Создать пользователя</h1>
        </div>

        <form action={createUser} className="grid gap-3 md:grid-cols-5">
          <label className="space-y-1 md:col-span-2">
            <div className="text-sm opacity-70">Email</div>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder="user@example.com"
              />
              <Mail className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
            </div>
          </label>

          <label className="space-y-1">
            <div className="text-sm opacity-70">Имя</div>
            <div className="relative">
              <input
                name="name"
                required
                className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder="Имя"
              />
              <User2 className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
            </div>
          </label>

          <label className="space-y-1">
            <div className="text-sm opacity-70">Пароль</div>
            <div className="relative">
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-xl border bg-transparent px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-violet-500/40"
                placeholder="Минимум 8 символов"
              />
              <KeyRound className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60" />
            </div>
          </label>

          <label className="space-y-1">
            <div className="text-sm opacity-70">Роль</div>
            <div className="relative">
              <select
                name="role"
                className="w-full rounded-xl border bg-transparent px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-violet-500/40"
                defaultValue="USER"
              >
                {Object.values(Role).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Shield className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 opacity-60" />
            </div>
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-sm opacity-70">Мастер (для роли MASTER)</div>
            <select
              name="masterId"
              className="w-full rounded-xl border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500/40"
              defaultValue=""
            >
              <option value="">— не выбирать —</option>
              {masters.map((m) => (
                <option key={m.id} value={m.id} disabled={!!m.userId}>
                  {m.name} {m.userId ? '(занят)' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500"
            >
              <UserPlus className="h-4 w-4" />
              Создать
            </button>
          </div>

          <p className="md:col-span-5 text-xs opacity-60">
            Для роли <b>MASTER</b> рекомендуется выбрать карточку мастера — пользователь будет привязан автоматически.
          </p>
        </form>
      </section>

      {/* Быстрый список: мастера, у которых уже есть доступ */}
      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-9 w-9 grid place-items-center rounded-lg ring-2 ring-emerald-400/30">
            <UserCheck className="h-5 w-5 text-emerald-400" />
          </div>
        <h2 className="text-base font-semibold">
          Мастера с доступом ({mastersWithAccess.length})
        </h2>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {mastersWithAccess.map((m) => (
            <li key={m.id} className="rounded-xl border px-3 py-2">
              <div className="font-medium">{m.name}</div>
              <div className="text-xs opacity-70">{m.user?.email}</div>
            </li>
          ))}
          {mastersWithAccess.length === 0 && (
            <li className="text-sm opacity-70">Пока ни один мастер не имеет доступа.</li>
          )}
        </ul>
      </section>

      {/* Таблица пользователей (как было) */}
      <section className="rounded-2xl border overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500/5 px-4 py-3">
          <h2 className="text-base font-semibold">Пользователи</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-left">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Имя</th>
                <th className="px-4 py-2">Роль</th>
                <th className="px-4 py-2">Мастер</th>
                <th className="px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t/50">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.name ?? '—'}</td>

                  <td className="px-4 py-2">
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-xl border bg-transparent px-2 py-1"
                      >
                        {Object.values(Role).map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-xl border px-3 py-1 hover:bg-white/5"
                      >
                        Сохранить
                      </button>
                    </form>
                  </td>

                  <td className="px-4 py-2">
                    {u.master ? `#${u.master.id.slice(0, 6)} — ${u.master.name}` : 'не привязан'}
                  </td>

                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={linkUserToMaster} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select
                          name="masterId"
                          className="rounded-xl border bg-transparent px-2 py-1"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Выбрать мастера…
                          </option>
                          {masters.map((m) => (
                            <option key={m.id} value={m.id} disabled={!!m.userId}>
                              {m.name} {m.userId ? '(занят)' : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-xl border px-3 py-1 hover:bg-white/5"
                        >
                          Привязать
                        </button>
                      </form>

                      <form action={unlinkUserFromMaster}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-xl border px-3 py-1 hover:bg-white/5 disabled:opacity-50"
                          disabled={!u.master}
                          title={u.master ? 'Отвязать' : 'Нет привязки'}
                        >
                          Отвязать
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center opacity-60">
                    Пользователи не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 text-xs opacity-60">
          Для роли <b>MASTER</b> сначала создайте мастера в разделе «Админ → Мастера → Новый», затем привяжите пользователя здесь.
        </div>
      </section>
    </main>
  );
}
