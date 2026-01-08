// src/app/admin/bookings/page.tsx - PREMIUM VERSION 💎
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, Prisma } from '@prisma/client';
import Link from 'next/link';
import { setStatus } from './actions';
import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Scissors,
  User2,
  Check,
  X,
  Filter,
  MessageSquareText,
  CheckCircle2,
  Download,
  Sparkles,
} from 'lucide-react';
import {
  formatInOrgTzDateTime,
  formatWallRangeWithDate,
} from '@/lib/orgTime';
import { IconGlow, type GlowTone } from '@/components/admin/IconGlow';
import { DeleteConfirmDialog } from './_components/DeleteConfirmDialog';
import { StatusHistory } from './_components/StatusHistory';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 10;

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════════════════════════════════════ */

function getOne(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function num(v: string | undefined, d = 1): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : d;
}

function qs(
  base: Record<string, string>,
  patch: Record<string, string | number | undefined>
) {
  const p = new URLSearchParams(base);
  Object.entries(patch).forEach(([k, v]) => {
    if (v !== undefined) p.set(k, String(v));
  });
  return `?${p.toString()}`;
}

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
function moneyFromCents(cents?: number | null) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
}

function resolveRange(sp: Record<string, string | string[] | undefined>) {
  const period = getOne(sp, 'period') ?? '7d';
  const by = getOne(sp, 'by') === 'visit' ? 'visit' : 'created';
  const todayStart = startOfDay(new Date());

  let from = todayStart;
  let to = addDays(todayStart, 1);

  switch (period) {
    case 'today':
      from = todayStart;
      to = addDays(todayStart, 1);
      break;
    case '7d':
      from = addDays(todayStart, -6);
      to = addDays(todayStart, 1);
      break;
    case '30d':
      from = addDays(todayStart, -29);
      to = addDays(todayStart, 1);
      break;
    case 'thisMonth':
      from = startOfMonth(new Date());
      to = startOfMonth(addDays(new Date(), 32));
      break;
    case 'thisYear':
      from = startOfYear(new Date());
      to = startOfYear(addDays(new Date(), 370));
      break;
    default:
      from = addDays(todayStart, -6);
      to = addDays(todayStart, 1);
  }
  return { from, to, period, by };
}

/** Полный путь услуги: Категория / … / Услуга */
type Svc = { name: string; parent?: Svc | null; priceCents?: number | null };
function servicePath(s?: Svc | null): string {
  if (!s) return '—';
  const parts: string[] = [];
  let cur: Svc | null | undefined = s;
  while (cur) {
    parts.unshift(cur.name);
    cur = cur.parent ?? null;
  }
  return parts.join(' / ');
}

type BookingRow = Prisma.AppointmentGetPayload<{
  select: {
    id: true;
    createdAt: true;
    customerName: true;
    phone: true;
    email: true;
    notes: true;
    startAt: true;
    endAt: true;
    status: true;
    master: { select: { id: true; name: true } };
    service: {
      select: {
        name: true;
        priceCents: true;
        parent: { select: { name: true; parent: { select: { name: true } } } };
      };
    };
  };
}>;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const page = Math.max(1, num(getOne(sp, 'page')));
  const statusParam = (getOne(sp, 'status') ?? 'all').toLowerCase();
  const masterParam = getOne(sp, 'master') ?? 'all';

  const { from, to, period, by } = resolveRange(sp);

  const baseQS: Record<string, string> = {
    period,
    status: statusParam,
    master: masterParam,
    by,
  };

  const masters = await prisma.master.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  let where: Prisma.AppointmentWhereInput =
    by === 'visit'
      ? { startAt: { gte: from, lt: to } }
      : { createdAt: { gte: from, lt: to } };

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

  const rows: BookingRow[] = await prisma.appointment.findMany({
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
          priceCents: true,
          parent: { select: { name: true, parent: { select: { name: true } } } },
        },
      },
    },
  });
  const hasMore = rows.length === PAGE_SIZE;

  const csvHref = `/admin/bookings/export${qs(baseQS, {})}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO ЗАГОЛОВОК С ГРАДИЕНТОМ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="card-glass card-glass-accent card-glow">
        <div className="gradient-bg-radial" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <IconGlow tone="fuchsia" className="icon-glow-lg">
              <Sparkles className="h-6 w-6 text-fuchsia-200" />
            </IconGlow>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Заявки на запись
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Управление онлайн-записями клиентов
              </p>
            </div>
          </div>
          
          <Link
            href={csvHref}
            className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Экспорт CSV</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          БЫСТРЫЕ ПРЕСЕТЫ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-2">
        <ChipLink
          active={period === 'today'}
          href={qs(baseQS, { period: 'today', page: 1 })}
          label="Сегодня"
          color="sky"
        />
        <ChipLink
          active={period === '7d'}
          href={qs(baseQS, { period: '7d', page: 1 })}
          label="Неделя"
          color="emerald"
        />
        <ChipLink
          active={period === 'thisMonth'}
          href={qs(baseQS, { period: 'thisMonth', page: 1 })}
          label="Месяц"
          color="violet"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ФИЛЬТРЫ С GLASSMORPHISM
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="card-glass card-glow">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <IconGlow tone="sky" className="icon-glow-sm">
              <Filter className="h-4 w-4 text-sky-200" />
            </IconGlow>
            <span className="text-white">Фильтры</span>
          </div>

          <form className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" method="GET">
            <input type="hidden" name="page" value="1" />

            <Field label="Период">
              <select name="period" defaultValue={period} className="input-glass">
                <option value="today">Сегодня</option>
                <option value="7d">Последние 7 дней</option>
                <option value="30d">Последние 30 дней</option>
                <option value="thisMonth">Текущий месяц</option>
                <option value="thisYear">Текущий год</option>
              </select>
            </Field>

            <Field label="Статус">
              <select name="status" defaultValue={statusParam} className="input-glass">
                <option value="all">Все</option>
                <option value="pending">В ожидании</option>
                <option value="confirmed">Подтверждённые</option>
                <option value="canceled">Отменённые</option>
                <option value="done">Выполненные</option>
              </select>
            </Field>

            <Field label="Мастер">
              <select name="master" defaultValue={masterParam} className="input-glass">
                <option value="all">Все мастера</option>
                {masters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Считать период по">
              <select name="by" defaultValue={by} className="input-glass">
                <option value="created">Дате создания</option>
                <option value="visit">Дате визита</option>
              </select>
            </Field>

            <div className="sm:col-span-2 lg:col-span-4">
              <button
                className="btn-gradient-sky w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95"
              >
                Применить фильтры
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          МОБИЛЬНЫЕ КАРТОЧКИ - ПРЕМИУМ СТИЛЬ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3 md:hidden">
        {rows.map((r) => (
          <MobileBookingCard key={r.id} booking={r} />
        ))}

        {rows.length === 0 && (
          <div className="card-glass card-glow p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent" />
            <div className="relative">
              <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Записей пока нет</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ТАБЛИЦА DESKTOP - ФИКСИРОВАННЫЕ КНОПКИ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-3">
        {rows.map((r) => (
          <DesktopBookingCard key={r.id} booking={r} />
        ))}

        {rows.length === 0 && (
          <div className="card-glass card-glow p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent" />
            <div className="relative">
              <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">Записей пока нет</p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ПАГИНАЦИЯ
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-slate-400">Страница {page}</div>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              className="btn-glass text-sm"
              href={qs(baseQS, { page: page - 1 })}
            >
              ← Назад
            </Link>
          )}
          {hasMore && (
            <Link
              className="btn-gradient-sky rounded-xl px-4 py-2.5 text-sm"
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

/* ═══════════════════════════════════════════════════════════════════════════
   DESKTOP КАРТОЧКА
═══════════════════════════════════════════════════════════════════════════ */

function DesktopBookingCard({ booking }: { booking: BookingRow }) {
  const priceCents = booking.service?.priceCents;
  const priceValue =
    priceCents != null ? (
      <span className="font-semibold text-emerald-400">
        {moneyFromCents(priceCents)}
      </span>
    ) : (
      '—'
    );

  return (
    <div className="card-glass-hover card-glass-accent card-glow">
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Создано: {formatInOrgTzDateTime(booking.createdAt)}</span>
            </span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<User2 className="h-4 w-4 text-fuchsia-400" />}
              label="Клиент"
              value={booking.customerName}
              tone="fuchsia"
            />
          </div>

          {booking.phone && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <InfoLine
                icon={<Phone className="h-4 w-4 text-emerald-400" />}
                label="Телефон"
                value={booking.phone}
                tone="emerald"
              />
            </div>
          )}

          {booking.email && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <InfoLine
                icon={<Mail className="h-4 w-4 text-sky-400" />}
                label="Email"
                value={booking.email}
                tone="sky"
              />
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<Scissors className="h-4 w-4 text-amber-400" />}
              label="Услуга"
              value={<span className="block line-clamp-2">{servicePath(booking.service)}</span>}
              tone="amber"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<Sparkles className="h-4 w-4 text-emerald-300" />}
              label="Стоимость"
              value={priceValue}
              tone="emerald"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<User2 className="h-4 w-4 text-cyan-400" />}
              label="Мастер"
              value={booking.master?.name ?? '—'}
              tone="cyan"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<Clock className="h-4 w-4 text-violet-400" />}
              label="Время визита"
              value={formatWallRangeWithDate(booking.startAt, booking.endAt)}
              tone="violet"
            />
          </div>
        </div>

        {booking.notes && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">
                <IconGlow tone="slate">
                  <MessageSquareText className="h-4 w-4 text-slate-300" />
                </IconGlow>
              </span>
              <div>
                <div className="text-xs text-slate-400 mb-1">Комментарий</div>
                <div
                  className="text-sm text-slate-300 break-words line-clamp-3"
                  title={booking.notes}
                >
                  {booking.notes}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <StatusHistory appointmentId={booking.id} />
          
          <div className="flex flex-wrap items-center gap-2">
            <Actions 
              id={booking.id} 
              customerName={booking.customerName}
              status={booking.status} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   МОБИЛЬНАЯ КАРТОЧКА
═══════════════════════════════════════════════════════════════════════════ */

function MobileBookingCard({ booking }: { booking: BookingRow }) {
  return (
    <div className="card-glass-hover card-glass-accent card-glow">
      <div className="p-4 space-y-3">
        {/* Заголовок */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="truncate">{formatInOrgTzDateTime(booking.createdAt)}</span>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Основная информация */}
        <div className="space-y-2 text-sm">
          <InfoLine
            icon={<User2 className="h-4 w-4 text-fuchsia-400" />}
            label="Клиент"
            value={booking.customerName}
            tone="fuchsia"
          />

          {booking.phone && (
            <InfoLine
              icon={<Phone className="h-4 w-4 text-emerald-400" />}
              label="Телефон"
              value={booking.phone}
              tone="emerald"
            />
          )}

          {booking.email && (
            <InfoLine
              icon={<Mail className="h-4 w-4 text-sky-400" />}
              label="Email"
              value={booking.email}
              tone="sky"
            />
          )}

          <InfoLine
            icon={<Scissors className="h-4 w-4 text-amber-400" />}
            label="Услуга"
            value={servicePath(booking.service)}
            tone="amber"
          />

          <InfoLine
            icon={<User2 className="h-4 w-4 text-cyan-400" />}
            label="Мастер"
            value={booking.master?.name ?? '—'}
            tone="cyan"
          />

          <InfoLine
            icon={<Clock className="h-4 w-4 text-violet-400" />}
            label="Время"
            value={formatWallRangeWithDate(booking.startAt, booking.endAt)}
            tone="violet"
          />

          {booking.notes && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">
                  <IconGlow tone="slate">
                    <MessageSquareText className="h-4 w-4 text-slate-300" />
                  </IconGlow>
                </span>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Комментарий:</div>
                  <div className="text-sm text-slate-300 break-words">{booking.notes}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-slate-400">Стоимость:</span>
            <span className="text-base font-semibold text-emerald-400">
              {moneyFromCents(booking.service?.priceCents)}
            </span>
          </div>
        </div>

        {/* Действия */}
        <div className="pt-2">
          <Actions 
            id={booking.id} 
            customerName={booking.customerName}
            status={booking.status} 
          />
        </div>

        {/* История изменений */}
        <StatusHistory appointmentId={booking.id} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm grid gap-2">
      <span className="text-slate-400 font-medium">{label}</span>
      {children}
    </label>
  );
}

function InfoLine({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: GlowTone;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="shrink-0 mt-0.5">
        {tone ? <IconGlow tone={tone}>{icon}</IconGlow> : icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-slate-200 break-words">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<
    AppointmentStatus,
    { text: string; bg: string; textClass: string; border: string }
  > = {
    PENDING: {
      text: 'Ожидание',
      bg: 'bg-amber-500/10',
      textClass: 'text-amber-400',
      border: 'border-amber-400/30',
    },
    CONFIRMED: {
      text: 'Подтверждено',
      bg: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      border: 'border-emerald-400/30',
    },
    CANCELED: {
      text: 'Отменено',
      bg: 'bg-rose-500/10',
      textClass: 'text-rose-400',
      border: 'border-rose-400/30',
    },
    DONE: {
      text: 'Выполнено',
      bg: 'bg-sky-500/10',
      textClass: 'text-sky-400',
      border: 'border-sky-400/30',
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium 
                 border ${s.bg} ${s.textClass} ${s.border} whitespace-nowrap`}
    >
      {s.text}
    </span>
  );
}

