// src/app/booking/(steps)/master/page.tsx
import { Suspense } from 'react';
import MasterStepClient from './MasterStepClient';

// Параметры сегмента: отключаем кэш/ISR
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';

export default function MasterStepPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Выбор мастера</h2>

      {/* MasterStepClient — клиентский компонент, рендерится без SSR */}
      <Suspense
        fallback={
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            Загрузка доступных мастеров…
          </div>
        }
      >
        <MasterStepClient />
      </Suspense>
    </div>
  );
}






// // src/app/booking/(steps)/master/page.tsx
// 'use client';

// import * as React from 'react';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
// import type { JSX } from 'react';

// type Master = { id: string; name: string };

// type MastersPayload = {
//   masters: Master[];
//   defaultMasterId: string | null;
// };

// function useSelectedServiceIds(): string[] {
//   const params = useSearchParams();
//   // Берём все ?s=<id>, удаляем пустые и дубликаты, сохраняем порядок первого вхождения
//   return React.useMemo(() => {
//     const raw = new URLSearchParams(params.toString()).getAll('s');
//     const seen = new Set<string>();
//     const result: string[] = [];
//     for (const v of raw) {
//       const id = v.trim();
//       if (!id || seen.has(id)) continue;
//       seen.add(id);
//       result.push(id);
//     }
//     return result;
//   }, [params]);
// }

// function isAbortError(err: unknown): boolean {
//   return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError';
// }

// function toQueryString(serviceIds: string[], masterId: string): string {
//   const qs = new URLSearchParams();
//   for (const s of serviceIds) qs.append('s', s);
//   qs.set('m', masterId);
//   return qs.toString();
// }

// export default function MasterStepPage(): JSX.Element {
//   const serviceIds = useSelectedServiceIds();
//   const key = React.useMemo(() => serviceIds.join(','), [serviceIds]);

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [selectedId, setSelectedId] = React.useState<string | null>(null);
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [error, setError] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     const controller = new AbortController();
//     let mounted = true;

//     async function load(): Promise<void> {
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = key ? `?serviceIds=${encodeURIComponent(key)}` : '';
//         const res = await fetch(`/api/masters${qs}`, {
//           method: 'GET',
//           signal: controller.signal,
//           cache: 'no-store',
//         });

//         if (!res.ok) {
//           throw new Error(`Failed to load masters: ${res.status}`);
//         }

//         const data: MastersPayload = await res.json();

//         if (!mounted) return;

//         const list = Array.isArray(data.masters) ? data.masters : [];
//         setMasters(list);
//         setSelectedId(data.defaultMasterId ?? (list[0]?.id ?? null));
//       } catch (e) {
//         if (!mounted || isAbortError(e)) return;
//         setError(e instanceof Error ? e.message : 'Failed to load masters');
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     void load();

//     return () => {
//       mounted = false;
//       controller.abort();
//     };
//   }, [key]);

//   const nextHref =
//     selectedId && serviceIds.length > 0
//       ? `/booking/calendar?${toQueryString(serviceIds, selectedId)}`
//       : '#';

//   return (
//     <div className="mx-auto max-w-3xl px-4 pb-24">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Выбор мастера</h2>

//       {loading && (
//         <div className="mt-6 rounded-lg border border-border bg-card p-4">
//           Загружаем доступных мастеров…
//         </div>
//       )}

//       {error && (
//         <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//           Ошибка: {error}
//         </div>
//       )}

//       {!loading && !error && masters.length === 0 && (
//         <div className="mt-6 rounded-lg border border-border bg-card p-4">
//           Нет мастеров, выполняющих выбранный набор услуг. Вернитесь и скорректируйте выбор.
//         </div>
//       )}

