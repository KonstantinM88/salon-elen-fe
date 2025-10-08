import type { ReactElement, ComponentPropsWithoutRef } from 'react';
import React from 'react';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function fmt(d: Date): string {
  return format(d, 'dd.MM.yyyy', { locale: ru });
}
function weekdayLabel(w: number): string {
  return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][w] ?? String(w);
}

export const dynamic = 'force-dynamic';

export default async function AdminCalendarPage({
  searchParams,
}: { searchParams: SearchParams }): Promise<ReactElement> {
  const sp = await searchParams;
  const saved = (Array.isArray(sp.saved) ? sp.saved[0] : sp.saved) === '1';

  const [wh, offs] = await Promise.all([
    prisma.workingHours.findMany(),
    prisma.timeOff.findMany({ orderBy: { date: 'desc' } }),
  ]);

  const whMap = new Map<number, { isClosed: boolean; startMinutes: number; endMinutes: number }>();
  for (let i = 0; i <= 6; i++) whMap.set(i, { isClosed: true, startMinutes: 0, endMinutes: 0 });
  for (const r of wh) whMap.set(r.weekday, { isClosed: r.isClosed, startMinutes: r.startMinutes, endMinutes: r.endMinutes });

  const order: number[] = [1, 2, 3, 4, 5, 6, 0];

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold">Календарь салона</h1>
        <Link href="/admin" className="link">← Дашборд</Link>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-2 text-sm">
          Сохранено.
        </div>
      )}

      {/* Недельный график */}
      <section className="space-y-3 rounded-2xl border p-4">
        <h2 className="font-medium">Общий график ПН–ВС</h2>
        <form
          action={async (fd) => {
            'use server';
            const { setSalonWorkingHours } = await import('./actions');
            await setSalonWorkingHours(fd);
          }}
          className="space-y-3"
        >
          {/* Desktop/tablet */}
          <div className="hidden md:block rounded-xl border overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-3">День</th>
                  <th className="p-3">Выходной</th>
                  <th className="p-3">Начало</th>
                  <th className="p-3">Конец</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.map((weekday) => {
                  const row = whMap.get(weekday)!;
                  return (
                    <tr key={weekday}>
                      <td className="p-3 whitespace-nowrap">{weekdayLabel(weekday)}</td>
                      <td className="p-3">
                        <input type="checkbox" name={`wh-${weekday}-isClosed`} defaultChecked={row.isClosed} />
                      </td>
                      <td className="p-3">
                        <input
                          type="time"
                          name={`wh-${weekday}-start`}
                          className="input w-40"
                          defaultValue={minutesToTime(row.startMinutes)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="time"
                          name={`wh-${weekday}-end`}
                          className="input w-40"
                          defaultValue={minutesToTime(row.endMinutes)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: карточки по дням */}
          <div className="md:hidden space-y-3">
            {order.map((weekday) => {
              const row = whMap.get(weekday)!;
              return (
                <div key={weekday} className="rounded-xl border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{weekdayLabel(weekday)}</div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name={`wh-${weekday}-isClosed`} defaultChecked={row.isClosed} />
                      <span className="opacity-80">Выходной</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Начало"
                      type="time"
                      name={`wh-${weekday}-start`}
                      defaultValue={minutesToTime(row.startMinutes)}
                    />
                    <Input
                      label="Конец"
                      type="time"
                      name={`wh-${weekday}-end`}
                      defaultValue={minutesToTime(row.endMinutes)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" type="submit" name="intent" value="save_stay">Сохранить</button>
            <button className="btn" type="submit" name="intent" value="save_close">Сохранить и выйти</button>
          </div>
        </form>
      </section>

      {/* Исключения (праздники/выходные) */}
      <section className="grid md:grid-cols-2 gap-4">
        <form
          action={async (fd) => {
            'use server';
            const { addSalonTimeOff } = await import('./actions');
            await addSalonTimeOff(fd);
          }}
          className="space-y-3 rounded-2xl border p-4"
        >
          <h2 className="font-medium">Добавить исключение</h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Дата начала" type="date" name="to-date-start" required />
            <Input label="Дата окончания (вкл.)" type="date" name="to-date-end" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="to-closed" />
              <span className="opacity-80">Целый день выходной</span>
            </label>
            <div />
            <Input label="Начало" type="time" name="to-start" />
            <Input label="Конец" type="time" name="to-end" />
            <Input label="Причина" name="to-reason" placeholder="8 марта — выходной" className="sm:col-span-2" />
          </div>

          <button className="btn btn-primary" type="submit">Добавить</button>
        </form>

        {/* Desktop/tablet table */}
        <div className="hidden md:block rounded-2xl border overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Дата</th>
                <th className="p-3">Интервал</th>
                <th className="p-3">Причина</th>
                <th className="p-3 w-24">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {offs.map((t) => (
                <tr key={t.id}>
                  <td className="p-3 whitespace-nowrap">{fmt(t.date)}</td>
                  <td className="p-3 whitespace-nowrap">
                    {t.startMinutes === 0 && t.endMinutes === 1440
                      ? 'весь день'
                      : `${minutesToTime(t.startMinutes)}–${minutesToTime(t.endMinutes)}`}
                  </td>
                  <td className="p-3">{t.reason ?? ''}</td>
                  <td className="p-3">
                    <form
                      action={async (fd) => {
                        'use server';
                        const { removeSalonTimeOff } = await import('./actions');
                        fd.set('timeOffId', t.id);
                        await removeSalonTimeOff(fd);
                      }}
                    >
                      <button className="btn btn-sm btn-outline" type="submit">Удалить</button>
                    </form>
                  </td>
                </tr>
              ))}
              {offs.length === 0 && (
                <tr><td className="p-3 opacity-70" colSpan={4}>Пока нет исключений</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden space-y-3">
          {offs.length === 0 && (
            <div className="rounded-xl border p-3 opacity-70">Пока нет исключений</div>
          )}
          {offs.map((t) => (
            <div key={t.id} className="rounded-xl border p-3 space-y-1">
              <div className="text-sm font-medium">{fmt(t.date)}</div>
              <div className="text-sm">
                {t.startMinutes === 0 && t.endMinutes === 1440
                  ? 'весь день'
                  : `${minutesToTime(t.startMinutes)}–${minutesToTime(t.endMinutes)}`}
              </div>
              <div className="text-xs opacity-70">{t.reason ?? ''}</div>
              <form
                action={async (fd) => {
                  'use server';
                  const { removeSalonTimeOff } = await import('./actions');
                  fd.set('timeOffId', t.id);
                  await removeSalonTimeOff(fd);
                }}
              >
                <button className="btn btn-sm btn-outline mt-2" type="submit">Удалить</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Input(
  { label, className, ...props }:
  { label: string } & Omit<ComponentPropsWithoutRef<'input'>, 'className'> & { className?: string }
): ReactElement {
  return (
    <label className={`grid gap-1 text-sm ${className ?? ''}`}>
      <span className="opacity-70">{label}</span>
      <input {...props} className="input" />
    </label>
  );
}