function Actions({
  id,
  customerName,
  status,
  compact,
}: {
  id: string;
  customerName: string;
  status: AppointmentStatus;
  compact?: boolean;
}) {
  const baseClasses = compact
    ? 'text-xs px-2 py-1'
    : 'text-xs px-3 py-1.5';

  return (
    <div className="flex flex-wrap gap-2">
      {/* Подтвердить */}
      {status !== AppointmentStatus.CONFIRMED &&
        status !== AppointmentStatus.DONE && (
          <form
            action={async () => {
              'use server';
              await setStatus(id, AppointmentStatus.CONFIRMED);
            }}
          >
            <button
              className={`rounded-full ${baseClasses} bg-emerald-600/90 text-white 
                       hover:bg-emerald-600 transition-all inline-flex items-center gap-1 
                       hover:scale-105 active:scale-95 border border-emerald-500/50`}
            >
              <Check className="h-3.5 w-3.5" />
              <span className={compact ? 'hidden xl:inline' : ''}>Подтвердить</span>
            </button>
          </form>
        )}

      {/* Выполнен */}
      {status === AppointmentStatus.CONFIRMED && (
        <form
          action={async () => {
            'use server';
            await setStatus(id, AppointmentStatus.DONE);
          }}
        >
          <button
            className={`rounded-full ${baseClasses} bg-sky-600/90 text-white 
                     hover:bg-sky-600 transition-all inline-flex items-center gap-1 
                     hover:scale-105 active:scale-95 border border-sky-500/50`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className={compact ? 'hidden xl:inline' : ''}>Выполнен</span>
          </button>
        </form>
      )}

      {/* Отменить */}
      {status !== AppointmentStatus.CANCELED && (
        <form
          action={async () => {
            'use server';
            await setStatus(id, AppointmentStatus.CANCELED);
          }}
        >
          <button
            className={`rounded-full ${baseClasses} bg-amber-600/90 text-white 
                     hover:bg-amber-600 transition-all inline-flex items-center gap-1 
                     hover:scale-105 active:scale-95 border border-amber-500/50`}
          >
            <X className="h-3.5 w-3.5" />
            <span className={compact ? 'hidden xl:inline' : ''}>Отменить</span>
          </button>
        </form>
      )}

      {/* Удалить с подтверждением */}
      <DeleteConfirmDialog
        appointmentId={id}
        customerName={customerName}
      />
    </div>
  );
}

function ChipLink({
  href,
  label,
  active,
  color,
}: {
  href: string;
  label: string;
  active?: boolean;
  color: 'sky' | 'emerald' | 'violet';
}) {
  const pal = {
    sky: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/50' },
    emerald: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-300',
      border: 'border-emerald-500/50',
    },
    violet: {
      bg: 'bg-violet-500/15',
      text: 'text-violet-300',
      border: 'border-violet-500/50',
    },
  }[color];

  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                 border transition-all hover:scale-105 active:scale-95 ${
                   active
                     ? `${pal.bg} ${pal.text} ${pal.border}`
                     : 'border-white/10 text-slate-400 hover:bg-white/5'
                 }`}
    >
      {label}
    </Link>
  );
}



//---------работало до 06.01.26 добовляем отправку по емейл
// // src/app/admin/bookings/page.tsx - PREMIUM VERSION 💎
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus, remove } from './actions';
// import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
// import {
//   Calendar,
//   Clock,
//   Mail,
//   Phone,
//   Scissors,
//   User2,
//   Check,
//   X,
//   Trash2,
//   Filter,
//   MessageSquareText,
//   CheckCircle2,
//   Download,
//   Copy,
//   Sparkles,
// } from 'lucide-react';
// import {
//   formatInOrgTzDateTime,
//   formatWallRangeWithDate,
// } from '@/lib/orgTime';
// import { IconGlow, type GlowTone } from '@/components/admin/IconGlow';

// export const dynamic = 'force-dynamic';

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// const PAGE_SIZE = 10;

// /* ═══════════════════════════════════════════════════════════════════════════
//    HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════ */

// function getOne(
//   sp: Record<string, string | string[] | undefined>,
//   key: string
// ): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }

// function num(v: string | undefined, d = 1): number {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.trunc(n) : d;
// }

// function qs(
//   base: Record<string, string>,
//   patch: Record<string, string | number | undefined>
// ) {
//   const p = new URLSearchParams(base);
//   Object.entries(patch).forEach(([k, v]) => {
//     if (v !== undefined) p.set(k, String(v));
//   });
//   return `?${p.toString()}`;
// }

// const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
// function moneyFromCents(cents?: number | null) {
//   const value = (cents ?? 0) / 100;
//   return new Intl.NumberFormat('ru-RU', {
//     style: 'currency',
//     currency: CURRENCY,
//   }).format(value);
// }

// function resolveRange(sp: Record<string, string | string[] | undefined>) {
//   const period = getOne(sp, 'period') ?? '7d';
//   const by = getOne(sp, 'by') === 'visit' ? 'visit' : 'created';
//   const todayStart = startOfDay(new Date());

//   let from = todayStart;
//   let to = addDays(todayStart, 1);

//   switch (period) {
//     case 'today':
//       from = todayStart;
//       to = addDays(todayStart, 1);
//       break;
//     case '7d':
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//       break;
//     case '30d':
//       from = addDays(todayStart, -29);
//       to = addDays(todayStart, 1);
//       break;
//     case 'thisMonth':
//       from = startOfMonth(new Date());
//       to = startOfMonth(addDays(new Date(), 32));
//       break;
//     case 'thisYear':
//       from = startOfYear(new Date());
//       to = startOfYear(addDays(new Date(), 370));
//       break;
//     default:
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//   }
//   return { from, to, period, by };
// }

// /** Полный путь услуги: Категория / … / Услуга */
// type Svc = { name: string; parent?: Svc | null; priceCents?: number | null };
// function servicePath(s?: Svc | null): string {
//   if (!s) return '—';
//   const parts: string[] = [];
//   let cur: Svc | null | undefined = s;
//   while (cur) {
//     parts.unshift(cur.name);
//     cur = cur.parent ?? null;
//   }
//   return parts.join(' / ');
// }

// type BookingRow = Prisma.AppointmentGetPayload<{
//   select: {
//     id: true;
//     createdAt: true;
//     customerName: true;
//     phone: true;
//     email: true;
//     notes: true;
//     startAt: true;
//     endAt: true;
//     status: true;
//     master: { select: { id: true; name: true } };
//     service: {
//       select: {
//         name: true;
//         priceCents: true;
//         parent: { select: { name: true; parent: { select: { name: true } } } };
//       };
//     };
//   };
// }>;

// /* ═══════════════════════════════════════════════════════════════════════════
//    MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ */

// export default async function AdminBookingsPage({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }) {
//   const sp = await searchParams;

//   const page = Math.max(1, num(getOne(sp, 'page')));
//   const statusParam = (getOne(sp, 'status') ?? 'all').toLowerCase();
//   const masterParam = getOne(sp, 'master') ?? 'all';

//   const { from, to, period, by } = resolveRange(sp);

//   const baseQS: Record<string, string> = {
//     period,
//     status: statusParam,
//     master: masterParam,
//     by,
//   };

//   const masters = await prisma.master.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: 'asc' },
//   });

//   let where: Prisma.AppointmentWhereInput =
//     by === 'visit'
//       ? { startAt: { gte: from, lt: to } }
//       : { createdAt: { gte: from, lt: to } };

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

//   const rows: BookingRow[] = await prisma.appointment.findMany({
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
//           priceCents: true,
//           parent: { select: { name: true, parent: { select: { name: true } } } },
//         },
//       },
//     },
//   });
//   const hasMore = rows.length === PAGE_SIZE;

//   const csvHref = `/admin/bookings/export${qs(baseQS, {})}`;

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* ═══════════════════════════════════════════════════════════════════
//           HERO ЗАГОЛОВОК С ГРАДИЕНТОМ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="card-glass card-glass-accent card-glow">
//         <div className="gradient-bg-radial" />

//         <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
//           <div className="flex items-center gap-3">
//             <IconGlow tone="fuchsia" className="icon-glow-lg">
//               <Sparkles className="h-6 w-6 text-fuchsia-200" />
//             </IconGlow>
//             <div>
//               <h1 className="text-xl sm:text-2xl font-semibold text-white">
//                 Заявки на запись
//               </h1>
//               <p className="text-sm text-slate-400 mt-0.5">
//                 Управление онлайн-записями клиентов
//               </p>
//             </div>
//           </div>
          
//           <Link
//             href={csvHref}
//             className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
//           >
//             <Download className="h-4 w-4" />
//             <span>Экспорт CSV</span>
//           </Link>
//         </div>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЫСТРЫЕ ПРЕСЕТЫ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-wrap gap-2">
//         <ChipLink
//           active={period === 'today'}
//           href={qs(baseQS, { period: 'today', page: 1 })}
//           label="Сегодня"
//           color="sky"
//         />
//         <ChipLink
//           active={period === '7d'}
//           href={qs(baseQS, { period: '7d', page: 1 })}
//           label="Неделя"
//           color="emerald"
//         />
//         <ChipLink
//           active={period === 'thisMonth'}
//           href={qs(baseQS, { period: 'thisMonth', page: 1 })}
//           label="Месяц"
//           color="violet"
//         />
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ФИЛЬТРЫ С GLASSMORPHISM
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="card-glass card-glow">
//         <div className="p-4 sm:p-6 space-y-4">
//           <div className="flex items-center gap-2 text-sm font-medium">
//             <IconGlow tone="sky" className="icon-glow-sm">
//               <Filter className="h-4 w-4 text-sky-200" />
//             </IconGlow>
//             <span className="text-white">Фильтры</span>
//           </div>

//           <form className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" method="GET">
//             <input type="hidden" name="page" value="1" />

//             <Field label="Период">
//               <select name="period" defaultValue={period} className="input-glass">
//                 <option value="today">Сегодня</option>
//                 <option value="7d">Последние 7 дней</option>
//                 <option value="30d">Последние 30 дней</option>
//                 <option value="thisMonth">Текущий месяц</option>
//                 <option value="thisYear">Текущий год</option>
//               </select>
//             </Field>

//             <Field label="Статус">
//               <select name="status" defaultValue={statusParam} className="input-glass">
//                 <option value="all">Все</option>
//                 <option value="pending">В ожидании</option>
//                 <option value="confirmed">Подтверждённые</option>
//                 <option value="canceled">Отменённые</option>
//                 <option value="done">Выполненные</option>
//               </select>
//             </Field>

//             <Field label="Мастер">
//               <select name="master" defaultValue={masterParam} className="input-glass">
//                 <option value="all">Все мастера</option>
//                 {masters.map((m) => (
//                   <option key={m.id} value={m.id}>
//                     {m.name}
//                   </option>
//                 ))}
//               </select>
//             </Field>

//             <Field label="Считать период по">
//               <select name="by" defaultValue={by} className="input-glass">
//                 <option value="created">Дате создания</option>
//                 <option value="visit">Дате визита</option>
//               </select>
//             </Field>

//             <div className="sm:col-span-2 lg:col-span-4">
//               <button
//                 className="btn-gradient-sky w-full sm:w-auto rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95"
//               >
//                 Применить фильтры
//               </button>
//             </div>
//           </form>
//         </div>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           МОБИЛЬНЫЕ КАРТОЧКИ - ПРЕМИУМ СТИЛЬ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="space-y-3 md:hidden">
//         {rows.map((r) => (
//           <MobileBookingCard key={r.id} booking={r} />
//         ))}

//         {rows.length === 0 && (
//           <div className="card-glass card-glow p-8 text-center">
//             <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent" />
//             <div className="relative">
//               <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//               <p className="text-sm text-slate-400">Записей пока нет</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ТАБЛИЦА DESKTOP - ФИКСИРОВАННЫЕ КНОПКИ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="hidden md:block space-y-3">
//         {rows.map((r) => (
//           <DesktopBookingCard key={r.id} booking={r} />
//         ))}

//         {rows.length === 0 && (
//           <div className="card-glass card-glow p-8 text-center">
//             <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-transparent" />
//             <div className="relative">
//               <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-3" />
//               <p className="text-sm text-slate-400">Записей пока нет</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ПАГИНАЦИЯ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
//         <div className="text-sm text-slate-400">Страница {page}</div>
//         <div className="flex gap-2">
//           {page > 1 && (
//             <Link
//               className="btn-glass text-sm"
//               href={qs(baseQS, { page: page - 1 })}
//             >
//               ← Назад
//             </Link>
//           )}
//           {hasMore && (
//             <Link
//               className="btn-gradient-sky rounded-xl px-4 py-2.5 text-sm"
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

// /* ═══════════════════════════════════════════════════════════════════════════
//    МОБИЛЬНАЯ КАРТОЧКА - ПРЕМИУМ СТИЛЬ
// ═══════════════════════════════════════════════════════════════════════════ */

// function DesktopBookingCard({ booking }: { booking: BookingRow }) {
//   const priceCents = booking.service?.priceCents;
//   const priceValue =
//     priceCents != null ? (
//       <span className="font-semibold text-emerald-400">
//         {moneyFromCents(priceCents)}
//       </span>
//     ) : (
//       '—'
//     );

//   return (
//     <div className="card-glass-hover card-glass-accent card-glow">
//       <div className="p-4 sm:p-5 space-y-4">
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
//               <Calendar className="h-3.5 w-3.5 text-slate-400" />
//               <span>Создано: {formatInOrgTzDateTime(booking.createdAt)}</span>
//             </span>
//           </div>
//           <StatusBadge status={booking.status} />
//         </div>

//         <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
//           <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//             <InfoLine
//               icon={<User2 className="h-4 w-4 text-fuchsia-400" />}
//               label="Клиент"
//               value={booking.customerName}
//               tone="fuchsia"
//             />
//           </div>

//           {booking.phone && (
//             <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//               <InfoLine
//                 icon={<Phone className="h-4 w-4 text-emerald-400" />}
//                 label="Телефон"
//                 value={booking.phone}
//                 tone="emerald"
//               />
//             </div>
//           )}

//           {booking.email && (
//             <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//               <InfoLine
//                 icon={<Mail className="h-4 w-4 text-sky-400" />}
//                 label="Email"
//                 value={booking.email}
//                 tone="sky"
//               />
//             </div>
//           )}

//           <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//             <InfoLine
//               icon={<Scissors className="h-4 w-4 text-amber-400" />}
//               label="Услуга"
//               value={<span className="block line-clamp-2">{servicePath(booking.service)}</span>}
//               tone="amber"
//             />
//           </div>

//           <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//             <InfoLine
//               icon={<Sparkles className="h-4 w-4 text-emerald-300" />}
//               label="Стоимость"
//               value={priceValue}
//               tone="emerald"
//             />
//           </div>

//           <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//             <InfoLine
//               icon={<User2 className="h-4 w-4 text-cyan-400" />}
//               label="Мастер"
//             value={booking.master?.name ?? '—'}
//               tone="cyan"
//             />
//           </div>

//           <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//             <InfoLine
//               icon={<Clock className="h-4 w-4 text-violet-400" />}
//               label="Время визита"
//               value={formatWallRangeWithDate(booking.startAt, booking.endAt)}
//               tone="violet"
//             />
//           </div>
//         </div>

//         {booking.notes && (
//           <div className="rounded-xl border border-white/10 bg-white/5 p-3">
//             <div className="flex items-start gap-2">
//               <span className="shrink-0 mt-0.5">
//                 <IconGlow tone="slate">
//                   <MessageSquareText className="h-4 w-4 text-slate-300" />
//                 </IconGlow>
//               </span>
//               <div>
//                 <div className="text-xs text-slate-400 mb-1">Комментарий</div>
//                 <div
//                   className="text-sm text-slate-300 break-words line-clamp-3"
//                   title={booking.notes}
//                 >
//                   {booking.notes}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-3">
//           <Actions id={booking.id} status={booking.status} />
//         </div>
//       </div>
//     </div>
//   );
// }

// function MobileBookingCard({ booking }: { booking: BookingRow }) {
//   return (
//     <div className="card-glass-hover card-glass-accent card-glow">
//       <div className="p-4 space-y-3">
//         {/* Заголовок */}
//         <div className="flex items-center justify-between gap-3">
//           <div className="text-xs text-slate-400 flex items-center gap-1.5">
//             <Calendar className="h-3.5 w-3.5" />
//             <span className="truncate">{formatInOrgTzDateTime(booking.createdAt)}</span>
//           </div>
//           <StatusBadge status={booking.status} />
//         </div>

//         {/* Основная информация */}
//         <div className="space-y-2 text-sm">
//           <InfoLine
//             icon={<User2 className="h-4 w-4 text-fuchsia-400" />}
//             label="Клиент"
//             value={booking.customerName}
//             tone="fuchsia"
//           />

//           {booking.phone && (
//             <InfoLine
//               icon={<Phone className="h-4 w-4 text-emerald-400" />}
//               label="Телефон"
//               value={booking.phone}
//               tone="emerald"
//             />
//           )}

//           {booking.email && (
//             <InfoLine
//               icon={<Mail className="h-4 w-4 text-sky-400" />}
//               label="Email"
//               value={booking.email}
//               tone="sky"
//             />
//           )}

//           <InfoLine
//             icon={<Scissors className="h-4 w-4 text-amber-400" />}
//             label="Услуга"
//             value={servicePath(booking.service)}
//             tone="amber"
//           />

//           <InfoLine
//             icon={<User2 className="h-4 w-4 text-cyan-400" />}
//             label="Мастер"
//             value={booking.master?.name ?? '—'}
//             tone="cyan"
//           />

//           <InfoLine
//             icon={<Clock className="h-4 w-4 text-violet-400" />}
//             label="Время"
//             value={formatWallRangeWithDate(booking.startAt, booking.endAt)}
//             tone="violet"
//           />

//           {booking.notes && (
//             <div className="rounded-xl bg-white/5 border border-white/10 p-3">
//               <div className="flex items-start gap-2">
//                 <span className="shrink-0 mt-0.5">
//                   <IconGlow tone="slate">
//                     <MessageSquareText className="h-4 w-4 text-slate-300" />
//                   </IconGlow>
//                 </span>
//                 <div>
//                   <div className="text-xs text-slate-400 mb-1">Комментарий:</div>
//                   <div className="text-sm text-slate-300 break-words">{booking.notes}</div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex items-center justify-between pt-2 border-t border-white/10">
//             <span className="text-xs text-slate-400">Стоимость:</span>
//             <span className="text-base font-semibold text-emerald-400">
//               {moneyFromCents(booking.service?.priceCents)}
//             </span>
//           </div>
//         </div>

//         {/* Действия */}
//         <div className="pt-2">
//           <Actions id={booking.id} status={booking.status} />
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════ */

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <label className="text-sm grid gap-2">
//       <span className="text-slate-400 font-medium">{label}</span>
//       {children}
//     </label>
//   );
// }

// function InfoLine({
//   icon,
//   label,
//   value,
//   tone,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
//   tone?: GlowTone;
// }) {
//   return (
//     <div className="flex items-start gap-2.5">
//       <span className="shrink-0 mt-0.5">
//         {tone ? <IconGlow tone={tone}>{icon}</IconGlow> : icon}
//       </span>
//       <div className="min-w-0 flex-1">
//         <div className="text-xs text-slate-500">{label}</div>
//         <div className="text-slate-200 break-words">{value}</div>
//       </div>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: AppointmentStatus }) {
//   const map: Record<
//     AppointmentStatus,
//     { text: string; bg: string; textClass: string; border: string }
//   > = {
//     PENDING: {
//       text: 'Ожидание',
//       bg: 'bg-amber-500/10',
//       textClass: 'text-amber-400',
//       border: 'border-amber-400/30',
//     },
//     CONFIRMED: {
//       text: 'Подтверждено',
//       bg: 'bg-emerald-500/10',
//       textClass: 'text-emerald-400',
//       border: 'border-emerald-400/30',
//     },
//     CANCELED: {
//       text: 'Отменено',
//       bg: 'bg-rose-500/10',
//       textClass: 'text-rose-400',
//       border: 'border-rose-400/30',
//     },
//     DONE: {
//       text: 'Выполнено',
//       bg: 'bg-sky-500/10',
//       textClass: 'text-sky-400',
//       border: 'border-sky-400/30',
//     },
//   };
//   const s = map[status];
//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium 
//                  border ${s.bg} ${s.textClass} ${s.border} whitespace-nowrap`}
//     >
//       {s.text}
//     </span>
//   );
// }