//       {!loading && !error && masters.length > 0 && (
//         <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
//           {masters.map(m => {
//             const active = m.id === selectedId;
//             return (
//               <li key={m.id}>
//                 <button
//                   type="button"
//                   onClick={() => setSelectedId(m.id)}
//                   className={[
//                     'w-full rounded-xl border px-4 py-3 text-left transition',
//                     active
//                       ? 'border-indigo-500 ring-2 ring-indigo-200'
//                       : 'border-border hover:border-indigo-300',
//                   ].join(' ')}
//                   aria-pressed={active}
//                 >
//                   <div className="font-medium">{m.name}</div>
//                   <div className="mt-1 text-sm text-muted-foreground">
//                     Доступен для выбранных услуг
//                   </div>
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       )}

//       <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
//           <Link
//             href="/booking/services"
//             className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Назад
//           </Link>

//           <Link
//             href={nextHref}
//             aria-disabled={!selectedId || serviceIds.length === 0}
//             className={[
//               'rounded-xl px-5 py-2 text-sm font-semibold transition',
//               !selectedId || serviceIds.length === 0
//                 ? 'pointer-events-none bg-muted text-muted-foreground'
//                 : 'bg-indigo-600 text-white hover:bg-indigo-500',
//             ].join(' ')}
//           >
//             Продолжить
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }






// "use client";

// import { Suspense, useEffect, useMemo, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export const dynamic = "force-dynamic";

// type MasterDTO = {
//   id: string;
//   name: string;
//   canDoAll?: boolean;
//   nextFreeDate?: string | null;
// };

// type MastersResponse =
//   | { ok: true; data?: { masters?: MasterDTO[] } | MasterDTO[] }
//   | { ok: false; error: string };

// export default function MasterPage() {
//   return (
//     <Suspense fallback={<div className="px-4 py-6 text-sm text-white/60">Загрузка мастеров…</div>}>
//       <MasterInner />
//     </Suspense>
//   );
// }

// function MasterInner() {
//   const router = useRouter();
//   const sp = useSearchParams();

//   // В URL ожидаем:
//   // s — ИД или слаг услуги. Для API /api/appointments нам удобнее слаг.
//   // m — длительность (мин).
//   const serviceKey = useMemo(() => (sp.get("s") ?? "").trim(), [sp]);
//   const durationMin = useMemo(() => Number(sp.get("m") ?? "0"), [sp]);

//   const [masters, setMasters] = useState<MasterDTO[] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     let aborted = false;
//     async function run() {
//       setBusy(true);
//       setError(null);
//       try {
//         if (!serviceKey || !Number.isFinite(durationMin) || durationMin <= 0) {
//           setMasters([]);
//           return;
//         }

//         // Совместимо с текущим бэком: POST на /booking/master?s=...&m=...
//         const qs = new URLSearchParams();
//         qs.set("s", serviceKey);
//         qs.set("m", String(durationMin));

//         const res = await fetch(`/booking/master?${qs.toString()}`, {
//           method: "POST",
//           cache: "no-store",
//         });
//         const json: MastersResponse = await res.json();

//         if (!("ok" in json) || !json.ok) {
//           throw new Error("error" in json ? json.error : "Не удалось загрузить мастеров");
//         }

//         const dataBlock = json.data;
//         const list: MasterDTO[] = Array.isArray(dataBlock)
//           ? dataBlock
//           : dataBlock?.masters ?? [];

//         if (!aborted) setMasters(list);
//       } catch (e) {
//         if (!aborted) setError(e instanceof Error ? e.message : "Ошибка загрузки");
//       } finally {
//         if (!aborted) setBusy(false);
//       }
//     }
//     run();
//     return () => {
//       aborted = true;
//     };
//   }, [serviceKey, durationMin]);

//   const selectMaster = (mid: string) => {
//     const q = new URLSearchParams(Array.from(sp.entries()));
//     q.set("masterId", mid);
//     // Следующий шаг — выбор слота на календаре / booking/calendar (как у тебя)
//     router.push(`/booking/calendar?${q.toString()}`);
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl font-semibold">Выберите мастера</h1>

//       {!serviceKey || durationMin <= 0 ? (
//         <div className="text-sm text-red-600">Сначала выберите услуги (и длительность).</div>
//       ) : null}

