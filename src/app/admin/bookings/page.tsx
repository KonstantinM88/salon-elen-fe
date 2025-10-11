// src/app/admin/bookings/page.tsx
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, Prisma } from '@prisma/client';
import Link from 'next/link';
import { setStatus, remove } from './actions';
import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import {
  Calendar, Clock, Mail, Phone, Scissors, User2,
  Check, X, Trash2, Filter, MessageSquareText,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

/* ───────── TZ setup ───────── */
const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

/* ───────── helpers ───────── */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const PAGE_SIZE = 10;

function getOne(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}
function num(v: string | undefined, d = 1): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : d;
}

/** Когда создано — Берлин */
function fmtDT(d: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: ORG_TZ,
  }).format(d);
}
/** Дата визита — Берлин */
function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeZone: ORG_TZ,
  }).format(d);
}
/** Время визита — показываем «как ввели»: форматируем UTC без смещения */
function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(d);
}

function qs(base: Record<string, string>, patch: Record<string, string | number | undefined>) {
  const p = new URLSearchParams(base);
  Object.entries(patch).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
  return `?${p.toString()}`;
}

function resolveRange(sp: Record<string, string | string[] | undefined>) {
  const period = getOne(sp, 'period') ?? '7d';
  const by = getOne(sp, 'by') === 'visit' ? 'visit' : 'created';
  const todayStart = startOfDay(new Date());

  let from = todayStart;
  let to = addDays(todayStart, 1);

  switch (period) {
    case 'today':      from = todayStart;               to = addDays(todayStart, 1); break;
    case '7d':         from = addDays(todayStart, -6);  to = addDays(todayStart, 1); break;
    case '30d':        from = addDays(todayStart, -29); to = addDays(todayStart, 1); break;
    case 'thisMonth':  from = startOfMonth(new Date()); to = startOfMonth(addDays(new Date(), 32)); break;
    case 'thisYear':   from = startOfYear(new Date());  to = startOfYear(addDays(new Date(), 370)); break;
    default:           from = addDays(todayStart, -6);  to = addDays(todayStart, 1);
  }
  return { from, to, period, by };
}

/** Строим полный путь услуги: Категория / … / Услуга */
type Svc = { name: string; parent?: Svc | null };
function servicePath(s?: Svc | null): string {
  if (!s) return '—';
  const parts: string[] = [];
  let cur: Svc | null | undefined = s;
  while (cur) { parts.unshift(cur.name); cur = cur.parent ?? null; }
  return parts.join(' / ');
}

/* ───────── page ───────── */