// function Actions({
//   id,
//   status,
//   compact,
// }: {
//   id: string;
//   status: AppointmentStatus;
//   compact?: boolean;
// }) {
//   const baseClasses = compact
//     ? 'text-xs px-2 py-1'
//     : 'text-xs px-3 py-1.5';

//   return (
//     <div className="flex flex-wrap gap-2">
//       {/* Подтвердить */}
//       {status !== AppointmentStatus.CONFIRMED &&
//         status !== AppointmentStatus.DONE && (
//           <form
//             action={async () => {
//               'use server';
//               await setStatus(id, AppointmentStatus.CONFIRMED);
//             }}
//           >
//             <button
//               className={`rounded-full ${baseClasses} bg-emerald-600/90 text-white 
//                        hover:bg-emerald-600 transition-all inline-flex items-center gap-1 
//                        hover:scale-105 active:scale-95 border border-emerald-500/50`}
//             >
//               <Check className="h-3.5 w-3.5" />
//               <span className={compact ? 'hidden xl:inline' : ''}>Подтвердить</span>
//             </button>
//           </form>
//         )}

//       {/* Выполнен */}
//       {status === AppointmentStatus.CONFIRMED && (
//         <form
//           action={async () => {
//             'use server';
//             await setStatus(id, AppointmentStatus.DONE);
//           }}
//         >
//           <button
//             className={`rounded-full ${baseClasses} bg-sky-600/90 text-white 
//                      hover:bg-sky-600 transition-all inline-flex items-center gap-1 
//                      hover:scale-105 active:scale-95 border border-sky-500/50`}
//           >
//             <CheckCircle2 className="h-3.5 w-3.5" />
//             <span className={compact ? 'hidden xl:inline' : ''}>Выполнен</span>
//           </button>
//         </form>
//       )}

