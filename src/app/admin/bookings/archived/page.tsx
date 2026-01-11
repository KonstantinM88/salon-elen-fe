// src/app/admin/bookings/archived/page.tsx
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, Prisma } from '@prisma/client';
import Link from 'next/link';
import { Archive, Calendar, Clock, Mail, Phone, Scissors, User2, MessageSquareText, Sparkles } from 'lucide-react';
import { formatInOrgTzDateTime, formatWallRangeWithDate } from '@/lib/orgTime';
import { IconGlow, type GlowTone } from '@/components/admin/IconGlow';
import RestoreAppointmentButton from './RestoreAppointmentButton';
import PermanentDeleteButton from './PermanentDeleteButton';

export const dynamic = 'force-dynamic';

const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';

function moneyFromCents(cents?: number | null) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
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

type ArchivedAppointment = Prisma.AppointmentGetPayload<{
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
    deletedAt: true;
    deletedBy: true;
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

export default async function ArchivedAppointmentsPage() {
  // Загружаем только удалённые заявки
  const archivedAppointments: ArchivedAppointment[] = await prisma.appointment.findMany({
    where: {
      deletedAt: { not: null }, // Только удалённые
    },
    orderBy: { deletedAt: 'desc' },
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
      deletedAt: true,
      deletedBy: true,
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO ЗАГОЛОВОК
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="card-glass card-glass-accent card-glow">
        <div className="gradient-bg-radial" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <IconGlow tone="amber" className="icon-glow-lg">
              <Archive className="h-6 w-6 text-amber-200" />
            </IconGlow>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Архив заявок
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Удалённые заявки с возможностью восстановления
              </p>
            </div>
          </div>

          <Link
            href="/admin/bookings"
            className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
          >
            ← Назад к заявкам
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          СТАТИСТИКА
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="text-sm text-slate-400">
        Всего в архиве: <span className="text-white font-medium">{archivedAppointments.length}</span>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          СПИСОК АРХИВНЫХ ЗАЯВОК
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {archivedAppointments.length === 0 ? (
          <div className="card-glass card-glow p-8 text-center">
            <Archive className="h-12 w-12 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">Архив пуст</p>
            <p className="text-xs text-slate-500 mt-2">
              Удалённые заявки появятся здесь
            </p>
          </div>
        ) : (
          archivedAppointments.map((appointment) => (
            <ArchivedAppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   КАРТОЧКА АРХИВНОЙ ЗАЯВКИ
═══════════════════════════════════════════════════════════════════════════ */

function ArchivedAppointmentCard({ appointment }: { appointment: ArchivedAppointment }) {
  const priceCents = appointment.service?.priceCents;
  const priceValue = priceCents != null ? (
    <span className="font-semibold text-emerald-400">{moneyFromCents(priceCents)}</span>
  ) : '—';

  return (
    <div className="card-glass-hover card-glass-accent card-glow">
      <div className="p-4 sm:p-5 space-y-4">
        {/* Заголовок с статусом */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              <Archive className="h-3.5 w-3.5" />
              <span>Удалено: {appointment.deletedAt ? formatInOrgTzDateTime(appointment.deletedAt) : '—'}</span>
            </span>
            {appointment.deletedBy && (
              <span className="text-xs text-slate-500">
                кем: {appointment.deletedBy}
              </span>
            )}
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Основная информация */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<User2 className="h-4 w-4 text-fuchsia-400" />}
              label="Клиент"
              value={appointment.customerName}
              tone="fuchsia"
            />
          </div>

          {appointment.phone && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <InfoLine
                icon={<Phone className="h-4 w-4 text-emerald-400" />}
                label="Телефон"
                value={appointment.phone}
                tone="emerald"
              />
            </div>
          )}

          {appointment.email && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <InfoLine
                icon={<Mail className="h-4 w-4 text-sky-400" />}
                label="Email"
                value={appointment.email}
                tone="sky"
              />
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<Scissors className="h-4 w-4 text-amber-400" />}
              label="Услуга"
              value={<span className="block line-clamp-2">{servicePath(appointment.service)}</span>}
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
              value={appointment.master?.name ?? '—'}
              tone="cyan"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<Clock className="h-4 w-4 text-violet-400" />}
              label="Время визита"
              value={formatWallRangeWithDate(appointment.startAt, appointment.endAt)}
              tone="violet"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <InfoLine
              icon={<Calendar className="h-3.5 w-3.5 text-slate-400" />}
              label="Создано"
              value={formatInOrgTzDateTime(appointment.createdAt)}
              tone="slate"
            />
          </div>
        </div>

        {/* Комментарий */}
        {appointment.notes && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start gap-2">
              <span className="shrink-0 mt-0.5">
                <IconGlow tone="slate">
                  <MessageSquareText className="h-4 w-4 text-slate-300" />
                </IconGlow>
              </span>
              <div>
                <div className="text-xs text-slate-400 mb-1">Комментарий</div>
                <div className="text-sm text-slate-300 break-words">{appointment.notes}</div>
              </div>
            </div>
          </div>
        )}

        {/* Действия */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <RestoreAppointmentButton
            appointmentId={appointment.id}
            customerName={appointment.customerName}
          />
          <PermanentDeleteButton
            appointmentId={appointment.id}
            customerName={appointment.customerName}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

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