export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const page = Math.max(1, num(getOne(sp, 'page')));
  const statusParam = (getOne(sp, 'status') ?? 'all').toLowerCase();
  const masterParam = getOne(sp, 'master') ?? 'all';

  const { from, to, period, by } = resolveRange(sp);

  const baseQS: Record<string, string> = {
    period, status: statusParam, master: masterParam, by,
  };

  const masters = await prisma.master.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // типобезопасный where
  let where: Prisma.AppointmentWhereInput =
    by === 'visit' ? { startAt: { gte: from, lt: to } } : { createdAt: { gte: from, lt: to } };

  type StatusKey = 'pending' | 'confirmed' | 'canceled' | 'done' | 'all';
  const statusKey = (statusParam as StatusKey) ?? 'all';
  if (statusKey !== 'all') {
    const map: Record<Exclude<StatusKey, 'all'>, AppointmentStatus> = {
      pending: AppointmentStatus.PENDING,
      confirmed: AppointmentStatus.CONFIRMED,
      canceled: AppointmentStatus.CANCELED,
      done: AppointmentStatus.DONE,
    };
    where = { ...where, status: map[statusKey] };
  }
  if (masterParam !== 'all') where = { ...where, masterId: masterParam };

  const skip = (page - 1) * PAGE_SIZE;

  const rows = await prisma.appointment.findMany({
    where,
    orderBy: by === 'visit' ? { startAt: 'desc' } : { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
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
      master: { select: { id: true, name: true } },
      service: {
        select: {
          name: true,
          parent: { select: { name: true, parent: { select: { name: true } } } },
        },
      },
    },
  });
  const hasMore = rows.length === PAGE_SIZE;

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Заявки (онлайн-запись)</h1>

      {/* Быстрые пресеты */}
      <div className="flex flex-wrap gap-2">
        <ChipLink active={period === 'today'}     href={qs(baseQS, { period: 'today', page: 1 })}     label="Сегодня"  color="sky" />
        <ChipLink active={period === '7d'}        href={qs(baseQS, { period: '7d', page: 1 })}        label="Неделя"   color="emerald" />
        <ChipLink active={period === 'thisMonth'} href={qs(baseQS, { period: 'thisMonth', page: 1 })} label="Месяц"    color="violet" />
      </div>

      {/* Фильтры */}
      <section className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 opacity-70" /> Фильтры
        </div>

        <form className="grid gap-3 md:grid-cols-4" method="GET">
          <input type="hidden" name="page" value="1" />

          <Field label="Период">
            <select name="period" defaultValue={period} className="input w-full">
              <option value="today">Сегодня</option>
              <option value="7d">Последние 7 дней</option>
              <option value="30d">Последние 30 дней</option>
              <option value="thisMonth">Текущий месяц</option>
              <option value="thisYear">Текущий год</option>
            </select>
          </Field>

          <Field label="Статус">
            <select name="status" defaultValue={statusParam} className="input w-full">
              <option value="all">Все</option>
              <option value="pending">В ожидании</option>
              <option value="confirmed">Подтверждённые</option>
              <option value="canceled">Отменённые</option>
              <option value="done">Выполненные</option>
            </select>
          </Field>

          <Field label="Мастер">
            <select name="master" defaultValue={masterParam} className="input w-full">
              <option value="all">Все мастера</option>
              {masters.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Считать период по">
            <select name="by" defaultValue={by} className="input w-full">
              <option value="created">Дате создания</option>
              <option value="visit">Дате визита</option>
            </select>
          </Field>

          <div className="md:col-span-4">
            <button className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-500 transition">
              Применить
            </button>
          </div>
        </form>
      </section>

      {/* Список — мобильные карточки */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs opacity-70 flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {fmtDT(r.createdAt)}
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4 opacity-70" />
                <div className="font-medium">{r.customerName}</div>
              </div>
              {r.phone && <Line icon={<Phone className="h-4 w-4" />} text={r.phone} />}
              {r.email && <Line icon={<Mail className="h-4 w-4" />} text={r.email} />}
              <Line icon={<Scissors className="h-4 w-4" />} text={servicePath(r.service)} />
              <Line icon={<User2 className="h-4 w-4" />} text={r.master?.name ?? '—'} />
              <Line icon={<Clock className="h-4 w-4" />} text={`${fmtDate(r.startAt)} • ${fmtTime(r.startAt)} — ${fmtTime(r.endAt)}`} />
              {r.notes && r.notes.trim().length > 0 && (
                <Line icon={<MessageSquareText className="h-4 w-4" />} text={r.notes.trim()} />
              )}
            </div>

            <Actions id={r.id} />
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border p-4 text-sm opacity-70">Записей пока нет</div>
        )}
      </div>

      {/* Таблица — md+ */}
      <div className="rounded-2xl border overflow-x-auto hidden md:block">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              {[
                <th key="h1" className="p-3">Когда создано</th>,
                <th key="h2" className="p-3">Клиент</th>,
                <th key="h3" className="p-3">Услуга</th>,
                <th key="h4" className="p-3">Мастер</th>,
                <th key="h5" className="p-3">Время</th>,
                <th key="h6" className="p-3">Комментарий</th>,
                <th key="h7" className="p-3">Статус</th>,
                <th key="h8" className="p-3"></th>,
              ]}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id}>
                {[
                  <td key="c1" className="p-3 whitespace-nowrap">{fmtDT(r.createdAt)}</td>,
                  <td key="c2" className="p-3">
                    <div className="font-medium">{r.customerName}</div>
                    <div className="text-xs opacity-70 flex gap-3">
                      {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
                      {r.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
                    </div>
                  </td>,
                  <td key="c3" className="p-3">{servicePath(r.service)}</td>,
                  <td key="c4" className="p-3">{r.master?.name ?? '—'}</td>,
                  <td key="c5" className="p-3 whitespace-nowrap">
                    {fmtDate(r.startAt)} {fmtTime(r.startAt)} — {fmtTime(r.endAt)}
                  </td>,
                  <td key="c6" className="p-3">{r.notes && r.notes.trim().length > 0 ? r.notes.trim() : '—'}</td>,
                  <td key="c7" className="p-3"><StatusBadge status={r.status} /></td>,
                  <td key="c8" className="p-3"><Actions id={r.id} compact /></td>,
                ]}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 opacity-70" colSpan={8}>Записей пока нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm opacity-70">Страница {page}</div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition"
              href={qs(baseQS, { page: page - 1 })}
            >
              ← Назад
            </Link>
          )}
          {hasMore && (
            <Link
              className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-500 transition"
              href={qs(baseQS, { page: page + 1 })}
            >
              Показать ещё
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── UI bits ───────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm grid gap-1">
      <span className="opacity-70">{label}</span>
      {children}
    </label>
  );
}