//       {/* Отменить */}
//       {status !== AppointmentStatus.CANCELED && (
//         <form
//           action={async () => {
//             'use server';
//             await setStatus(id, AppointmentStatus.CANCELED);
//           }}
//         >
//           <button
//             className={`rounded-full ${baseClasses} bg-amber-600/90 text-white 
//                      hover:bg-amber-600 transition-all inline-flex items-center gap-1 
//                      hover:scale-105 active:scale-95 border border-amber-500/50`}
//           >
//             <X className="h-3.5 w-3.5" />
//             <span className={compact ? 'hidden xl:inline' : ''}>Отменить</span>
//           </button>
//         </form>
//       )}

//       {/* Удалить */}
//       <form
//         action={async () => {
//           'use server';
//           await remove(id);
//         }}
//       >
//         <button
//           className={`rounded-full ${baseClasses} bg-rose-600/90 text-white 
//                    hover:bg-rose-600 transition-all inline-flex items-center gap-1 
//                    hover:scale-105 active:scale-95 border border-rose-500/50`}
//         >
//           <Trash2 className="h-3.5 w-3.5" />
//           <span className={compact ? 'hidden xl:inline' : ''}>Удалить</span>
//         </button>
//       </form>
//     </div>
//   );
// }

// function ChipLink({
//   href,
//   label,
//   active,
//   color,
// }: {
//   href: string;
//   label: string;
//   active?: boolean;
//   color: 'sky' | 'emerald' | 'violet';
// }) {
//   const pal = {
//     sky: { bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/50' },
//     emerald: {
//       bg: 'bg-emerald-500/15',
//       text: 'text-emerald-300',
//       border: 'border-emerald-500/50',
//     },
//     violet: {
//       bg: 'bg-violet-500/15',
//       text: 'text-violet-300',
//       border: 'border-violet-500/50',
//     },
//   }[color];