//       {error && <div className="text-sm text-red-600">{error}</div>}

//       {!error && (masters === null || busy) && (
//         <div className="text-sm text-white/60">Загрузка…</div>
//       )}

//       {!error && masters && masters.length === 0 && (
//         <div className="text-sm text-white/60">Нет подходящих мастеров.</div>
//       )}

//       {!error && masters && masters.length > 0 && (
//         <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//           {masters.map((m) => (
//             <li
//               key={m.id}
//               className="rounded-2xl ring-1 ring-black/10 bg-black/5 p-4 flex items-center justify-between gap-3"
//             >
//               <div className="min-w-0">
//                 <div className="font-medium">{m.name}</div>
//                 {m.nextFreeDate ? (
//                   <div className="text-xs text-white/60">Ближайшая дата: {m.nextFreeDate}</div>
//                 ) : null}
//               </div>
//               <button
//                 onClick={() => selectMaster(m.id)}
//                 className="shrink-0 rounded-full bg-black text-white px-4 py-2"
//               >
//                 Выбрать
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );






// // src/app/booking/(steps)/master/page.tsx
// 'use client';

// import { JSX, useEffect, useMemo, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// type Master = { id: string; name: string };

// type SlotsResponse<TMeta = unknown> = {
//   ok: boolean;
//   slots: string[];
//   meta?: TMeta;
//   error?: string;
// };

// function isUuidLike(s: string): boolean {
//   return /^[0-9a-f-]{24,}$/i.test(s) || /^cmg/i.test(s);
// }

// async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
//   const res = await fetch(url, { cache: 'no-store', ...init });
//   const ct = res.headers.get('content-type') ?? '';
//   const text = await res.text();

//   if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
//   if (!ct.includes('application/json')) {
//     throw new Error(`Expected JSON, got: ${ct}. Body: ${text.slice(0, 200)}...`);
//   }
//   return JSON.parse(text) as T;
// }

// export default function BookingMasterPage(): JSX.Element {
//   const router = useRouter();
//   const sp = useSearchParams();

//   const s = sp.get('s') ?? '';
//   const m = Number(sp.get('m') ?? '0');

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [mastersLoading, setMastersLoading] = useState<boolean>(false);
//   const [mastersError, setMastersError] = useState<string | null>(null);

//   const [selectedMasterId, setSelectedMasterId] = useState<string>('');
//   const [dateISO, setDateISO] = useState<string>(() => {
//     const d = new Date();
//     d.setDate(d.getDate() + 1);
//     return d.toISOString().slice(0, 10);
//   });

//   const [slots, setSlots] = useState<string[]>([]);
//   const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
//   const [slotsError, setSlotsError] = useState<string | null>(null);

//   const serviceParam = useMemo<string>(() => (isUuidLike(s) ? s : s || 'manicure-classic'), [s]);

//   // загрузка мастеров
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         setMastersLoading(true);
//         setMastersError(null);

//         const url = isUuidLike(serviceParam)
//           ? '/api/masters'
//           : `/api/masters?serviceSlug=${encodeURIComponent(serviceParam)}`;
//         const list = await fetchJson<Master[]>(url);
//         if (cancelled) return;

//         setMasters(list);
//         if (list.length > 0 && !selectedMasterId) setSelectedMasterId(list[0].id);
//       } catch (err: unknown) {
//         if (!cancelled) {
//           setMastersError(err instanceof Error ? err.message : 'Не удалось загрузить мастеров');
//         }
//       } finally {
//         if (!cancelled) setMastersLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [serviceParam]);

//   // загрузка слотов
//   const loadSlots = async (): Promise<void> => {
//     if (!selectedMasterId || !serviceParam || !dateISO || !m) return;

//     setSlotsLoading(true);
//     setSlotsError(null);
//     setSlots([]);