function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2 opacity-90">{icon}<span>{text}</span></div>;
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { text: string; cls: string }> = {
    PENDING:   { text: 'PENDING',   cls: 'bg-amber-500/15 text-amber-400' },
    CONFIRMED: { text: 'CONFIRMED', cls: 'bg-emerald-500/15 text-emerald-400' },
    CANCELED:  { text: 'CANCELED',  cls: 'bg-rose-500/15 text-rose-400' },
    DONE:      { text: 'DONE',      cls: 'bg-sky-500/15 text-sky-400' },
  };
  const s = map[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.text}</span>;
}

function Actions({ id, compact }: { id: string; compact?: boolean }) {
  const size = compact ? 'text-xs px-2.5 py-1' : 'text-xs px-3 py-1';
  return (
    <div className="flex flex-wrap gap-2">
      <form action={async () => { 'use server'; await setStatus(id, AppointmentStatus.CONFIRMED); }}>
        <button className={`rounded-full ${size} bg-emerald-600 text-white hover:bg-emerald-500 transition inline-flex items-center`}>
          <Check className="h-4 w-4 mr-1" /> Подтвердить
        </button>
      </form>
      <form action={async () => { 'use server'; await setStatus(id, AppointmentStatus.CANCELED); }}>
        <button className={`rounded-full ${size} bg-amber-600 text-white hover:bg-amber-500 transition inline-flex items-center`}>
          <X className="h-4 w-4 mr-1" /> Отменить
        </button>
      </form>
      <form action={async () => { 'use server'; await remove(id); }}>
        <button className={`rounded-full ${size} bg-rose-600 text-white hover:bg-rose-500 transition inline-flex items-center`}>
          <Trash2 className="h-4 w-4 mr-1" /> Удалить
        </button>
      </form>
    </div>
  );
}

