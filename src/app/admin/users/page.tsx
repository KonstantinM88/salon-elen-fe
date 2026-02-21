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
import {
  UserPlus,
  Users,
  Shield,
  Link2,
  Unlink,
  Trash2,
  Save,
  ArrowLeft,
} from 'lucide-react';
import {
  type SeoLocale,
  type SearchParamsPromise,
} from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';

/* ───────────────────────── helpers ───────────────────────── */

function roleLabel(r: Role): string {
  if (r === 'ADMIN') return 'ADMIN';
  if (r === 'MASTER') return 'MASTER';
  return 'USER';
}

function roleBadgeClass(r: Role): string {
  if (r === 'ADMIN')
    return 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30';
  if (r === 'MASTER')
    return 'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30';
  return 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/15';
}

type UsersPageCopy = {
  title: string;
  total: string;
  admins: string;
  back: string;
  createUser: string;
  name: string;
  email: string;
  password: string;
  passwordHint: string;
  role: string;
  linkToMasterOptional: string;
  noSelect: string;
  create: string;
  tableName: string;
  tableMaster: string;
  tableActions: string;
  saveRoleTitle: string;
  saveShort: string;
  notLinked: string;
  selectShort: string;
  linkTitle: string;
  notLinkedTitle: string;
  unlinkTitle: string;
  deleteUserTitle: string;
  cannotDeleteSelf: string;
  lastAdmin: string;
  delete: string;
  roleHintBefore: string;
  roleHintAfter: string;
  usersList: string;
  pieces: string;
  noName: string;
  masterLabel: string;
  save: string;
  selectMaster: string;
  unlink: string;
  deleteUser: string;
};

const USERS_PAGE_COPY: Record<SeoLocale, UsersPageCopy> = {
  de: {
    title: 'Benutzer',
    total: 'insgesamt',
    admins: 'Admin',
    back: 'Zurueck',
    createUser: 'Benutzer erstellen',
    name: 'Name',
    email: 'E-Mail',
    password: 'Passwort',
    passwordHint: 'mind. 8 Zeichen',
    role: 'Rolle',
    linkToMasterOptional: 'Mit Mitarbeiter verknuepfen (optional)',
    noSelect: '— nichts auswaehlen —',
    create: 'Erstellen',
    tableName: 'Name',
    tableMaster: 'Mitarbeiter',
    tableActions: 'Aktionen',
    saveRoleTitle: 'Rolle speichern',
    saveShort: 'Speich.',
    notLinked: 'nicht verknuepft',
    selectShort: 'Auswaehlen…',
    linkTitle: 'Verknuepfen',
    notLinkedTitle: 'Nicht verknuepft',
    unlinkTitle: 'Trennen',
    deleteUserTitle: 'Benutzer loeschen',
    cannotDeleteSelf: 'Sie koennen sich nicht selbst loeschen',
    lastAdmin: 'Einziger Admin',
    delete: 'Loeschen',
    roleHintBefore: 'Fuer die Rolle ',
    roleHintAfter:
      ' erstellen Sie zuerst einen Mitarbeiter unter „Admin → Mitarbeiter → Neu“ und verknuepfen dann hier den Benutzer.',
    usersList: 'Benutzerliste',
    pieces: 'Stk.',
    noName: '(ohne Namen)',
    masterLabel: 'Mitarbeiter:',
    save: 'Speichern',
    selectMaster: 'Mitarbeiter auswaehlen…',
    unlink: 'Trennen',
    deleteUser: 'Benutzer loeschen',
  },
  ru: {
    title: 'Пользователи',
    total: 'всего',
    admins: 'админ',
    back: 'Назад',
    createUser: 'Создать пользователя',
    name: 'Имя',
    email: 'Email',
    password: 'Пароль',
    passwordHint: 'мин. 8 символов',
    role: 'Роль',
    linkToMasterOptional: 'Привязать к мастеру (опционально)',
    noSelect: '— не выбирать —',
    create: 'Создать',
    tableName: 'Имя',
    tableMaster: 'Мастер',
    tableActions: 'Действия',
    saveRoleTitle: 'Сохранить роль',
    saveShort: 'Сохр.',
    notLinked: 'не привязан',
    selectShort: 'Выбрать…',
    linkTitle: 'Привязать',
    notLinkedTitle: 'Не привязан',
    unlinkTitle: 'Отвязать',
    deleteUserTitle: 'Удалить пользователя',
    cannotDeleteSelf: 'Нельзя удалить себя',
    lastAdmin: 'Единственный админ',
    delete: 'Удалить',
    roleHintBefore: 'Для роли ',
    roleHintAfter:
      ' сначала создайте мастера в разделе «Админ → Мастера → Новый», затем привяжите пользователя здесь.',
    usersList: 'Список пользователей',
    pieces: 'шт.',
    noName: '(без имени)',
    masterLabel: 'Мастер:',
    save: 'Сохранить',
    selectMaster: 'Выбрать мастера…',
    unlink: 'Отвязать',
    deleteUser: 'Удалить пользователя',
  },
  en: {
    title: 'Users',
    total: 'total',
    admins: 'admins',
    back: 'Back',
    createUser: 'Create User',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    passwordHint: 'min. 8 characters',
    role: 'Role',
    linkToMasterOptional: 'Link to staff member (optional)',
    noSelect: '— do not select —',
    create: 'Create',
    tableName: 'Name',
    tableMaster: 'Staff',
    tableActions: 'Actions',
    saveRoleTitle: 'Save role',
    saveShort: 'Save',
    notLinked: 'not linked',
    selectShort: 'Select…',
    linkTitle: 'Link',
    notLinkedTitle: 'Not linked',
    unlinkTitle: 'Unlink',
    deleteUserTitle: 'Delete user',
    cannotDeleteSelf: 'You cannot delete yourself',
    lastAdmin: 'Last admin',
    delete: 'Delete',
    roleHintBefore: 'For role ',
    roleHintAfter:
      ' first create a staff member in “Admin → Staff → New”, then link the user here.',
    usersList: 'Users List',
    pieces: 'pcs.',
    noName: '(no name)',
    masterLabel: 'Staff:',
    save: 'Save',
    selectMaster: 'Select staff…',
    unlink: 'Unlink',
    deleteUser: 'Delete User',
  },
};