//     try {
//       const url =
//         `/api/availability?serviceSlug=${encodeURIComponent(serviceParam)}` +
//         `&masterId=${encodeURIComponent(selectedMasterId)}` +
//         `&dateISO=${encodeURIComponent(dateISO)}` +
//         `&durationMin=${encodeURIComponent(String(m))}&debug=1`;

//       const data = await fetchJson<SlotsResponse>(url);
//       if (!data.ok) throw new Error(data.error ?? 'Не удалось получить свободные слоты');
//       setSlots(Array.isArray(data.slots) ? data.slots : []);
//     } catch (err: unknown) {
//       setSlotsError(err instanceof Error ? err.message : 'Ошибка загрузки слотов');
//     } finally {
//       setSlotsLoading(false);
//     }
//   };

//   useEffect(() => {
//     void loadSlots();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedMasterId, dateISO, serviceParam, m]);

//   // переход на следующий шаг
//   const goNext = (iso: string): void => {
//     const url =
//       `/booking/client` +
//       `?s=${encodeURIComponent(serviceParam)}` +
//       `&m=${encodeURIComponent(String(m))}` +
//       `&masterId=${encodeURIComponent(selectedMasterId)}` +
//       `&startAt=${encodeURIComponent(iso)}`;
//     router.push(url);
//   };

//   return (
//     <div className="mx-auto max-w-3xl p-4 space-y-6">
//       <h1 className="text-2xl font-semibold">Онлайн-запись</h1>

//       {/* Параметры */}
//       <div className="grid gap-4 sm:grid-cols-3">
//         <div className="col-span-2">
//           <label className="block text-sm mb-1">Мастер</label>
//           {mastersLoading ? (
//             <div className="text-sm opacity-70">Загрузка мастеров…</div>
//           ) : mastersError ? (
//             <div className="text-sm text-red-500">{mastersError}</div>
//           ) : (
//             <select
//               className="w-full rounded border bg-transparent p-2"
//               value={selectedMasterId}
//               onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMasterId(e.target.value)}
//             >
//               {masters.map((m) => (
//                 <option key={m.id} value={m.id}>
//                   {m.name}
//                 </option>
//               ))}
//               {masters.length === 0 && <option>Мастера не найдены</option>}
//             </select>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm mb-1">Дата</label>
//           <input
//             type="date"
//             value={dateISO}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateISO(e.target.value)}
//             className="w-full rounded border bg-transparent p-2"
//           />
//         </div>
//       </div>

//       {/* Слоты */}
//       <div className="rounded-lg border p-4">
//         <div className="mb-3 flex items-center justify-between">
//           <div className="font-medium">Свободное время</div>
//           <button className="rounded border px-3 py-1 text-sm" onClick={() => void loadSlots()} disabled={slotsLoading}>
//             Обновить
//           </button>
//         </div>

//         {slotsLoading && <div className="text-sm opacity-70">Загрузка слотов…</div>}
//         {slotsError && <div className="text-sm text-red-500">{slotsError}</div>}

//         {!slotsLoading && !slotsError && (
//           <>
//             {slots.length === 0 ? (
//               <div className="text-sm opacity-70">Нет свободных слотов на выбранную дату</div>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {slots.map((iso) => {
//                   const dt = new Date(iso);
//                   const label = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//                   return (
//                     <button
//                       key={iso}
//                       className="rounded-md border px-3 py-1 text-sm hover:bg-white/5"
//                       onClick={() => goNext(iso)}
//                     >
//                       {label}
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Диагностика */}
//       <div className="rounded-md border p-3 text-xs opacity-70">
//         <div>
//           service: <code>{serviceParam}</code>
//         </div>
//         <div>
//           duration: <code>{m}</code> мин
//         </div>
//         <div>
//           master: <code>{selectedMasterId || '—'}</code>
//         </div>
//         <div>
//           dateISO: <code>{dateISO}</code>
//         </div>
//       </div>
//     </div>
//   );
// }





// // src/app/booking/(steps)/master/page.tsx
// "use client";