function ChipLink({ href, label, active, color }:{
  href: string; label: string; active?: boolean; color: 'sky'|'emerald'|'violet';
}) {
  const pal = {
    sky:     { bg: 'bg-sky-500/10',     br: 'border-sky-600/40',     tx: 'text-sky-300' },
    emerald: { bg: 'bg-emerald-500/10', br: 'border-emerald-600/40', tx: 'text-emerald-300' },
    violet:  { bg: 'bg-violet-500/10',  br: 'border-violet-600/40',  tx: 'text-violet-300' },
  }[color];
  const activeCls = `${pal.bg} ${pal.tx} border ${pal.br}`;
  const idle = 'border border-muted-foreground/20 hover:bg-muted/30';
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm transition ${active ? activeCls : idle}`}
    >
      {label}
    </Link>
  );
}










//-------------------временно оставил для себя--------------------
// // src/app/admin/bookings/page.tsx
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus, remove } from './actions';
// import {
//   addDays,
//   startOfDay,
//   startOfMonth,
//   startOfYear,
// } from 'date-fns';
// import {
//   Calendar, Clock, Mail, Phone, Scissors, User2,
//   Check, X, Trash2, Filter,
// } from 'lucide-react';

// export const dynamic = 'force-dynamic';

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// const PAGE_SIZE = 10;

// /* ───────── helpers ───────── */
// function getOne(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }
// function num(v: string | undefined, d = 1): number {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.trunc(n) : d;
// }
// function fmtDT(d: Date): string {
//   return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
// }
// function fmtDate(d: Date): string {
//   return d.toLocaleDateString('ru-RU', { dateStyle: 'short' });
// }
// function fmtTime(d: Date): string {
//   return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
// }
// function qs(base: Record<string, string>, patch: Record<string, string | number | undefined>) {
//   const p = new URLSearchParams(base);
//   Object.entries(patch).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
//   return `?${p.toString()}`;
// }

// function resolveRange(sp: Record<string, string | string[] | undefined>) {
//   const period = getOne(sp, 'period') ?? '7d';
//   const by = getOne(sp, 'by') === 'visit' ? 'visit' : 'created';
//   const todayStart = startOfDay(new Date());

//   let from = todayStart;
//   let to = addDays(todayStart, 1);

//   switch (period) {
//     case 'today': from = todayStart; to = addDays(todayStart, 1); break;
//     case '7d':    from = addDays(todayStart, -6); to = addDays(todayStart, 1); break;
//     case '30d':   from = addDays(todayStart, -29); to = addDays(todayStart, 1); break;
//     case 'thisMonth': from = startOfMonth(new Date()); to = startOfMonth(addDays(new Date(), 32)); break;
//     case 'thisYear':  from = startOfYear(new Date());  to = startOfYear(addDays(new Date(), 370)); break;
//     default: from = addDays(todayStart, -6); to = addDays(todayStart, 1);
//   }
//   return { from, to, period, by };
// }

// /** Строим полный путь услуги: Категория / … / Услуга */
// type Svc = { name: string; parent?: Svc | null };
// function servicePath(s?: Svc | null): string {
//   if (!s) return '—';
//   const parts: string[] = [];
//   let cur: Svc | null | undefined = s;
//   while (cur) { parts.unshift(cur.name); cur = cur.parent ?? null; }
//   return parts.join(' / ');
// }

// /* ───────── page ───────── */

// export default async function AdminBookingsPage({ searchParams }: { searchParams: SearchParams }) {
//   const sp = await searchParams;

//   const page = Math.max(1, num(getOne(sp, 'page')));
//   const statusParam = (getOne(sp, 'status') ?? 'all').toLowerCase();
//   const masterParam = getOne(sp, 'master') ?? 'all';

//   const { from, to, period, by } = resolveRange(sp);

//   const baseQS: Record<string, string> = {
//     period, status: statusParam, master: masterParam, by,
//   };

//   const masters = await prisma.master.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: 'asc' },
//   });

//   // типобезопасный where
//   let where: Prisma.AppointmentWhereInput =
//     by === 'visit' ? { startAt: { gte: from, lt: to } } : { createdAt: { gte: from, lt: to } };

//   type StatusKey = 'pending' | 'confirmed' | 'canceled' | 'done' | 'all';
//   const statusKey = (statusParam as StatusKey) ?? 'all';
//   if (statusKey !== 'all') {
//     const map: Record<Exclude<StatusKey, 'all'>, AppointmentStatus> = {
//       pending: AppointmentStatus.PENDING,
//       confirmed: AppointmentStatus.CONFIRMED,
//       canceled: AppointmentStatus.CANCELED,
//       done: AppointmentStatus.DONE,
//     };
//     where = { ...where, status: map[statusKey] };
//   }
//   if (masterParam !== 'all') where = { ...where, masterId: masterParam };

//   const skip = (page - 1) * PAGE_SIZE;

//   const rows = await prisma.appointment.findMany({
//     where,
//     orderBy: by === 'visit' ? { startAt: 'desc' } : { createdAt: 'desc' },
//     skip,
//     take: PAGE_SIZE,
//     select: {
//       id: true,
//       createdAt: true,
//       customerName: true,
//       phone: true,
//       email: true,
//       notes: true,
//       startAt: true,
//       endAt: true,
//       status: true,
//       master: { select: { id: true, name: true } },
//       service: {
//         select: {
//           name: true,
//           parent: { select: { name: true, parent: { select: { name: true } } } },
//         },
//       },
//     },
//   });
//   const hasMore = rows.length === PAGE_SIZE;

//   return (
//     <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Заявки (онлайн-запись)</h1>

//       {/* Быстрые пресеты */}
//       <div className="flex flex-wrap gap-2">
//         <ChipLink active={period === 'today'}  href={qs(baseQS, { period: 'today', page: 1 })}  label="Сегодня"  color="sky" />
//         <ChipLink active={period === '7d'}     href={qs(baseQS, { period: '7d', page: 1 })}     label="Неделя"  color="emerald" />
//         <ChipLink active={period === 'thisMonth'} href={qs(baseQS, { period: 'thisMonth', page: 1 })} label="Месяц" color="violet" />
//       </div>

//       {/* Фильтры */}
//       <section className="rounded-2xl border p-4 space-y-4">
//         <div className="flex items-center gap-2 text-sm font-medium">
//           <Filter className="h-4 w-4 opacity-70" /> Фильтры
//         </div>

//         <form className="grid gap-3 md:grid-cols-4" method="GET">
//           <input type="hidden" name="page" value="1" />

//           <Field label="Период">
//             <select name="period" defaultValue={period} className="input w-full">
//               <option value="today">Сегодня</option>
//               <option value="7d">Последние 7 дней</option>
//               <option value="30d">Последние 30 дней</option>
//               <option value="thisMonth">Текущий месяц</option>
//               <option value="thisYear">Текущий год</option>
//             </select>
//           </Field>

//           <Field label="Статус">
//             <select name="status" defaultValue={statusParam} className="input w-full">
//               <option value="all">Все</option>
//               <option value="pending">В ожидании</option>
//               <option value="confirmed">Подтверждённые</option>
//               <option value="canceled">Отменённые</option>
//               <option value="done">Выполненные</option>
//             </select>
//           </Field>

//           <Field label="Мастер">
//             <select name="master" defaultValue={masterParam} className="input w-full">
//               <option value="all">Все мастера</option>
//               {masters.map((m) => (
//                 <option key={m.id} value={m.id}>{m.name}</option>
//               ))}
//             </select>
//           </Field>

//           <Field label="Считать период по">
//             <select name="by" defaultValue={by} className="input w-full">
//               <option value="created">Дате создания</option>
//               <option value="visit">Дате визита</option>
//             </select>
//           </Field>

//           <div className="md:col-span-4">
//             {/* Явный цвет, чтобы он точно не «пропал» */}
//             <button className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-500 transition">
//               Применить
//             </button>
//           </div>
//         </form>
//       </section>

//       {/* Список — мобильные карточки */}
//       <div className="space-y-3 md:hidden">
//         {rows.map((r) => (
//           <div key={r.id} className="rounded-2xl border p-3 space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="text-xs opacity-70 flex items-center gap-1">
//                 <Calendar className="h-4 w-4" /> {fmtDT(r.createdAt)}
//               </div>
//               <StatusBadge status={r.status} />
//             </div>

//             <div className="grid gap-2 text-sm">
//               <div className="flex items-center gap-2">
//                 <User2 className="h-4 w-4 opacity-70" />
//                 <div className="font-medium">{r.customerName}</div>
//               </div>
//               {r.phone && <Line icon={<Phone className="h-4 w-4" />} text={r.phone} />}
//               {r.email && <Line icon={<Mail className="h-4 w-4" />} text={r.email} />}
//               <Line icon={<Scissors className="h-4 w-4" />} text={servicePath(r.service)} />
//               <Line icon={<User2 className="h-4 w-4" />} text={r.master?.name ?? '—'} />
//               <Line icon={<Clock className="h-4 w-4" />} text={`${fmtDate(r.startAt)} • ${fmtTime(r.startAt)} — ${fmtTime(r.endAt)}`} />
//             </div>

//             <Actions id={r.id} />
//           </div>
//         ))}

//         {rows.length === 0 && (
//           <div className="rounded-2xl border p-4 text-sm opacity-70">Записей пока нет</div>
//         )}
//       </div>

//       {/* Таблица — md+ */}
//       <div className="rounded-2xl border overflow-x-auto hidden md:block">
//         <table className="min-w-[980px] w-full text-sm">
//           <thead className="bg-muted/40 text-left">
//             <tr>
//               <th className="p-3">Когда создано</th>
//               <th className="p-3">Клиент</th>
//               <th className="p-3">Услуга</th>
//               <th className="p-3">Мастер</th>
//               <th className="p-3">Время</th>
//               <th className="p-3">Статус</th>
//               <th className="p-3"></th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {rows.map((r) => (
//               <tr key={r.id}>
//                 <td className="p-3 whitespace-nowrap">{fmtDT(r.createdAt)}</td>
//                 <td className="p-3">
//                   <div className="font-medium">{r.customerName}</div>
//                   <div className="text-xs opacity-70 flex gap-3">
//                     {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
//                     {r.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
//                   </div>
//                 </td>
//                 <td className="p-3">{servicePath(r.service)}</td>
//                 <td className="p-3">{r.master?.name ?? '—'}</td>
//                 <td className="p-3 whitespace-nowrap">{fmtDate(r.startAt)} {fmtTime(r.startAt)} — {fmtTime(r.endAt)}</td>
//                 <td className="p-3"><StatusBadge status={r.status} /></td>
//                 <td className="p-3"><Actions id={r.id} compact /></td>
//               </tr>
//             ))}
//             {rows.length === 0 && (
//               <tr><td className="p-4 opacity-70" colSpan={7}>Записей пока нет</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Пагинация */}
//       <div className="flex items-center justify-between pt-2">
//         <div className="text-sm opacity-70">Страница {page}</div>
//         <div className="flex gap-2">
//           {page > 1 && (
//             <Link
//               className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition"
//               href={qs(baseQS, { page: page - 1 })}
//             >
//               ← Назад
//             </Link>
//           )}
//           {hasMore && (
//             <Link
//               className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-500 transition"
//               href={qs(baseQS, { page: page + 1 })}
//             >
//               Показать ещё
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ───────── UI bits ───────── */

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <label className="text-sm grid gap-1">
//       <span className="opacity-70">{label}</span>
//       {children}
//     </label>
//   );
// }

// function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
//   return <div className="flex items-center gap-2 opacity-90">{icon}<span>{text}</span></div>;
// }

// function StatusBadge({ status }: { status: AppointmentStatus }) {
//   const map: Record<AppointmentStatus, { text: string; cls: string }> = {
//     PENDING:   { text: 'PENDING',   cls: 'bg-amber-500/15 text-amber-400' },
//     CONFIRMED: { text: 'CONFIRMED', cls: 'bg-emerald-500/15 text-emerald-400' },
//     CANCELED:  { text: 'CANCELED',  cls: 'bg-rose-500/15 text-rose-400' },
//     DONE:      { text: 'DONE',      cls: 'bg-sky-500/15 text-sky-400' },
//   };
//   const s = map[status];
//   return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.text}</span>;
// }

// function Actions({ id, compact }: { id: string; compact?: boolean }) {
//   const size = compact ? 'text-xs px-2.5 py-1' : 'text-xs px-3 py-1';
//   return (
//     <div className="flex flex-wrap gap-2">
//       <form action={async () => { 'use server'; await setStatus(id, AppointmentStatus.CONFIRMED); }}>
//         <button className={`rounded-full ${size} bg-emerald-600 text-white hover:bg-emerald-500 transition inline-flex items-center`}>
//           <Check className="h-4 w-4 mr-1" /> Подтвердить
//         </button>
//       </form>
//       <form action={async () => { 'use server'; await setStatus(id, AppointmentStatus.CANCELED); }}>
//         <button className={`rounded-full ${size} bg-amber-600 text-white hover:bg-amber-500 transition inline-flex items-center`}>
//           <X className="h-4 w-4 mr-1" /> Отменить
//         </button>
//       </form>
//       <form action={async () => { 'use server'; await remove(id); }}>
//         <button className={`rounded-full ${size} bg-rose-600 text-white hover:bg-rose-500 transition inline-flex items-center`}>
//           <Trash2 className="h-4 w-4 mr-1" /> Удалить
//         </button>
//       </form>
//     </div>
//   );
// }

// function ChipLink({ href, label, active, color }:{
//   href: string; label: string; active?: boolean; color: 'sky'|'emerald'|'violet';
// }) {
//   const pal = {
//     sky:     { bg: 'bg-sky-500/10',     br: 'border-sky-600/40',     tx: 'text-sky-300' },
//     emerald: { bg: 'bg-emerald-500/10', br: 'border-emerald-600/40', tx: 'text-emerald-300' },
//     violet:  { bg: 'bg-violet-500/10',  br: 'border-violet-600/40',  tx: 'text-violet-300' },
//   }[color];
//   const activeCls = `${pal.bg} ${pal.tx} border ${pal.br}`;
//   const idle = 'border border-muted-foreground/20 hover:bg-muted/30';
//   return (
//     <Link
//       href={href}
//       className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm transition ${active ? activeCls : idle}`}
//     >
//       {label}
//     </Link>
//   );
// }
