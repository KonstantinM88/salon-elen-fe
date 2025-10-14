// src/app/booking/widget.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/** ---------- TZ helpers (Europe/Berlin) ---------- */

const ORG_TZ: string =
  process.env.NEXT_PUBLIC_ORG_TZ ?? "Europe/Berlin";

/** Смещение TZ (мс) для заданного UTC-инстанта. Положительное для TZ восточнее UTC. */
function tzOffsetMs(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;

  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUTC - at.getTime(); // ключевой знак
}

/** UTC-время локальной полуночи организации для указанной даты (YYYY-MM-DD) */
function orgDayStart(dateISO: string, tz: string = ORG_TZ): Date {
  const utcMidnight = new Date(`${dateISO}T00:00:00Z`);
  const offset = tzOffsetMs(tz, utcMidnight);
  // локальная полночь (в координатах UTC)
  return new Date(utcMidnight.getTime() - offset);
}

/** Локальные минуты от полуночи (0..1439) по ISO-времени слота */
function minsFromIso(dateISO: string, iso: string, tz: string = ORG_TZ): number {
  const day0 = orgDayStart(dateISO, tz).getTime();
  const t = new Date(iso).getTime();
  return Math.round((t - day0) / 60_000);
}

/** ---------- Типы ---------- */

type ApiSlotRaw = {
  start: string; // ISO от API
  end: string;   // ISO от API
};

type Slot = ApiSlotRaw & {
  startMin: number; // вычисляем на клиенте
  endMin: number;   // вычисляем на клиенте
};

type Props = {
  serviceSlug: string;
  dateISO: string; // YYYY-MM-DD
  masterId?: string;
};

