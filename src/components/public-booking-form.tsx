// src/components/public-booking-form.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/** Данные услуги, которые приходят со страницы */
type Service = { slug: string; name: string; durationMin: number };
type Props = { services: Service[] };

/** Слот в минутах от начала дня */
type Slot = { start: number; end: number };

/* ---------- utils ---------- */

/** Минуты -> "HH:mm" */
function m2hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Сегодня в формате YYYY-MM-DD */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/* ---------- компонент ---------- */

export default function PublicBookingForm({ services }: Props) {
  // выбранная услуга+дата
  const [serviceSlug, setServiceSlug] = useState<string>(services[0]?.slug ?? "");
  const [dateISO, setDateISO] = useState<string>(todayISO());

  // сетка слотов
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // выбранный слот ключом "start-end"
  const [selectedKey, setSelectedKey] = useState<string>("");

  // поля клиента
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // быстрый доступ к слоту по ключу
  const slotMap = useMemo(() => {
    const m = new Map<string, Slot>();
    for (const s of slots) {
      if (Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start) {
        m.set(`${s.start}-${s.end}`, s);
      }
    }
    return m;
  }, [slots]);

  const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

  /** Загрузка слотов с бэка */
  const loadSlots = useCallback(async () => {
    if (!serviceSlug || !dateISO) return;
    setError("");
    setSelectedKey("");
    setLoading(true);
    try {
      const url = `/api/availability?serviceSlug=${encodeURIComponent(
        serviceSlug
      )}&dateISO=${encodeURIComponent(dateISO)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Не удалось получить свободные слоты");

      const data: unknown = await res.json();
      const next: Slot[] = Array.isArray(data)
        ? data
            .filter(
              (s: unknown): s is Slot =>
                !!s &&
                typeof (s as Slot).start === "number" &&
                typeof (s as Slot).end === "number" &&
                (s as Slot).end > (s as Slot).start
            )
            .sort((a, b) => a.start - b.start)
        : [];

      setSlots(next);
    } catch (e) {
      setError(
        process.env.NODE_ENV === "development"
          ? `loadSlots error: ${String(e)}`
          : "Ошибка загрузки слотов"
      );
    } finally {
      setLoading(false);
    }
  }, [serviceSlug, dateISO]);

  /** Автоподгрузка при смене услуги/даты */
  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  /** Отправка заявки */
  const onSubmit = useCallback(async () => {
    setError("");

    if (!serviceSlug) {
      setError("Выберите услугу");
      return;
    }
    if (!selectedSlot) {
      setError("Выберите время");
      return;
    }
    if (!name.trim()) {
      setError("Укажите имя");
      return;
    }
    if (!/^[\d\s+()\-]{6,}$/.test(phone.trim())) {
      setError("Укажите корректный телефон");
      return;
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          serviceSlug,
          dateISO,
          startMin: selectedSlot.start,
          endMin: selectedSlot.end,
          name: name.trim(),
          phone: phone.trim(),
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        // dev-подсказка
        const text = await res.text();

        // КЛЮЧЕВАЯ ЧАСТЬ: если слот уже заняли — освежаем сетку слотов
        if (res.status === 409) {
          setSelectedKey("");
          await loadSlots();
          setError("К сожалению, это время только что заняли. Выберите другой слот.");
          return;
        }

        setError(
          process.env.NODE_ENV === "development"
            ? `submit error ${res.status}: ${text}`
            : "Не получилось отправить заявку"
        );
        return;
      }

      alert("Заявка отправлена! Мы свяжемся с вами.");
      setSelectedKey("");
      setNotes("");
      await loadSlots(); // на всякий случай тоже обновим расписание
    } catch (e) {
      setError(
        process.env.NODE_ENV === "development"
          ? `submit exception: ${String(e)}`
          : "Не получилось отправить заявку"
      );
    }
  }, [serviceSlug, dateISO, selectedSlot, name, phone, notes, loadSlots]);

  return (
    <div className="space-y-6">
      {/* выбор услуги и даты */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Услуга</label>
          <select
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.durationMin} мин)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Дата</label>
          <input
            type="date"
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={loadSlots}
            className="rounded-full border px-4 py-2 hover:bg-white/10 transition"
            disabled={loading || !serviceSlug || !dateISO}
          >
            Показать свободные слоты
          </button>
        </div>
      </div>

      {/* ошибка / статус */}
      {error && (
        <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-200">
          {error}
        </div>
      )}

      {/* доступные слоты */}
      <div>
        <p className="text-sm mb-2 opacity-80">Выберите время:</p>

        <div className="flex flex-wrap gap-2">
          {!loading && slots.length === 0 && (
            <span className="opacity-70 text-sm">Нет свободных окон.</span>
          )}

          {slots.map((s) => {
            const key = `${s.start}-${s.end}`;
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey((prev) => (prev === key ? "" : key))}
                className={[
                  "rounded-full px-3 py-1.5 border transition",
                  isSelected ? "bg-white/10 border-white/50" : "hover:bg-white/10",
                ].join(" ")}
                aria-pressed={isSelected ? "true" : "false"}
                aria-label={`Время ${m2hhmm(s.start)}–${m2hhmm(s.end)}: ${
                  isSelected ? "выбрано" : "не выбрано"
                }`}
              >
                {m2hhmm(s.start)}–{m2hhmm(s.end)}
              </button>
            );
          })}
        </div>
      </div>

      {/* форма клиента */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Имя</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Телефон</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+49 ..."
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Комментарий</label>
          <textarea
            className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Пожелания…"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full border px-5 py-2 hover:bg-white/10 transition"
            disabled={!selectedSlot || loading}
          >
            Записаться
          </button>
        </div>
      </div>

      {/* dev-панель */}
      {process.env.NODE_ENV === "development" && (
        <details className="rounded-lg border border-white/10 p-3">
          <summary className="cursor-pointer opacity-70">dev debug</summary>
          <pre className="mt-2 text-xs opacity-70">
            {JSON.stringify(
              {
                serviceSlug,
                dateISO,
                slots,
                selectedKey,
                selectedSlot,
                name,
                phone,
                notes,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
}