//   return (
//     <Link
//       href={href}
//       className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
//                  border transition-all hover:scale-105 active:scale-95 ${
//                    active
//                      ? `${pal.bg} ${pal.text} ${pal.border}`
//                      : 'border-white/10 text-slate-400 hover:bg-white/5'
//                  }`}
//     >
//       {label}
//     </Link>
//   );
// }





// // src/app/admin/bookings/page.tsx
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus, remove } from './actions';
// import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
// import {
//   Calendar,
//   Clock,
//   Mail,
//   Phone,
//   Scissors,
//   User2,
//   Check,
//   X,
//   Trash2,
//   Filter,
//   MessageSquareText,
//   CheckCircle2,
//   Download,
// } from 'lucide-react';
// import {
//   formatInOrgTzDateTime,
//   formatWallRangeWithDate,
// } from '@/lib/orgTime';

// export const dynamic = 'force-dynamic';

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// const PAGE_SIZE = 10;

// /* ═══════════════════════════════════════════════════════════════════════════
//    HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════ */

// function getOne(
//   sp: Record<string, string | string[] | undefined>,
//   key: string
// ): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }

// function num(v: string | undefined, d = 1): number {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.trunc(n) : d;
// }

// function qs(
//   base: Record<string, string>,
//   patch: Record<string, string | number | undefined>
// ) {
//   const p = new URLSearchParams(base);
//   Object.entries(patch).forEach(([k, v]) => {
//     if (v !== undefined) p.set(k, String(v));
//   });
//   return `?${p.toString()}`;
// }

// const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
// function moneyFromCents(cents?: number | null) {
//   const value = (cents ?? 0) / 100;
//   return new Intl.NumberFormat('ru-RU', {
//     style: 'currency',
//     currency: CURRENCY,
//   }).format(value);
// }

// function resolveRange(sp: Record<string, string | string[] | undefined>) {
//   const period = getOne(sp, 'period') ?? '7d';
//   const by = getOne(sp, 'by') === 'visit' ? 'visit' : 'created';
//   const todayStart = startOfDay(new Date());

//   let from = todayStart;
//   let to = addDays(todayStart, 1);

//   switch (period) {
//     case 'today':
//       from = todayStart;
//       to = addDays(todayStart, 1);
//       break;
//     case '7d':
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//       break;
//     case '30d':
//       from = addDays(todayStart, -29);
//       to = addDays(todayStart, 1);
//       break;
//     case 'thisMonth':
//       from = startOfMonth(new Date());
//       to = startOfMonth(addDays(new Date(), 32));
//       break;
//     case 'thisYear':
//       from = startOfYear(new Date());
//       to = startOfYear(addDays(new Date(), 370));
//       break;
//     default:
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//   }
//   return { from, to, period, by };
// }

// /** Полный путь услуги: Категория / … / Услуга */
// type Svc = { name: string; parent?: Svc | null; priceCents?: number | null };
// function servicePath(s?: Svc | null): string {
//   if (!s) return '—';
//   const parts: string[] = [];
//   let cur: Svc | null | undefined = s;
//   while (cur) {
//     parts.unshift(cur.name);
//     cur = cur.parent ?? null;
//   }
//   return parts.join(' / ');
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════ */

// export default async function AdminBookingsPage({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }) {
//   const sp = await searchParams;

//   const page = Math.max(1, num(getOne(sp, 'page')));
//   const statusParam = (getOne(sp, 'status') ?? 'all').toLowerCase();
//   const masterParam = getOne(sp, 'master') ?? 'all';

//   const { from, to, period, by } = resolveRange(sp);

//   const baseQS: Record<string, string> = {
//     period,
//     status: statusParam,
//     master: masterParam,
//     by,
//   };

//   const masters = await prisma.master.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: 'asc' },
//   });

//   // Типобезопасный where
//   let where: Prisma.AppointmentWhereInput =
//     by === 'visit'
//       ? { startAt: { gte: from, lt: to } }
//       : { createdAt: { gte: from, lt: to } };

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
//           priceCents: true,
//           parent: { select: { name: true, parent: { select: { name: true } } } },
//         },
//       },
//     },
//   });
//   const hasMore = rows.length === PAGE_SIZE;

//   const csvHref = `/admin/bookings/export${qs(baseQS, {})}`;

