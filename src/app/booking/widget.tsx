// src/app/booking/widget.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale"; // ← правильный импорт локали

type Service = { slug: string; name: string; durationMin: number };
type Slot = { start: string; end: string };
type Props = { services: Service[] };

export default function BookingWidget({ services }: Props) {
  const [service, setService] = useState<Service | null>(services[0] ?? null);
  const [dateISO, setDateISO] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const canQuery = useMemo(() => Boolean(service && dateISO), [service, dateISO]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!canQuery || !service) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/availability?date=${encodeURIComponent(dateISO)}&service=${encodeURIComponent(service.slug)}`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as { slots: Slot[] };
        if (!ignore) setSlots(json.slots ?? []);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [service, dateISO, canQuery]);

  async function submit(slot: Slot) {
    if (!service) return;
  
    const payload = {
      serviceSlug: service.slug,
      start: slot.start,
      name: "Гость сайта",
      phone: "+49 000 000 000",
    };
  
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    // Пытаемся безопасно прочитать JSON
    let data: { ok?: boolean; error?: string } | null = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      try {
        data = (await res.json()) as { ok?: boolean; error?: string };
      } catch {
        data = null; // сервер вернул пустой ответ или невалидный JSON
      }
    }
  
    if (!res.ok || !data?.ok) {
      // показываем текст из ответа либо генерируем внятный фолбэк
      const errText =
        data?.error ||
        (res.status === 409
          ? "Этот слот уже занят. Обновите слоты и выберите другой."
          : `Ошибка сервера (${res.status}). Попробуйте позже.`);
      alert(errText);
      return;
    }
  
    alert("Заявка создана! Мы свяжемся для подтверждения ✅");
  }
  

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-white/10 p-4 bg-white/5 dark:bg-gray-900/40">
        <label className="block text-sm mb-2">Услуга</label>
        <select
          className="w-full rounded-lg bg-transparent border px-3 py-2"
          value={service?.slug ?? ""}
          onChange={(e) => setService(services.find((x) => x.slug === e.target.value) ?? null)}
        >
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name} — {s.durationMin} мин
            </option>
          ))}
        </select>

        <label className="block text-sm mt-4 mb-2">Дата</label>
        <input
          type="date"
          className="w-full rounded-lg bg-transparent border px-3 py-2"
          value={dateISO}
          onChange={(e) => setDateISO(e.target.value)}
        />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">
          Свободные окна на {format(new Date(dateISO), "d MMMM yyyy", { locale: ru })}
        </h2>

        {loading && <p className="opacity-70">Загрузка…</p>}
        {!loading && slots.length === 0 && <p className="opacity-70">Нет свободных слотов.</p>}

        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              key={s.start}
              onClick={() => submit(s)}
              className="rounded-full px-4 py-2 border hover:bg-white/10 transition"
              title={`${format(new Date(s.start), "HH:mm")}–${format(new Date(s.end), "HH:mm")}`}
            >
              {format(new Date(s.start), "HH:mm")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