export default function BookingWidget({ serviceSlug, dateISO, masterId }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [picked, setPicked] = useState<Slot | null>(null);

  // Форматтер времени для кнопок
  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: ORG_TZ,
      }),
    []
  );

  useEffect(() => {
    setPicked(null); // сбрасываем выбор при смене параметров

    const q = new URLSearchParams({
      serviceSlug,
      dateISO,
      ...(masterId ? { masterId } : {}),
    });

    (async () => {
      const r = await fetch(`/api/availability?${q.toString()}`, { cache: "no-store" });
      const raw: ApiSlotRaw[] = await r.json();

      // Преобразуем к слоту с минутами (совместимо со старым сервером)
      const mapped: Slot[] = raw.map((s) => {
        const startMin = minsFromIso(dateISO, s.start);
        const endMin = minsFromIso(dateISO, s.end);
        return { ...s, startMin, endMin };
      });

      setSlots(mapped);
    })().catch(console.error);
  }, [serviceSlug, dateISO, masterId]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {slots.map((s) => {
          const label = timeFmt.format(new Date(s.start));
          const isPicked = picked?.start === s.start;

          return (
            <button
              key={`${s.start}-${s.end}`}
              onClick={() => setPicked(s)}
              className={`rounded px-3 py-2 border transition ${
                isPicked ? "bg-sky-600 text-white" : "bg-white text-black"
              }`}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      {picked && (
        <form action="/booking" method="post" className="mt-3 space-y-2">
          {/* обязательные скрытые поля для сервера (совместимость) */}
          <input type="hidden" name="serviceSlug" value={serviceSlug} />
          <input type="hidden" name="dateISO" value={dateISO} />
          <input type="hidden" name="startMin" value={picked.startMin} />
          <input type="hidden" name="endMin" value={picked.endMin} />
          {masterId && <input type="hidden" name="masterId" value={masterId} />}

          {/* дополнительно передаём ISO — если на сервере уже есть поддержка ISO, он сможет их использовать */}
          <input type="hidden" name="startISO" value={picked.start} />
          <input type="hidden" name="endISO" value={picked.end} />

          {/* Остальные поля формы (имя/телефон/email/др и т.д.) должны быть выше по верстке формы страницы */}
          <button type="submit" className="rounded bg-emerald-600 text-white px-4 py-2">
            Записаться на {timeFmt.format(new Date(picked.start))}
          </button>
        </form>
      )}
    </div>
  );
}







// // src/app/booking/widget.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { format } from "date-fns";
// import { ru } from "date-fns/locale"; // ← правильный импорт локали

// type Service = { slug: string; name: string; durationMin: number };
// type Slot = { start: string; end: string };
// type Props = { services: Service[] };

// export default function BookingWidget({ services }: Props) {
//   const [service, setService] = useState<Service | null>(services[0] ?? null);
//   const [dateISO, setDateISO] = useState<string>(format(new Date(), "yyyy-MM-dd"));
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [loading, setLoading] = useState(false);

//   const canQuery = useMemo(() => Boolean(service && dateISO), [service, dateISO]);

//   useEffect(() => {
//     let ignore = false;
//     async function load() {
//       if (!canQuery || !service) return;
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `/api/availability?date=${encodeURIComponent(dateISO)}&service=${encodeURIComponent(service.slug)}`,
//           { cache: "no-store" }
//         );
//         const json = (await res.json()) as { slots: Slot[] };
//         if (!ignore) setSlots(json.slots ?? []);
//       } finally {
//         if (!ignore) setLoading(false);
//       }
//     }
//     load();
//     return () => {
//       ignore = true;
//     };
//   }, [service, dateISO, canQuery]);

//   async function submit(slot: Slot) {
//     if (!service) return;
  
//     const payload = {
//       serviceSlug: service.slug,
//       start: slot.start,
//       name: "Гость сайта",
//       phone: "+49 000 000 000",
//     };
  
//     const res = await fetch("/api/appointments", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
  
//     // Пытаемся безопасно прочитать JSON
//     let data: { ok?: boolean; error?: string } | null = null;
//     const ct = res.headers.get("content-type") || "";
//     if (ct.includes("application/json")) {
//       try {
//         data = (await res.json()) as { ok?: boolean; error?: string };
//       } catch {
//         data = null; // сервер вернул пустой ответ или невалидный JSON
//       }
//     }
  
//     if (!res.ok || !data?.ok) {
//       // показываем текст из ответа либо генерируем внятный фолбэк
//       const errText =
//         data?.error ||
//         (res.status === 409
//           ? "Этот слот уже занят. Обновите слоты и выберите другой."
//           : `Ошибка сервера (${res.status}). Попробуйте позже.`);
//       alert(errText);
//       return;
//     }
  
//     alert("Заявка создана! Мы свяжемся для подтверждения ✅");
//   }
  

//   return (
//     <div className="grid gap-6 md:grid-cols-[320px_1fr]">
//       <div className="rounded-2xl border border-white/10 p-4 bg-white/5 dark:bg-gray-900/40">
//         <label className="block text-sm mb-2">Услуга</label>
//         <select
//           className="w-full rounded-lg bg-transparent border px-3 py-2"
//           value={service?.slug ?? ""}
//           onChange={(e) => setService(services.find((x) => x.slug === e.target.value) ?? null)}
//         >
//           {services.map((s) => (
//             <option key={s.slug} value={s.slug}>
//               {s.name} — {s.durationMin} мин
//             </option>
//           ))}
//         </select>

//         <label className="block text-sm mt-4 mb-2">Дата</label>
//         <input
//           type="date"
//           className="w-full rounded-lg bg-transparent border px-3 py-2"
//           value={dateISO}
//           onChange={(e) => setDateISO(e.target.value)}
//         />
//       </div>

//       <div>
//         <h2 className="text-lg font-medium mb-3">
//           Свободные окна на {format(new Date(dateISO), "d MMMM yyyy", { locale: ru })}
//         </h2>

//         {loading && <p className="opacity-70">Загрузка…</p>}
//         {!loading && slots.length === 0 && <p className="opacity-70">Нет свободных слотов.</p>}

//         <div className="flex flex-wrap gap-2">
//           {slots.map((s) => (
//             <button
//               key={s.start}
//               onClick={() => submit(s)}
//               className="rounded-full px-4 py-2 border hover:bg-white/10 transition"
//               title={`${format(new Date(s.start), "HH:mm")}–${format(new Date(s.end), "HH:mm")}`}
//             >
//               {format(new Date(s.start), "HH:mm")}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