//   return (
//     <div className="space-y-4 sm:space-y-6">
//       {/* ═══════════════════════════════════════════════════════════════════
//           ЗАГОЛОВОК
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex items-center justify-between gap-3">
//         <h1 className="text-xl sm:text-2xl font-semibold truncate">
//           Заявки (онлайн-запись)
//         </h1>
//         <Link
//           href={csvHref}
//           className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 
//                    hover:bg-white/5 transition text-sm shrink-0"
//         >
//           <Download className="h-4 w-4" />
//           <span className="hidden sm:inline">CSV</span>
//         </Link>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           БЫСТРЫЕ ПРЕСЕТЫ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-wrap gap-2">
//         <ChipLink
//           active={period === 'today'}
//           href={qs(baseQS, { period: 'today', page: 1 })}
//           label="Сегодня"
//           color="sky"
//         />
//         <ChipLink
//           active={period === '7d'}
//           href={qs(baseQS, { period: '7d', page: 1 })}
//           label="Неделя"
//           color="emerald"
//         />
//         <ChipLink
//           active={period === 'thisMonth'}
//           href={qs(baseQS, { period: 'thisMonth', page: 1 })}
//           label="Месяц"
//           color="violet"
//         />
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ФИЛЬТРЫ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <section className="rounded-2xl border border-white/5 p-4 space-y-4">
//         <div className="flex items-center gap-2 text-sm font-medium">
//           <Filter className="h-4 w-4 opacity-70" /> Фильтры
//         </div>

//         <form className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" method="GET">
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
//                 <option key={m.id} value={m.id}>
//                   {m.name}
//                 </option>
//               ))}
//             </select>
//           </Field>

//           <Field label="Считать период по">
//             <select name="by" defaultValue={by} className="input w-full">
//               <option value="created">Дате создания</option>
//               <option value="visit">Дате визита</option>
//             </select>
//           </Field>

//           <div className="sm:col-span-2 lg:col-span-4">
//             <button
//               className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium bg-sky-600 
//                        text-white hover:bg-sky-500 transition-all hover:scale-105 active:scale-95"
//             >
//               Применить
//             </button>
//           </div>
//         </form>
//       </section>

//       {/* ═══════════════════════════════════════════════════════════════════
//           МОБИЛЬНЫЕ КАРТОЧКИ (< md)
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="space-y-3 md:hidden">
//         {rows.map((r) => (
//           <div
//             key={r.id}
//             className="rounded-2xl border border-white/5 p-4 space-y-3 
//                      hover:border-white/10 transition-colors"
//           >
//             {/* Заголовок карточки */}
//             <div className="flex items-center justify-between gap-3">
//               <div className="text-xs opacity-70 flex items-center gap-1 min-w-0">
//                 <Calendar className="h-4 w-4 shrink-0" />
//                 <span className="truncate">{formatInOrgTzDateTime(r.createdAt)}</span>
//               </div>
//               <StatusBadge status={r.status} />
//             </div>

//             {/* Основная информация */}
//             <div className="grid gap-2 text-sm">
//               <div className="flex items-center gap-2">
//                 <User2 className="h-4 w-4 opacity-70 shrink-0" />
//                 <div className="font-medium truncate">{r.customerName}</div>
//               </div>

//               {r.phone && (
//                 <Line icon={<Phone className="h-4 w-4" />} text={r.phone} />
//               )}

//               {r.email && (
//                 <Line icon={<Mail className="h-4 w-4" />} text={r.email} />
//               )}

//               <Line
//                 icon={<Scissors className="h-4 w-4" />}
//                 text={servicePath(r.service)}
//               />

//               <Line
//                 icon={<User2 className="h-4 w-4" />}
//                 text={r.master?.name ?? '—'}
//               />

//               <Line
//                 icon={<Clock className="h-4 w-4" />}
//                 text={formatWallRangeWithDate(r.startAt, r.endAt)}
//               />

//               {r.notes && (
//                 <Line
//                   icon={<MessageSquareText className="h-4 w-4" />}
//                   text={r.notes}
//                 />
//               )}

//               <div className="flex items-center gap-2 opacity-90">
//                 <span className="text-xs opacity-70">Стоимость:</span>
//                 <span className="font-medium">
//                   {moneyFromCents(r.service?.priceCents)}
//                 </span>
//               </div>
//             </div>

//             {/* Действия */}
//             <Actions id={r.id} status={r.status} />
//           </div>
//         ))}

//         {rows.length === 0 && (
//           <div className="rounded-2xl border border-white/5 p-6 text-center text-sm opacity-70">
//             Записей пока нет
//           </div>
//         )}
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ТАБЛИЦА (md+)
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="hidden md:block rounded-2xl border border-white/5 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-[1200px] w-full text-sm">
//             <thead className="bg-white/[0.02] text-left">
//               <tr>
//                 <th className="p-3 font-medium opacity-70 whitespace-nowrap">
//                   Когда создано
//                 </th>
//                 <th className="p-3 font-medium opacity-70">Клиент</th>
//                 <th className="p-3 font-medium opacity-70">Услуга</th>
//                 <th className="p-3 font-medium opacity-70 whitespace-nowrap">
//                   Стоимость
//                 </th>
//                 <th className="p-3 font-medium opacity-70">Мастер</th>
//                 <th className="p-3 font-medium opacity-70 whitespace-nowrap">
//                   Время визита
//                 </th>
//                 <th className="p-3 font-medium opacity-70">Комментарий</th>
//                 <th className="p-3 font-medium opacity-70">Статус</th>
//                 <th className="p-3 font-medium opacity-70">Действия</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5">
//               {rows.map((r) => (
//                 <tr
//                   key={r.id}
//                   className="hover:bg-white/[0.02] transition-colors"
//                 >
//                   <td className="p-3 whitespace-nowrap text-xs opacity-80">
//                     {formatInOrgTzDateTime(r.createdAt)}
//                   </td>
//                   <td className="p-3">
//                     <div className="font-medium">{r.customerName}</div>
//                     <div className="text-xs opacity-70 flex flex-wrap gap-2 mt-1">
//                       {r.phone && (
//                         <span className="inline-flex items-center gap-1">
//                           <Phone className="h-3 w-3" />
//                           {r.phone}
//                         </span>
//                       )}
//                       {r.email && (
//                         <span className="inline-flex items-center gap-1">
//                           <Mail className="h-3 w-3" />
//                           {r.email}
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                   <td className="p-3 max-w-[200px]">
//                     <div className="line-clamp-2">{servicePath(r.service)}</div>
//                   </td>
//                   <td className="p-3 whitespace-nowrap font-medium">
//                     {moneyFromCents(r.service?.priceCents)}
//                   </td>
//                   <td className="p-3">{r.master?.name ?? '—'}</td>
//                   <td className="p-3 whitespace-nowrap text-xs">
//                     {formatWallRangeWithDate(r.startAt, r.endAt)}
//                   </td>
//                   <td className="p-3 max-w-[250px]">
//                     {r.notes ? (
//                       <span className="line-clamp-2 text-xs">{r.notes}</span>
//                     ) : (
//                       <span className="opacity-60">—</span>
//                     )}
//                   </td>
//                   <td className="p-3">
//                     <StatusBadge status={r.status} />
//                   </td>
//                   <td className="p-3">
//                     <Actions id={r.id} status={r.status} compact />
//                   </td>
//                 </tr>
//               ))}
//               {rows.length === 0 && (
//                 <tr>
//                   <td className="p-6 text-center opacity-70" colSpan={9}>
//                     Записей пока нет
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ═══════════════════════════════════════════════════════════════════
//           ПАГИНАЦИЯ
//       ═══════════════════════════════════════════════════════════════════ */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
//         <div className="text-sm opacity-70">Страница {page}</div>
//         <div className="flex gap-2">
//           {page > 1 && (
//             <Link
//               className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 
//                        transition text-sm"
//               href={qs(baseQS, { page: page - 1 })}
//             >
//               ← Назад
//             </Link>
//           )}
//           {hasMore && (
//             <Link
//               className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white 
//                        hover:bg-sky-500 transition text-sm"
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

// /* ═══════════════════════════════════════════════════════════════════════════
//    UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════ */

// function Field({ label, children }: { label: string; children: React.ReactNode }) {
//   return (
//     <label className="text-sm grid gap-1.5">
//       <span className="opacity-70 font-medium">{label}</span>
//       {children}
//     </label>
//   );
// }

// function Line({ icon, text }: { icon: React.ReactNode; text: string }) {
//   return (
//     <div className="flex items-center gap-2 opacity-90">
//       <span className="shrink-0">{icon}</span>
//       <span className="truncate">{text}</span>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: AppointmentStatus }) {
//   const map: Record<AppointmentStatus, { text: string; cls: string }> = {
//     PENDING: { text: 'Ожидание', cls: 'bg-amber-500/15 text-amber-400' },
//     CONFIRMED: { text: 'Подтверждено', cls: 'bg-emerald-500/15 text-emerald-400' },
//     CANCELED: { text: 'Отменено', cls: 'bg-rose-500/15 text-rose-400' },
//     DONE: { text: 'Выполнено', cls: 'bg-sky-500/15 text-sky-400' },
//   };
//   const s = map[status];
//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${s.cls}`}
//     >
//       {s.text}
//     </span>
//   );
// }

