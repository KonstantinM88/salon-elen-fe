// src/app/admin/stats/export/route.ts
import { prisma } from '@/lib/db';
import { AppointmentStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
  addDays,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
  startOfWeek,
  format,
} from 'date-fns';
import { ru } from 'date-fns/locale';

function getOne(u: URLSearchParams, key: string, def = ''): string {
  const v = u.get(key);
  return v ?? def;
}

function resolveRange(u: URLSearchParams): { from: Date; to: Date; label: string } {
  const now = new Date();
  const todayStart = startOfDay(now);

  const period = getOne(u, 'period', 'thisMonth');
  const fromStr = getOne(u, 'from');
  const toStr = getOne(u, 'to');

  let from = todayStart;
  let to = addDays(todayStart, 1);
  let label = 'Сегодня';

  switch (period) {
    case 'today':
      from = todayStart;
      to = addDays(from, 1);
      label = 'Сегодня';
      break;
    case '7d':
      from = addDays(todayStart, -6);
      to = addDays(todayStart, 1);
      label = 'Последние 7 дней';
      break;
    case '30d':
      from = addDays(todayStart, -29);
      to = addDays(todayStart, 1);
      label = 'Последние 30 дней';
      break;
    case 'thisMonth':
      from = startOfMonth(now);
      to = startOfMonth(addDays(now, 32));
      label = 'Текущий месяц';
      break;
    case 'lastMonth': {
      const last = subMonths(now, 1);
      from = startOfMonth(last);
      to = startOfMonth(addDays(last, 32));
      label = 'Прошлый месяц';
      break;
    }
    case 'thisYear':
      from = startOfYear(now);
      to = startOfYear(addDays(now, 370));
      label = 'Текущий год';
      break;
    case 'custom': {
      const f = fromStr ? new Date(fromStr) : todayStart;
      const t = toStr ? addDays(startOfDay(new Date(toStr)), 1) : addDays(startOfDay(f), 1);
      from = startOfDay(f);
      to = t;
      label = `C ${format(from, 'dd.MM.yyyy', { locale: ru })} по ${format(addDays(to, -1), 'dd.MM.yyyy', { locale: ru })}`;
      break;
    }
    default:
      from = startOfMonth(now);
      to = startOfMonth(addDays(now, 32));
      label = 'Текущий месяц';
  }
  return { from, to, label };
}

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCSV(rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  return rows.map((r) => r.map(csvEscape).join(';')).join('\n');
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams;

  // защита от префетча и случайных заходов без флага
  const headers = req.headers;
  const isPrefetch =
    headers.get('purpose') === 'prefetch' ||
    headers.get('sec-purpose')?.includes('prefetch') ||
    headers.get('next-router-prefetch') === '1';
  const download = q.get('download') === '1';
  if (isPrefetch || !download) {
    return new NextResponse('', { status: 204 });
  }

  const { from, to, label } = resolveRange(q);
  const currency = getOne(q, 'currency', 'EUR').toUpperCase();
  const type = getOne(q, 'type', 'raw');
  const group = getOne(q, 'group', 'day') === 'week' ? 'week' : 'day';
  const now = new Date();

  const appts = await prisma.appointment.findMany({
    where: { startAt: { gte: from, lt: to } },
    select: {
      id: true,
      status: true,
      startAt: true,
      service: { select: { id: true, name: true, priceCents: true } },
      master: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { startAt: 'asc' },
  });

  let csv = '';
  if (type === 'masters') {
    const by = new Map<
      string,
      {
        name: string;
        total: number;
        done: number;
        futureConfirmed: number;
        canceled: number;
        pending: number;
        revenueDone: number;
        revenueFutureConfirmed: number;
      }
    >();

    for (const a of appts) {
      const id = a.master?.id ?? 'none';
      const name = a.master?.name ?? 'Без мастера';
      const r =
        by.get(id) ??
        {
          name,
          total: 0,
          done: 0,
          futureConfirmed: 0,
          canceled: 0,
          pending: 0,
          revenueDone: 0,
          revenueFutureConfirmed: 0,
        };
      r.total += 1;
      if (a.status === AppointmentStatus.DONE) {
        r.done += 1;
        r.revenueDone += a.service?.priceCents ?? 0;
      } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
        r.futureConfirmed += 1;
        r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
      } else if (a.status === AppointmentStatus.CANCELED) {
        r.canceled += 1;
      } else if (a.status === AppointmentStatus.PENDING) {
        r.pending += 1;
      }
      by.set(id, r);
    }

    const rows: Array<Array<unknown>> = [
      ['Сводка по мастерам', label],
      ['Мастер', 'Заявок', 'Выполнено', 'Будущие подтв.', 'Отменено', 'Ожидают', `Касса (вып.), ${currency}`, `Касса (буд.), ${currency}`],
    ];
    for (const r of by.values()) {
      rows.push([
        r.name,
        r.total,
        r.done,
        r.futureConfirmed,
        r.canceled,
        r.pending,
        (r.revenueDone || 0) / 100,
        (r.revenueFutureConfirmed || 0) / 100,
      ]);
    }
    csv = toCSV(rows);
  } else if (type === 'services') {
    const by = new Map<
      string,
      { name: string; total: number; done: number; futureConfirmed: number; revenueDone: number; revenueFutureConfirmed: number }
    >();

    for (const a of appts) {
      const sid = a.service?.id ?? 'unknown';
      const name = a.service?.name ?? 'Удалённая услуга';
      const r =
        by.get(sid) ?? { name, total: 0, done: 0, futureConfirmed: 0, revenueDone: 0, revenueFutureConfirmed: 0 };
      r.total += 1;
      if (a.status === AppointmentStatus.DONE) {
        r.done += 1;
        r.revenueDone += a.service?.priceCents ?? 0;
      } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
        r.futureConfirmed += 1;
        r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
      }
      by.set(sid, r);
    }

    const rows: Array<Array<unknown>> = [
      ['Сводка по услугам', label],
      ['Услуга', 'Заявок', 'Выполнено', `Касса (вып.), ${currency}`, 'Будущие подтв.', `Касса (буд.), ${currency}`],
    ];
    for (const r of by.values()) {
      rows.push([r.name, r.total, r.done, (r.revenueDone || 0) / 100, r.futureConfirmed, (r.revenueFutureConfirmed || 0) / 100]);
    }
    csv = toCSV(rows);
  } else if (type === 'timeline') {
    type B = { key: string; start: Date; cnt: number; rev: number };
    const buckets = new Map<string, B>();
    const makeKey = (d: Date): { key: string; start: Date } => {
      if (group === 'week') {
        const s = startOfWeek(d, { locale: ru, weekStartsOn: 1 });
        return { key: `W${format(s, 'yyyy-ww')}`, start: s };
      }
      const s = startOfDay(d);
      return { key: format(s, 'yyyy-MM-dd'), start: s };
    };

    for (const a of appts) {
      if (a.status !== AppointmentStatus.DONE) continue;
      const { key, start } = makeKey(a.startAt);
      const b = buckets.get(key) ?? { key, start, cnt: 0, rev: 0 };
      b.cnt += 1;
      b.rev += a.service?.priceCents ?? 0;
      buckets.set(key, b);
    }

    const rows: Array<Array<unknown>> = [
      ['Динамика', label, group === 'week' ? 'недели' : 'дни'],
      [group === 'week' ? 'Неделя (начало)' : 'День', 'Выполнено', `Касса (вып.), ${currency}`],
    ];
    for (const b of [...buckets.values()].sort((a, b) => a.start.getTime() - b.start.getTime())) {
      rows.push([format(b.start, 'dd.MM.yyyy', { locale: ru }), b.cnt, b.rev / 100]);
    }
    csv = toCSV(rows);
  } else {
    // raw
    const rows: Array<Array<unknown>> = [
      ['Заявки', label],
      ['ID', 'Дата', 'Статус', 'Мастер', 'Клиент', 'Телефон', 'Услуга', `Цена, ${currency}`],
    ];
    for (const a of appts) {
      rows.push([
        a.id,
        format(a.startAt, 'dd.MM.yyyy HH:mm', { locale: ru }),
        a.status,
        a.master?.name ?? '',
        a.client?.name ?? '',
        a.client?.phone ?? '',
        a.service?.name ?? '',
        (a.service?.priceCents || 0) / 100,
      ]);
    }
    csv = toCSV(rows);
  }

  const filename = `stats_${type}_${format(from, 'yyyyMMdd')}-${format(addDays(to, -1), 'yyyyMMdd')}.csv`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
