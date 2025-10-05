// src/components/public-booking-form.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import { useRouter } from "next/navigation";

type Service = { slug: string; name: string; durationMin: number };
type Props = { services: Service[] };
type Slot = { start: number; end: number };

function m2hhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const LS_NAME_KEY = "booking:name";
const LS_PHONE_KEY = "booking:phone";

export default function PublicBookingForm({ services }: Props) {
  const router = useRouter();

  // ids для связывания label/controls
  const serviceLabelId = useId();
  const listboxId = useId();
  const serviceBtnId = useId();

  const nameId = useId();
  const phoneId = useId();
  const notesId = useId();
  const dateId = useId();

  const [serviceSlug, setServiceSlug] = useState<string>("");
  const [dateISO, setDateISO] = useState<string>(todayISO());

  const [ddOpen, setDdOpen] = useState<boolean>(false);
  const ddRef = useRef<HTMLDivElement | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [selectedKey, setSelectedKey] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [successOpen, setSuccessOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedName = localStorage.getItem(LS_NAME_KEY);
      const savedPhone = localStorage.getItem(LS_PHONE_KEY);
      if (savedName) setName(savedName);
      if (savedPhone) setPhone(savedPhone);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (name.trim()) localStorage.setItem(LS_NAME_KEY, name.trim());
    } catch {}
  }, [name]);
  useEffect(() => {
    try {
      if (phone.trim()) localStorage.setItem(LS_PHONE_KEY, phone.trim());
    } catch {}
  }, [phone]);

  // закрытие дропдауна по клику вне и по Esc
  useEffect(() => {
    function onDocMouse(e: MouseEvent) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setDdOpen(false);
    }
    function onDocKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDdOpen(false);
    }
    if (ddOpen) {
      document.addEventListener("mousedown", onDocMouse);
      document.addEventListener("keydown", onDocKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDocMouse);
      document.removeEventListener("keydown", onDocKey);
    };
  }, [ddOpen]);

  const slotMap = useMemo(() => {
    const m = new Map<string, Slot>();
    for (const s of slots) {
      if (Number.isFinite(s.start) && Number.isFinite(s.end)) {
        m.set(`${s.start}-${s.end}`, s);
      }
    }
    return m;
  }, [slots]);

  const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

  const loadSlots = useCallback(async () => {
    setError("");
    setSelectedKey("");
    setSlots([]);
    setLoading(true);
    try {
      if (!serviceSlug || !dateISO) {
        setLoading(false);
        return;
      }
      const url = `/api/availability?serviceSlug=${encodeURIComponent(
        serviceSlug
      )}&dateISO=${encodeURIComponent(dateISO)}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Не удалось получить свободные слоты");
      const data: unknown = await res.json();

      const clean: Slot[] = Array.isArray(data)
        ? (data as unknown[])
            .map((v) => {
              if (
                typeof v === "object" &&
                v !== null &&
                Number.isFinite((v as { start: number }).start) &&
                Number.isFinite((v as { end: number }).end)
              ) {
                const s = (v as { start: number; end: number }).start;
                const e = (v as { start: number; end: number }).end;
                return { start: s, end: e };
              }
              return null;
            })
            .filter((v): v is Slot => !!v && v.end > v.start)
            .sort((a, b) => a.start - b.start)
        : [];

      setSlots(clean);
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

  const onSubmit = useCallback(async () => {
    setError("");

    if (!serviceSlug) return setError("Выберите услугу");
    if (!selectedSlot) return setError("Выберите время");
    if (!name.trim()) return setError("Укажите имя");
    if (!/^[\d\s+()\-]{6,}$/.test(phone.trim()))
      return setError("Укажите корректный телефон");

    setSubmitting(true);
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
        const text = await res.text();
        setError(
          process.env.NODE_ENV === "development"
            ? `submit error ${res.status}: ${text}`
            : "Не получилось отправить заявку"
        );
        return;
      }

      setSelectedKey("");
      setNotes("");
      setSuccessOpen(true);
    } catch (e) {
      setError(
        process.env.NODE_ENV === "development"
          ? `submit exception: ${String(e)}`
          : "Не получилось отправить заявку"
      );
    } finally {
      setSubmitting(false);
    }
  }, [serviceSlug, dateISO, selectedSlot, name, phone, notes]);

  const selectedService =
    services.find((s) => s.slug === serviceSlug) || null;

  return (
    <div className="space-y-6">
      {/* выбор услуги и даты */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* кастомный дропдаун услуг */}
        <div ref={ddRef} className="relative">
          <label id={serviceLabelId} htmlFor={serviceBtnId} className="block text-sm mb-1">
            Услуга
          </label>

          <button
            id={serviceBtnId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={ddOpen ? "true" : "false"}
            aria-controls={listboxId}
            aria-labelledby={`${serviceLabelId} ${serviceBtnId}`}
            onClick={() => setDdOpen((v) => !v)}
            className={[
              "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
              "bg-transparent",
              "hover:bg-white/5 dark:hover:bg-white/5",
              "border-gray-300 dark:border-gray-700",
            ].join(" ")}
          >
            <span className={!serviceSlug ? "opacity-60" : ""}>
              {selectedService
                ? `${selectedService.name} (${selectedService.durationMin} мин)`
                : "Выберите услугу…"}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              className="opacity-70"
              aria-hidden="true"
            >
              <path
                d="M7 10l5 5 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {ddOpen && (
            <ul
              id={listboxId}
              role="listbox"
              aria-labelledby={serviceLabelId}
              className={[
                "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
                "bg-white text-gray-900 border-gray-200",
                "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
              ].join(" ")}
            >
              {/* плейсхолдер как disabled option */}
              <li
                role="option"
                aria-disabled="true"
                aria-selected="false"
                className="px-3 py-2 text-sm opacity-60 select-none cursor-default"
              >
                Выберите услугу…
              </li>

              {services.map((s) => {
                const active = s.slug === serviceSlug;
                return (
                  <li
                    key={s.slug}
                    role="option"
                    aria-selected={active ? "true" : "false"}
                    tabIndex={0}
                    onClick={() => {
                      setServiceSlug(s.slug);
                      setDdOpen(false);
                      setSlots([]);
                      setSelectedKey("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        (e.currentTarget as HTMLLIElement).click();
                      }
                    }}
                    className={[
                      "px-3 py-2 cursor-pointer transition",
                      active
                        ? "bg-primary/10 dark:bg-white/10"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800",
                    ].join(" ")}
                  >
                    {s.name} ({s.durationMin} мин)
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor={dateId}>
            Дата
          </label>
          <input
            id={dateId}
            type="date"
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={loadSlots}
            className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
            disabled={loading || !serviceSlug || !dateISO}
          >
            {loading ? "Загрузка…" : "Показать свободные слоты"}
          </button>
        </div>
      </div>

      {/* ошибки / статус */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-200"
        >
          {error}
        </div>
      )}

      {/* слоты */}
      <div>
        <p className="text-sm mb-2 opacity-80">Выберите время:</p>
        <div className="flex flex-wrap gap-2">
          {slots.length === 0 && !loading && (
            <span className="opacity-70 text-sm">Нет свободных окон.</span>
          )}
          {slots.map((s) => {
            const key = `${s.start}-${s.end}`;
            const isSelected = selectedKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setSelectedKey((prev) => (prev === key ? "" : key))
                }
                className={[
                  "rounded-full px-3 py-1.5 border transition",
                  isSelected
                    ? "bg-white/10 border-white/50"
                    : "hover:bg-white/10 border-gray-300 dark:border-gray-700",
                ].join(" ")}
                aria-pressed={isSelected ? "true" : "false"}
                aria-label={`Время ${m2hhmm(s.start)}–${m2hhmm(
                  s.end
                )}: ${isSelected ? "выбрано" : "не выбрано"}`}
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
          <label className="block text-sm mb-1" htmlFor={nameId}>
            Имя
          </label>
          <input
            id={nameId}
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            autoComplete="name"
            name="name"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor={phoneId}>
            Телефон
          </label>
          <input
            id={phoneId}
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+49 ..."
            autoComplete="tel"
            inputMode="tel"
            name="phone"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1" htmlFor={notesId}>
            Комментарий
          </label>
          <textarea
            id={notesId}
            className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px] border-gray-300 dark:border-gray-700"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Пожелания…"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full border px-5 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
            disabled={!selectedSlot || loading || submitting}
          >
            {submitting ? "Отправляем…" : "Записаться"}
          </button>
        </div>
      </div>

      {/* модалка успешной заявки */}
      {successOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSuccessOpen(false)} />
          <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
            <p className="opacity-80 mb-4">
              Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
                onClick={() => setSuccessOpen(false)}
              >
                Ок
              </button>
              <button
                type="button"
                className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
                onClick={() => router.push("/")}
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
