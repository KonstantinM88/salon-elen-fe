'use client';

import * as React from 'react';
import { JSX, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* =========================
   Типы
========================= */

type Slot = {
  startAt: string;
  endAt: string;
  startMinutes: number;
  endMinutes: number;
};

type ApiPayload = {
  slots: Slot[];
  splitRequired: boolean;
  firstDateISO?: string | null;
};

type Master = { id: string; name: string };

/* =========================
   Время/формат
========================= */

const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

const todayISO = (tz: string = ORG_TZ): string => {
  const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
  return s.split(' ')[0];
};

const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

const addDaysISO = (iso: string, days: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toISODate(dt);
};

const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

const clampISO = (iso: string, minISO: string, maxISO: string): string => {
  if (iso < minISO) return minISO;
  if (iso > maxISO) return maxISO;
  return iso;
};

const formatHM = (minutes: number): string => {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}`;
};

/* =========================
   Внутренний компонент
========================= */

function CalendarInner(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const serviceIds = React.useMemo<string[]>(
    () => params.getAll('s').filter(Boolean),
    [params],
  );
  const masterIdFromUrl = params.get('m') ?? '';
  const urlDate = params.get('d') ?? undefined;

  const minISO = todayISO();
  const maxISO = max9WeeksISO();

  const [dateISO, setDateISO] = React.useState<string>(() => {
    const initial = urlDate ?? minISO;
    return clampISO(initial, minISO, maxISO);
  });

  const [masters, setMasters] = React.useState<Master[]>([]);
  const [masterId, setMasterId] = React.useState<string>(masterIdFromUrl);

  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const hasDateParam = React.useMemo<boolean>(() => params.has('d'), [params]);

  // Загрузка доступных мастеров для выбранных услуг
  React.useEffect(() => {
    let alive = true;
    async function loadMasters(): Promise<void> {
      if (serviceIds.length === 0) {
        setMasters([]);
        setMasterId('');
        return;
      }
      try {
        const qs = new URLSearchParams();
        qs.set('serviceIds', serviceIds.join(','));
        const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { masters: Master[] };
        if (!alive) return;
        setMasters(data.masters ?? []);
        // если мастер не выбран или не входит в список, выбираем первого
        if (!masterId || !data.masters.find(m => m.id === masterId)) {
          const first = data.masters[0]?.id ?? '';
          setMasterId(first);
          // синхронизируем URL
          const q = new URLSearchParams();
          serviceIds.forEach(s => q.append('s', s));
          if (first) q.set('m', first);
          q.set('d', dateISO);
          router.replace(`/booking/calendar?${q.toString()}`);
        }
      } catch {
        /* игнорируем, UI продолжит без мастеров */
      }
    }
    void loadMasters();
    return () => { alive = false; };
  }, [serviceIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Загрузка слотов
  React.useEffect(() => {
    let alive = true;
    async function load(): Promise<void> {
      if (serviceIds.length === 0 || !masterId) {
        setSlots([]);
        return;
      }
      setLoading(true);
      setError(null);
      setSlots([]);
      try {
        const qs = new URLSearchParams();
        qs.set('masterId', masterId);
        qs.set('serviceIds', serviceIds.join(','));

        // Если есть параметр даты в URL - запрашиваем конкретную дату
        // Если нет - API сам найдет первую доступную дату
        if (hasDateParam) {
          qs.set('dateISO', dateISO);
        }

        const res = await fetch(`/api/availability?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiPayload = await res.json();
        if (!alive) return;

        setSlots(Array.isArray(data.slots) ? data.slots : []);

        // Если API вернул firstDateISO и мы не запрашивали конкретную дату,
        // обновляем dateISO и URL
        if (!hasDateParam && data.firstDateISO) {
          setDateISO(data.firstDateISO);
          const urlQS = new URLSearchParams();
          serviceIds.forEach(id => urlQS.append('s', id));
          if (masterId) urlQS.set('m', masterId);
          urlQS.set('d', data.firstDateISO);
          router.replace(`/booking/calendar?${urlQS.toString()}`);
        }
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'Не удалось загрузить слоты';
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void load();
    return () => { alive = false; };
  }, [dateISO, masterId, serviceIds, hasDateParam, router]);

  // Навигация по датам
  const canPrev = dateISO > minISO;
  const canNext = dateISO < maxISO;

  const goPrev = (): void => {
    if (!canPrev) return;
    const d = addDaysISO(dateISO, -1);
    setDateISO(d);
    syncUrl(d, masterId);
  };

  const goNext = (): void => {
    if (!canNext) return;
    const d = addDaysISO(dateISO, +1);
    setDateISO(d);
    syncUrl(d, masterId);
  };

  const onPickDate: React.ChangeEventHandler<HTMLInputElement> = e => {
    const raw = e.target.value;
    if (!raw) return;
    const d = clampISO(raw, minISO, maxISO);
    setDateISO(d);
    syncUrl(d, masterId);
  };

  const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const id = e.target.value;
    setMasterId(id);
    syncUrl(dateISO, id);
  };

  const syncUrl = (d: string, m: string): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach(id => qs.append('s', id));
    if (m) qs.set('m', m);
    qs.set('d', d);
    router.replace(`/booking/calendar?${qs.toString()}`);
  };

  // Переход к форме клиента
  const goClient = (slot: Slot): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach(id => qs.append('s', id));
    if (masterId) qs.set('m', masterId);
    qs.set('start', slot.startAt);
    qs.set('end', slot.endAt);
    qs.set('d', dateISO);
    router.push(`/booking/client?${qs.toString()}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Календарь</h2>

      {/* Панель выбора мастера и даты */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">Мастер:</label>
        <select
          className="rounded-md border bg-background px-3 py-1 text-sm"
          value={masterId}
          onChange={onPickMaster}
        >
          {masters.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <span className="ml-3 text-sm text-muted-foreground">Дата:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            className={`rounded-md border px-3 py-1 text-sm ${canPrev ? 'hover:bg-muted' : 'opacity-50'}`}
          >
            ←
          </button>

          <input
            type="date"
            value={dateISO}
            min={minISO}
            max={maxISO}
            onChange={onPickDate}
            className="rounded-md border bg-background px-3 py-1 text-sm"
          />

          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className={`rounded-md border px-3 py-1 text-sm ${canNext ? 'hover:bg-muted' : 'opacity-50'}`}
          >
            →
          </button>
        </div>
      </div>

      {/* Слоты */}
      <section className="mt-4">
        {loading && (
          <div className="rounded-lg border border-border bg-card p-4">
            Загрузка свободных окон…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && slots.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            На выбранную дату нет свободных окон. Попробуйте выбрать другую дату.
          </div>
        )}

        {!loading && !error && slots.length > 0 && (
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {slots.map((t) => (
              <li key={t.startAt}>
                <button
                  type="button"
                  onClick={() => goClient(t)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
                >
                  {formatHM(t.startMinutes)}–{formatHM(t.endMinutes)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 text-xs text-muted-foreground">
        Доступно слотов: <span className="font-medium text-foreground">{slots.length}</span>
      </div>
    </div>
  );
}

/* =========================
   Обёртка
========================= */

export default function CalendarPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-6 max-w-5xl rounded-lg border border-border bg-card p-4">
          Инициализация календаря…
        </div>
      }
    >
      <CalendarInner />
    </Suspense>
  );
}