// function Actions({
//   id,
//   status,
//   compact,
// }: {
//   id: string;
//   status: AppointmentStatus;
//   compact?: boolean;
// }) {
//   const size = compact ? 'text-xs px-2 py-1' : 'text-xs px-3 py-1.5';

//   return (
//     <div className="flex flex-wrap gap-2">
//       {/* Подтвердить - показываем если не CONFIRMED и не DONE */}
//       {status !== AppointmentStatus.CONFIRMED &&
//         status !== AppointmentStatus.DONE && (
//           <form
//             action={async () => {
//               'use server';
//               await setStatus(id, AppointmentStatus.CONFIRMED);
//             }}
//           >
//             <button
//               className={`rounded-full ${size} bg-emerald-600 text-white hover:bg-emerald-500 
//                        transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95`}
//             >
//               <Check className="h-3.5 w-3.5" />
//               <span className={compact ? 'hidden xl:inline' : ''}>Подтвердить</span>
//             </button>
//           </form>
//         )}

//       {/* Выполнен - показываем если CONFIRMED */}
//       {status === AppointmentStatus.CONFIRMED && (
//         <form
//           action={async () => {
//             'use server';
//             await setStatus(id, AppointmentStatus.DONE);
//           }}
//         >
//           <button
//             className={`rounded-full ${size} bg-sky-600 text-white hover:bg-sky-500 
//                      transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95`}
//           >
//             <CheckCircle2 className="h-3.5 w-3.5" />
//             <span className={compact ? 'hidden xl:inline' : ''}>Выполнен</span>
//           </button>
//         </form>
//       )}

//       {/* Отменить - показываем если не CANCELED */}
//       {status !== AppointmentStatus.CANCELED && (
//         <form
//           action={async () => {
//             'use server';
//             await setStatus(id, AppointmentStatus.CANCELED);
//           }}
//         >
//           <button
//             className={`rounded-full ${size} bg-amber-600 text-white hover:bg-amber-500 
//                      transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95`}
//           >
//             <X className="h-3.5 w-3.5" />
//             <span className={compact ? 'hidden xl:inline' : ''}>Отменить</span>
//           </button>
//         </form>
//       )}

//       {/* Удалить */}
//       <form
//         action={async () => {
//           'use server';
//           await remove(id);
//         }}
//       >
//         <button
//           className={`rounded-full ${size} bg-rose-600 text-white hover:bg-rose-500 
//                    transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95`}
//         >
//           <Trash2 className="h-3.5 w-3.5" />
//           <span className={compact ? 'hidden xl:inline' : ''}>Удалить</span>
//         </button>
//       </form>
//     </div>
//   );
// }

// function ChipLink({
//   href,
//   label,
//   active,
//   color,
// }: {
//   href: string;
//   label: string;
//   active?: boolean;
//   color: 'sky' | 'emerald' | 'violet';
// }) {
//   const pal = {
//     sky: { bg: 'bg-sky-500/10', br: 'border-sky-600/40', tx: 'text-sky-300' },
//     emerald: {
//       bg: 'bg-emerald-500/10',
//       br: 'border-emerald-600/40',
//       tx: 'text-emerald-300',
//     },
//     violet: {
//       bg: 'bg-violet-500/10',
//       br: 'border-violet-600/40',
//       tx: 'text-violet-300',
//     },
//   }[color];
//   const activeCls = `${pal.bg} ${pal.tx} border ${pal.br}`;
//   const idle = 'border border-white/10 hover:bg-white/5';
//   return (
//     <Link
//       href={href}
//       className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm 
//                  transition-all hover:scale-105 active:scale-95 ${
//                    active ? activeCls : idle
//                  }`}
//     >
//       {label}
//     </Link>
//   );
// }




//--------работал до 05.01.26 сделал адаптацию и добавил кнопку выполнен-----
// // src/app/admin/bookings/page.tsx
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus, remove } from './actions';
// import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
// import {
//   Calendar, Clock, Mail, Phone, Scissors, User2,
//   Check, X, Trash2, Filter, MessageSquareText,
// } from 'lucide-react';
// import {
//   formatInOrgTzDateTime,
//   formatWallRangeLabel,
//   formatWallRangeWithDate,
// } from '@/lib/orgTime';

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
// function qs(base: Record<string, string>, patch: Record<string, string | number | undefined>) {
//   const p = new URLSearchParams(base);
//   Object.entries(patch).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
//   return `?${p.toString()}`;
// }

// const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
// function moneyFromCents(cents?: number | null) {
//   const value = (cents ?? 0) / 100;
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: CURRENCY }).format(value);
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

// /** Полный путь услуги: Категория / … / Услуга */
// type Svc = { name: string; parent?: Svc | null; priceCents?: number | null };
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
//       master: { select: { id: true, name: true} },
//       service: {
//         select: {
//           name: true,
//           priceCents: true,
//           parent: { select: { name: true, parent: { select: { name: true } } } },
//         },
//       },
//     },
//   });
//   const hasMore = rows.length === PAGE_SIZE;

//   const csvHref = `/admin/bookings/export${qs(baseQS, {})}`;

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
//                 <Calendar className="h-4 w-4" /> {formatInOrgTzDateTime(r.createdAt)}
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
//               {/* время визита в таймзоне салона */}
//               <Line
//                 icon={<Clock className="h-4 w-4" />}
//                 text={formatWallRangeWithDate(r.startAt, r.endAt)}
//               />
//               {/* комментарий, если есть */}
//               {r.notes && <Line icon={<MessageSquareText className="h-4 w-4" />} text={r.notes} />}
//               {/* цена */}
//               <div className="flex items-center gap-2 opacity-90">
//                 <span className="text-xs opacity-70">Стоимость:</span>
//                 <span className="font-medium">{moneyFromCents(r.service?.priceCents)}</span>
//               </div>
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
//         <table className="min-w-[1180px] w-full text-sm">
//           <thead className="bg-muted/40 text-left">
//             <tr>
//               <th className="p-3">Когда создано</th>
//               <th className="p-3">Клиент</th>
//               <th className="p-3">Услуга</th>
//               <th className="p-3">Стоимость</th>
//               <th className="p-3">Мастер</th>
//               <th className="p-3">Время</th>
//               <th className="p-3">Комментарий</th>
//               <th className="p-3">Статус</th>
//               <th className="p-3"></th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {rows.map((r) => (
//               <tr key={r.id}>
//                 <td className="p-3 whitespace-nowrap">{formatInOrgTzDateTime(r.createdAt)}</td>
//                 <td className="p-3">
//                   <div className="font-medium">{r.customerName}</div>
//                   <div className="text-xs opacity-70 flex gap-3">
//                     {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
//                     {r.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
//                   </div>
//                 </td>
//                 <td className="p-3">{servicePath(r.service)}</td>
//                 <td className="p-3 whitespace-nowrap">{moneyFromCents(r.service?.priceCents)}</td>
//                 <td className="p-3">{r.master?.name ?? '—'}</td>
//                 {/* время визита в таймзоне салона */}
//                 <td className="p-3 whitespace-nowrap">
//                   {formatWallRangeWithDate(r.startAt, r.endAt)}
//                 </td>
//                 <td className="p-3 max-w-[360px]">
//                   {r.notes ? <span className="line-clamp-2">{r.notes}</span> : <span className="opacity-60">—</span>}
//                 </td>
//                 <td className="p-3"><StatusBadge status={r.status} /></td>
//                 <td className="p-3"><Actions id={r.id} compact /></td>
//               </tr>
//             ))}
//             {rows.length === 0 && (
//               <tr><td className="p-4 opacity-70" colSpan={9}>Записей пока нет</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Пагинация + экспорт */}
//       <div className="flex items-center justify-between pt-2">
//         <div className="text-sm opacity-70">Страница {page}</div>
//         <div className="flex gap-2">
//           <Link className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition" href={csvHref}>
//             Экспорт CSV
//           </Link>
//           {page > 1 && (
//             <Link className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition" href={qs(baseQS, { page: page - 1 })}>
//               ← Назад
//             </Link>
//           )}
//           {hasMore && (
//             <Link className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-500 transition" href={qs(baseQS, { page: page + 1 })}>
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






