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
  Archive,
  ExternalLink,
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
    clientId: true;
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

  // ✅ Базовый фильтр: ТОЛЬКО активные заявки + период
  let where: Prisma.AppointmentWhereInput = {
    deletedAt: null,  // ← ВАЖНО! Только активные заявки
    ...(by === 'visit'
      ? { startAt: { gte: from, lt: to } }
      : { createdAt: { gte: from, lt: to } })
  };

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
      clientId: true, // ← ДОБАВЛЕНО для ссылки на клиента
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
          
          {/* ✅ КНОПКИ С АРХИВОМ */}
          <div className="flex gap-2">
            <Link
              href="/admin/bookings/archived"
              className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              <Archive className="h-4 w-4" />
              <span>Архив</span>
            </Link>

            <Link
              href={csvHref}
              className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Экспорт CSV</span>
            </Link>
          </div>
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
          {/* ✅ КЛИКАБЕЛЬНАЯ КАРТОЧКА КЛИЕНТА */}
          <Link
            href={booking.clientId ? `/admin/clients/${booking.clientId}` : '#'}
            className="group rounded-xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 p-3
                       hover:border-fuchsia-400/40 hover:from-fuchsia-500/15 hover:to-purple-500/15 
                       transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                       hover:shadow-lg hover:shadow-fuchsia-500/20"
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">
                <IconGlow tone="fuchsia">
                  <User2 className="h-4 w-4 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors" />
                </IconGlow>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-fuchsia-400/70 font-medium">Клиент</div>
                  <ExternalLink className="h-3 w-3 text-fuchsia-400/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-white font-medium group-hover:text-fuchsia-100 transition-colors break-words">
                  {booking.customerName}
                </div>
                <div className="text-[10px] text-fuchsia-400/50 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Открыть профиль →
                </div>
              </div>
            </div>
          </Link>

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
          {/* ✅ КЛИКАБЕЛЬНАЯ КАРТОЧКА КЛИЕНТА - МОБИЛЬНАЯ */}
          <Link
            href={booking.clientId ? `/admin/clients/${booking.clientId}` : '#'}
            className="group block rounded-xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 p-3
                       hover:border-fuchsia-400/40 hover:from-fuchsia-500/15 hover:to-purple-500/15 
                       transition-all duration-200 active:scale-[0.98]
                       hover:shadow-lg hover:shadow-fuchsia-500/20"
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">
                <IconGlow tone="fuchsia">
                  <User2 className="h-4 w-4 text-fuchsia-400" />
                </IconGlow>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-fuchsia-400/70">Клиент</div>
                  <ExternalLink className="h-3 w-3 text-fuchsia-400/50" />
                </div>
                <div className="text-white font-medium break-words">{booking.customerName}</div>
              </div>
            </div>
          </Link>

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




//--------работало до 11.01.26 добавил корзину после удаления и кликабельный клиент с переходом в карточку профиля-------
// // src/app/admin/bookings/page.tsx - PREMIUM VERSION 💎
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus, Prisma } from '@prisma/client';
// import Link from 'next/link';
// import { setStatus } from './actions';
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
//   Filter,
//   MessageSquareText,
//   CheckCircle2,
//   Download,
//   Sparkles,
// } from 'lucide-react';
// import {
//   formatInOrgTzDateTime,
//   formatWallRangeWithDate,
// } from '@/lib/orgTime';
// import { IconGlow, type GlowTone } from '@/components/admin/IconGlow';
// import { DeleteConfirmDialog } from './_components/DeleteConfirmDialog';
// import { StatusHistory } from './_components/StatusHistory';

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

//   // ✅ Базовый фильтр: ТОЛЬКО активные заявки + период
//   let where: Prisma.AppointmentWhereInput = {
//     deletedAt: null,  // ← ВАЖНО! Только активные заявки
//     ...(by === 'visit'
//       ? { startAt: { gte: from, lt: to } }
//       : { createdAt: { gte: from, lt: to } })
//   };

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
//    DESKTOP КАРТОЧКА
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
//               value={booking.master?.name ?? '—'}
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

//         <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
//           <StatusHistory appointmentId={booking.id} />
          
//           <div className="flex flex-wrap items-center gap-2">
//             <Actions 
//               id={booking.id} 
//               customerName={booking.customerName}
//               status={booking.status} 
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════════════════
//    МОБИЛЬНАЯ КАРТОЧКА
// ═══════════════════════════════════════════════════════════════════════════ */

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
//           <Actions 
//             id={booking.id} 
//             customerName={booking.customerName}
//             status={booking.status} 
//           />
//         </div>

//         {/* История изменений */}
//         <StatusHistory appointmentId={booking.id} />
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
//   customerName,
//   status,
//   compact,
// }: {
//   id: string;
//   customerName: string;
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

//       {/* Удалить с подтверждением */}
//       <DeleteConfirmDialog
//         appointmentId={id}
//         customerName={customerName}
//       />
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





