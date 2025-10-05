// src/components/public-booking-form.tsx
"use client";

import React, {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { book, type BookState } from "@/app/booking/book";
import { BookingSchema } from "@/lib/validation/booking";

/* ---------- типы пропсов ---------- */

type Service = { slug: string; name: string; durationMin: number };
type Props = { services: Service[] };

type Slot = { start: number; end: number };

/* ---------- утилиты ---------- */

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

/* ---------- localStorage ---------- */
const LS_NAME = "booking:name";
const LS_PHONE = "booking:phone";
const LS_EMAIL = "booking:email";

/* =============================================================== */

export default function PublicBookingForm({ services }: Props) {
  const router = useRouter();

  /* выбор услуги/даты */
  const [serviceSlug, setServiceSlug] = useState<string>("");
  const [dateISO, setDateISO] = useState<string>(todayISO());

  /* дропдаун услуг */
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef<HTMLDivElement | null>(null);

  /* слоты */
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("");

  /* поля формы */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
  const [source, setSource] = useState<string>("");
  const [notes, setNotes] = useState("");

  /* общий алерт формы */
  const [formError, setFormError] = useState<string>("");

  /* модалка успеха */
  const [successOpen, setSuccessOpen] = useState(false);

  /* server action */
  const initial: BookState = { ok: false };
  const [serverState, formAction, isPending] = useActionState(book, initial);

  /* автоподстановка из LS */
  useEffect(() => {
    try {
      const n = localStorage.getItem(LS_NAME);
      const p = localStorage.getItem(LS_PHONE);
      const e = localStorage.getItem(LS_EMAIL);
      if (n) setName(n);
      if (p) setPhone(p);
      if (e) setEmail(e);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (name.trim()) localStorage.setItem(LS_NAME, name.trim());
    } catch {}
  }, [name]);
  useEffect(() => {
    try {
      if (phone.trim()) localStorage.setItem(LS_PHONE, phone.trim());
    } catch {}
  }, [phone]);
  useEffect(() => {
    try {
      if (email.trim()) localStorage.setItem(LS_EMAIL, email.trim());
    } catch {}
  }, [email]);

  /* закрыть дропдаун по клику вне */
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ddRef.current) return;
      if (!ddRef.current.contains(e.target as Node)) setDdOpen(false);
    }
    if (ddOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [ddOpen]);

  /* выбранный слот */
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

  /* реакция на ответ сервера */
  useEffect(() => {
    setFormError(serverState.formError ?? "");
    if (serverState.ok) {
      setSelectedKey("");
      setNotes("");
      setSuccessOpen(true);
    }
  }, [serverState]);

  /* загрузка слотов */
  const loadSlots = React.useCallback(async () => {
    setFormError("");
    setSelectedKey("");
    setSlots([]);
    setLoading(true);
    try {
      if (!serviceSlug || !dateISO) return;
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
      setFormError(
        process.env.NODE_ENV === "development"
          ? `loadSlots error: ${String(e)}`
          : "Ошибка загрузки слотов"
      );
    } finally {
      setLoading(false);
    }
  }, [serviceSlug, dateISO]);

  /* клиентская валидация (без setState — только вычисляем) */
  const { clientOk, clientErrors } = useMemo(() => {
    const payload = {
      serviceSlug,
      dateISO,
      startMin: selectedSlot?.start ?? Number.NaN,
      endMin: selectedSlot?.end ?? Number.NaN,
      name,
      phone,
      email,
      birthDate,
      source: source || undefined,
      notes: notes || undefined,
    };
    const r = BookingSchema.safeParse(payload);
    if (r.success)
      return { clientOk: true, clientErrors: {} as Record<string, string> };

    const errs: Record<string, string> = {};
    for (const issue of r.error.issues) {
      const key = String(issue.path?.[0] ?? "");
      if (key && !errs[key]) errs[key] = issue.message;
    }
    return { clientOk: false, clientErrors: errs };
  }, [
    serviceSlug,
    dateISO,
    selectedSlot,
    name,
    phone,
    email,
    birthDate,
    source,
    notes,
  ]);

  // объединяем клиентские и серверные ошибки (серверные имеют приоритет)
  const errors = useMemo(() => {
    const server = (serverState.fieldErrors ?? {}) as Record<string, string>;
    return { ...clientErrors, ...server };
  }, [clientErrors, serverState.fieldErrors]);

  const selectedService = services.find((s) => s.slug === serviceSlug) ?? null;

  /* --------------------------- UI --------------------------- */

  // общие классы и «тёмно-синяя» заливка для системного select/option
  const selectCls =
    "w-full rounded-lg border px-3 py-2 border-gray-300 dark:border-gray-700 " +
    "bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100";
  const optionCls = "dark:bg-slate-900 dark:text-gray-100";
  const optionStyle: React.CSSProperties = {
    // fallback для браузеров, игнорирующих классы на <option>
    backgroundColor: "rgb(15 23 42)", // slate-900
    color: "rgb(243 244 246)", // gray-100
  };

  return (
    <div className="space-y-6">
      {/* выбор услуги/даты */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* кастомный тёмный дропдаун */}
        <div ref={ddRef} className="relative">
          <label className="block text-sm mb-1">Услуга</label>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={ddOpen ? "true" : "false"}
            onClick={() => setDdOpen((v) => !v)}
            className={[
              "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
              "bg-transparent border-gray-300 dark:border-gray-700",
              "hover:bg-white/5 dark:hover:bg-white/5",
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
              aria-hidden
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
              role="listbox"
              tabIndex={-1}
              className={[
                "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
                "bg-white text-gray-900 border-gray-200",
                "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
              ].join(" ")}
            >
              <li
                aria-disabled="true"
                className="px-3 py-2 text-sm opacity-60 select-none"
              >
                Выберите услугу…
              </li>

              {services.map((s) => {
                const active = s.slug === serviceSlug;
                return (
                  <li key={s.slug}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active ? "true" : "false"}
                      onClick={() => {
                        setServiceSlug(s.slug);
                        setDdOpen(false);
                        setSlots([]);
                        setSelectedKey("");
                      }}
                      className={[
                        "w-full text-left px-3 py-2 transition",
                        active
                          ? "bg-primary/10 dark:bg-white/10"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800",
                      ].join(" ")}
                    >
                      {s.name} ({s.durationMin} мин)
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {errors["serviceSlug"] && (
            <p className="mt-1 text-xs text-rose-400">
              {errors["serviceSlug"]}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Дата</label>
          <input
            type="date"
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
          {errors["dateISO"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["dateISO"]}</p>
          )}
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

      {/* общий алерт */}
      {(formError || serverState.formError) && (
        <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-rose-200">
          {formError || serverState.formError}
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
              >
                {m2hhmm(s.start)}–{m2hhmm(s.end)}
              </button>
            );
          })}
        </div>
        {errors["startMin"] && (
          <p className="mt-1 text-xs text-rose-400">{errors["startMin"]}</p>
        )}
      </div>

      {/* ФОРМА — используем action={formAction} */}
      <form action={formAction} className="grid sm:grid-cols-2 gap-3">
        <input type="hidden" name="serviceSlug" value={serviceSlug} />
        <input type="hidden" name="dateISO" value={dateISO} />
        <input
          type="hidden"
          name="startMin"
          value={selectedSlot?.start ?? ""}
        />
        <input type="hidden" name="endMin" value={selectedSlot?.end ?? ""} />

        <div>
          <label className="block text-sm mb-1">Имя</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
          {errors["name"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["name"]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Телефон</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+49 ..."
            required
          />
          {errors["phone"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["phone"]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          {errors["email"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["email"]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Дата рождения</label>
          <input
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            name="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          {errors["birthDate"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["birthDate"]}</p>
          )}
        </div>

        {/* Как вы узнали о нас — нативный select, но с тёмно-синей темой */}
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Как вы узнали о нас</label>
          <select
            className={selectCls}
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="" className={optionCls} style={optionStyle}>
              — выберите вариант —
            </option>
            <option value="Google" className={optionCls} style={optionStyle}>
              Google
            </option>
            <option value="Instagram" className={optionCls} style={optionStyle}>
              Instagram
            </option>
            {/* был Walk-in → теперь Facebook */}
            <option value="Facebook" className={optionCls} style={optionStyle}>
              Facebook
            </option>
            <option value="Friends" className={optionCls} style={optionStyle}>
              Знакомые
            </option>
            <option value="Other" className={optionCls} style={optionStyle}>
              Другое
            </option>
          </select>
          {errors["source"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["source"]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Комментарий</label>
          <textarea
            className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px] border-gray-300 dark:border-gray-700"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Пожелания…"
          />
          {errors["notes"] && (
            <p className="mt-1 text-xs text-rose-400">{errors["notes"]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="rounded-full border px-5 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
            disabled={
              isPending || loading || !serviceSlug || !selectedSlot || !clientOk
            }
          >
            {isPending ? "Отправляем…" : "Записаться"}
          </button>
        </div>
      </form>

      {/* dev-debug */}
      {process.env.NODE_ENV === "development" && (
        <details className="rounded-lg border border-white/10 p-3">
          <summary className="cursor-pointer opacity-70">dev debug</summary>
          <pre className="mt-2 text-xs opacity-70">
            {JSON.stringify(
              {
                serviceSlug,
                dateISO,
                selectedKey,
                selectedSlot,
                name,
                phone,
                email,
                birthDate,
                source,
                notes,
                clientOk,
                clientErrors,
                serverState,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}

      {/* модалка успеха */}
      {successOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSuccessOpen(false)}
          />
          <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
            <p className="opacity-80 mb-4">
              Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее
              время.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
                onClick={() => router.push("/")}
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