/* ───────────────────────── Page ───────────────────────── */

type PageProps = {
  searchParams?: SearchParamsPromise;
};

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);
  const t = USERS_PAGE_COPY[locale];

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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center rounded-xl
                          bg-lime-100 dark:bg-lime-500/15 ring-1 ring-lime-300 dark:ring-lime-400/30">
            <Users className="h-5 w-5 text-lime-600 dark:text-lime-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-xs text-gray-500 dark:text-white/50">
              {users.length} {t.total} · {adminsCount} {t.admins}
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400
                     hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t.back}</span>
        </Link>
      </div>

      {/* ── Создать нового ── */}
      <section className="rounded-2xl border border-gray-200 dark:border-white/10
                          bg-white dark:bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
            {t.createUser}
          </h2>
        </div>

        <form action={createUser} className="space-y-3">
          {/* Row 1: Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-xs text-gray-500 dark:text-slate-400">{t.name}</span>
              <input
                name="name"
                required
                className="w-full rounded-xl border border-gray-300 dark:border-white/10
                           bg-gray-50 dark:bg-slate-800/60
                           text-gray-900 dark:text-white
                           px-3 h-10 outline-none text-sm
                           focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400
                           transition"
                placeholder={t.name}
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs text-gray-500 dark:text-slate-400">Email</span>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-xl border border-gray-300 dark:border-white/10
                           bg-gray-50 dark:bg-slate-800/60
                           text-gray-900 dark:text-white
                           px-3 h-10 outline-none text-sm
                           focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400
                           transition"
                placeholder="user@example.com"
              />
            </label>
          </div>

          {/* Row 2: Password + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-xs text-gray-500 dark:text-slate-400">{t.password}</span>
              <input
                type="password"
                name="password"
                minLength={8}
                required
                className="w-full rounded-xl border border-gray-300 dark:border-white/10
                           bg-gray-50 dark:bg-slate-800/60
                           text-gray-900 dark:text-white
                           px-3 h-10 outline-none text-sm
                           focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400
                           transition"
                placeholder={t.passwordHint}
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs text-gray-500 dark:text-slate-400">{t.role}</span>
              <select
                name="role"
                className="w-full rounded-xl border border-gray-300 dark:border-white/10
                           bg-gray-50 dark:bg-slate-800/60
                           text-gray-900 dark:text-white
                           px-3 h-10 text-sm
                           focus:ring-2 focus:ring-violet-500/40
                           transition"
                defaultValue="USER"
              >
                <option value="USER">USER</option>
                <option value="MASTER">MASTER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
          </div>

          {/* Row 3: Master + Submit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-xs text-gray-500 dark:text-slate-400">
                {t.linkToMasterOptional}
              </span>
              <select
                name="masterId"
                className="w-full rounded-xl border border-gray-300 dark:border-white/10
                           bg-gray-50 dark:bg-slate-800/60
                           text-gray-900 dark:text-white
                           px-3 h-10 text-sm
                           focus:ring-2 focus:ring-violet-500/40
                transition"
                defaultValue=""
              >
                <option value="">{t.noSelect}</option>
                {masters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 h-10
                           text-sm font-medium text-white
                           bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                           hover:brightness-110 transition
                           shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                {t.create}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* ══════════ Таблица: DESKTOP (lg+) ══════════ */}
      <section className="hidden lg:block rounded-2xl border border-gray-200 dark:border-white/10
                          bg-white dark:bg-slate-900/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-white/10
                           bg-gray-50 dark:bg-white/[0.03]">
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300">{t.tableName}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300">{t.role}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-slate-300">{t.tableMaster}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-slate-300">{t.tableActions}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {users.map((u) => {
              const attached = masters.find((m) => m.userId === u.id) ?? null;
              const canDelete =
                u.id !== selfId && (u.role !== 'ADMIN' || adminsCount > 1);

              return (
                <tr key={u.id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  {/* Email */}
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[220px]">
                      {u.email}
                    </div>
                  </td>

                  {/* Имя */}
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 dark:text-slate-300">
                      {u.name ?? '—'}
                    </div>
                  </td>

                  {/* Роль */}
                  <td className="px-4 py-3">
                    <form action={updateUserRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-lg border border-gray-300 dark:border-white/10
                                   bg-white dark:bg-slate-800/60
                                   text-gray-900 dark:text-white
                                   h-8 px-2 text-xs
                                   focus:ring-2 focus:ring-violet-500/40
                                   transition"
                      >
                        <option value="USER">USER</option>
                        <option value="MASTER">MASTER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 h-8 text-xs font-medium
                                   border border-gray-300 dark:border-white/10
                                   text-gray-700 dark:text-slate-200
                                   bg-white dark:bg-slate-900/60
                                   hover:bg-gray-50 dark:hover:bg-slate-800/70
                                   transition"
                        title={t.saveRoleTitle}
                      >
                        <Save className="h-3 w-3" />
                        {t.saveShort}
                      </button>
                    </form>
                  </td>

                  {/* Мастер */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-500 dark:text-slate-400 mb-1.5">
                      {attached ? (
                        <>
                          <span className="text-gray-400 dark:text-slate-500">
                            #{attached.id.slice(0, 6)}
                          </span>{' '}
                          — {attached.name}
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-500">{t.notLinked}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <form action={linkUserToMaster} className="flex items-center gap-1.5">
                        <input type="hidden" name="userId" value={u.id} />
                        <select
                          name="masterId"
                          defaultValue=""
                          className="rounded-lg border border-gray-300 dark:border-white/10
                                     bg-white dark:bg-slate-800/60
                                     text-gray-900 dark:text-white
                                     h-8 px-2 text-xs max-w-[140px]
                                     focus:ring-2 focus:ring-violet-500/40
                                     transition"
                        >
                          <option value="">{t.selectShort}</option>
                          {masters.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg px-2 h-8 text-xs
                                     border border-emerald-300 dark:border-emerald-500/30
                                     text-emerald-700 dark:text-emerald-300
                                     bg-emerald-50 dark:bg-emerald-500/10
                                     hover:bg-emerald-100 dark:hover:bg-emerald-500/20
                                     transition"
                          title={t.linkTitle}
                        >
                          <Link2 className="h-3 w-3" />
                        </button>
                      </form>

                      <form action={unlinkUserFromMaster}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 rounded-lg px-2 h-8 text-xs
                                     border border-gray-300 dark:border-white/10
                                     text-gray-500 dark:text-slate-400
                                     hover:bg-gray-50 dark:hover:bg-white/5
                                     disabled:opacity-40 transition"
                          disabled={!attached}
                          title={!attached ? t.notLinkedTitle : t.unlinkTitle}
                        >
                          <Unlink className="h-3 w-3" />
                        </button>
                      </form>
                    </div>
                  </td>

                  {/* Удалить */}
                  <td className="px-4 py-3 text-right">
                    <form action={deleteUser}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 h-8 text-xs font-medium
                                   border border-red-300 dark:border-red-500/30
                                   text-red-600 dark:text-red-300
                                   bg-red-50 dark:bg-red-500/10
                                   hover:bg-red-100 dark:hover:bg-red-500/20
                                   disabled:opacity-40 transition"
                        disabled={!canDelete}
                        title={
                          canDelete
                            ? t.deleteUserTitle
                            : u.id === selfId
                            ? t.cannotDeleteSelf
                            : t.lastAdmin
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                        {t.delete}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400
                       border-t border-gray-200 dark:border-white/10">
          {t.roleHintBefore}
          <strong className="text-gray-800 dark:text-slate-200">MASTER</strong>{' '}
          {t.roleHintAfter}
        </p>
      </section>

      {/* ══════════ Карточки: MOBILE (до lg) ══════════ */}
      <section className="lg:hidden space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-200">
            {t.usersList}
          </h2>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {users.length} {t.pieces}
          </span>
        </div>

        {users.map((u) => {
          const attached = masters.find((m) => m.userId === u.id) ?? null;
          const canDelete =
            u.id !== selfId && (u.role !== 'ADMIN' || adminsCount > 1);

          return (
            <div
              key={u.id}
              className="rounded-xl border border-gray-200 dark:border-white/10
                         bg-white dark:bg-slate-900/60 p-3.5 space-y-3"
            >
              {/* Top row: email + role badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {u.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {u.name ?? t.noName}
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5
                              text-[10px] font-semibold ${roleBadgeClass(u.role)}`}
                >
                  {roleLabel(u.role)}
                </span>
              </div>

              {/* Master info */}
              <div className="text-xs text-gray-500 dark:text-slate-400">
                <Shield className="inline h-3 w-3 mr-1 opacity-50" />
                {t.masterLabel}{' '}
                {attached ? (
                  <span className="text-gray-700 dark:text-slate-200 font-medium">
                    {attached.name}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-slate-500">{t.notLinked}</span>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-white/5">
                {/* Role change */}
                <form action={updateUserRole} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={u.id} />
                  <select
                    name="role"
                    defaultValue={u.role}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-white/10
                               bg-gray-50 dark:bg-slate-800/60
                               text-gray-900 dark:text-white
                               h-9 px-2.5 text-xs
                               focus:ring-2 focus:ring-violet-500/40 transition"
                  >
                    <option value="USER">USER</option>
                    <option value="MASTER">MASTER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 h-9 text-xs font-medium
                               border border-gray-300 dark:border-white/10
                               text-gray-700 dark:text-slate-200
                               bg-gray-50 dark:bg-slate-800/60
                               hover:bg-gray-100 dark:hover:bg-slate-700/60
                               transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {t.save}
                  </button>
                </form>

                {/* Master link/unlink */}
                <div className="flex items-center gap-2">
                  <form action={linkUserToMaster} className="flex flex-1 items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select
                      name="masterId"
                      defaultValue=""
                      className="flex-1 rounded-lg border border-gray-300 dark:border-white/10
                                 bg-gray-50 dark:bg-slate-800/60
                                 text-gray-900 dark:text-white
                                 h-9 px-2.5 text-xs
                                 focus:ring-2 focus:ring-violet-500/40 transition"
                    >
                      <option value="">{t.selectMaster}</option>
                      {masters.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 h-9 text-xs
                                 border border-emerald-300 dark:border-emerald-500/30
                                 text-emerald-700 dark:text-emerald-300
                                 bg-emerald-50 dark:bg-emerald-500/10
                                 hover:bg-emerald-100 dark:hover:bg-emerald-500/20
                                 transition"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                    </button>
                  </form>

                  <form action={unlinkUserFromMaster}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-lg px-2.5 h-9 text-xs
                                 border border-gray-300 dark:border-white/10
                                 text-gray-500 dark:text-slate-400
                                 hover:bg-gray-50 dark:hover:bg-white/5
                                 disabled:opacity-40 transition"
                      disabled={!attached}
                      title={t.unlink}
                    >
                      <Unlink className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>

                {/* Delete */}
                {canDelete && (
                  <form action={deleteUser}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 h-9 text-xs font-medium
                                 border border-red-200 dark:border-red-500/30
                                 text-red-600 dark:text-red-300
                                 bg-red-50 dark:bg-red-500/10
                                 hover:bg-red-100 dark:hover:bg-red-500/20
                                 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t.deleteUser}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}

        <p className="text-xs text-gray-500 dark:text-slate-400 px-1">
          {t.roleHintBefore}
          <strong className="text-gray-800 dark:text-slate-200">MASTER</strong>{' '}
          {t.roleHintAfter}
        </p>
      </section>
    </div>
  );
}


//---------адаптация + светлая тема для админки---------//
// // src/app/admin/users/page.tsx
// import { prisma } from '@/lib/db';
// import { Role } from '@prisma/client';
// import {
//   createUser,
//   updateUserRole,
//   linkUserToMaster,
//   unlinkUserFromMaster,
//   deleteUser,
// } from './actions';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import Link from 'next/link';

// /* ───────────────────────── helpers ───────────────────────── */

// function roleLabel(r: Role): string {
//   if (r === 'ADMIN') return 'ADMIN';
//   if (r === 'MASTER') return 'MASTER';
//   return 'USER';
// }

// /* ───────────────────────── Page ───────────────────────── */

// export default async function AdminUsersPage() {
//   const session = await getServerSession(authOptions);
//   const selfId = session?.user?.id ?? '';

//   const [users, masters] = await Promise.all([
//     prisma.user.findMany({
//       orderBy: [{ role: 'asc' }, { email: 'asc' }],
//       select: { id: true, email: true, name: true, role: true },
//     }),
//     prisma.master.findMany({
//       orderBy: { name: 'asc' },
//       select: { id: true, name: true, userId: true },
//     }),
//   ]);

//   const adminsCount = users.filter((u) => u.role === 'ADMIN').length;

//   return (
//     <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Пользователи</h1>
//         <Link
//           href="/admin"
//           className="text-sm text-slate-300 hover:text-white transition"
//         >
//           ← назад в панель
//         </Link>
//       </div>

//       {/* ---------- Создать нового ---------- */}
//       <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-6">
//         <h2 className="text-sm font-semibold text-slate-200 mb-4">
//           Создать пользователя
//         </h2>

//         <form action={createUser} className="grid grid-cols-1 gap-3 md:grid-cols-6">
//           <div className="md:col-span-2">
//             <label className="block text-xs text-slate-400 mb-1">Имя</label>
//             <input
//               name="name"
//               required
//               className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 outline-none text-sm"
//               placeholder="Имя"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-xs text-slate-400 mb-1">Email</label>
//             <input
//               type="email"
//               name="email"
//               required
//               className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 outline-none text-sm"
//               placeholder="user@example.com"
//             />
//           </div>
//           <div className="md:col-span-1">
//             <label className="block text-xs text-slate-400 mb-1">Пароль</label>
//             <input
//               type="password"
//               name="password"
//               minLength={8}
//               required
//               className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 outline-none text-sm"
//               placeholder="мин. 8 символов"
//             />
//           </div>
//           <div className="md:col-span-1">
//             <label className="block text-xs text-slate-400 mb-1">Роль</label>
//             <select
//               name="role"
//               className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 text-sm"
//               defaultValue="USER"
//             >
//               <option value="USER">USER</option>
//               <option value="MASTER">MASTER</option>
//               <option value="ADMIN">ADMIN</option>
//             </select>
//           </div>

//           <div className="md:col-span-3">
//             <label className="block text-xs text-slate-400 mb-1">
//               Привязать к мастеру (опционально)
//             </label>
//             <select
//               name="masterId"
//               className="w-full rounded-xl bg-slate-800/60 border border-white/10 px-3 h-10 text-sm"
//               defaultValue=""
//             >
//               <option value="">— не выбирать —</option>
//               {masters.map((m) => (
//                 <option key={m.id} value={m.id}>
//                   {m.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="md:col-span-3 flex items-end">
//             <button
//               type="submit"
//               className="inline-flex items-center justify-center rounded-xl px-4 h-10 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500 ring-1 ring-white/10 hover:brightness-110 transition"
//             >
//               Создать
//             </button>
//           </div>
//         </form>
//       </section>

//       {/* ---------- Таблица пользователей ---------- */}
//       <section className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
//         <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold text-slate-300 border-b border-white/10">
//           <div className="col-span-3">Email</div>
//           <div className="col-span-2">Имя</div>
//           <div className="col-span-2">Роль</div>
//           <div className="col-span-3">Мастер</div>
//           <div className="col-span-2 text-right">Действия</div>
//         </div>

//         <div className="divide-y divide-white/10">
//           {users.map((u) => {
//             const attached = masters.find((m) => m.userId === u.id) ?? null;
//             const canDelete =
//               u.id !== selfId && (u.role !== 'ADMIN' || adminsCount > 1);

//             return (
//               <div
//                 key={u.id}
//                 className="grid grid-cols-12 gap-3 px-4 py-3 items-center"
//               >
//                 {/* Email */}
//                 <div className="col-span-3">
//                   <div className="text-sm">{u.email}</div>
//                 </div>

//                 {/* Имя */}
//                 <div className="col-span-2">
//                   <div className="text-sm text-slate-300">{u.name ?? '—'}</div>
//                 </div>

//                 {/* Роль + сохранить */}
//                 <div className="col-span-2">
//                   <form action={updateUserRole} className="flex items-center gap-2">
//                     <input type="hidden" name="userId" value={u.id} />
//                     <select
//                       name="role"
//                       defaultValue={u.role}
//                       className="rounded-xl bg-slate-800/60 border border-white/10 h-9 px-3 text-sm"
//                     >
//                       <option value="USER">{roleLabel('USER')}</option>
//                       <option value="MASTER">{roleLabel('MASTER')}</option>
//                       <option value="ADMIN">{roleLabel('ADMIN')}</option>
//                     </select>
//                     <button
//                       type="submit"
//                       className="rounded-xl px-3 h-9 text-sm font-medium text-slate-100 border border-white/10 bg-slate-900/60 hover:bg-slate-800/70"
//                     >
//                       Сохранить
//                     </button>
//                   </form>
//                 </div>

//                 {/* Привязанный мастер (текст) */}
//                 <div className="col-span-3">
//                   <div className="text-sm text-slate-300">
//                     {attached ? (
//                       <>
//                         <span className="text-slate-400">#{attached.id.slice(0, 6)}</span>{' '}
//                         — {attached.name}
//                       </>
//                     ) : (
//                       <span className="text-slate-500">не привязан</span>
//                     )}
//                   </div>

//                   {/* Выбор мастера + привязать / отвязать */}
//                   <div className="mt-2 flex items-center gap-2">
//                     <form action={linkUserToMaster} className="flex items-center gap-2">
//                       <input type="hidden" name="userId" value={u.id} />
//                       <select
//                         name="masterId"
//                         defaultValue=""
//                         className="rounded-xl bg-slate-800/60 border border-white/10 h-9 px-3 text-sm"
//                       >
//                         <option value="">Выбрать мастера…</option>
//                         {masters.map((m) => (
//                           <option key={m.id} value={m.id}>
//                             {m.name}
//                           </option>
//                         ))}
//                       </select>
//                       <button
//                         type="submit"
//                         className="rounded-xl px-3 h-9 text-sm font-medium text-slate-100 border border-white/10 bg-slate-900/60 hover:bg-slate-800/70"
//                       >
//                         Привязать
//                       </button>
//                     </form>

//                     <form action={unlinkUserFromMaster}>
//                       <input type="hidden" name="userId" value={u.id} />
//                       <button
//                         type="submit"
//                         className="rounded-xl px-3 h-9 text-sm font-medium text-slate-100 border border-white/10 bg-slate-900/60 hover:bg-slate-800/70"
//                         disabled={!attached}
//                         title={!attached ? 'Мастер не привязан' : 'Отвязать мастера'}
//                       >
//                         Отвязать
//                       </button>
//                     </form>
//                   </div>
//                 </div>

//                 {/* Действия справа — Удалить */}
//                 <div className="col-span-2">
//                   <div className="flex items-center justify-end gap-2">
//                     <form action={deleteUser}>
//                       <input type="hidden" name="userId" value={u.id} />
//                       <button
//                         type="submit"
//                         className="rounded-full px-3 h-9 text-sm font-medium text-red-200 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:hover:bg-red-500/10"
//                         disabled={!canDelete}
//                         title={
//                           canDelete
//                             ? 'Удалить пользователя'
//                             : u.id === selfId
//                             ? 'Нельзя удалить самих себя'
//                             : 'Нельзя удалить единственного администратора'
//                         }
//                       >
//                         Удалить
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         <p className="px-4 py-3 text-xs text-slate-400 border-t border-white/10">
//           Для роли <strong className="text-slate-200">MASTER</strong> сначала
//           создайте мастера в разделе «Админ → Мастера → Новый», затем привяжите
//           пользователя здесь.
//         </p>
//       </section>
//     </div>
//   );
// }