// import { Suspense, useEffect, useMemo, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export const dynamic = "force-dynamic";

// type MasterDTO = { id: string; name: string; canDoAll?: boolean; nextFreeDate?: string | null };
// type RespOk = { ok: true; data?: { masters?: MasterDTO[] } | MasterDTO[] };
// type RespErr = { ok: false; error: string };

// export default function MasterPage() {
//   return (
//     <Suspense fallback={<div className="px-4 py-6 text-sm text-white/60">Загрузка мастеров…</div>}>
//       <MasterInner />
//     </Suspense>
//   );
// }

// function MasterInner() {
//   const router = useRouter();
//   const sp = useSearchParams();

//   // услуги (список id или slug — как уже передаёшь между шагами)
//   const serviceIds = useMemo(
//     () =>
//       (sp.get("s") ?? "")
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean),
//     [sp]
//   );
//   const durationMin = Number(sp.get("m") ?? "0");

//   const [masters, setMasters] = useState<MasterDTO[] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     let abort = false;
//     async function run() {
//       setBusy(true);
//       setError(null);
//       try {
//         if (!serviceIds.length || !Number.isFinite(durationMin) || durationMin <= 0) {
//           setMasters([]);
//           return;
//         }

//         // Совместимо с твоим текущим беком (судя по логам — POST на /booking/master?s=...&m=...)
//         const qs = new URLSearchParams();
//         qs.set("s", serviceIds.join(","));
//         qs.set("m", String(durationMin));

//         const res = await fetch(`/booking/master?${qs.toString()}`, {
//           method: "POST",
//           cache: "no-store",
//         });

//         const json = (await res.json()) as RespOk | RespErr;

//         if (!("ok" in json) || !json.ok) {
//           const msg = "error" in json ? json.error : "Не удалось загрузить мастеров";
//           throw new Error(msg);
//         }

//         // Бэки иногда присылают массив напрямую или завернутый в {data:{masters}}
//         const dataBlock = (json as RespOk).data;
//         const list: MasterDTO[] = Array.isArray(dataBlock)
//           ? dataBlock
//           : dataBlock?.masters ?? [];

//         if (!abort) setMasters(list);
//       } catch (e) {
//         if (!abort) setError(e instanceof Error ? e.message : "Ошибка загрузки");
//       } finally {
//         if (!abort) setBusy(false);
//       }
//     }
//     run();
//     return () => {
//       abort = true;
//     };
//   }, [serviceIds, durationMin]);

//   const selectMaster = (mid: string) => {
//     const q = new URLSearchParams(Array.from(sp.entries()));
//     q.set("mid", mid);
//     router.push(`/booking/calendar?${q.toString()}`);
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl font-semibold">Выберите мастера</h1>

//       {!serviceIds.length || durationMin <= 0 ? (
//         <div className="text-sm text-red-600">
//           Сначала выберите услуги (и длительность).
//         </div>
//       ) : null}

//       {error && <div className="text-sm text-red-600">{error}</div>}

//       {!error && (masters === null || busy) && (
//         <div className="text-sm text-white/60">Загрузка…</div>
//       )}

//       {!error && masters && masters.length === 0 && (
//         <div className="text-sm text-white/60">Нет подходящих мастеров.</div>
//       )}

//       {!error && masters && masters.length > 0 && (
//         <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//           {masters.map((m) => (
//             <li
//               key={m.id}
//               className="rounded-2xl ring-1 ring-black/10 bg-black/5 p-4 flex items-center justify-between gap-3"
//             >
//               <div className="min-w-0">
//                 <div className="font-medium">{m.name}</div>
//                 {m.nextFreeDate ? (
//                   <div className="text-xs text-white/60">
//                     Ближайшая дата: {m.nextFreeDate}
//                   </div>
//                 ) : null}
//               </div>
//               <button
//                 onClick={() => selectMaster(m.id)}
//                 className="shrink-0 rounded-full bg-black text-white px-4 py-2"
//               >
//                 Выбрать
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
