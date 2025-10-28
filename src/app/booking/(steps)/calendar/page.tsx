// src/app/booking/(steps)/calendar/page.tsx
'use client';

import * as React from 'react';
import { JSX, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ===== Types =====
type Slot = {
  startAt: string;      // ISO
  endAt: string;        // ISO
  startMinutes: number; // целые минуты с начала суток
  endMinutes: number;
};

type ApiPayload = {
  slots: Slot[];
  splitRequired: boolean;
};

// ===== Utils =====
const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

const todayISO = (): string => {
  const now = new Date();
  // нормализуем к местной дате без смещения по часовому поясу
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return toISODate(local);
};

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

const fmtHM = (iso: string): string => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

// ===== Page =====
export default function CalendarPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
          <h2 className="mt-2 text-lg text-muted-foreground">Календарь</h2>
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            Загрузка доступных слотов…
          </div>
        </div>
      }
    >
      <CalendarInner />
    </Suspense>
  );
}

function CalendarInner(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  // параметры шага
  const serviceIds = React.useMemo<string[]>(
    () => params.getAll('s').filter(Boolean),
    [params],
  );
  const masterId = params.get('m') || '';

  // границы календаря
  const minISO = todayISO();
  const maxISO = max9WeeksISO();

  // начальная дата: из параметра d либо сегодня, зажатая в диапазон
  const initialDateISO = clampISO(params.get('d') || minISO, minISO, maxISO);

  const [dateISO, setDateISO] = React.useState<string>(initialDateISO);
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // загрузка слотов при смене даты/набора/мастера
  React.useEffect(() => {
    let alive = true;

    async function load(): Promise<void> {
      if (!masterId || serviceIds.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams();
        qs.set('masterId', masterId);
        qs.set('dateISO', dateISO);
        qs.set('serviceIds', serviceIds.join(','));

        const res = await fetch(`/api/availability?${qs.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const { slots: dataSlots }: ApiPayload = await res.json();

        if (alive) {
          // защита от сломанных данных
          const safe = Array.isArray(dataSlots) ? dataSlots : [];
          setSlots(safe);
        }
      } catch (e) {
        if (alive) {
          const msg = e instanceof Error ? e.message : 'Не удалось загрузить слоты';
          setError(msg);
          setSlots([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [masterId, serviceIds, dateISO]);

  // смена даты через инпут
  const onDateChange = (next: string): void => {
    const clamped = clampISO(next, minISO, maxISO);
    setDateISO(clamped);
    // подсветим дату в URL для перезагрузки/шеринга
    const qs = new URLSearchParams();
    serviceIds.forEach(id => qs.append('s', id));
    if (masterId) qs.set('m', masterId);
    qs.set('d', clamped);
    router.replace(`/booking/calendar?${qs.toString()}`);
  };

  // кнопки день назад/вперед
  const prevDisabled = dateISO <= minISO;
  const nextDisabled = dateISO >= maxISO;

  const goPrev = (): void => {
    if (prevDisabled) return;
    onDateChange(addDaysISO(dateISO, -1));
  };

  const goNext = (): void => {
    if (nextDisabled) return;
    onDateChange(addDaysISO(dateISO, +1));
  };

  // переход на подтверждение
  const goConfirm = (t: Slot): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach(id => qs.append('s', id));
    if (masterId) qs.set('m', masterId);
    qs.set('start', t.startAt);
    qs.set('end', t.endAt);
    router.push(`/booking/confirm?${qs.toString()}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Календарь</h2>

      {/* Панель выбора даты */}
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Дата: <span className="font-medium text-foreground">{dateISO}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={prevDisabled}
            className={`rounded-xl border px-3 py-2 text-sm ${
              prevDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted'
            }`}
          >
            ← Предыдущий день
          </button>

          <input
            type="date"
            value={dateISO}
            min={minISO}
            max={maxISO}
            onChange={e => onDateChange(e.currentTarget.value)}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
          />

          <button
            type="button"
            onClick={goNext}
            disabled={nextDisabled}
            className={`rounded-xl border px-3 py-2 text-sm ${
              nextDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted'
            }`}
          >
            Следующий день →
          </button>
        </div>
      </div>

      {/* Слоты */}
      <div className="mt-6">
        {loading && (
          <div className="rounded-lg border border-border bg-card p-4">Загрузка…</div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && slots.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            На выбранную дату нет свободных окон. Попробуйте другую дату.
          </div>
        )}

        {!loading && !error && slots.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {slots.map((t) => {
              const key = `${t.startAt}-${t.endAt}`; // уникальный ключ
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => goConfirm(t)}
                    className="w-full rounded-xl border px-4 py-2 text-sm hover:border-indigo-300"
                    title={`${fmtHM(t.startAt)}–${fmtHM(t.endAt)}`}
                  >
                    {fmtHM(t.startAt)}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Навигация назад */}
      <div className="mt-8">
        <Link
          href={
            serviceIds.length > 0
              ? `/booking/master?s=${serviceIds.join('&s=')}`
              : '/booking/services'
          }
          className="inline-flex rounded-xl border px-4 py-2 text-sm hover:bg-muted"
        >
          Назад
        </Link>
      </div>
    </div>
  );
}










// // src/app/booking/(steps)/calendar/page.tsx
// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { fmtVisitDate, fmtVisitTime } from "@/lib/datetime";

// // Утилита чтения параметров с обратной совместимостью
// function parseParams(sp: URLSearchParams) {
//   const dateISO = sp.get("d") || sp.get("dateISO") || new Date().toISOString().slice(0, 10);
//   const masterId = sp.get("masterId") || undefined;

//   // Мульти-услуги: приоритет "serviceIds", затем одиночные ("s"/"serviceId"/"serviceSlug")
//   const csv = sp.get("serviceIds")?.trim();
//   let serviceIds = csv ? csv.split(",").map(s => s.trim()).filter(Boolean) : [];

//   const legacyOne = sp.get("s") || sp.get("serviceId") || sp.get("serviceSlug") || sp.get("serviceSlugOrId");
//   if (!serviceIds.length && legacyOne) serviceIds = [legacyOne];

//   const durationMin = sp.get("m") ? Number(sp.get("m")) : undefined;

//   return { dateISO, masterId, serviceIds, durationMin };
// }

// type Slot =
//   | { startISO: string; endISO: string }
//   | { startAt: string; endAt: string }
//   | string; // на всякий случай

// type MastersListItem = { id: string; name: string };

// export default function CalendarStep() {
//   const router = useRouter();
//   const sp = useSearchParams();
//   const { dateISO: initialDateISO, masterId: initialMaster, serviceIds: initialServices, durationMin } = useMemo(
//     () => parseParams(sp),
//     [sp]
//   );

//   const [dateISO, setDateISO] = useState<string>(initialDateISO);
//   const [serviceIds, setServiceIds] = useState<string[]>(initialServices);
//   const [masterId, setMasterId] = useState<string | undefined>(initialMaster);
//   const [slots, setSlots] = useState<Slot[] | null>(null);
//   const [mastersToChoose, setMastersToChoose] = useState<MastersListItem[] | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const paramsForFetch = useMemo(() => {
//     const p = new URLSearchParams();
//     p.set("dateISO", dateISO);
//     if (serviceIds.length) p.set("serviceIds", serviceIds.join(","));
//     if (masterId) p.set("masterId", masterId);
//     if (!serviceIds.length && durationMin) p.set("durationMin", String(durationMin));
//     return p.toString();
//   }, [dateISO, serviceIds, masterId, durationMin]);

//   const fetchSlots = useCallback(async () => {
//     setLoading(true);
//     setErrorMsg(null);
//     setMastersToChoose(null);
//     try {
//       const res = await fetch(`/api/availability?${paramsForFetch}`, { cache: "no-store" });
//       if (res.ok) {
//         const data = await res.json();
//         // API может вернуть masterId при автоназначении
//         if (data.masterId && !masterId) setMasterId(data.masterId);
//         setSlots(Array.isArray(data.slots) ? data.slots : []);
//       } else {
//         const data = await res.json().catch(() => ({}));
//         if (data?.error === "master_required") {
//           const list: MastersListItem[] = Array.isArray(data.masters) ? data.masters : [];
//           setMastersToChoose(list);
//           setSlots(null);
//           if (!list.length) {
//             setErrorMsg(
//               "Ни один мастер не покрывает выбранные услуги. Оформите две отдельные записи или измените набор услуг."
//             );
//           }
//         } else if (data?.error === "duration_or_services_required") {
//           setErrorMsg("Необходимо указать услуги или длительность визита.");
//         } else if (data?.error === "invalid_dateISO") {
//           setErrorMsg("Некорректная дата.");
//         } else {
//           setErrorMsg("Не удалось загрузить свободные слоты.");
//         }
//       }
//     } catch {
//       setErrorMsg("Ошибка сети при загрузке свободных слотов.");
//     } finally {
//       setLoading(false);
//     }
//   }, [paramsForFetch, masterId]);

//   useEffect(() => {
//     fetchSlots();
//   }, [fetchSlots]);

//   // Навигация при выборе слота
//   const goNext = useCallback(
//     (startISO: string) => {
//       const p = new URLSearchParams();
//       if (serviceIds.length) p.set("serviceIds", serviceIds.join(","));
//       if (durationMin) p.set("m", String(durationMin));
//       if (masterId) p.set("masterId", masterId);
//       p.set("startAt", new Date(startISO).toISOString()); // хранить в ISO UTC
//       router.push(`/booking/client?${p.toString()}`);
//     },
//     [router, serviceIds, durationMin, masterId]
//   );

//   // Хелперы форматирования времени с учётом хот-фикса TZ
//   function slotStart(s: Slot): Date {
//     if (typeof s === "string") return new Date(s);
//     if ("startISO" in s) return new Date(s.startISO);
//     return new Date(s.startAt);
//   }
//   function slotEnd(s: Slot): Date {
//     if (typeof s === "string") return new Date(s);
//     if ("endISO" in s) return new Date(s.endISO);
//     return new Date(s.endAt);
//   }

//   // Обработчики выбора
//   const onPickMaster = async (id: string) => {
//     setMasterId(id);
//     // Обновим URL, чтобы шаги далее знали про выбранного мастера
//     const urlParams = new URLSearchParams(Array.from(sp.entries()));
//     urlParams.set("dateISO", dateISO);
//     urlParams.set("serviceIds", serviceIds.join(","));
//     urlParams.set("masterId", id);
//     if (!serviceIds.length && durationMin) urlParams.set("m", String(durationMin));
//     router.replace(`/booking/calendar?${urlParams.toString()}`);
//     // Перезапрос слотов
//     await fetchSlots();
//   };

//   const changeDay = (delta: number) => {
//     const d = new Date(dateISO + "T00:00:00");
//     d.setDate(d.getDate() + delta);
//     const next = d.toISOString().slice(0, 10);
//     setDateISO(next);
//     const urlParams = new URLSearchParams(Array.from(sp.entries()));
//     urlParams.set("dateISO", next);
//     router.replace(`/booking/calendar?${urlParams.toString()}`);
//   };

//   return (
//     <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Выбор времени</h1>

//       {/* Навигация по дням */}
//       <div className="flex items-center gap-2">
//         <button
//           className="rounded border px-3 py-2 hover:bg-gray-50"
//           onClick={() => changeDay(-1)}
//           aria-label="Предыдущий день"
//         >
//           ←
//         </button>
//         <div className="min-w-[180px] text-center font-medium">{fmtVisitDate(new Date(dateISO + "T00:00:00Z"))}</div>
//         <button
//           className="rounded border px-3 py-2 hover:bg-gray-50"
//           onClick={() => changeDay(1)}
//           aria-label="Следующий день"
//         >
//           →
//         </button>

//         <div className="ml-auto text-sm text-gray-500">
//           {serviceIds.length > 0 ? (
//             <span>Услуг: {serviceIds.length}</span>
//           ) : durationMin ? (
//             <span>Длительность: {durationMin} мин</span>
//           ) : null}
//         </div>
//       </div>

//       {/* Требуется выбор мастера */}
//       {mastersToChoose && mastersToChoose.length > 0 && (
//         <div className="rounded-xl border p-4">
//           <div className="mb-2 font-medium">Выберите мастера для заданных услуг:</div>
//           <div className="grid gap-2 sm:grid-cols-2">
//             {mastersToChoose.map(m => (
//               <button
//                 key={m.id}
//                 onClick={() => onPickMaster(m.id)}
//                 className={`rounded border px-3 py-2 text-left hover:bg-gray-50 ${
//                   masterId === m.id ? "border-black" : "border-gray-300"
//                 }`}
//               >
//                 {m.name}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {errorMsg && (
//         <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">{errorMsg}</div>
//       )}

//       {/* Слоты */}
//       <div className="min-h-[120px]">
//         {loading && <div className="text-gray-500">Загрузка свободных слотов…</div>}

//         {!loading && slots && slots.length === 0 && (
//           <div className="text-gray-600">Нет свободных слотов на выбранную дату.</div>
//         )}

//         {!loading && slots && slots.length > 0 && (
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
//             {slots.map((s, idx) => {
//               const start = slotStart(s);
//               const end = slotEnd(s);
//               return (
//                 <button
//                   key={idx}
//                   onClick={() => goNext(start.toISOString())}
//                   className="rounded-xl border px-3 py-2 text-center hover:bg-gray-50"
//                 >
//                   <div className="font-medium">{fmtVisitTime(start)}</div>
//                   <div className="text-xs text-gray-500">до {fmtVisitTime(end)}</div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <div className="flex items-center justify-between">
//         <Link href="/booking/services" className="text-sm text-gray-600 hover:underline">
//           ← Назад к услугам
//         </Link>
//         {masterId && (
//           <div className="text-sm text-gray-500">
//             Мастер: <span className="font-medium">{masterId}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }