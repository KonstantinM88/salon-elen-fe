'use client';

import * as React from 'react';
import Link from 'next/link';
import { JSX } from 'react';

type Service = {
  id: string;
  title: string;
  description?: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string | null;
};

type Group = {
  id: string;
  title: string;
  services: Service[];
};

type Promotion = {
  id: string;
  title: string;
  percent: number;     // 0..100
  isGlobal: boolean;
};

type Payload = {
  groups: Group[];
  promotions: Promotion[];
};

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatMinutes(min: number): string {
  return `${min} мин`;
}

/**
 * Применение самой сильной глобальной скидки к цене.
 * Точечные скидки по услугам можно добавить позже.
 */
function applyBestDiscount(cents: number, promotions: Promotion[]): number {
  const best = promotions
    .filter(p => p.isGlobal && p.percent > 0)
    .reduce<number>((acc, p) => Math.max(acc, p.percent), 0);
  if (!best) return cents;
  const discounted = Math.round(cents * (100 - best) / 100);
  return Math.max(0, discounted);
}

export default function ServicesPage(): JSX.Element {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/booking/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Failed to load services: ${res.status}`);
        const data: Payload = await res.json();
        if (!cancelled) {
          setGroups(data.groups ?? []);
          setPromotions(data.promotions ?? []);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load services';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleService = (id: string): void => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Плоский список и расчеты итогов
  const flatServices: Service[] = React.useMemo(
    () => groups.flatMap(g => g.services),
    [groups],
  );

  const byId: Record<string, Service> = React.useMemo(() => {
    const acc: Record<string, Service> = {};
    for (const s of flatServices) acc[s.id] = s;
    return acc;
  }, [flatServices]);

  const selectedServices: Service[] = React.useMemo(
    () => Array.from(selected).map(id => byId[id]).filter(Boolean),
    [selected, byId],
  );

  const totalDurationMin = React.useMemo(
    () => selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0),
    [selectedServices],
  );

  const totalPriceCents = React.useMemo(
    () =>
      selectedServices.reduce((sum, s) => {
        const base = s.priceCents ?? 0;
        return sum + applyBestDiscount(base, promotions);
      }, 0),
    [selectedServices, promotions],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pb-28">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Выбор услуг</h2>

      {loading && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          Загрузка списка услуг…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Ошибка: {error}
        </div>
      )}

      {!loading && !error && groups.map(group => (
        <section key={group.id} className="mt-6 rounded-xl border border-border bg-card">
          <div className="px-5 py-4 text-base font-semibold">{group.title}</div>
          <ul className="divide-y divide-border">
            {group.services.map(svc => {
              const checked = selected.has(svc.id);
              const base = svc.priceCents ?? 0;
              const withDiscount = applyBestDiscount(base, promotions);
              const hasDiscount = withDiscount !== base;

              return (
                <li key={svc.id} className="px-5 py-4">
                  <label className="flex cursor-pointer items-start gap-4">
                    <input
                      type="checkbox"
                      className="mt-1 size-5 accent-indigo-500"
                      checked={checked}
                      onChange={() => toggleService(svc.id)}
                    />
                    <div className="flex w-full items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{svc.title}</div>
                        {svc.description ? (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {svc.description}
                          </div>
                        ) : null}
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {formatMinutes(svc.durationMin)}
                          {' · '}
                          {hasDiscount ? (
                            <>
                              <span className="mr-2 line-through opacity-70">
                                {formatPriceEUR(base)}
                              </span>
                              <span className="font-semibold text-emerald-500">
                                {formatPriceEUR(withDiscount)}
                              </span>
                            </>
                          ) : (
                            <span>{formatPriceEUR(base)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {/* Нижняя панель с итогом */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Выбрано услуг: <span className="font-medium text-foreground">{selected.size}</span>
            {selected.size > 0 && (
              <>
                {' · '}
                <span>{formatMinutes(totalDurationMin)}</span>
                {' · '}
                <span className="font-medium">{formatPriceEUR(totalPriceCents)}</span>
              </>
            )}
          </div>

          <Link
            href={
              selected.size > 0
                ? `/booking/master?s=${Array.from(selected).map(encodeURIComponent).join('&s=')}`
                : '#'
            }
            prefetch={false}
            aria-disabled={selected.size === 0}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition
              ${selected.size === 0
                ? 'pointer-events-none bg-muted text-muted-foreground'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
          >
            Продолжить
          </Link>
        </div>
      </div>
    </div>
  );
}






//------------28/10
// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getActivePromotionBanner, getServicesFlat } from "../../actions";
// import type { ServicesFlat, ServiceDTO } from "@/lib/types/booking";

// /** Узкий тип-предикат: есть ли у услуги slug */
// function hasSlug(s: ServiceDTO): s is ServiceDTO & { slug: string } {
//   const r: Record<string, unknown> = s as unknown as Record<string, unknown>;
//   return typeof r.slug === "string" && (r.slug as string).length > 0;
// }
// /** Ключ услуги для передачи дальше: slug если есть, иначе id */
// function serviceKey(s: ServiceDTO): string {
//   return hasSlug(s) ? s.slug : s.id;
// }

// export default function ServicesStep() {
//   const [catalog, setCatalog] = useState<ServicesFlat | null>(null);
//   const [banner, setBanner] =
//     useState<{ percent: number; from: string; to: string } | null>(null);
//   const [picked, setPicked] = useState<ServiceDTO | null>(null);

//   useEffect(() => {
//     void (async () => {
//       const s = await getServicesFlat();
//       if (s.ok) setCatalog(s.data);
//       const b = await getActivePromotionBanner();
//       if (b.ok) setBanner(b.data);
//     })();
//   }, []);

//   if (!catalog) {
//     return <p className="text-sm opacity-70">Загрузка услуг…</p>;
//   }

//   return (
//     <div className="space-y-4">
//       {banner && (
//         <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 dark:border-emerald-300/20 dark:bg-emerald-500/10">
//           <div className="text-sm">
//             Акция на все услуги: <b>{banner.percent}%</b> c {banner.from} по {banner.to}
//           </div>
//         </div>
//       )}

//       <PromoBlock
//         promotions={catalog.promotions}
//         selectedId={picked?.id ?? null}
//         onPick={setPicked}
//       />

//       {catalog.categories.map((cat) => (
//         <div
//           key={cat.id}
//           className="rounded-2xl bg-white/70 dark:bg-neutral-800/60 p-4 shadow-sm ring-1 ring-black/5"
//         >
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-medium">{cat.name}</h2>
//           </div>

//           <div className="mt-3 grid gap-3">
//             {cat.children.map((s) => {
//               const checked = picked?.id === s.id;
//               return (
//                 <label
//                   key={s.id}
//                   className="flex items-start gap-3 rounded-xl p-3 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
//                 >
//                   <input
//                     type="radio"
//                     name="service"
//                     className="mt-1 h-5 w-5"
//                     checked={checked}
//                     onChange={() => setPicked(s)}
//                   />
//                   <div className="flex-1">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium">{s.title}</span>
//                       <span className="tabular-nums">
//                         € {((s.priceCents as number) / 100).toFixed(2)}
//                       </span>
//                     </div>
//                     {s.excerpt && <p className="text-sm opacity-70">{s.excerpt}</p>}
//                     <p className="text-xs opacity-60">~ {s.durationMin} мин</p>
//                   </div>
//                 </label>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       <footer className="sticky bottom-2 z-10">
//         <div className="flex items-center justify-between rounded-2xl bg-black text-white px-4 py-3 shadow-lg">
//           <div className="text-sm space-y-0.5">
//             <div className="font-semibold">
//               {picked ? picked.title : "Выберите услугу"}
//             </div>
//             {picked && (
//               <>
//                 <div className="opacity-90">
//                   Цена: € {((picked.priceCents as number) / 100).toFixed(2)}
//                 </div>
//                 <div className="opacity-80">~ {picked.durationMin} минут</div>
//               </>
//             )}
//           </div>

//           {picked ? (
//             <Link
//               href={{
//                 pathname: "/booking/calendar", // важно: без (steps)
//                 query: {
//                   s: serviceKey(picked),        // slug если есть, иначе id
//                   m: picked.durationMin,        // длительность
//                 },
//               }}
//               className="rounded-full bg-white text-black px-5 py-2 font-medium"
//             >
//               Выбрать время
//             </Link>
//           ) : (
//             <button
//               disabled
//               className="rounded-full bg-white/30 text-white/70 px-5 py-2"
//             >
//               Выбрать время
//             </button>
//           )}
//         </div>
//       </footer>
//     </div>
//   );
// }

// function PromoBlock({
//   promotions,
//   selectedId,
//   onPick,
// }: {
//   promotions: ServiceDTO[];
//   selectedId: string | null;
//   onPick: (s: ServiceDTO) => void;
// }) {
//   if (!promotions.length) return null;
//   return (
//     <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-300/20 dark:bg-amber-500/10">
//       <h2 className="text-lg font-semibold">Акции</h2>
//       <div className="mt-2 grid gap-3">
//         {promotions.map((p) => {
//           const checked = selectedId === p.id;
//           return (
//             <label
//               key={p.id}
//               className="flex items-start gap-3 rounded-xl p-3 hover:bg-amber-100/50 dark:hover:bg-amber-100/10"
//             >
//               <input
//                 type="radio"
//                 name="promo-service"
//                 className="mt-1 h-5 w-5"
//                 checked={checked}
//                 onChange={() => onPick(p)}
//               />
//               <div className="flex-1">
//                 <div className="flex items-center justify-between">
//                   <span className="font-medium">{p.title}</span>
//                   <span className="tabular-nums">
//                     € {((p.priceCents as number) / 100).toFixed(2)}
//                   </span>
//                 </div>
//                 {p.excerpt && <p className="text-sm opacity-70">{p.excerpt}</p>}
//                 <p className="text-xs opacity-60">~ {p.durationMin} мин</p>
//               </div>
//             </label>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getActivePromotionBanner, getServicesFlat } from "../../actions";
// import type { ServicesFlat, ServiceDTO, MoneyCents } from "@/lib/types/booking";

// const toMoney = (n: number): MoneyCents => n as MoneyCents;

// /** Узкий тип-предикат: есть ли у услуги slug */
// function hasSlug(s: ServiceDTO): s is ServiceDTO & { slug: string } {
//   const r: Record<string, unknown> = s as unknown as Record<string, unknown>;
//   return typeof r.slug === "string" && (r.slug as string).length > 0;
// }
// /** Ключ услуги для передачи дальше: slug если есть, иначе id */
// function serviceKey(s: ServiceDTO): string {
//   return hasSlug(s) ? s.slug : s.id;
// }

// export default function ServicesStep() {
//   const [catalog, setCatalog] = useState<ServicesFlat | null>(null);
//   const [banner, setBanner] = useState<{ percent: number; from: string; to: string } | null>(null);
//   const [picked, setPicked] = useState<ServiceDTO | null>(null);

//   useEffect(() => {
//     void (async () => {
//       const s = await getServicesFlat();
//       if (s.ok) setCatalog(s.data);
//       const b = await getActivePromotionBanner();
//       if (b.ok) setBanner(b.data);
//     })();
//   }, []);

//   if (!catalog) {
//     return <p className="text-sm opacity-70">Загрузка услуг…</p>;
//   }

//   return (
//     <div className="space-y-4">
//       {banner && (
//         <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 dark:border-emerald-300/20 dark:bg-emerald-500/10">
//           <div className="text-sm">
//             Акция на все услуги: <b>{banner.percent}%</b> c {banner.from} по {banner.to}
//           </div>
//         </div>
//       )}

//       <PromoBlock
//         promotions={catalog.promotions}
//         selectedId={picked?.id ?? null}
//         onPick={setPicked}
//       />

//       {catalog.categories.map((cat) => (
//         <div
//           key={cat.id}
//           className="rounded-2xl bg-white/70 dark:bg-neutral-800/60 p-4 shadow-sm ring-1 ring-black/5"
//         >
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-medium">{cat.name}</h2>
//           </div>

//           <div className="mt-3 grid gap-3">
//             {cat.children.map((s) => {
//               const checked = picked?.id === s.id;
//               return (
//                 <label
//                   key={s.id}
//                   className="flex items-start gap-3 rounded-xl p-3 hover:bg-black/[.03] dark:hover:bg-white/[.05]"
//                 >
//                   <input
//                     type="radio"
//                     name="service"
//                     className="mt-1 h-5 w-5"
//                     checked={checked}
//                     onChange={() => setPicked(s)}
//                   />
//                   <div className="flex-1">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium">{s.title}</span>
//                       <span className="tabular-nums">€ {((s.priceCents as number) / 100).toFixed(2)}</span>
//                     </div>
//                     {s.excerpt && <p className="text-sm opacity-70">{s.excerpt}</p>}
//                     <p className="text-xs opacity-60">~ {s.durationMin} мин</p>
//                   </div>
//                 </label>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       <footer className="sticky bottom-2 z-10">
//         <div className="flex items-center justify-between rounded-2xl bg-black text-white px-4 py-3 shadow-lg">
//           <div className="text-sm space-y-0.5">
//             <div className="font-semibold">
//               {picked ? picked.title : "Выберите услугу"}
//             </div>
//             {picked && (
//               <>
//                 <div className="opacity-90">
//                   Цена: € {((picked.priceCents as number) / 100).toFixed(2)}
//                 </div>
//                 <div className="opacity-80">~ {picked.durationMin} минут</div>
//               </>
//             )}
//           </div>

//           {picked ? (
//             <Link
//               href={{
//                 pathname: "/booking/calendar",
//                 query: {
//                   // критично: передаем slug если он есть, иначе id
//                   s: serviceKey(picked),
//                   m: picked.durationMin,
//                 },
//               }}
//               className="rounded-full bg-white text-black px-5 py-2 font-medium"
//             >
//               Выбрать время
//             </Link>
//           ) : (
//             <button disabled className="rounded-full bg-white/30 text-white/70 px-5 py-2">
//               Выбрать время
//             </button>
//           )}
//         </div>
//       </footer>
//     </div>
//   );
// }

// function PromoBlock({
//   promotions,
//   selectedId,
//   onPick,
// }: {
//   promotions: ServiceDTO[];
//   selectedId: string | null;
//   onPick: (s: ServiceDTO) => void;
// }) {
//   if (!promotions.length) return null;
//   return (
//     <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-300/20 dark:bg-amber-500/10">
//       <h2 className="text-lg font-semibold">Акции</h2>
//       <div className="mt-2 grid gap-3">
//         {promotions.map((p) => {
//           const checked = selectedId === p.id;
//           return (
//             <label
//               key={p.id}
//               className="flex items-start gap-3 rounded-xl p-3 hover:bg-amber-100/50 dark:hover:bg-amber-100/10"
//             >
//               <input
//                 type="radio"
//                 name="promo-service"
//                 className="mt-1 h-5 w-5"
//                 checked={checked}
//                 onChange={() => onPick(p)}
//               />
//               <div className="flex-1">
//                 <div className="flex items-center justify-between">
//                   <span className="font-medium">{p.title}</span>
//                   <span className="tabular-nums">€ {((p.priceCents as number) / 100).toFixed(2)}</span>
//                 </div>
//                 {p.excerpt && <p className="text-sm opacity-70">{p.excerpt}</p>}
//                 <p className="text-xs opacity-60">~ {p.durationMin} мин</p>
//               </div>
//             </label>
//           );
//         })}
//       </div>
//     </div>
//   );
// }





//-----------работал до нового чата
// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getActivePromotionBanner, getServicesFlat } from "../../actions";
// import type { Basket, MoneyCents, ServicesFlat, ServiceDTO } from "@/lib/types/booking";

// const toMoney = (n: number): MoneyCents => n as MoneyCents;

// export default function ServicesStep() {
//   const [catalog, setCatalog] = useState<ServicesFlat | null>(null);
//   const [banner, setBanner] = useState<{ percent: number; from: string; to: string } | null>(null);

//   const [basket, setBasket] = useState<Basket>({
//     serviceIds: [],
//     totalMin: 0,
//     totalCents: toMoney(0),
//     discountCents: toMoney(0),
//     payableCents: toMoney(0),
//   });

//   useEffect(() => {
//     (async () => {
//       const res = await getServicesFlat();
//       if (res.ok) setCatalog(res.data);
//       const b = await getActivePromotionBanner();
//       if (b.ok) setBanner(b.data);
//     })();
//   }, []);

//   const recalc = (ids: string[]) => {
//     if (!catalog) return { discount: 0, payable: 0, sum: 0, minutes: 0 };

//     const selected: ServiceDTO[] = catalog.allServices.filter(s => ids.includes(s.id));
//     const sum = selected.reduce((a, s) => a + (s.priceCents as number), 0);
//     const minutes = selected.reduce((a, s) => a + s.durationMin, 0);

//     // приоритет: индивидуальная скидка клиента (если будет на бэке) > глобальная > точечная
//     const global = catalog.activeGlobalPercent ?? 0;
//     const map = new Map<string, number>(catalog.servicePercents ?? []);

//     let discount = 0;
//     for (const s of selected) {
//       const p = Math.max(global, map.get(s.id) ?? 0);
//       discount += Math.floor(((s.priceCents as number) * p) / 100);
//     }
//     return { discount, payable: sum - discount, sum, minutes };
//   };

//   const toggle = (id: string) => {
//     setBasket((prev) => {
//       const has = prev.serviceIds.includes(id);
//       let serviceIds = has ? prev.serviceIds.filter(x => x !== id) : [...prev.serviceIds, id];

//       // лимит 2 услуги (как обсуждали)
//       if (!has && serviceIds.length > 2) {
//         serviceIds = serviceIds.slice(0, 2);
//       }

//       const { discount, payable, sum, minutes } = recalc(serviceIds);
//       return {
//         serviceIds,
//         totalMin: minutes,
//         totalCents: toMoney(sum),
//         discountCents: toMoney(discount),
//         payableCents: toMoney(payable),
//       };
//     });
//   };

//   const canProceed = basket.serviceIds.length > 0;

//   if (!catalog) return <p className="text-sm opacity-70">Загрузка услуг…</p>;

//   return (
//     <div className="space-y-4">
//       {banner && (
//         <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50 p-4 dark:border-emerald-300/20 dark:bg-emerald-500/10">
//           <div className="text-sm">
//             Акция на все услуги: <b>{banner.percent}%</b> c {banner.from} по {banner.to}
//           </div>
//         </div>
//       )}

//       <PromoBlock promotions={catalog.promotions} selected={basket.serviceIds} onToggle={toggle} />

//       {catalog.categories.map((cat) => (
//         <div key={cat.id} className="rounded-2xl bg-white/70 dark:bg-neutral-800/60 p-4 shadow-sm ring-1 ring-black/5">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-medium">{cat.name}</h2>
//           </div>
//           <div className="mt-3 grid gap-3">
//             {cat.children.map((s) => (
//               <label key={s.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-black/[.03] dark:hover:bg-white/[.05]">
//                 <input
//                   type="checkbox"
//                   className="mt-1 h-5 w-5"
//                   checked={basket.serviceIds.includes(s.id)}
//                   onChange={() => toggle(s.id)}
//                 />
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between">
//                     <span className="font-medium">{s.title}</span>
//                     <span className="tabular-nums">€ {((s.priceCents as number) / 100).toFixed(2)}</span>
//                   </div>
//                   <p className="text-sm opacity-70">{s.excerpt ?? ""}</p>
//                   <p className="text-xs opacity-60">~ {s.durationMin} мин</p>
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//       ))}

//       <footer className="sticky bottom-2 z-10">
//         <div className="flex items-center justify-between rounded-2xl bg-black text-white px-4 py-3 shadow-lg">
//           <div className="text-sm space-y-0.5">
//             <div className="font-semibold">Сумма: € {((basket.totalCents as number) / 100).toFixed(2)}</div>
//             <div className="opacity-90">Скидка: −€ {((basket.discountCents as number) / 100).toFixed(2)}</div>
//             <div className="opacity-100">К оплате: € {((basket.payableCents as number) / 100).toFixed(2)}</div>
//             <div className="opacity-80">~ {basket.totalMin} минут</div>
//           </div>
//           {canProceed ? (
//             <Link
//               href={{ pathname: "/booking/master", query: { s: basket.serviceIds.join(","), m: basket.totalMin } }}
//               className="rounded-full bg-white text-black px-5 py-2 font-medium"
//             >
//               Дальше
//             </Link>
//           ) : (
//             <button disabled className="rounded-full bg-white/30 text-white/70 px-5 py-2">Дальше</button>
//           )}
//         </div>
//       </footer>
//     </div>
//   );
// }

// function PromoBlock({
//   promotions,
//   selected,
//   onToggle,
// }: {
//   promotions: ServiceDTO[];
//   selected: string[];
//   onToggle: (id: string) => void;
// }) {
//   if (!promotions.length) return null;
//   return (
//     <div className="rounded-2xl border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-300/20 dark:bg-amber-500/10">
//       <h2 className="text-lg font-semibold">Акции</h2>
//       <div className="mt-2 grid gap-3">
//         {promotions.map((p) => (
//           <label key={p.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-amber-100/50 dark:hover:bg-amber-100/10">
//             <input
//               type="checkbox"
//               className="mt-1 h-5 w-5"
//               checked={selected.includes(p.id)}
//               onChange={() => onToggle(p.id)}
//             />
//             <div className="flex-1">
//               <div className="flex items-center justify-between">
//                 <span className="font-medium">{p.title}</span>
//                 <span className="tabular-nums">€ {((p.priceCents as number) / 100).toFixed(2)}</span>
//               </div>
//               <p className="text-sm opacity-70">{p.excerpt ?? ""}</p>
//               <p className="text-xs opacity-60">~ {p.durationMin} мин</p>
//             </div>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// }
