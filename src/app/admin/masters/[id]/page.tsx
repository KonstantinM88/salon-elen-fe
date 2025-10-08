// src/app/admin/masters/[id]/page.tsx
import type { ReactElement, ComponentPropsWithoutRef } from 'react';
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type Params = Promise<{ id: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

function fmtDate(d: Date): string {
  return format(d, 'dd.MM.yyyy', { locale: ru });
}
function toInputDate(d: Date): string {
  // YYYY-MM-DD (UTC)
  const iso = new Date(d).toISOString();
  return iso.slice(0, 10);
}
function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function weekdayLabel(w: number): string {
  // 0=Вс … 6=Сб (как в БД)
  return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][w] ?? String(w);
}

export const dynamic = 'force-dynamic';

export default async function MasterProfilePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}): Promise<ReactElement> {
  const { id } = await params;
  if (!id) notFound();

  const sp = await searchParams;
  const tab = (Array.isArray(sp.tab) ? sp.tab[0] : sp.tab) ?? 'profile';
  const saved = (Array.isArray(sp.saved) ? sp.saved[0] : sp.saved) === '1';
  const error = Array.isArray(sp.error) ? sp.error[0] : sp.error;

  const master = await prisma.master.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birthDate: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      services: { select: { id: true } },
      _count: { select: { services: true, appointments: true } },
    },
  });
  if (!master) notFound();

  const [allServices, workingHours, timeOff] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, parentId: true },
    }),
    prisma.masterWorkingHours.findMany({ where: { masterId: id } }),
    prisma.masterTimeOff.findMany({ where: { masterId: id }, orderBy: { date: 'desc' } }),
  ]);

  const assigned = new Set(master.services.map((s) => s.id));

  // подготовим расписание (0..6 всегда есть)
  const whMap = new Map<number, { isClosed: boolean; startMinutes: number; endMinutes: number }>();
  for (let w = 0; w <= 6; w++) whMap.set(w, { isClosed: true, startMinutes: 0, endMinutes: 0 });
  for (const r of workingHours)
    whMap.set(r.weekday, {
      isClosed: r.isClosed,
      startMinutes: r.startMinutes,
      endMinutes: r.endMinutes,
    });
  const weekOrder = [1, 2, 3, 4, 5, 6, 0]; // показываем Пн..Вс

  const errText =
    error === 'upload'
      ? 'Не удалось загрузить изображение.'
      : error === 'type'
      ? 'Неверный тип файла. Разрешены JPG/PNG/WebP.'
      : error === 'too_big'
      ? 'Файл слишком большой (макс. 5 МБ).'
      : null;

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{master.name}</h1>
          <div className="text-xs opacity-60">
            Услуг: {master._count.services} · Заявок: {master._count.appointments}
          </div>
        </div>
        <Link href="/admin/masters" className="link">
          ← Назад
        </Link>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-3 py-2 text-sm">
          Сохранено.
        </div>
      )}
      {errText && (
        <div className="rounded-lg border border-rose-300 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 px-3 py-2 text-sm">
          {errText}
        </div>
      )}

      {/* Навигация вкладок */}
      <nav className="flex flex-wrap gap-2">
        <Tab href={`/admin/masters/${id}?tab=profile`} active={tab === 'profile'}>
          Профиль
        </Tab>
        <Tab href={`/admin/masters/${id}?tab=services`} active={tab === 'services'}>
          Категории и услуги
        </Tab>
        <Tab href={`/admin/masters/${id}?tab=schedule`} active={tab === 'schedule'}>
          Календарь
        </Tab>
      </nav>

      {/* PROFILE */}
      {tab === 'profile' && (
        <section className="grid lg:grid-cols-[280px,1fr] gap-6">
          {/* Аватар и загрузка */}
          <div className="space-y-3 rounded-2xl border p-4">
            <h3 className="font-medium">Аватар</h3>
            <div className="flex items-center gap-4">
              <AvatarBox name={master.name} src={master.avatarUrl ?? null} />
            </div>

            <form
              action={async (fd) => {
                'use server';
                const { uploadAvatar } = await import('./actions');
                fd.set('id', id);
                await uploadAvatar(fd);
              }}
              className="space-y-2"
            >
              <input
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full text-sm file:mr-3 file:btn file:btn-outline"
                required
              />
              <div className="text-xs opacity-60">JPG/PNG/WebP · до 5 МБ</div>
              <button className="btn btn-primary" type="submit">
                Загрузить
              </button>
            </form>

            {master.avatarUrl && (
              <form
                action={async (fd) => {
                  'use server';
                  const { removeAvatar } = await import('./actions');
                  fd.set('id', id);
                  await removeAvatar(fd);
                }}
              >
                <button className="btn btn-outline btn-sm" type="submit">
                  Удалить аватар
                </button>
              </form>
            )}
          </div>

          {/* Данные профиля */}
          <form
            action={async (fd) => {
              'use server';
              const { updateMaster } = await import('./actions');
              fd.set('id', id);
              await updateMaster(fd);
            }}
            className="space-y-4 rounded-2xl border p-4"
          >
            <h3 className="font-medium">Профиль</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Имя" name="name" defaultValue={master.name} required minLength={2} />
              <Input label="E-mail" name="email" type="email" defaultValue={master.email} />
              <Input label="Телефон" name="phone" defaultValue={master.phone} />
              <Input label="Дата рождения" name="birthDate" type="date" defaultValue={toInputDate(master.birthDate)} />
              <Textarea
                label="Короткое описание"
                name="bio"
                rows={6}
                defaultValue={master.bio ?? ''}
                className="sm:col-span-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit" name="intent" value="save_stay">
                Сохранить
              </button>
              <button className="btn" type="submit" name="intent" value="save_close">
                Сохранить и выйти
              </button>
            </div>
          </form>
        </section>
      )}

      {/* SERVICES */}
      {tab === 'services' && (
        <section className="space-y-3 rounded-2xl border p-4">
          <h3 className="font-medium">Категории и услуги</h3>

          <form
            action={async (fd) => {
              'use server';
              const { setMasterServices } = await import('./actions');
              fd.set('id', id);
              await setMasterServices(fd);
            }}
            className="space-y-4"
          >
            {/* Покажем иерархию: сначала родительские (parentId=null), затем дети */}
            <div className="grid md:grid-cols-2 gap-4">
              {allServices
                .filter((s) => s.parentId === null)
                .map((cat) => {
                  const children = allServices.filter((s) => s.parentId === cat.id);
                  return (
                    <div key={cat.id} className="rounded-xl border p-3">
                      <div className="font-medium mb-2">{cat.name}</div>
                      <div className="space-y-2">
                        {children.length === 0 ? (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="serviceId"
                              value={cat.id}
                              defaultChecked={assigned.has(cat.id)}
                            />
                            <span>{cat.name}</span>
                          </label>
                        ) : (
                          children.map((srv) => (
                            <label key={srv.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                name="serviceId"
                                value={srv.id}
                                defaultChecked={assigned.has(srv.id)}
                              />
                              <span>{srv.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit" name="intent" value="save_stay">
                Сохранить
              </button>
              <button className="btn" type="submit" name="intent" value="save_close">
                Сохранить и выйти
              </button>
            </div>
          </form>
        </section>
      )}

      {/* SCHEDULE */}
      {tab === 'schedule' && (
        <section className="space-y-6">
          {/* Рабочие часы по дням недели */}
          <form
            action={async (fd) => {
              'use server';
              const { setMasterWorkingHours } = await import('./actions');
              fd.set('id', id);
              await setMasterWorkingHours(fd);
            }}
            className="space-y-3 rounded-2xl border p-4"
          >
            <h3 className="font-medium">Рабочий график</h3>

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
                  {weekOrder.map((w) => {
                    const row = whMap.get(w)!;
                    return (
                      <tr key={w}>
                        <td className="p-3 whitespace-nowrap">{weekdayLabel(w)}</td>
                        <td className="p-3">
                          <input type="checkbox" name={`wh-${w}-isClosed`} defaultChecked={row.isClosed} />
                        </td>
                        <td className="p-3">
                          <input
                            type="time"
                            name={`wh-${w}-start`}
                            className="input w-40"
                            defaultValue={minutesToTime(row.startMinutes)}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="time"
                            name={`wh-${w}-end`}
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

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {weekOrder.map((w) => {
                const row = whMap.get(w)!;
                return (
                  <div key={w} className="rounded-xl border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{weekdayLabel(w)}</div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name={`wh-${w}-isClosed`} defaultChecked={row.isClosed} />
                        <span className="opacity-80">Выходной</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Начало" type="time" name={`wh-${w}-start`} defaultValue={minutesToTime(row.startMinutes)} />
                      <Input label="Конец" type="time" name={`wh-${w}-end`} defaultValue={minutesToTime(row.endMinutes)} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit" name="intent" value="save_stay">
                Сохранить график
              </button>
              <button className="btn" type="submit" name="intent" value="save_close">
                Сохранить и выйти
              </button>
            </div>
          </form>

          {/* Исключения: диапазон дат */}
          <div className="grid md:grid-cols-2 gap-4">
            <form
              action={async (fd) => {
                'use server';
                const { addTimeOff } = await import('./actions');
                fd.set('id', id);
                await addTimeOff(fd);
              }}
              className="space-y-3 rounded-2xl border p-4"
            >
              <h3 className="font-medium">Добавить исключение</h3>
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
                <Input label="Причина" name="to-reason" placeholder="Отпуск / выходной / прочее" className="sm:col-span-2" />
              </div>
              <button className="btn btn-primary" type="submit">
                Добавить исключение
              </button>
            </form>

            {/* Список исключений */}
            <div className="rounded-2xl border overflow-x-auto">
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
                  {timeOff.map((t) => (
                    <tr key={t.id}>
                      <td className="p-3 whitespace-nowrap">{fmtDate(t.date)}</td>
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
                            const { removeTimeOff } = await import('./actions');
                            fd.set('id', id);
                            fd.set('timeOffId', t.id);
                            await removeTimeOff(fd);
                          }}
                        >
                          <button className="btn btn-sm btn-outline" type="submit">
                            Удалить
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {timeOff.length === 0 && (
                    <tr>
                      <td className="p-3 opacity-70" colSpan={4}>
                        Нет исключений
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

/* ───────────────────────── UI helpers ───────────────────────── */

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm border ${
        active ? 'bg-primary text-primary-foreground border-transparent' : 'hover:bg-muted'
      }`}
    >
      {children}
    </Link>
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

function Textarea(
  { label, className, ...props }:
  { label: string } & Omit<ComponentPropsWithoutRef<'textarea'>, 'className'> & { className?: string }
): ReactElement {
  return (
    <label className={`grid gap-1 text-sm ${className ?? ''}`}>
      <span className="opacity-70">{label}</span>
      <textarea {...props} className="input min-h-[120px]" />
    </label>
  );
}

function AvatarBox({ name, src }: { name: string; src: string | null }): ReactElement {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="relative">
      <div className="w-28 h-28 rounded-full overflow-hidden ring-1 ring-border bg-muted flex items-center justify-center text-xl">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="opacity-70">{initials || '👤'}</span>
        )}
      </div>
    </div>
  );
}