//--------работал -4 часа--------
// // src/app/admin/bookings/page.tsx
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus, remove } from './actions';
// import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
// import {
//   Calendar, Clock, Mail, Phone, Scissors, User2,
//   Check, X, Trash2, Filter, MessageSquareText,
// } from 'lucide-react';
// import { fmtDT, fmtVisitDate, fmtVisitTime } from '@/lib/time';

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
// function qs(base: Record<string, string>, patch: Record<string, string | number | undefined>) {
//   const p = new URLSearchParams(base);
//   Object.entries(patch).forEach(([k, v]) => { if (v !== undefined) p.set(k, String(v)); });
//   return `?${p.toString()}`;
// }

// const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
// function moneyFromCents(cents?: number | null) {
//   const value = (cents ?? 0) / 100;
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: CURRENCY }).format(value);
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

// /** Полный путь услуги: Категория / … / Услуга */
// type Svc = { name: string; parent?: Svc | null; priceCents?: number | null };
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
//       master: { select: { id: true, name: true} },
//       service: {
//         select: {
//           name: true,
//           priceCents: true,
//           parent: { select: { name: true, parent: { select: { name: true } } } },
//         },
//       },
//     },
//   });
//   const hasMore = rows.length === PAGE_SIZE;

//   const csvHref = `/admin/bookings/export${qs(baseQS, {})}`;

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
//               {/* время визита в таймзоне салона */}
//               <Line icon={<Clock className="h-4 w-4" />} text={`${fmtVisitDate(r.startAt)} • ${fmtVisitTime(r.startAt)} — ${fmtVisitTime(r.endAt)}`} />
//               {/* комментарий, если есть */}
//               {r.notes && <Line icon={<MessageSquareText className="h-4 w-4" />} text={r.notes} />}
//               {/* цена */}
//               <div className="flex items-center gap-2 opacity-90">
//                 <span className="text-xs opacity-70">Стоимость:</span>
//                 <span className="font-medium">{moneyFromCents(r.service?.priceCents)}</span>
//               </div>
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
//         <table className="min-w-[1180px] w-full text-sm">
//           <thead className="bg-muted/40 text-left">
//             <tr>
//               <th className="p-3">Когда создано</th>
//               <th className="p-3">Клиент</th>
//               <th className="p-3">Услуга</th>
//               <th className="p-3">Стоимость</th>
//               <th className="p-3">Мастер</th>
//               <th className="p-3">Время</th>
//               <th className="p-3">Комментарий</th>
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
//                 <td className="p-3 whitespace-nowrap">{moneyFromCents(r.service?.priceCents)}</td>
//                 <td className="p-3">{r.master?.name ?? '—'}</td>
//                 {/* время визита в таймзоне салона */}
//                 <td className="p-3 whitespace-nowrap">
//                   {fmtVisitDate(r.startAt)} {fmtVisitTime(r.startAt)} — {fmtVisitTime(r.endAt)}
//                 </td>
//                 <td className="p-3 max-w-[360px]">
//                   {r.notes ? <span className="line-clamp-2">{r.notes}</span> : <span className="opacity-60">—</span>}
//                 </td>
//                 <td className="p-3"><StatusBadge status={r.status} /></td>
//                 <td className="p-3"><Actions id={r.id} compact /></td>
//               </tr>
//             ))}
//             {rows.length === 0 && (
//               <tr><td className="p-4 opacity-70" colSpan={9}>Записей пока нет</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Пагинация + экспорт */}
//       <div className="flex items-center justify-between pt-2">
//         <div className="text-sm opacity-70">Страница {page}</div>
//         <div className="flex gap-2">
//           <Link className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition" href={csvHref}>
//             Экспорт CSV
//           </Link>
//           {page > 1 && (
//             <Link className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition" href={qs(baseQS, { page: page - 1 })}>
//               ← Назад
//             </Link>
//           )}
//           {hasMore && (
//             <Link className="px-4 py-2 rounded-xl font-medium bg-sky-600 text-white hover:bg-sky-500 transition" href={qs(baseQS, { page: page + 1 })}>
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










//------------------рабочий черновик----------------------------

// // src/app/admin/bookings/page.tsx
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus, remove } from './actions';
// import { addDays, startOfDay, startOfMonth, startOfYear } from 'date-fns';
// import {
//   Calendar, Clock, Mail, Phone, Scissors, User2,
//   Check, X, Trash2, Filter, MessageSquareText,
// } from 'lucide-react';

// export const dynamic = 'force-dynamic';

// /* ───────── TZ setup ───────── */
// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// /* ───────── helpers ───────── */
// type SearchParams = Promise<Record<string, string | string[] | undefined>>;
// const PAGE_SIZE = 10;

// function getOne(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }
// function num(v: string | undefined, d = 1): number {
//   const n = Number(v);
//   return Number.isFinite(n) && n > 0 ? Math.trunc(n) : d;
// }

// /** Когда создано — Берлин */
// function fmtDT(d: Date): string {
//   return new Intl.DateTimeFormat('ru-RU', {
//     dateStyle: 'short',
//     timeStyle: 'short',
//     timeZone: ORG_TZ,
//   }).format(d);
// }
// /** Дата визита — Берлин */
// function fmtDate(d: Date): string {
//   return new Intl.DateTimeFormat('ru-RU', {
//     dateStyle: 'short',
//     timeZone: ORG_TZ,
//   }).format(d);
// }
// /** Время визита — показываем «как ввели»: форматируем UTC без смещения */
// function fmtTime(d: Date): string {
//   return new Intl.DateTimeFormat('ru-RU', {
//     hour: '2-digit',
//     minute: '2-digit',
//     timeZone: 'UTC',
//   }).format(d);
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
//     case 'today':      from = todayStart;               to = addDays(todayStart, 1); break;
//     case '7d':         from = addDays(todayStart, -6);  to = addDays(todayStart, 1); break;
//     case '30d':        from = addDays(todayStart, -29); to = addDays(todayStart, 1); break;
//     case 'thisMonth':  from = startOfMonth(new Date()); to = startOfMonth(addDays(new Date(), 32)); break;
//     case 'thisYear':   from = startOfYear(new Date());  to = startOfYear(addDays(new Date(), 370)); break;
//     default:           from = addDays(todayStart, -6);  to = addDays(todayStart, 1);
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
//         <ChipLink active={period === 'today'}     href={qs(baseQS, { period: 'today', page: 1 })}     label="Сегодня"  color="sky" />
//         <ChipLink active={period === '7d'}        href={qs(baseQS, { period: '7d', page: 1 })}        label="Неделя"   color="emerald" />
//         <ChipLink active={period === 'thisMonth'} href={qs(baseQS, { period: 'thisMonth', page: 1 })} label="Месяц"    color="violet" />
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
//               {r.notes && r.notes.trim().length > 0 && (
//                 <Line icon={<MessageSquareText className="h-4 w-4" />} text={r.notes.trim()} />
//               )}
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
//         <table className="min-w-[1100px] w-full text-sm">
//           <thead className="bg-muted/40 text-left">
//             <tr>
//               {[
//                 <th key="h1" className="p-3">Когда создано</th>,
//                 <th key="h2" className="p-3">Клиент</th>,
//                 <th key="h3" className="p-3">Услуга</th>,
//                 <th key="h4" className="p-3">Мастер</th>,
//                 <th key="h5" className="p-3">Время</th>,
//                 <th key="h6" className="p-3">Комментарий</th>,
//                 <th key="h7" className="p-3">Статус</th>,
//                 <th key="h8" className="p-3"></th>,
//               ]}
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {rows.map((r) => (
//               <tr key={r.id}>
//                 {[
//                   <td key="c1" className="p-3 whitespace-nowrap">{fmtDT(r.createdAt)}</td>,
//                   <td key="c2" className="p-3">
//                     <div className="font-medium">{r.customerName}</div>
//                     <div className="text-xs opacity-70 flex gap-3">
//                       {r.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</span>}
//                       {r.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</span>}
//                     </div>
//                   </td>,
//                   <td key="c3" className="p-3">{servicePath(r.service)}</td>,
//                   <td key="c4" className="p-3">{r.master?.name ?? '—'}</td>,
//                   <td key="c5" className="p-3 whitespace-nowrap">
//                     {fmtDate(r.startAt)} {fmtTime(r.startAt)} — {fmtTime(r.endAt)}
//                   </td>,
//                   <td key="c6" className="p-3">{r.notes && r.notes.trim().length > 0 ? r.notes.trim() : '—'}</td>,
//                   <td key="c7" className="p-3"><StatusBadge status={r.status} /></td>,
//                   <td key="c8" className="p-3"><Actions id={r.id} compact /></td>,
//                 ]}
//               </tr>
//             ))}
//             {rows.length === 0 && (
//               <tr>
//                 <td className="p-4 opacity-70" colSpan={8}>Записей пока нет</td>
//               </tr>
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
