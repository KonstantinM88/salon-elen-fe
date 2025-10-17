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

/* ---------- типы ---------- */
type SubService = {
  slug: string;
  name: string;
  durationMin: number;
  description?: string | null;
  priceCents?: number | null;
};
type Category = { id: string; name: string; children: SubService[] };
type Props = { categories: Category[] };

type Slot = { start: number; end: number };
type Master = { id: string; name: string };

/* ---------- утилы ---------- */
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
function euro(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

/** ISO (UTC) -> минуты локального дня Europe/Berlin для указанной dateISO */
function isoToLocalMins(dateISO: string, iso: string): number {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return NaN;

  const asUtcMidnight = new Date(`${dateISO}T00:00:00Z`);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(asUtcMidnight);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;

  const berlinMidnightUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    0,
    0,
    0
  );
  const diffMs = d.getTime() - berlinMidnightUTC;
  return Math.round(diffMs / 60000);
}

/* ---------- LS ---------- */
const LS_NAME = "booking:name";
const LS_PHONE = "booking:phone";
const LS_EMAIL = "booking:email";

/* ========================================================= */
export default function PublicBookingForm({ categories }: Props) {
  const router = useRouter();

  // безопасная инициализация
  const [categoryId, setCategoryId] = useState<string>("");
  const [serviceSlug, setServiceSlug] = useState<string>("");

  const [masters, setMasters] = useState<Master[]>([]);
  const [masterId, setMasterId] = useState<string>("");

  const [dateISO, setDateISO] = useState<string>(todayISO());

  // дропдауны
  const [ddCatOpen, setDdCatOpen] = useState(false);
  const [ddSrvOpen, setDdSrvOpen] = useState(false);
  const [ddMstOpen, setDdMstOpen] = useState(false);
  const ddCatRef = useRef<HTMLDivElement | null>(null);
  const ddSrvRef = useRef<HTMLDivElement | null>(null);
  const ddMstRef = useRef<HTMLDivElement | null>(null);

  // слоты
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsOpen, setSlotsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("");

  // поля
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [source, setSource] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [formError, setFormError] = useState<string>("");
  const [successOpen, setSuccessOpen] = useState(false);

  // server action
  const initial: BookState = { ok: false };
  const [serverState, formAction, isPending] = useActionState(book, initial);

  /* ---------- начальная установка категории/услуги ---------- */
  useEffect(() => {
    if (!categories?.length) return;
    setCategoryId((prev) => prev || categories[0].id);
  }, [categories]);

  useEffect(() => {
    if (!categoryId) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    setServiceSlug((prev) => (prev ? prev : cat.children?.[0]?.slug ?? ""));
  }, [categoryId, categories]);

  /* ---------- автоизвлечение из LS ---------- */
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

  // закрытия дропдаунов
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ddCatRef.current && !ddCatRef.current.contains(e.target as Node))
        setDdCatOpen(false);
      if (ddSrvRef.current && !ddSrvRef.current.contains(e.target as Node))
        setDdSrvOpen(false);
      if (ddMstRef.current && !ddMstRef.current.contains(e.target as Node))
        setDdMstOpen(false);
    }
    if (ddCatOpen || ddSrvOpen || ddMstOpen)
      document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [ddCatOpen, ddSrvOpen, ddMstOpen]);

  /* ---------- вычисления ---------- */
  const currentChildren = useMemo<SubService[]>(
    () => categories.find((c) => c.id === categoryId)?.children ?? [],
    [categories, categoryId]
  );
  const hasChildren = currentChildren.length > 0;
  const selectedService =
    currentChildren.find((s) => s.slug === serviceSlug) ?? null;

  // выбранный слот
  const slotMap = useMemo(() => {
    const m = new Map<string, Slot>();
    for (const s of slots) {
      if (Number.isFinite(s.start) && Number.isFinite(s.end))
        m.set(`${s.start}-${s.end}`, s);
    }
    return m;
  }, [slots]);
  const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

  // ответ сервера
  useEffect(() => {
    setFormError(serverState.formError ?? "");
    if (serverState.ok) {
      setSelectedKey("");
      setNotes("");
      setSuccessOpen(true);
    }
  }, [serverState]);

  // смена категории — сброс подуслуги/мастера
  useEffect(() => {
    setMasters([]);
    setMasterId("");
    setSlots([]);
    setSelectedKey("");
    setSlotsOpen(false);
  }, [categoryId]);

  // загрузка мастеров при смене подуслуги (с автоподстановкой, если мастер ровно один)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setMasters([]);
      setMasterId("");
      setSlots([]);
      setSelectedKey("");
      setSlotsOpen(false);
      if (!serviceSlug) return;

      try {
        const res = await fetch(
          `/api/masters?serviceSlug=${encodeURIComponent(serviceSlug)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Не удалось получить мастеров");

        const data: Master[] = await res.json();
        if (cancelled) return;

        setMasters(data);

        // 👉 если по подуслуге найден ровно один мастер — выбираем автоматически
        if (data.length === 1) {
          setMasterId(data[0].id);
        }
      } catch (e) {
        if (!cancelled) {
          setFormError(
            process.env.NODE_ENV === "development"
              ? `Ошибка загрузки мастеров: ${String(e)}`
              : "Ошибка загрузки мастеров"
          );
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [serviceSlug]);

  // при наличии слотов — показываем блок
  useEffect(() => {
    if (slots.length > 0) setSlotsOpen(true);
  }, [slots.length]);

  // автоподстановка ДР по имени/телефону
  useEffect(() => {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p || birthDate) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = `/api/clients/lookup?name=${encodeURIComponent(
          n
        )}&phone=${encodeURIComponent(p)}`;
        const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
        if (!res.ok) return;
        const data: { ok: boolean; birthDateISO: string | null } =
          await res.json();
        if (data.ok && data.birthDateISO && !birthDate) {
          setBirthDate(data.birthDateISO);
        }
      } catch {}
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [name, phone, birthDate]);

  /** Универсальный парсер ответа слотов */
  function parseSlotsFlexible(dateStr: string, data: unknown): Slot[] {
    const cast = (v: unknown): Slot | null => {
      if (typeof v !== "object" || v === null) return null;
      const o = v as Record<string, unknown>;

      if (Number.isFinite(o.start) && Number.isFinite(o.end)) {
        const s = o.start as number;
        const e = o.end as number;
        return e > s ? { start: s, end: e } : null;
      }
      if (Number.isFinite(o.startMin) && Number.isFinite(o.endMin)) {
        const s = o.startMin as number;
        const e = o.endMin as number;
        return e > s ? { start: s, end: e } : null;
      }
      if (typeof o.start === "string" && typeof o.end === "string") {
        const s = isoToLocalMins(dateStr, o.start);
        const e = isoToLocalMins(dateStr, o.end);
        return Number.isFinite(s) && Number.isFinite(e) && e > s
          ? { start: s, end: e }
          : null;
      }
      return null;
    };

    const arr: Slot[] = Array.isArray(data)
      ? (data as unknown[])
          .map(cast)
          .filter((x): x is Slot => !!x)
          .filter((x) => x.start >= 0 && x.end <= 24 * 60 && x.end > x.start)
          .sort((a, b) => a.start - b.start)
      : [];

    const seen = new Set<string>();
    const out: Slot[] = [];
    for (const s of arr) {
      const k = `${s.start}-${s.end}`;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(s);
      }
    }
    return out;
  }

  // загрузка слотов
  const loadSlots = React.useCallback(async () => {
    setFormError("");
    setSelectedKey("");
    setSlots([]);
    setLoading(true);

    try {
      if (!serviceSlug) {
        setFormError("Сначала выберите подуслугу.");
        return;
      }
      if (!masterId) {
        setFormError("Выберите мастера.");
        return;
      }
      if (!dateISO) {
        setFormError("Сначала выберите дату.");
        return;
      }

      const url =
        `/api/availability` +
        `?serviceSlug=${encodeURIComponent(serviceSlug)}` +
        `&dateISO=${encodeURIComponent(dateISO)}` +
        `&masterId=${encodeURIComponent(masterId)}`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw: unknown = await res.json();
      const clean = parseSlotsFlexible(dateISO, raw);
      setSlots(clean);

      if (clean.length === 0) {
        setFormError(
          "На выбранную дату и мастера нет свободных окон. Попробуйте другую дату."
        );
      }
    } catch (e) {
      setFormError(
        process.env.NODE_ENV === "development"
          ? `Ошибка загрузки слотов: ${String(e)}`
          : "Ошибка загрузки слотов. Попробуйте обновить страницу."
      );
    } finally {
      setLoading(false);
    }
  }, [serviceSlug, dateISO, masterId]);

  // клиентская валидация
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
      masterId,
    };
    const r = BookingSchema.safeParse(payload);
    if (r.success)
      return { clientOk: true, clientErrors: {} as Record<string, string> };
    const errs: Record<string, string> = {};
    for (const issue of r.error.issues) {
      const key = String(issue.path?.[0] ?? "");
      if (key && !errs[key]) {
        errs[key] =
          key === "startMin"
            ? "Не выбрано время. Нажмите на свободный слот."
            : issue.message;
      }
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
    masterId,
  ]);

  const errors = useMemo(() => {
    const server = (serverState.fieldErrors ?? {}) as Record<string, string>;
    return { ...clientErrors, ...server };
  }, [clientErrors, serverState.fieldErrors]);

  /* ------------------ UI ------------------ */
  const showLoadBtn =
    Boolean(serviceSlug) && Boolean(dateISO) && Boolean(masterId);

  return (
    <div className="space-y-6">
      {/* выбор: категория/подуслуга/мастер и дата */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-3">
          {/* Категория */}
          <Dropdown
            label="Категория"
            open={ddCatOpen}
            setOpen={setDdCatOpen}
            refEl={ddCatRef}
            buttonText={
              categoryId
                ? categories.find((c) => c.id === categoryId)?.name ??
                  "Выберите категорию…"
                : "Выберите категорию…"
            }
            items={categories.map((c) => ({
              key: c.id,
              text: c.name,
              active: c.id === categoryId,
              onClick: () => {
                setCategoryId(c.id);
              },
            }))}
          />

          {/* Подуслуга */}
          <Dropdown
            label="Подуслуга"
            open={ddSrvOpen}
            setOpen={setDdSrvOpen}
            refEl={ddSrvRef}
            disabled={!hasChildren}
            buttonText={
              selectedService
                ? `${selectedService.name} (${selectedService.durationMin} мин · ${euro(
                    selectedService.priceCents
                  )})`
                : hasChildren
                ? "Выберите подуслугу…"
                : "Нет подуслуг"
            }
            items={currentChildren.map((s) => ({
              key: s.slug,
              text: `${s.name} (${s.durationMin} мин · ${euro(s.priceCents)})`,
              active: s.slug === serviceSlug,
              onClick: () => {
                setServiceSlug(s.slug);
              },
            }))}
            helpText={
              !hasChildren
                ? "В этой категории пока нет подуслуг. Пожалуйста, выберите другую категорию."
                : undefined
            }
            error={errors["serviceSlug"]}
          />

          {/* Мастер */}
          <Dropdown
            label="Мастер"
            open={ddMstOpen}
            setOpen={setDdMstOpen}
            refEl={ddMstRef}
            disabled={!serviceSlug}
            buttonText={
              masterId
                ? masters.find((m) => m.id === masterId)?.name ??
                  "Выберите мастера…"
                : masters.length
                ? "Выберите мастера…"
                : serviceSlug
                ? "Нет доступных мастеров"
                : "Сначала выберите подуслугу"
            }
            items={masters.map((m) => ({
              key: m.id,
              text: m.name,
              active: m.id === masterId,
              onClick: () => {
                setMasterId(m.id);
              },
            }))}
            error={errors["masterId"]}
          />
        </div>

        {/* Дата */}
        <div>
          <label className="block text-sm mb-1">Дата</label>
          <input
            type="date"
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            value={dateISO}
            onChange={(e) => setDateISO(e.target.value)}
          />
          {errors["dateISO"] && (
            <span className="mt-1 text-xs text-rose-400">{errors["dateISO"]}</span>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={loadSlots}
            className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700 disabled:opacity-50"
            disabled={loading || !showLoadBtn}
          >
            {loading ? "Загрузка…" : "Показать свободные слоты"}
          </button>
          {formError && (
            <p className="mt-2 text-xs text-amber-400">{formError}</p>
          )}
        </div>
      </div>

      {/* слоты */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm opacity-80">Выберите время:</p>
          <button
            type="button"
            onClick={() => setSlotsOpen((v) => !v)}
            className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            {slotsOpen ? "Скрыть слоты" : "Показать слоты"}
          </button>
        </div>

        {selectedSlot && (
          <p className="mb-2 text-sm">
            Вы выбрали:{" "}
            <span className="font-semibold">
              {m2hhmm(selectedSlot.start)}—{m2hhmm(selectedSlot.end)}
            </span>
          </p>
        )}

        {slotsOpen && (
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
                  onClick={() => {
                    const next = selectedKey === key ? "" : key;
                    setSelectedKey(next);
                    setFormError(""); // важно: очищаем «не выбрано время»
                    // НЕ закрываем список слотов — это путало выбор
                  }}
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
        )}
        {errors["startMin"] && (
          <p className="mt-1 text-xs text-rose-400">{errors["startMin"]}</p>
        )}
      </div>

      {/* форма отправки */}
      <form action={formAction} className="grid sm:grid-cols-2 gap-3">
        <input type="hidden" name="serviceSlug" value={serviceSlug} />
        <input type="hidden" name="dateISO" value={dateISO} />
        <input type="hidden" name="startMin" value={selectedSlot?.start ?? ""} />
        <input type="hidden" name="endMin" value={selectedSlot?.end ?? ""} />
        <input type="hidden" name="masterId" value={masterId} />

        <FieldText
          label="Имя"
          name="name"
          value={name}
          onChange={setName}
          error={errors["name"]}
          gold
        />
        <FieldText
          label="Телефон"
          name="phone"
          value={phone}
          onChange={setPhone}
          error={errors["phone"]}
          inputMode="tel"
          placeholder="+49 ..."
        />
        <FieldText
          label="E-mail"
          name="email"
          value={email}
          onChange={setEmail}
          error={errors["email"]}
          type="email"
          placeholder="you@example.com"
        />
        <FieldText
          label="Дата рождения"
          name="birthDate"
          value={birthDate}
          onChange={setBirthDate}
          error={errors["birthDate"]}
          type="date"
        />

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1">Как вы узнали о нас</label>
          <select
            className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
            name="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">— выберите вариант —</option>
            <option value="Google">Google</option>
            <option value="Instagram">Instagram</option>
            <option value="Friends">Знакомые</option>
            <option value="Facebook">Facebook</option>
            <option value="Other">Другое</option>
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
              isPending ||
              loading ||
              !serviceSlug ||
              !masterId ||
              !selectedSlot ||
              !clientOk
            }
          >
            {isPending ? "Отправляем…" : "Записаться"}
          </button>
        </div>
      </form>

      {successOpen && <SuccessModal onClose={() => router.push("/")} />}

      {/* глобальный select в dark */}
      <style jsx global>{`
        :root {
          --site-dark: #0b1220;
        }
        .dark select option,
        .dark select optgroup {
          background-color: var(--site-dark) !important;
          color: #e5e7eb !important;
        }
        .dark select option:checked,
        .dark select option:hover {
          background-color: #0f1a2b !important;
        }
      `}</style>
      {/* «золотое» имя, без деградации на мобилках */}
      <style jsx>{`
        .goldy-text {
          font-weight: 600;
          color: #f5d76e;
          text-shadow: 0 0 8px rgba(245, 215, 110, 0.45);
          caret-color: #ffe08a;
          transition: text-shadow 200ms ease;
        }
        @supports (-webkit-background-clip: text) {
          .goldy-text:not(input):not(textarea) {
            background-image: linear-gradient(
              110deg,
              #b3903b 0%,
              #f5d76e 25%,
              #fff3c4 50%,
              #f5d76e 75%,
              #b3903b 100%
            );
            background-size: 200% auto;
            background-position: 0% center;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            animation: goldShimmer 4s linear infinite;
          }
        }
        @keyframes goldShimmer {
          to {
            background-position: -200% center;
          }
        }
        input.goldy-text,
        textarea.goldy-text {
          background-image: none !important;
          -webkit-background-clip: border-box !important;
          background-clip: border-box !important;
          -webkit-text-fill-color: initial !important;
          animation: none !important;
        }
      `}</style>
    </div>
  );
}

/* ---------- маленькие подкомпоненты ---------- */

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
        <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
        <p className="opacity-80 mb-4">Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
        <div className="flex gap-2 justify-end">
          <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
            Ок
          </button>
          <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}

function Dropdown(props: {
  label: string;
  buttonText: string;
  items: { key: string; text: string; active: boolean; onClick: () => void }[];
  open: boolean;
  setOpen: (v: boolean) => void;
  refEl: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
  helpText?: string;
  error?: string;
}) {
  const { label, buttonText, items, open, setOpen, refEl, disabled, helpText, error } = props;
  return (
    <div ref={refEl} className="relative">
      <label className="block text-sm mb-1">{label}</label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={[
          "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
          "bg-transparent border-gray-300 dark:border-gray-700",
          "hover:bg-white/5 dark:hover:bg-white/5",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <span className={!buttonText ? "opacity-60" : ""}>{buttonText}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70" aria-hidden>
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          tabIndex={-1}
          className={[
            "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
            "bg-white text-gray-900 border-gray-200",
            "dark:bg-[#0B1220] dark:text-gray-100 dark:border-gray-700",
          ].join(" ")}
        >
          <li className="px-3 py-2 text-sm opacity-60 select-none">Выберите…</li>
          {items.map((it) => (
            <li key={it.key}>
              <button
                type="button"
                role="option"
                aria-selected={it.active ? "true" : "false"}
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                className={[
                  "w-full text-left px-3 py-2 transition",
                  it.active ? "bg-primary/10 dark:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/5",
                ].join(" ")}
              >
                {it.text}
              </button>
            </li>
          ))}
        </ul>
      )}

      {helpText && <p className="mt-1 text-xs text-amber-500">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function FieldText({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  placeholder,
  gold,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: "text" | "email" | "date";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  gold?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        className={[
          "w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700",
          gold && value.trim() ? "goldy-text" : "",
        ].join(" ")}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}





//---------работало но сделали апгрейт выпадания мастера
// "use client";

// import React, {
//   useActionState,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { useRouter } from "next/navigation";

// import { book, type BookState } from "@/app/booking/book";
// import { BookingSchema } from "@/lib/validation/booking";

// /* ---------- типы ---------- */
// type SubService = {
//   slug: string;
//   name: string;
//   durationMin: number;
//   description?: string | null;
//   priceCents?: number | null;
// };
// type Category = { id: string; name: string; children: SubService[] };
// type Props = { categories: Category[] };

// type Slot = { start: number; end: number };
// type Master = { id: string; name: string };

// /* ---------- утилы ---------- */
// function m2hhmm(min: number): string {
//   const h = Math.floor(min / 60);
//   const m = min % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }
// function todayISO(): string {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;
// }
// function euro(cents: number | null | undefined): string {
//   if (cents == null) return "—";
//   return new Intl.NumberFormat("de-DE", {
//     style: "currency",
//     currency: "EUR",
//   }).format(cents / 100);
// }

// /** ISO (UTC) -> минуты локального дня Europe/Berlin для указанной dateISO */
// function isoToLocalMins(dateISO: string, iso: string): number {
//   const d = new Date(iso);
//   if (!Number.isFinite(d.getTime())) return NaN;

//   const asUtcMidnight = new Date(`${dateISO}T00:00:00Z`);
//   const dtf = new Intl.DateTimeFormat("en-US", {
//     timeZone: "Europe/Berlin",
//     hour12: false,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
//   const parts = dtf.formatToParts(asUtcMidnight);
//   const map: Record<string, string> = {};
//   for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;

//   const berlinMidnightUTC = Date.UTC(
//     Number(map.year),
//     Number(map.month) - 1,
//     Number(map.day),
//     0,
//     0,
//     0
//   );
//   const diffMs = d.getTime() - berlinMidnightUTC;
//   return Math.round(diffMs / 60000);
// }

// /* ---------- LS ---------- */
// const LS_NAME = "booking:name";
// const LS_PHONE = "booking:phone";
// const LS_EMAIL = "booking:email";

// /* ========================================================= */
// export default function PublicBookingForm({ categories }: Props) {
//   const router = useRouter();

//   // безопасная инициализация
//   const [categoryId, setCategoryId] = useState<string>("");
//   const [serviceSlug, setServiceSlug] = useState<string>("");

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [masterId, setMasterId] = useState<string>("");

//   const [dateISO, setDateISO] = useState<string>(todayISO());

//   // дропдауны
//   const [ddCatOpen, setDdCatOpen] = useState(false);
//   const [ddSrvOpen, setDdSrvOpen] = useState(false);
//   const [ddMstOpen, setDdMstOpen] = useState(false);
//   const ddCatRef = useRef<HTMLDivElement | null>(null);
//   const ddSrvRef = useRef<HTMLDivElement | null>(null);
//   const ddMstRef = useRef<HTMLDivElement | null>(null);

//   // слоты
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [slotsOpen, setSlotsOpen] = useState<boolean>(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedKey, setSelectedKey] = useState<string>("");

//   // поля
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [birthDate, setBirthDate] = useState("");
//   const [source, setSource] = useState<string>("");
//   const [notes, setNotes] = useState("");

//   const [formError, setFormError] = useState<string>("");
//   const [successOpen, setSuccessOpen] = useState(false);

//   // server action
//   const initial: BookState = { ok: false };
//   const [serverState, formAction, isPending] = useActionState(book, initial);

//   /* ---------- начальная установка категории/услуги ---------- */
//   useEffect(() => {
//     if (!categories?.length) return;
//     setCategoryId((prev) => prev || categories[0].id);
//   }, [categories]);

//   useEffect(() => {
//     if (!categoryId) return;
//     const cat = categories.find((c) => c.id === categoryId);
//     if (!cat) return;
//     setServiceSlug((prev) => (prev ? prev : cat.children?.[0]?.slug ?? ""));
//   }, [categoryId, categories]);

//   /* ---------- автоизвлечение из LS ---------- */
//   useEffect(() => {
//     try {
//       const n = localStorage.getItem(LS_NAME);
//       const p = localStorage.getItem(LS_PHONE);
//       const e = localStorage.getItem(LS_EMAIL);
//       if (n) setName(n);
//       if (p) setPhone(p);
//       if (e) setEmail(e);
//     } catch {}
//   }, []);
//   useEffect(() => {
//     try {
//       if (name.trim()) localStorage.setItem(LS_NAME, name.trim());
//     } catch {}
//   }, [name]);
//   useEffect(() => {
//     try {
//       if (phone.trim()) localStorage.setItem(LS_PHONE, phone.trim());
//     } catch {}
//   }, [phone]);
//   useEffect(() => {
//     try {
//       if (email.trim()) localStorage.setItem(LS_EMAIL, email.trim());
//     } catch {}
//   }, [email]);

//   // закрытия дропдаунов
//   useEffect(() => {
//     function onDoc(e: MouseEvent) {
//       if (ddCatRef.current && !ddCatRef.current.contains(e.target as Node))
//         setDdCatOpen(false);
//       if (ddSrvRef.current && !ddSrvRef.current.contains(e.target as Node))
//         setDdSrvOpen(false);
//       if (ddMstRef.current && !ddMstRef.current.contains(e.target as Node))
//         setDdMstOpen(false);
//     }
//     if (ddCatOpen || ddSrvOpen || ddMstOpen)
//       document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [ddCatOpen, ddSrvOpen, ddMstOpen]);

//   /* ---------- вычисления ---------- */
//   const currentChildren = useMemo<SubService[]>(
//     () => categories.find((c) => c.id === categoryId)?.children ?? [],
//     [categories, categoryId]
//   );
//   const hasChildren = currentChildren.length > 0;
//   const selectedService =
//     currentChildren.find((s) => s.slug === serviceSlug) ?? null;

//   // выбранный слот
//   const slotMap = useMemo(() => {
//     const m = new Map<string, Slot>();
//     for (const s of slots) {
//       if (Number.isFinite(s.start) && Number.isFinite(s.end))
//         m.set(`${s.start}-${s.end}`, s);
//     }
//     return m;
//   }, [slots]);
//   const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

//   // ответ сервера
//   useEffect(() => {
//     setFormError(serverState.formError ?? "");
//     if (serverState.ok) {
//       setSelectedKey("");
//       setNotes("");
//       setSuccessOpen(true);
//     }
//   }, [serverState]);

//   // смена категории — сброс подуслуги/мастера
//   useEffect(() => {
//     setMasters([]);
//     setMasterId("");
//     setSlots([]);
//     setSelectedKey("");
//     setSlotsOpen(false);
//   }, [categoryId]);

//   // загрузка мастеров при смене подуслуги
//   useEffect(() => {
//     async function run() {
//       setMasters([]);
//       setMasterId("");
//       setSlots([]);
//       setSelectedKey("");
//       setSlotsOpen(false);
//       if (!serviceSlug) return;
//       try {
//         const res = await fetch(
//           `/api/masters?serviceSlug=${encodeURIComponent(serviceSlug)}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("Не удалось получить мастеров");
//         const data: Master[] = await res.json();
//         setMasters(data);
//       } catch (e) {
//         setFormError(
//           process.env.NODE_ENV === "development"
//             ? `Ошибка загрузки мастеров: ${String(e)}`
//             : "Ошибка загрузки мастеров"
//         );
//       }
//     }
//     run();
//   }, [serviceSlug]);

//   // при наличии слотов — показываем блок
//   useEffect(() => {
//     if (slots.length > 0) setSlotsOpen(true);
//   }, [slots.length]);

//   // автоподстановка ДР по имени/телефону
//   useEffect(() => {
//     const n = name.trim();
//     const p = phone.trim();
//     if (!n || !p || birthDate) return;
//     const ctrl = new AbortController();
//     const t = setTimeout(async () => {
//       try {
//         const url = `/api/clients/lookup?name=${encodeURIComponent(
//           n
//         )}&phone=${encodeURIComponent(p)}`;
//         const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
//         if (!res.ok) return;
//         const data: { ok: boolean; birthDateISO: string | null } =
//           await res.json();
//         if (data.ok && data.birthDateISO && !birthDate) {
//           setBirthDate(data.birthDateISO);
//         }
//       } catch {}
//     }, 400);
//     return () => {
//       clearTimeout(t);
//       ctrl.abort();
//     };
//   }, [name, phone, birthDate]);

//   /** Универсальный парсер ответа слотов */
//   function parseSlotsFlexible(dateStr: string, data: unknown): Slot[] {
//     const cast = (v: unknown): Slot | null => {
//       if (typeof v !== "object" || v === null) return null;
//       const o = v as Record<string, unknown>;

//       if (Number.isFinite(o.start) && Number.isFinite(o.end)) {
//         const s = o.start as number;
//         const e = o.end as number;
//         return e > s ? { start: s, end: e } : null;
//       }
//       if (Number.isFinite(o.startMin) && Number.isFinite(o.endMin)) {
//         const s = o.startMin as number;
//         const e = o.endMin as number;
//         return e > s ? { start: s, end: e } : null;
//       }
//       if (typeof o.start === "string" && typeof o.end === "string") {
//         const s = isoToLocalMins(dateStr, o.start);
//         const e = isoToLocalMins(dateStr, o.end);
//         return Number.isFinite(s) && Number.isFinite(e) && e > s
//           ? { start: s, end: e }
//           : null;
//       }
//       return null;
//     };

//     const arr: Slot[] = Array.isArray(data)
//       ? (data as unknown[])
//           .map(cast)
//           .filter((x): x is Slot => !!x)
//           .filter((x) => x.start >= 0 && x.end <= 24 * 60 && x.end > x.start)
//           .sort((a, b) => a.start - b.start)
//       : [];

//     const seen = new Set<string>();
//     const out: Slot[] = [];
//     for (const s of arr) {
//       const k = `${s.start}-${s.end}`;
//       if (!seen.has(k)) {
//         seen.add(k);
//         out.push(s);
//       }
//     }
//     return out;
//   }

//   // загрузка слотов
//   const loadSlots = React.useCallback(async () => {
//     setFormError("");
//     setSelectedKey("");
//     setSlots([]);
//     setLoading(true);

//     try {
//       if (!serviceSlug) {
//         setFormError("Сначала выберите подуслугу.");
//         return;
//       }
//       if (!masterId) {
//         setFormError("Выберите мастера.");
//         return;
//       }
//       if (!dateISO) {
//         setFormError("Сначала выберите дату.");
//         return;
//       }

//       const url =
//         `/api/availability` +
//         `?serviceSlug=${encodeURIComponent(serviceSlug)}` +
//         `&dateISO=${encodeURIComponent(dateISO)}` +
//         `&masterId=${encodeURIComponent(masterId)}`;

//       const res = await fetch(url, { cache: "no-store" });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const raw: unknown = await res.json();
//       const clean = parseSlotsFlexible(dateISO, raw);
//       setSlots(clean);

//       if (clean.length === 0) {
//         setFormError(
//           "На выбранную дату и мастера нет свободных окон. Попробуйте другую дату."
//         );
//       }
//     } catch (e) {
//       setFormError(
//         process.env.NODE_ENV === "development"
//           ? `Ошибка загрузки слотов: ${String(e)}`
//           : "Ошибка загрузки слотов. Попробуйте обновить страницу."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [serviceSlug, dateISO, masterId]);

//   // клиентская валидация
//   const { clientOk, clientErrors } = useMemo(() => {
//     const payload = {
//       serviceSlug,
//       dateISO,
//       startMin: selectedSlot?.start ?? Number.NaN,
//       endMin: selectedSlot?.end ?? Number.NaN,
//       name,
//       phone,
//       email,
//       birthDate,
//       source: source || undefined,
//       notes: notes || undefined,
//       masterId,
//     };
//     const r = BookingSchema.safeParse(payload);
//     if (r.success)
//       return { clientOk: true, clientErrors: {} as Record<string, string> };
//     const errs: Record<string, string> = {};
//     for (const issue of r.error.issues) {
//       const key = String(issue.path?.[0] ?? "");
//       if (key && !errs[key]) {
//         errs[key] =
//           key === "startMin"
//             ? "Не выбрано время. Нажмите на свободный слот."
//             : issue.message;
//       }
//     }
//     return { clientOk: false, clientErrors: errs };
//   }, [
//     serviceSlug,
//     dateISO,
//     selectedSlot,
//     name,
//     phone,
//     email,
//     birthDate,
//     source,
//     notes,
//     masterId,
//   ]);

//   const errors = useMemo(() => {
//     const server = (serverState.fieldErrors ?? {}) as Record<string, string>;
//     return { ...clientErrors, ...server };
//   }, [clientErrors, serverState.fieldErrors]);

//   /* ------------------ UI ------------------ */
//   const showLoadBtn =
//     Boolean(serviceSlug) && Boolean(dateISO) && Boolean(masterId);

//   return (
//     <div className="space-y-6">
//       {/* выбор: категория/подуслуга/мастер и дата */}
//       <div className="grid sm:grid-cols-2 gap-3">
//         <div className="space-y-3">
//           {/* Категория */}
//           <Dropdown
//             label="Категория"
//             open={ddCatOpen}
//             setOpen={setDdCatOpen}
//             refEl={ddCatRef}
//             buttonText={
//               categoryId
//                 ? categories.find((c) => c.id === categoryId)?.name ??
//                   "Выберите категорию…"
//                 : "Выберите категорию…"
//             }
//             items={categories.map((c) => ({
//               key: c.id,
//               text: c.name,
//               active: c.id === categoryId,
//               onClick: () => {
//                 setCategoryId(c.id);
//               },
//             }))}
//           />

//           {/* Подуслуга */}
//           <Dropdown
//             label="Подуслуга"
//             open={ddSrvOpen}
//             setOpen={setDdSrvOpen}
//             refEl={ddSrvRef}
//             disabled={!hasChildren}
//             buttonText={
//               selectedService
//                 ? `${selectedService.name} (${selectedService.durationMin} мин · ${euro(
//                     selectedService.priceCents
//                   )})`
//                 : hasChildren
//                 ? "Выберите подуслугу…"
//                 : "Нет подуслуг"
//             }
//             items={currentChildren.map((s) => ({
//               key: s.slug,
//               text: `${s.name} (${s.durationMin} мин · ${euro(s.priceCents)})`,
//               active: s.slug === serviceSlug,
//               onClick: () => {
//                 setServiceSlug(s.slug);
//               },
//             }))}
//             helpText={
//               !hasChildren
//                 ? "В этой категории пока нет подуслуг. Пожалуйста, выберите другую категорию."
//                 : undefined
//             }
//             error={errors["serviceSlug"]}
//           />

//           {/* Мастер */}
//           <Dropdown
//             label="Мастер"
//             open={ddMstOpen}
//             setOpen={setDdMstOpen}
//             refEl={ddMstRef}
//             disabled={!serviceSlug}
//             buttonText={
//               masterId
//                 ? masters.find((m) => m.id === masterId)?.name ??
//                   "Выберите мастера…"
//                 : masters.length
//                 ? "Выберите мастера…"
//                 : serviceSlug
//                 ? "Нет доступных мастеров"
//                 : "Сначала выберите подуслугу"
//             }
//             items={masters.map((m) => ({
//               key: m.id,
//               text: m.name,
//               active: m.id === masterId,
//               onClick: () => {
//                 setMasterId(m.id);
//               },
//             }))}
//             error={errors["masterId"]}
//           />
//         </div>

//         {/* Дата */}
//         <div>
//           <label className="block text-sm mb-1">Дата</label>
//           <input
//             type="date"
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             value={dateISO}
//             onChange={(e) => setDateISO(e.target.value)}
//           />
//           {errors["dateISO"] && (
//             <span className="mt-1 text-xs text-rose-400">{errors["dateISO"]}</span>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="button"
//             onClick={loadSlots}
//             className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700 disabled:opacity-50"
//             disabled={loading || !showLoadBtn}
//           >
//             {loading ? "Загрузка…" : "Показать свободные слоты"}
//           </button>
//           {formError && (
//             <p className="mt-2 text-xs text-amber-400">{formError}</p>
//           )}
//         </div>
//       </div>

//       {/* слоты */}
//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <p className="text-sm opacity-80">Выберите время:</p>
//           <button
//             type="button"
//             onClick={() => setSlotsOpen((v) => !v)}
//             className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
//           >
//             {slotsOpen ? "Скрыть слоты" : "Показать слоты"}
//           </button>
//         </div>

//         {selectedSlot && (
//           <p className="mb-2 text-sm">
//             Вы выбрали:{" "}
//             <span className="font-semibold">
//               {m2hhmm(selectedSlot.start)}—{m2hhmm(selectedSlot.end)}
//             </span>
//           </p>
//         )}

//         {slotsOpen && (
//           <div className="flex flex-wrap gap-2">
//             {slots.length === 0 && !loading && (
//               <span className="opacity-70 text-sm">Нет свободных окон.</span>
//             )}
//             {slots.map((s) => {
//               const key = `${s.start}-${s.end}`;
//               const isSelected = selectedKey === key;
//               return (
//                 <button
//                   key={key}
//                   type="button"
//                   onClick={() => {
//                     const next = selectedKey === key ? "" : key;
//                     setSelectedKey(next);
//                     setFormError(""); // важно: очищаем «не выбрано время»
//                     // НЕ закрываем список слотов — это путало выбор
//                   }}
//                   className={[
//                     "rounded-full px-3 py-1.5 border transition",
//                     isSelected
//                       ? "bg-white/10 border-white/50"
//                       : "hover:bg-white/10 border-gray-300 dark:border-gray-700",
//                   ].join(" ")}
//                   aria-pressed={isSelected ? "true" : "false"}
//                 >
//                   {m2hhmm(s.start)}–{m2hhmm(s.end)}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//         {errors["startMin"] && (
//           <p className="mt-1 text-xs text-rose-400">{errors["startMin"]}</p>
//         )}
//       </div>

//       {/* форма отправки */}
//       <form action={formAction} className="grid sm:grid-cols-2 gap-3">
//         <input type="hidden" name="serviceSlug" value={serviceSlug} />
//         <input type="hidden" name="dateISO" value={dateISO} />
//         <input type="hidden" name="startMin" value={selectedSlot?.start ?? ""} />
//         <input type="hidden" name="endMin" value={selectedSlot?.end ?? ""} />
//         <input type="hidden" name="masterId" value={masterId} />

//         <FieldText
//           label="Имя"
//           name="name"
//           value={name}
//           onChange={setName}
//           error={errors["name"]}
//           gold
//         />
//         <FieldText
//           label="Телефон"
//           name="phone"
//           value={phone}
//           onChange={setPhone}
//           error={errors["phone"]}
//           inputMode="tel"
//           placeholder="+49 ..."
//         />
//         <FieldText
//           label="E-mail"
//           name="email"
//           value={email}
//           onChange={setEmail}
//           error={errors["email"]}
//           type="email"
//           placeholder="you@example.com"
//         />
//         <FieldText
//           label="Дата рождения"
//           name="birthDate"
//           value={birthDate}
//           onChange={setBirthDate}
//           error={errors["birthDate"]}
//           type="date"
//         />

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Как вы узнали о нас</label>
//           <select
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             name="source"
//             value={source}
//             onChange={(e) => setSource(e.target.value)}
//           >
//             <option value="">— выберите вариант —</option>
//             <option value="Google">Google</option>
//             <option value="Instagram">Instagram</option>
//             <option value="Friends">Знакомые</option>
//             <option value="Facebook">Facebook</option>
//             <option value="Other">Другое</option>
//           </select>
//           {errors["source"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["source"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Комментарий</label>
//           <textarea
//             className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px] border-gray-300 dark:border-gray-700"
//             name="notes"
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             placeholder="Пожелания…"
//           />
//           {errors["notes"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["notes"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="submit"
//             className="rounded-full border px-5 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
//             disabled={
//               isPending ||
//               loading ||
//               !serviceSlug ||
//               !masterId ||
//               !selectedSlot ||
//               !clientOk
//             }
//           >
//             {isPending ? "Отправляем…" : "Записаться"}
//           </button>
//         </div>
//       </form>

//       {successOpen && <SuccessModal onClose={() => router.push("/")} />}

//       {/* глобальный select в dark */}
//       <style jsx global>{`
//         :root {
//           --site-dark: #0b1220;
//         }
//         .dark select option,
//         .dark select optgroup {
//           background-color: var(--site-dark) !important;
//           color: #e5e7eb !important;
//         }
//         .dark select option:checked,
//         .dark select option:hover {
//           background-color: #0f1a2b !important;
//         }
//       `}</style>
//       {/* «золотое» имя, без деградации на мобилках */}
//       <style jsx>{`
//         .goldy-text {
//           font-weight: 600;
//           color: #f5d76e;
//           text-shadow: 0 0 8px rgba(245, 215, 110, 0.45);
//           caret-color: #ffe08a;
//           transition: text-shadow 200ms ease;
//         }
//         @supports (-webkit-background-clip: text) {
//           .goldy-text:not(input):not(textarea) {
//             background-image: linear-gradient(
//               110deg,
//               #b3903b 0%,
//               #f5d76e 25%,
//               #fff3c4 50%,
//               #f5d76e 75%,
//               #b3903b 100%
//             );
//             background-size: 200% auto;
//             background-position: 0% center;
//             -webkit-background-clip: text;
//             background-clip: text;
//             -webkit-text-fill-color: transparent;
//             color: transparent;
//             animation: goldShimmer 4s linear infinite;
//           }
//         }
//         @keyframes goldShimmer {
//           to {
//             background-position: -200% center;
//           }
//         }
//         input.goldy-text,
//         textarea.goldy-text {
//           background-image: none !important;
//           -webkit-background-clip: border-box !important;
//           background-clip: border-box !important;
//           -webkit-text-fill-color: initial !important;
//           animation: none !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ---------- маленькие подкомпоненты ---------- */

// function SuccessModal({ onClose }: { onClose: () => void }) {
//   return (
//     <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
//         <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
//         <p className="opacity-80 mb-4">Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
//         <div className="flex gap-2 justify-end">
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             Ок
//           </button>
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             На главную
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Dropdown(props: {
//   label: string;
//   buttonText: string;
//   items: { key: string; text: string; active: boolean; onClick: () => void }[];
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   refEl: React.RefObject<HTMLDivElement | null>;
//   disabled?: boolean;
//   helpText?: string;
//   error?: string;
// }) {
//   const { label, buttonText, items, open, setOpen, refEl, disabled, helpText, error } = props;
//   return (
//     <div ref={refEl} className="relative">
//       <label className="block text-sm mb-1">{label}</label>
//       <button
//         type="button"
//         aria-haspopup="listbox"
//         aria-expanded={open ? "true" : "false"}
//         onClick={() => !disabled && setOpen(!open)}
//         disabled={disabled}
//         className={[
//           "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
//           "bg-transparent border-gray-300 dark:border-gray-700",
//           "hover:bg-white/5 dark:hover:bg-white/5",
//           disabled ? "opacity-50 cursor-not-allowed" : "",
//         ].join(" ")}
//       >
//         <span className={!buttonText ? "opacity-60" : ""}>{buttonText}</span>
//         <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70" aria-hidden>
//           <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </button>

//       {open && !disabled && (
//         <ul
//           role="listbox"
//           tabIndex={-1}
//           className={[
//             "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
//             "bg-white text-gray-900 border-gray-200",
//             "dark:bg-[#0B1220] dark:text-gray-100 dark:border-gray-700",
//           ].join(" ")}
//         >
//           <li className="px-3 py-2 text-sm opacity-60 select-none">Выберите…</li>
//           {items.map((it) => (
//             <li key={it.key}>
//               <button
//                 type="button"
//                 role="option"
//                 aria-selected={it.active ? "true" : "false"}
//                 onClick={() => {
//                   it.onClick();
//                   setOpen(false);
//                 }}
//                 className={[
//                   "w-full text-left px-3 py-2 transition",
//                   it.active ? "bg-primary/10 dark:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/5",
//                 ].join(" ")}
//               >
//                 {it.text}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {helpText && <p className="mt-1 text-xs text-amber-500">{helpText}</p>}
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }

// function FieldText({
//   label,
//   name,
//   value,
//   onChange,
//   error,
//   type = "text",
//   inputMode,
//   placeholder,
//   gold,
// }: {
//   label: string;
//   name: string;
//   value: string;
//   onChange: (v: string) => void;
//   error?: string;
//   type?: "text" | "email" | "date";
//   inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
//   placeholder?: string;
//   gold?: boolean;
// }) {
//   return (
//     <div>
//       <label className="block text-sm mb-1">{label}</label>
//       <input
//         className={[
//           "w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700",
//           gold && value.trim() ? "goldy-text" : "",
//         ].join(" ")}
//         name={name}
//         type={type}
//         inputMode={inputMode}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         required
//       />
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }






//-----------------почти работал, скрывал занятые слоты, но не давал выбрать которые свободны по бэкенду но не брались по фронту
// "use client";

// import React, {
//   useActionState,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { useRouter } from "next/navigation";

// import { book, type BookState } from "@/app/booking/book";
// import { BookingSchema } from "@/lib/validation/booking";
// import { Temporal } from "@js-temporal/polyfill";
// import { ORG_TZ } from "@/lib/orgTime";

// /* ---------- типы ---------- */
// type SubService = {
//   slug: string;
//   name: string;
//   durationMin: number;
//   description?: string | null;
//   priceCents?: number | null;
// };
// type Category = { id: string; name: string; children: SubService[] };
// type Props = { categories: Category[] };

// type Slot = { start: number; end: number };
// type Master = { id: string; name: string };

// /* ---------- утилы ---------- */
// function m2hhmm(min: number): string {
//   const h = Math.floor(min / 60);
//   const m = min % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }
// function todayISO(): string {
//   const now = Temporal.Now.zonedDateTimeISO(ORG_TZ);
//   return `${now.year}-${String(now.month).padStart(2, "0")}-${String(
//     now.day
//   ).padStart(2, "0")}`;
// }
// function euro(cents: number | null | undefined): string {
//   if (cents == null) return "—";
//   return new Intl.NumberFormat("de-DE", {
//     style: "currency",
//     currency: "EUR",
//   }).format(cents / 100);
// }

// /**
//  * ISO-строка UTC → минуты локального дня салона.
//  * Возвращает количество минут от локальной полуночи выбранной даты.
//  */
// function isoToLocalMins(dateISO: string, iso: string): number {
//   const inst = Temporal.Instant.from(iso); // UTC instant
//   const zdt = inst.toZonedDateTimeISO(ORG_TZ);

//   // Для указанной dateISO берем её локальную полуночь и считаем разницу.
//   const pd = Temporal.PlainDate.from(dateISO);
//   const midnight = pd.toZonedDateTime({ timeZone: ORG_TZ, plainTime: "00:00" });
//   const diffMs = Number(inst.epochMilliseconds) - Number(midnight.toInstant().epochMilliseconds);
//   return Math.round(diffMs / 60000);
// }

// /** если выбранная дата — сегодня (в TZ салона), вернуть «текущие» минуты от полуночи; иначе null */
// function nowMinutesIfToday(dateISO: string): number | null {
//   const now = Temporal.Now.zonedDateTimeISO(ORG_TZ);
//   const pd = Temporal.PlainDate.from(dateISO);
//   const isToday = now.year === pd.year && now.month === pd.month && now.day === pd.day;
//   if (!isToday) return null;
//   return now.hour * 60 + now.minute;
// }

// /* ---------- LS ---------- */
// const LS_NAME = "booking:name";
// const LS_PHONE = "booking:phone";
// const LS_EMAIL = "booking:email";

// /* ========================================================= */
// export default function PublicBookingForm({ categories }: Props) {
//   const router = useRouter();

//   // безопасная инициализация: сначала пустые, потом выставляем после прихода props
//   const [categoryId, setCategoryId] = useState<string>("");
//   const [serviceSlug, setServiceSlug] = useState<string>("");

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [masterId, setMasterId] = useState<string>("");

//   const [dateISO, setDateISO] = useState<string>(todayISO());

//   // дропдауны
//   const [ddCatOpen, setDdCatOpen] = useState(false);
//   const [ddSrvOpen, setDdSrvOpen] = useState(false);
//   const [ddMstOpen, setDdMstOpen] = useState(false);
//   const ddCatRef = useRef<HTMLDivElement | null>(null);
//   const ddSrvRef = useRef<HTMLDivElement | null>(null);
//   const ddMstRef = useRef<HTMLDivElement | null>(null);

//   // слоты
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [slotsOpen, setSlotsOpen] = useState<boolean>(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedKey, setSelectedKey] = useState<string>("");

//   // поля
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [birthDate, setBirthDate] = useState("");
//   const [source, setSource] = useState<string>("");
//   const [notes, setNotes] = useState("");

//   const [formError, setFormError] = useState<string>("");
//   const [successOpen, setSuccessOpen] = useState(false);

//   // server action
//   const initial: BookState = { ok: false };
//   const [serverState, formAction, isPending] = useActionState(book, initial);

//   /* ---------- начальная установка категории/услуги ---------- */
//   useEffect(() => {
//     if (!categories?.length) return;
//     // если ничего не выбрано — выбираем первую категорию и первую подуслугу
//     setCategoryId((prev) => prev || categories[0].id);
//   }, [categories]);

//   useEffect(() => {
//     if (!categoryId) return;
//     const cat = categories.find((c) => c.id === categoryId);
//     if (!cat) return;
//     setServiceSlug((prev) => (prev ? prev : cat.children?.[0]?.slug ?? ""));
//   }, [categoryId, categories]);

//   /* ---------- автоизвлечение из LS ---------- */
//   useEffect(() => {
//     try {
//       const n = localStorage.getItem(LS_NAME);
//       const p = localStorage.getItem(LS_PHONE);
//       const e = localStorage.getItem(LS_EMAIL);
//       if (n) setName(n);
//       if (p) setPhone(p);
//       if (e) setEmail(e);
//     } catch {}
//   }, []);
//   useEffect(() => {
//     try {
//       if (name.trim()) localStorage.setItem(LS_NAME, name.trim());
//     } catch {}
//   }, [name]);
//   useEffect(() => {
//     try {
//       if (phone.trim()) localStorage.setItem(LS_PHONE, phone.trim());
//     } catch {}
//   }, [phone]);
//   useEffect(() => {
//     try {
//       if (email.trim()) localStorage.setItem(LS_EMAIL, email.trim());
//     } catch {}
//   }, [email]);

//   // закрытия дропдаунов
//   useEffect(() => {
//     function onDoc(e: MouseEvent) {
//       if (ddCatRef.current && !ddCatRef.current.contains(e.target as Node))
//         setDdCatOpen(false);
//       if (ddSrvRef.current && !ddSrvRef.current.contains(e.target as Node))
//         setDdSrvOpen(false);
//       if (ddMstRef.current && !ddMstRef.current.contains(e.target as Node))
//         setDdMstOpen(false);
//     }
//     if (ddCatOpen || ddSrvOpen || ddMstOpen)
//       document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [ddCatOpen, ddSrvOpen, ddMstOpen]);

//   /* ---------- вычисления ---------- */
//   const currentChildren = useMemo<SubService[]>(
//     () => categories.find((c) => c.id === categoryId)?.children ?? [],
//     [categories, categoryId]
//   );
//   const hasChildren = currentChildren.length > 0;
//   const selectedService =
//     currentChildren.find((s) => s.slug === serviceSlug) ?? null;

//   // выбранный слот
//   const slotMap = useMemo(() => {
//     const m = new Map<string, Slot>();
//     for (const s of slots) {
//       if (Number.isFinite(s.start) && Number.isFinite(s.end))
//         m.set(`${s.start}-${s.end}`, s);
//     }
//     return m;
//   }, [slots]);
//   const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

//   // ответ сервера
//   useEffect(() => {
//     setFormError(serverState.formError ?? "");
//     if (serverState.ok) {
//       setSelectedKey("");
//       setNotes("");
//       setSuccessOpen(true);
//     }
//   }, [serverState]);

//   // смена категории — сброс подуслуги/мастера
//   useEffect(() => {
//     setMasters([]);
//     setMasterId("");
//     setSlots([]);
//     setSelectedKey("");
//     setSlotsOpen(false);
//   }, [categoryId]);

//   // загрузка мастеров при смене подуслуги
//   useEffect(() => {
//     async function run() {
//       setMasters([]);
//       setMasterId("");
//       setSlots([]);
//       setSelectedKey("");
//       setSlotsOpen(false);
//       if (!serviceSlug) return;
//       try {
//         const res = await fetch(
//           `/api/masters?serviceSlug=${encodeURIComponent(serviceSlug)}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("Не удалось получить мастеров");
//         const data: Master[] = await res.json();
//         setMasters(data);
//       } catch (e) {
//         setFormError(
//           process.env.NODE_ENV === "development"
//             ? `Ошибка загрузки мастеров: ${String(e)}`
//             : "Ошибка загрузки мастеров"
//         );
//       }
//     }
//     run();
//   }, [serviceSlug]);

//   // при наличии слотов — показываем блок
//   useEffect(() => {
//     if (slots.length > 0) setSlotsOpen(true);
//   }, [slots.length]);

//   // автоподстановка ДР по имени/телефону
//   useEffect(() => {
//     const n = name.trim();
//     const p = phone.trim();
//     if (!n || !p || birthDate) return;
//     const ctrl = new AbortController();
//     const t = setTimeout(async () => {
//       try {
//         const url = `/api/clients/lookup?name=${encodeURIComponent(
//           n
//         )}&phone=${encodeURIComponent(p)}`;
//         const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
//         if (!res.ok) return;
//         const data: { ok: boolean; birthDateISO: string | null } =
//           await res.json();
//         if (data.ok && data.birthDateISO && !birthDate) {
//           setBirthDate(data.birthDateISO);
//         }
//       } catch {}
//     }, 400);
//     return () => {
//       clearTimeout(t);
//       ctrl.abort();
//     };
//   }, [name, phone, birthDate]);

//   /** Определяем, что элемент ответа помечен как занятый */
//   function isBusyFlag(obj: Record<string, unknown>): boolean {
//     // поддержка разных вариантов API
//     if (obj.busy === true) return true;
//     if (obj.available === false) return true;
//     if (obj.free === false) return true;
//     if (typeof obj.status === "string") {
//       const s = obj.status.toLowerCase();
//       if (s === "busy" || s === "occupied" || s === "taken" || s === "unavailable") return true;
//     }
//     return false;
//   }

//   /** Универсальный парсер ответа слотов + скрытие занятых и прошедших */
//   function parseSlotsFlexible(dateStr: string, data: unknown): Slot[] {
//     const cast = (v: unknown): Slot | null => {
//       if (typeof v !== "object" || v === null) return null;
//       const o = v as Record<string, unknown>;

//       // пропускаем занятые слоты (любая из поддерживаемых пометок)
//       if (isBusyFlag(o)) return null;

//       // 1) минуты: { start, end }
//       if (Number.isFinite(o.start) && Number.isFinite(o.end)) {
//         const s = o.start as number;
//         const e = o.end as number;
//         return e > s ? { start: s, end: e } : null;
//       }
//       // 2) минуты: { startMin, endMin }
//       if (Number.isFinite(o.startMin) && Number.isFinite(o.endMin)) {
//         const s = o.startMin as number;
//         const e = o.endMin as number;
//         return e > s ? { start: s, end: e } : null;
//       }
//       // 3) ISO: { start: string, end: string }
//       if (typeof o.start === "string" && typeof o.end === "string") {
//         const s = isoToLocalMins(dateStr, o.start);
//         const e = isoToLocalMins(dateStr, o.end);
//         return Number.isFinite(s) && Number.isFinite(e) && e > s
//           ? { start: s, end: e }
//           : null;
//       }
//       return null;
//     };

//     // собрали, отфильтровали по форме
//     const arr: Slot[] = Array.isArray(data)
//       ? (data as unknown[])
//           .map(cast)
//           .filter((x): x is Slot => !!x)
//       : [];

//     // «сегодня» — убираем прошедшие
//     const nowMin = nowMinutesIfToday(dateStr);
//     const withToday = nowMin == null ? arr : arr.filter((s) => s.start >= nowMin);

//     // вменяемые границы и сортировка
//     const normalized = withToday
//       .filter((x) => x.start >= 0 && x.end <= 24 * 60 && x.end > x.start)
//       .sort((a, b) => a.start - b.start);

//     // уникализируем
//     const seen = new Set<string>();
//     const out: Slot[] = [];
//     for (const s of normalized) {
//       const k = `${s.start}-${s.end}`;
//       if (!seen.has(k)) {
//         seen.add(k);
//         out.push(s);
//       }
//     }
//     return out;
//   }

//   // загрузка слотов
//   const loadSlots = React.useCallback(async () => {
//     setFormError("");
//     setSelectedKey("");
//     setSlots([]);
//     setLoading(true);

//     try {
//       if (!serviceSlug) {
//         setFormError("Сначала выберите подуслугу.");
//         return;
//       }
//       if (!masterId) {
//         setFormError("Выберите мастера.");
//         return;
//       }
//       if (!dateISO) {
//         setFormError("Сначала выберите дату.");
//         return;
//       }

//       const url =
//         `/api/availability` +
//         `?serviceSlug=${encodeURIComponent(serviceSlug)}` +
//         `&dateISO=${encodeURIComponent(dateISO)}` +
//         `&masterId=${encodeURIComponent(masterId)}`;

//       const res = await fetch(url, { cache: "no-store" });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const raw: unknown = await res.json();
//       const clean = parseSlotsFlexible(dateISO, raw);
//       setSlots(clean);

//       if (clean.length === 0) {
//         setFormError(
//           "На выбранную дату и мастера нет свободных окон. Попробуйте другую дату."
//         );
//       }
//     } catch (e) {
//       setFormError(
//         process.env.NODE_ENV === "development"
//           ? `Ошибка загрузки слотов: ${String(e)}`
//           : "Ошибка загрузки слотов. Попробуйте обновить страницу."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [serviceSlug, dateISO, masterId]);

//   // клиентская валидация
//   const { clientOk, clientErrors } = useMemo(() => {
//     const payload = {
//       serviceSlug,
//       dateISO,
//       startMin: selectedSlot?.start ?? Number.NaN,
//       endMin: selectedSlot?.end ?? Number.NaN,
//       name,
//       phone,
//       email,
//       birthDate,
//       source: source || undefined,
//       notes: notes || undefined,
//       masterId,
//     };
//     const r = BookingSchema.safeParse(payload);
//     if (r.success)
//       return { clientOk: true, clientErrors: {} as Record<string, string> };
//     const errs: Record<string, string> = {};
//     for (const issue of r.error.issues) {
//       const key = String(issue.path?.[0] ?? "");
//       if (key && !errs[key]) {
//         errs[key] =
//           key === "startMin"
//             ? "Не выбрано время. Нажмите на свободный слот."
//             : issue.message;
//       }
//     }
//     return { clientOk: false, clientErrors: errs };
//   }, [
//     serviceSlug,
//     dateISO,
//     selectedSlot,
//     name,
//     phone,
//     email,
//     birthDate,
//     source,
//     notes,
//     masterId,
//   ]);

//   const errors = useMemo(() => {
//     const server = (serverState.fieldErrors ?? {}) as Record<string, string>;
//     return { ...clientErrors, ...server };
//   }, [clientErrors, serverState.fieldErrors]);

//   /* ------------------ UI ------------------ */
//   const showLoadBtn =
//     Boolean(serviceSlug) && Boolean(dateISO) && Boolean(masterId);

//   return (
//     <div className="space-y-6">
//       {/* выбор: категория/подуслуга/мастер и дата */}
//       <div className="grid sm:grid-cols-2 gap-3">
//         <div className="space-y-3">
//           {/* Категория */}
//           <Dropdown
//             label="Категория"
//             open={ddCatOpen}
//             setOpen={setDdCatOpen}
//             refEl={ddCatRef}
//             buttonText={
//               categoryId
//                 ? categories.find((c) => c.id === categoryId)?.name ??
//                   "Выберите категорию…"
//                 : "Выберите категорию…"
//             }
//             items={categories.map((c) => ({
//               key: c.id,
//               text: c.name,
//               active: c.id === categoryId,
//               onClick: () => {
//                 setCategoryId(c.id);
//               },
//             }))}
//           />

//           {/* Подуслуга */}
//           <Dropdown
//             label="Подуслуга"
//             open={ddSrvOpen}
//             setOpen={setDdSrvOpen}
//             refEl={ddSrvRef}
//             disabled={!hasChildren}
//             buttonText={
//               selectedService
//                 ? `${selectedService.name} (${selectedService.durationMin} мин · ${euro(
//                     selectedService.priceCents
//                   )})`
//                 : hasChildren
//                 ? "Выберите подуслугу…"
//                 : "Нет подуслуг"
//             }
//             items={currentChildren.map((s) => ({
//               key: s.slug,
//               text: `${s.name} (${s.durationMin} мин · ${euro(s.priceCents)})`,
//               active: s.slug === serviceSlug,
//               onClick: () => {
//                 setServiceSlug(s.slug);
//               },
//             }))}
//             helpText={
//               !hasChildren
//                 ? "В этой категории пока нет подуслуг. Пожалуйста, выберите другую категорию."
//                 : undefined
//             }
//             error={errors["serviceSlug"]}
//           />

//           {/* Мастер */}
//           <Dropdown
//             label="Мастер"
//             open={ddMstOpen}
//             setOpen={setDdMstOpen}
//             refEl={ddMstRef}
//             disabled={!serviceSlug}
//             buttonText={
//               masterId
//                 ? masters.find((m) => m.id === masterId)?.name ??
//                   "Выберите мастера…"
//                 : masters.length
//                 ? "Выберите мастера…"
//                 : serviceSlug
//                 ? "Нет доступных мастеров"
//                 : "Сначала выберите подуслугу"
//             }
//             items={masters.map((m) => ({
//               key: m.id,
//               text: m.name,
//               active: m.id === masterId,
//               onClick: () => {
//                 setMasterId(m.id);
//               },
//             }))}
//             error={errors["masterId"]}
//           />
//         </div>

//         {/* Дата */}
//         <div>
//           <label className="block text-sm mb-1">Дата</label>
//           <input
//             type="date"
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             value={dateISO}
//             onChange={(e) => setDateISO(e.target.value)}
//           />
//           {errors["dateISO"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["dateISO"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="button"
//             onClick={loadSlots}
//             className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700 disabled:opacity-50"
//             disabled={loading || !showLoadBtn}
//           >
//             {loading ? "Загрузка…" : "Показать свободные слоты"}
//           </button>
//           {formError && (
//             <p className="mt-2 text-xs text-amber-400">{formError}</p>
//           )}
//         </div>
//       </div>

//       {/* слоты */}
//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <p className="text-sm opacity-80">Выберите время:</p>
//           <button
//             type="button"
//             onClick={() => setSlotsOpen((v) => !v)}
//             className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
//           >
//             {slotsOpen ? "Скрыть слоты" : "Показать слоты"}
//           </button>
//         </div>

//         {slotsOpen && (
//           <div className="flex flex-wrap gap-2">
//             {slots.length === 0 && !loading && (
//               <span className="opacity-70 text-sm">Нет свободных окон.</span>
//             )}
//             {slots.map((s) => {
//               const key = `${s.start}-${s.end}`;
//               const isSelected = selectedKey === key;
//               return (
//                 <button
//                   key={key}
//                   type="button"
//                   onClick={() => {
//                     const next = selectedKey === key ? "" : key;
//                     setSelectedKey(next);
//                     if (next) setSlotsOpen(false);
//                   }}
//                   className={[
//                     "rounded-full px-3 py-1.5 border transition",
//                     isSelected
//                       ? "bg-white/10 border-white/50"
//                       : "hover:bg-white/10 border-gray-300 dark:border-gray-700",
//                   ].join(" ")}
//                   aria-pressed={isSelected ? "true" : "false"}
//                 >
//                   {m2hhmm(s.start)}–{m2hhmm(s.end)}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//         {errors["startMin"] && (
//           <p className="mt-1 text-xs text-rose-400">{errors["startMin"]}</p>
//         )}
//       </div>

//       {/* форма отправки */}
//       <form action={formAction} className="grid sm:grid-cols-2 gap-3">
//         <input type="hidden" name="serviceSlug" value={serviceSlug} />
//         <input type="hidden" name="dateISO" value={dateISO} />
//         <input type="hidden" name="startMin" value={selectedSlot?.start ?? ""} />
//         <input type="hidden" name="endMin" value={selectedSlot?.end ?? ""} />
//         <input type="hidden" name="masterId" value={masterId} />

//         <FieldText
//           label="Имя"
//           name="name"
//           value={name}
//           onChange={setName}
//           error={errors["name"]}
//           gold
//         />
//         <FieldText
//           label="Телефон"
//           name="phone"
//           value={phone}
//           onChange={setPhone}
//           error={errors["phone"]}
//           inputMode="tel"
//           placeholder="+49 ..."
//         />
//         <FieldText
//           label="E-mail"
//           name="email"
//           value={email}
//           onChange={setEmail}
//           error={errors["email"]}
//           type="email"
//           placeholder="you@example.com"
//         />
//         <FieldText
//           label="Дата рождения"
//           name="birthDate"
//           value={birthDate}
//           onChange={setBirthDate}
//           error={errors["birthDate"]}
//           type="date"
//         />

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Как вы узнали о нас</label>
//           <select
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             name="source"
//             value={source}
//             onChange={(e) => setSource(e.target.value)}
//           >
//             <option value="">— выберите вариант —</option>
//             <option value="Google">Google</option>
//             <option value="Instagram">Instagram</option>
//             <option value="Friends">Знакомые</option>
//             <option value="Facebook">Facebook</option>
//             <option value="Other">Другое</option>
//           </select>
//           {errors["source"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["source"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Комментарий</label>
//           <textarea
//             className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px] border-gray-300 dark:border-gray-700"
//             name="notes"
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             placeholder="Пожелания…"
//           />
//           {errors["notes"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["notes"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="submit"
//             className="rounded-full border px-5 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
//             disabled={
//               isPending ||
//               loading ||
//               !serviceSlug ||
//               !masterId ||
//               !selectedSlot ||
//               !clientOk
//             }
//           >
//             {isPending ? "Отправляем…" : "Записаться"}
//           </button>
//         </div>
//       </form>

//       {successOpen && <SuccessModal onClose={() => router.push("/")} />}

//       {/* глобальный select в dark */}
//       <style jsx global>{`
//         :root {
//           --site-dark: #0b1220;
//         }
//         .dark select option,
//         .dark select optgroup {
//           background-color: var(--site-dark) !important;
//           color: #e5e7eb !important;
//         }
//         .dark select option:checked,
//         .dark select option:hover {
//           background-color: #0f1a2b !important;
//         }
//       `}</style>
//       {/* «золотое» имя, без деградации на мобилках */}
//       <style jsx>{`
//         .goldy-text {
//           font-weight: 600;
//           color: #f5d76e;
//           text-shadow: 0 0 8px rgba(245, 215, 110, 0.45);
//           caret-color: #ffe08a;
//           transition: text-shadow 200ms ease;
//         }
//         @supports (-webkit-background-clip: text) {
//           .goldy-text:not(input):not(textarea) {
//             background-image: linear-gradient(
//               110deg,
//               #b3903b 0%,
//               #f5d76e 25%,
//               #fff3c4 50%,
//               #f5d76e 75%,
//               #b3903b 100%
//             );
//             background-size: 200% auto;
//             background-position: 0% center;
//             -webkit-background-clip: text;
//             background-clip: text;
//             -webkit-text-fill-color: transparent;
//             color: transparent;
//             animation: goldShimmer 4s linear infinite;
//           }
//         }
//         @keyframes goldShimmer {
//           to {
//             background-position: -200% center;
//           }
//         }
//         input.goldy-text,
//         textarea.goldy-text {
//           background-image: none !important;
//           -webkit-background-clip: border-box !important;
//           background-clip: border-box !important;
//           -webkit-text-fill-color: initial !important;
//           animation: none !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ---------- маленькие подкомпоненты ---------- */

// function SuccessModal({ onClose }: { onClose: () => void }) {
//   return (
//     <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
//         <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
//         <p className="opacity-80 mb-4">Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
//         <div className="flex gap-2 justify-end">
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             Ок
//           </button>
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             На главную
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Dropdown(props: {
//   label: string;
//   buttonText: string;
//   items: { key: string; text: string; active: boolean; onClick: () => void }[];
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   refEl: React.RefObject<HTMLDivElement | null>;
//   disabled?: boolean;
//   helpText?: string;
//   error?: string;
// }) {
//   const { label, buttonText, items, open, setOpen, refEl, disabled, helpText, error } = props;
//   return (
//     <div ref={refEl} className="relative">
//       <label className="block text-sm mb-1">{label}</label>
//       <button
//         type="button"
//         aria-haspopup="listbox"
//         aria-expanded={open ? "true" : "false"}
//         onClick={() => !disabled && setOpen(!open)}
//         disabled={disabled}
//         className={[
//           "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
//           "bg-transparent border-gray-300 dark:border-gray-700",
//           "hover:bg-white/5 dark:hover:bg-white/5",
//           disabled ? "opacity-50 cursor-not-allowed" : "",
//         ].join(" ")}
//       >
//         <span className={!buttonText ? "opacity-60" : ""}>{buttonText}</span>
//         <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70" aria-hidden>
//           <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </button>

//       {open && !disabled && (
//         <ul
//           role="listbox"
//           tabIndex={-1}
//           className={[
//             "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
//             "bg-white text-gray-900 border-gray-200",
//             "dark:bg-[#0B1220] dark:text-gray-100 dark:border-gray-700",
//           ].join(" ")}
//         >
//           <li className="px-3 py-2 text-sm opacity-60 select-none">Выберите…</li>
//           {items.map((it) => (
//             <li key={it.key}>
//               <button
//                 type="button"
//                 role="option"
//                 aria-selected={it.active ? "true" : "false"}
//                 onClick={() => {
//                   it.onClick();
//                   setOpen(false);
//                 }}
//                 className={[
//                   "w-full text-left px-3 py-2 transition",
//                   it.active ? "bg-primary/10 dark:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/5",
//                 ].join(" ")}
//               >
//                 {it.text}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {helpText && <p className="mt-1 text-xs text-amber-500">{helpText}</p>}
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }

// function FieldText({
//   label,
//   name,
//   value,
//   onChange,
//   error,
//   type = "text",
//   inputMode,
//   placeholder,
//   gold,
// }: {
//   label: string;
//   name: string;
//   value: string;
//   onChange: (v: string) => void;
//   error?: string;
//   type?: "text" | "email" | "date";
//   inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
//   placeholder?: string;
//   gold?: boolean;
// }) {
//   return (
//     <div>
//       <label className="block text-sm mb-1">{label}</label>
//       <input
//         className={[
//           "w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700",
//           gold && value.trim() ? "goldy-text" : "",
//         ].join(" ")}
//         name={name}
//         type={type}
//         inputMode={inputMode}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         required
//       />
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }





//-------------работал пока не решил убрать лишние слоты
// // src/components/public-booking-form.tsx
// "use client";

// import React, {
//   useActionState,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { useRouter } from "next/navigation";

// import { book, type BookState } from "@/app/booking/book";
// import { BookingSchema } from "@/lib/validation/booking";

// /* ---------- типы ---------- */
// type SubService = {
//   slug: string;
//   name: string;
//   durationMin: number;
//   description?: string | null;
//   priceCents?: number | null;
// };
// type Category = { id: string; name: string; children: SubService[] };
// type Props = { categories: Category[] };

// type Slot = { start: number; end: number };
// type Master = { id: string; name: string };

// /* ---------- утилы ---------- */
// function m2hhmm(min: number): string {
//   const h = Math.floor(min / 60);
//   const m = min % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }
// function todayISO(): string {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;
// }
// function euro(cents: number | null | undefined): string {
//   if (cents == null) return "—";
//   return new Intl.NumberFormat("de-DE", {
//     style: "currency",
//     currency: "EUR",
//   }).format(cents / 100);
// }

// /** ISO (UTC) -> минуты локального дня Europe/Berlin для указанной dateISO */
// function isoToLocalMins(dateISO: string, iso: string): number {
//   const d = new Date(iso); // это UTC-инстант
//   if (!Number.isFinite(d.getTime())) return NaN;

//   // Берём локальную полночь Europe/Berlin для указанной dateISO
//   const asUtcMidnight = new Date(`${dateISO}T00:00:00Z`);
//   const dtf = new Intl.DateTimeFormat("en-US", {
//     timeZone: "Europe/Berlin",
//     hour12: false,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
//   const parts = dtf.formatToParts(asUtcMidnight);
//   const map: Record<string, string> = {};
//   for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;
//   // это локальная (Берлин) полуночь как UTC-время
//   const berlinMidnightUTC = Date.UTC(
//     Number(map.year),
//     Number(map.month) - 1,
//     Number(map.day),
//     0,
//     0,
//     0
//   );
//   const diffMs = d.getTime() - berlinMidnightUTC;
//   return Math.round(diffMs / 60000);
// }

// /* ---------- LS ---------- */
// const LS_NAME = "booking:name";
// const LS_PHONE = "booking:phone";
// const LS_EMAIL = "booking:email";

// /* ========================================================= */
// export default function PublicBookingForm({ categories }: Props) {
//   const router = useRouter();

//   // безопасная инициализация: сначала пустые, потом выставляем после прихода props
//   const [categoryId, setCategoryId] = useState<string>("");
//   const [serviceSlug, setServiceSlug] = useState<string>("");

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [masterId, setMasterId] = useState<string>("");

//   const [dateISO, setDateISO] = useState<string>(todayISO());

//   // дропдауны
//   const [ddCatOpen, setDdCatOpen] = useState(false);
//   const [ddSrvOpen, setDdSrvOpen] = useState(false);
//   const [ddMstOpen, setDdMstOpen] = useState(false);
//   const ddCatRef = useRef<HTMLDivElement | null>(null);
//   const ddSrvRef = useRef<HTMLDivElement | null>(null);
//   const ddMstRef = useRef<HTMLDivElement | null>(null);

//   // слоты
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [slotsOpen, setSlotsOpen] = useState<boolean>(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedKey, setSelectedKey] = useState<string>("");

//   // поля
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [birthDate, setBirthDate] = useState("");
//   const [source, setSource] = useState<string>("");
//   const [notes, setNotes] = useState("");

//   const [formError, setFormError] = useState<string>("");
//   const [successOpen, setSuccessOpen] = useState(false);

//   // server action
//   const initial: BookState = { ok: false };
//   const [serverState, formAction, isPending] = useActionState(book, initial);

//   /* ---------- начальная установка категории/услуги ---------- */
//   useEffect(() => {
//     if (!categories?.length) return;
//     // если ничего не выбрано — выбираем первую категорию и первую подуслугу
//     setCategoryId((prev) => prev || categories[0].id);
//   }, [categories]);

//   useEffect(() => {
//     if (!categoryId) return;
//     const cat = categories.find((c) => c.id === categoryId);
//     if (!cat) return;
//     setServiceSlug((prev) => (prev ? prev : cat.children?.[0]?.slug ?? ""));
//   }, [categoryId, categories]);

//   /* ---------- автоизвлечение из LS ---------- */
//   useEffect(() => {
//     try {
//       const n = localStorage.getItem(LS_NAME);
//       const p = localStorage.getItem(LS_PHONE);
//       const e = localStorage.getItem(LS_EMAIL);
//       if (n) setName(n);
//       if (p) setPhone(p);
//       if (e) setEmail(e);
//     } catch {}
//   }, []);
//   useEffect(() => {
//     try {
//       if (name.trim()) localStorage.setItem(LS_NAME, name.trim());
//     } catch {}
//   }, [name]);
//   useEffect(() => {
//     try {
//       if (phone.trim()) localStorage.setItem(LS_PHONE, phone.trim());
//     } catch {}
//   }, [phone]);
//   useEffect(() => {
//     try {
//       if (email.trim()) localStorage.setItem(LS_EMAIL, email.trim());
//     } catch {}
//   }, [email]);

//   // закрытия дропдаунов
//   useEffect(() => {
//     function onDoc(e: MouseEvent) {
//       if (ddCatRef.current && !ddCatRef.current.contains(e.target as Node))
//         setDdCatOpen(false);
//       if (ddSrvRef.current && !ddSrvRef.current.contains(e.target as Node))
//         setDdSrvOpen(false);
//       if (ddMstRef.current && !ddMstRef.current.contains(e.target as Node))
//         setDdMstOpen(false);
//     }
//     if (ddCatOpen || ddSrvOpen || ddMstOpen)
//       document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [ddCatOpen, ddSrvOpen, ddMstOpen]);

//   /* ---------- вычисления ---------- */
//   const currentChildren = useMemo<SubService[]>(
//     () => categories.find((c) => c.id === categoryId)?.children ?? [],
//     [categories, categoryId]
//   );
//   const hasChildren = currentChildren.length > 0;
//   const selectedService =
//     currentChildren.find((s) => s.slug === serviceSlug) ?? null;

//   // выбранный слот
//   const slotMap = useMemo(() => {
//     const m = new Map<string, Slot>();
//     for (const s of slots) {
//       if (Number.isFinite(s.start) && Number.isFinite(s.end))
//         m.set(`${s.start}-${s.end}`, s);
//     }
//     return m;
//   }, [slots]);
//   const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

//   // ответ сервера
//   useEffect(() => {
//     setFormError(serverState.formError ?? "");
//     if (serverState.ok) {
//       setSelectedKey("");
//       setNotes("");
//       setSuccessOpen(true);
//     }
//   }, [serverState]);

//   // смена категории — сброс подуслуги/мастера
//   useEffect(() => {
//     setMasters([]);
//     setMasterId("");
//     setSlots([]);
//     setSelectedKey("");
//     setSlotsOpen(false);
//   }, [categoryId]);

//   // загрузка мастеров при смене подуслуги
//   useEffect(() => {
//     async function run() {
//       setMasters([]);
//       setMasterId("");
//       setSlots([]);
//       setSelectedKey("");
//       setSlotsOpen(false);
//       if (!serviceSlug) return;
//       try {
//         const res = await fetch(
//           `/api/masters?serviceSlug=${encodeURIComponent(serviceSlug)}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("Не удалось получить мастеров");
//         const data: Master[] = await res.json();
//         setMasters(data);
//       } catch (e) {
//         setFormError(
//           process.env.NODE_ENV === "development"
//             ? `Ошибка загрузки мастеров: ${String(e)}`
//             : "Ошибка загрузки мастеров"
//         );
//       }
//     }
//     run();
//   }, [serviceSlug]);

//   // при наличии слотов — показываем блок
//   useEffect(() => {
//     if (slots.length > 0) setSlotsOpen(true);
//   }, [slots.length]);

//   // автоподстановка ДР по имени/телефону
//   useEffect(() => {
//     const n = name.trim();
//     const p = phone.trim();
//     if (!n || !p || birthDate) return;
//     const ctrl = new AbortController();
//     const t = setTimeout(async () => {
//       try {
//         const url = `/api/clients/lookup?name=${encodeURIComponent(
//           n
//         )}&phone=${encodeURIComponent(p)}`;
//         const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
//         if (!res.ok) return;
//         const data: { ok: boolean; birthDateISO: string | null } =
//           await res.json();
//         if (data.ok && data.birthDateISO && !birthDate) {
//           setBirthDate(data.birthDateISO);
//         }
//       } catch {}
//     }, 400);
//     return () => {
//       clearTimeout(t);
//       ctrl.abort();
//     };
//   }, [name, phone, birthDate]);

//   /** Универсальный парсер ответа слотов */
//   function parseSlotsFlexible(dateStr: string, data: unknown): Slot[] {
//     const cast = (v: unknown): Slot | null => {
//       if (typeof v !== "object" || v === null) return null;
//       const o = v as Record<string, unknown>;

//       // 1) минуты: { start, end }
//       if (Number.isFinite(o.start) && Number.isFinite(o.end)) {
//         const s = o.start as number;
//         const e = o.end as number;
//         return e > s ? { start: s, end: e } : null;
//       }
//       // 2) минуты: { startMin, endMin }
//       if (Number.isFinite(o.startMin) && Number.isFinite(o.endMin)) {
//         const s = o.startMin as number;
//         const e = o.endMin as number;
//         return e > s ? { start: s, end: e } : null;
//       }
//       // 3) ISO: { start: string, end: string }
//       if (typeof o.start === "string" && typeof o.end === "string") {
//         const s = isoToLocalMins(dateStr, o.start);
//         const e = isoToLocalMins(dateStr, o.end);
//         return Number.isFinite(s) && Number.isFinite(e) && e > s
//           ? { start: s, end: e }
//           : null;
//       }
//       return null;
//       };
//     const arr: Slot[] = Array.isArray(data)
//       ? (data as unknown[])
//           .map(cast)
//           .filter((x): x is Slot => !!x)
//           .filter((x) => x.start >= 0 && x.end <= 24 * 60 && x.end > x.start)
//           .sort((a, b) => a.start - b.start)
//       : [];
//     // уникализируем на всякий
//     const seen = new Set<string>();
//     const out: Slot[] = [];
//     for (const s of arr) {
//       const k = `${s.start}-${s.end}`;
//       if (!seen.has(k)) {
//         seen.add(k);
//         out.push(s);
//       }
//     }
//     return out;
//   }

//   // загрузка слотов
//   const loadSlots = React.useCallback(async () => {
//     setFormError("");
//     setSelectedKey("");
//     setSlots([]);
//     setLoading(true);

//     try {
//       // строгая защита: вообще не делаем запрос, если чего-то нет
//       if (!serviceSlug) {
//         setFormError("Сначала выберите подуслугу.");
//         return;
//       }
//       if (!masterId) {
//         setFormError("Выберите мастера.");
//         return;
//       }
//       if (!dateISO) {
//         setFormError("Сначала выберите дату.");
//         return;
//       }

//       const url =
//         `/api/availability` +
//         `?serviceSlug=${encodeURIComponent(serviceSlug)}` +
//         `&dateISO=${encodeURIComponent(dateISO)}` +
//         `&masterId=${encodeURIComponent(masterId)}`;

//       const res = await fetch(url, { cache: "no-store" });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);

//       const raw: unknown = await res.json();
//       const clean = parseSlotsFlexible(dateISO, raw);
//       setSlots(clean);

//       if (clean.length === 0) {
//         setFormError(
//           "На выбранную дату и мастера нет свободных окон. Попробуйте другую дату."
//         );
//       }
//     } catch (e) {
//       setFormError(
//         process.env.NODE_ENV === "development"
//           ? `Ошибка загрузки слотов: ${String(e)}`
//           : "Ошибка загрузки слотов. Попробуйте обновить страницу."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [serviceSlug, dateISO, masterId]);

//   // клиентская валидация
//   const { clientOk, clientErrors } = useMemo(() => {
//     const payload = {
//       serviceSlug,
//       dateISO,
//       startMin: selectedSlot?.start ?? Number.NaN,
//       endMin: selectedSlot?.end ?? Number.NaN,
//       name,
//       phone,
//       email,
//       birthDate,
//       source: source || undefined,
//       notes: notes || undefined,
//       masterId,
//     };
//     const r = BookingSchema.safeParse(payload);
//     if (r.success)
//       return { clientOk: true, clientErrors: {} as Record<string, string> };
//     const errs: Record<string, string> = {};
//     for (const issue of r.error.issues) {
//       const key = String(issue.path?.[0] ?? "");
//       if (key && !errs[key]) {
//         errs[key] =
//           key === "startMin"
//             ? "Не выбрано время. Нажмите на свободный слот."
//             : issue.message;
//       }
//     }
//     return { clientOk: false, clientErrors: errs };
//   }, [
//     serviceSlug,
//     dateISO,
//     selectedSlot,
//     name,
//     phone,
//     email,
//     birthDate,
//     source,
//     notes,
//     masterId,
//   ]);

//   const errors = useMemo(() => {
//     const server = (serverState.fieldErrors ?? {}) as Record<string, string>;
//     return { ...clientErrors, ...server };
//   }, [clientErrors, serverState.fieldErrors]);

//   /* ------------------ UI ------------------ */
//   const showLoadBtn =
//     Boolean(serviceSlug) && Boolean(dateISO) && Boolean(masterId);

//   return (
//     <div className="space-y-6">
//       {/* выбор: категория/подуслуга/мастер и дата */}
//       <div className="grid sm:grid-cols-2 gap-3">
//         <div className="space-y-3">
//           {/* Категория */}
//           <Dropdown
//             label="Категория"
//             open={ddCatOpen}
//             setOpen={setDdCatOpen}
//             refEl={ddCatRef}
//             buttonText={
//               categoryId
//                 ? categories.find((c) => c.id === categoryId)?.name ??
//                   "Выберите категорию…"
//                 : "Выберите категорию…"
//             }
//             items={categories.map((c) => ({
//               key: c.id,
//               text: c.name,
//               active: c.id === categoryId,
//               onClick: () => {
//                 setCategoryId(c.id);
//               },
//             }))}
//           />

//           {/* Подуслуга */}
//           <Dropdown
//             label="Подуслуга"
//             open={ddSrvOpen}
//             setOpen={setDdSrvOpen}
//             refEl={ddSrvRef}
//             disabled={!hasChildren}
//             buttonText={
//               selectedService
//                 ? `${selectedService.name} (${selectedService.durationMin} мин · ${euro(
//                     selectedService.priceCents
//                   )})`
//                 : hasChildren
//                 ? "Выберите подуслугу…"
//                 : "Нет подуслуг"
//             }
//             items={currentChildren.map((s) => ({
//               key: s.slug,
//               text: `${s.name} (${s.durationMin} мин · ${euro(s.priceCents)})`,
//               active: s.slug === serviceSlug,
//               onClick: () => {
//                 setServiceSlug(s.slug);
//               },
//             }))}
//             helpText={
//               !hasChildren
//                 ? "В этой категории пока нет подуслуг. Пожалуйста, выберите другую категорию."
//                 : undefined
//             }
//             error={errors["serviceSlug"]}
//           />

//           {/* Мастер */}
//           <Dropdown
//             label="Мастер"
//             open={ddMstOpen}
//             setOpen={setDdMstOpen}
//             refEl={ddMstRef}
//             disabled={!serviceSlug}
//             buttonText={
//               masterId
//                 ? masters.find((m) => m.id === masterId)?.name ??
//                   "Выберите мастера…"
//                 : masters.length
//                 ? "Выберите мастера…"
//                 : serviceSlug
//                 ? "Нет доступных мастеров"
//                 : "Сначала выберите подуслугу"
//             }
//             items={masters.map((m) => ({
//               key: m.id,
//               text: m.name,
//               active: m.id === masterId,
//               onClick: () => {
//                 setMasterId(m.id);
//               },
//             }))}
//             error={errors["masterId"]}
//           />
//         </div>

//         {/* Дата */}
//         <div>
//           <label className="block text-sm mb-1">Дата</label>
//           <input
//             type="date"
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             value={dateISO}
//             onChange={(e) => setDateISO(e.target.value)}
//           />
//           {errors["dateISO"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["dateISO"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="button"
//             onClick={loadSlots}
//             className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700 disabled:opacity-50"
//             disabled={loading || !showLoadBtn}
//           >
//             {loading ? "Загрузка…" : "Показать свободные слоты"}
//           </button>
//           {formError && (
//             <p className="mt-2 text-xs text-amber-400">{formError}</p>
//           )}
//         </div>
//       </div>

//       {/* слоты */}
//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <p className="text-sm opacity-80">Выберите время:</p>
//           <button
//             type="button"
//             onClick={() => setSlotsOpen((v) => !v)}
//             className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
//           >
//             {slotsOpen ? "Скрыть слоты" : "Показать слоты"}
//           </button>
//         </div>

//         {slotsOpen && (
//           <div className="flex flex-wrap gap-2">
//             {slots.length === 0 && !loading && (
//               <span className="opacity-70 text-sm">Нет свободных окон.</span>
//             )}
//             {slots.map((s) => {
//               const key = `${s.start}-${s.end}`;
//               const isSelected = selectedKey === key;
//               return (
//                 <button
//                   key={key}
//                   type="button"
//                   onClick={() => {
//                     const next = selectedKey === key ? "" : key;
//                     setSelectedKey(next);
//                     if (next) setSlotsOpen(false);
//                   }}
//                   className={[
//                     "rounded-full px-3 py-1.5 border transition",
//                     isSelected
//                       ? "bg-white/10 border-white/50"
//                       : "hover:bg-white/10 border-gray-300 dark:border-gray-700",
//                   ].join(" ")}
//                   aria-pressed={isSelected ? "true" : "false"}
//                 >
//                   {m2hhmm(s.start)}–{m2hhmm(s.end)}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//         {errors["startMin"] && (
//           <p className="mt-1 text-xs text-rose-400">{errors["startMin"]}</p>
//         )}
//       </div>

//       {/* форма отправки */}
//       <form action={formAction} className="grid sm:grid-cols-2 gap-3">
//         <input type="hidden" name="serviceSlug" value={serviceSlug} />
//         <input type="hidden" name="dateISO" value={dateISO} />
//         <input type="hidden" name="startMin" value={selectedSlot?.start ?? ""} />
//         <input type="hidden" name="endMin" value={selectedSlot?.end ?? ""} />
//         <input type="hidden" name="masterId" value={masterId} />

//         <FieldText
//           label="Имя"
//           name="name"
//           value={name}
//           onChange={setName}
//           error={errors["name"]}
//           gold
//         />
//         <FieldText
//           label="Телефон"
//           name="phone"
//           value={phone}
//           onChange={setPhone}
//           error={errors["phone"]}
//           inputMode="tel"
//           placeholder="+49 ..."
//         />
//         <FieldText
//           label="E-mail"
//           name="email"
//           value={email}
//           onChange={setEmail}
//           error={errors["email"]}
//           type="email"
//           placeholder="you@example.com"
//         />
//         <FieldText
//           label="Дата рождения"
//           name="birthDate"
//           value={birthDate}
//           onChange={setBirthDate}
//           error={errors["birthDate"]}
//           type="date"
//         />

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Как вы узнали о нас</label>
//           <select
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             name="source"
//             value={source}
//             onChange={(e) => setSource(e.target.value)}
//           >
//             <option value="">— выберите вариант —</option>
//             <option value="Google">Google</option>
//             <option value="Instagram">Instagram</option>
//             <option value="Friends">Знакомые</option>
//             <option value="Facebook">Facebook</option>
//             <option value="Other">Другое</option>
//           </select>
//           {errors["source"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["source"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Комментарий</label>
//           <textarea
//             className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px] border-gray-300 dark:border-gray-700"
//             name="notes"
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             placeholder="Пожелания…"
//           />
//           {errors["notes"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["notes"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="submit"
//             className="rounded-full border px-5 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
//             disabled={
//               isPending ||
//               loading ||
//               !serviceSlug ||
//               !masterId ||
//               !selectedSlot ||
//               !clientOk
//             }
//           >
//             {isPending ? "Отправляем…" : "Записаться"}
//           </button>
//         </div>
//       </form>

//       {successOpen && <SuccessModal onClose={() => router.push("/")} />}

//       {/* глобальный select в dark */}
//       <style jsx global>{`
//         :root {
//           --site-dark: #0b1220;
//         }
//         .dark select option,
//         .dark select optgroup {
//           background-color: var(--site-dark) !important;
//           color: #e5e7eb !important;
//         }
//         .dark select option:checked,
//         .dark select option:hover {
//           background-color: #0f1a2b !important;
//         }
//       `}</style>
//       {/* «золотое» имя, без деградации на мобилках */}
//       <style jsx>{`
//         .goldy-text {
//           font-weight: 600;
//           color: #f5d76e;
//           text-shadow: 0 0 8px rgba(245, 215, 110, 0.45);
//           caret-color: #ffe08a;
//           transition: text-shadow 200ms ease;
//         }
//         @supports (-webkit-background-clip: text) {
//           .goldy-text:not(input):not(textarea) {
//             background-image: linear-gradient(
//               110deg,
//               #b3903b 0%,
//               #f5d76e 25%,
//               #fff3c4 50%,
//               #f5d76e 75%,
//               #b3903b 100%
//             );
//             background-size: 200% auto;
//             background-position: 0% center;
//             -webkit-background-clip: text;
//             background-clip: text;
//             -webkit-text-fill-color: transparent;
//             color: transparent;
//             animation: goldShimmer 4s linear infinite;
//           }
//         }
//         @keyframes goldShimmer {
//           to {
//             background-position: -200% center;
//           }
//         }
//         input.goldy-text,
//         textarea.goldy-text {
//           background-image: none !important;
//           -webkit-background-clip: border-box !important;
//           background-clip: border-box !important;
//           -webkit-text-fill-color: initial !important;
//           animation: none !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ---------- маленькие подкомпоненты ---------- */

// function SuccessModal({ onClose }: { onClose: () => void }) {
//   return (
//     <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
//         <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
//         <p className="opacity-80 mb-4">Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
//         <div className="flex gap-2 justify-end">
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             Ок
//           </button>
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             На главную
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Dropdown(props: {
//   label: string;
//   buttonText: string;
//   items: { key: string; text: string; active: boolean; onClick: () => void }[];
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   refEl: React.RefObject<HTMLDivElement | null>;
//   disabled?: boolean;
//   helpText?: string;
//   error?: string;
// }) {
//   const { label, buttonText, items, open, setOpen, refEl, disabled, helpText, error } = props;
//   return (
//     <div ref={refEl} className="relative">
//       <label className="block text-sm mb-1">{label}</label>
//       <button
//         type="button"
//         aria-haspopup="listbox"
//         aria-expanded={open ? "true" : "false"}
//         onClick={() => !disabled && setOpen(!open)}
//         disabled={disabled}
//         className={[
//           "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
//           "bg-transparent border-gray-300 dark:border-gray-700",
//           "hover:bg-white/5 dark:hover:bg-white/5",
//           disabled ? "opacity-50 cursor-not-allowed" : "",
//         ].join(" ")}
//       >
//         <span className={!buttonText ? "opacity-60" : ""}>{buttonText}</span>
//         <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70" aria-hidden>
//           <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </button>

//       {open && !disabled && (
//         <ul
//           role="listbox"
//           tabIndex={-1}
//           className={[
//             "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
//             "bg-white text-gray-900 border-gray-200",
//             "dark:bg-[#0B1220] dark:text-gray-100 dark:border-gray-700",
//           ].join(" ")}
//         >
//           <li className="px-3 py-2 text-sm opacity-60 select-none">Выберите…</li>
//           {items.map((it) => (
//             <li key={it.key}>
//               <button
//                 type="button"
//                 role="option"
//                 aria-selected={it.active ? "true" : "false"}
//                 onClick={() => {
//                   it.onClick();
//                   setOpen(false);
//                 }}
//                 className={[
//                   "w-full text-left px-3 py-2 transition",
//                   it.active ? "bg-primary/10 dark:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/5",
//                 ].join(" ")}
//               >
//                 {it.text}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {helpText && <p className="mt-1 text-xs text-amber-500">{helpText}</p>}
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }

// function FieldText({
//   label,
//   name,
//   value,
//   onChange,
//   error,
//   type = "text",
//   inputMode,
//   placeholder,
//   gold,
// }: {
//   label: string;
//   name: string;
//   value: string;
//   onChange: (v: string) => void;
//   error?: string;
//   type?: "text" | "email" | "date";
//   inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
//   placeholder?: string;
//   gold?: boolean;
// }) {
//   return (
//     <div>
//       <label className="block text-sm mb-1">{label}</label>
//       <input
//         className={[
//           "w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700",
//           gold && value.trim() ? "goldy-text" : "",
//         ].join(" ")}
//         name={name}
//         type={type}
//         inputMode={inputMode}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         required
//       />
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }





// "use client";

// import React, {
//   useActionState,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { useRouter } from "next/navigation";

// import { book, type BookState } from "@/app/booking/book";
// import { BookingSchema } from "@/lib/validation/booking";

// /* ---------- типы ---------- */
// type SubService = {
//   slug: string;
//   name: string;
//   durationMin: number;
//   description?: string | null;
//   priceCents?: number | null;
// };
// type Category = { id: string; name: string; children: SubService[] };
// type Props = { categories: Category[] };

// type Slot = { start: number; end: number };
// type Master = { id: string; name: string };

// /* ---------- утилы ---------- */
// function m2hhmm(min: number): string {
//   const h = Math.floor(min / 60);
//   const m = min % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
// }
// function todayISO(): string {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;
// }
// function euro(cents: number | null | undefined): string {
//   if (cents == null) return "—";
//   return new Intl.NumberFormat("de-DE", {
//     style: "currency",
//     currency: "EUR",
//   }).format(cents / 100);
// }

// /* ---------- LS ---------- */
// const LS_NAME = "booking:name";
// const LS_PHONE = "booking:phone";
// const LS_EMAIL = "booking:email";

// /* ========================================================= */
// export default function PublicBookingForm({ categories }: Props) {
//   const router = useRouter();

//   // выбор категории/подуслуги/мастера и даты
//   const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
//   const [serviceSlug, setServiceSlug] = useState<string>(
//     categories[0]?.children?.[0]?.slug ?? ""
//   );

//   const [masters, setMasters] = useState<Master[]>([]); // NEW
//   const [masterId, setMasterId] = useState<string>(""); // CHANGED: masterId

//   const [dateISO, setDateISO] = useState<string>(todayISO());

//   // дропдауны
//   const [ddCatOpen, setDdCatOpen] = useState(false);
//   const [ddSrvOpen, setDdSrvOpen] = useState(false);
//   const [ddMstOpen, setDdMstOpen] = useState(false); // NEW
//   const ddCatRef = useRef<HTMLDivElement | null>(null);
//   const ddSrvRef = useRef<HTMLDivElement | null>(null);
//   const ddMstRef = useRef<HTMLDivElement | null>(null); // NEW

//   // слоты
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [slotsOpen, setSlotsOpen] = useState<boolean>(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedKey, setSelectedKey] = useState<string>("");

//   // поля
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [birthDate, setBirthDate] = useState("");
//   const [source, setSource] = useState<string>("");
//   const [notes, setNotes] = useState("");

//   const [formError, setFormError] = useState<string>("");
//   const [successOpen, setSuccessOpen] = useState(false);

//   // server action
//   const initial: BookState = { ok: false };
//   const [serverState, formAction, isPending] = useActionState(book, initial);

//   /* ---------- автоизвлечение из LS ---------- */
//   useEffect(() => {
//     try {
//       const n = localStorage.getItem(LS_NAME);
//       const p = localStorage.getItem(LS_PHONE);
//       const e = localStorage.getItem(LS_EMAIL);
//       if (n) setName(n);
//       if (p) setPhone(p);
//       if (e) setEmail(e);
//     } catch {}
//   }, []);
//   useEffect(() => {
//     try {
//       if (name.trim()) localStorage.setItem(LS_NAME, name.trim());
//     } catch {}
//   }, [name]);
//   useEffect(() => {
//     try {
//       if (phone.trim()) localStorage.setItem(LS_PHONE, phone.trim());
//     } catch {}
//   }, [phone]);
//   useEffect(() => {
//     try {
//       if (email.trim()) localStorage.setItem(LS_EMAIL, email.trim());
//     } catch {}
//   }, [email]);

//   // закрытия дропдаунов
//   useEffect(() => {
//     function onDoc(e: MouseEvent) {
//       if (ddCatRef.current && !ddCatRef.current.contains(e.target as Node))
//         setDdCatOpen(false);
//       if (ddSrvRef.current && !ddSrvRef.current.contains(e.target as Node))
//         setDdSrvOpen(false);
//       if (ddMstRef.current && !ddMstRef.current.contains(e.target as Node))
//         setDdMstOpen(false);
//     }
//     if (ddCatOpen || ddSrvOpen || ddMstOpen)
//       document.addEventListener("mousedown", onDoc);
//     return () => document.removeEventListener("mousedown", onDoc);
//   }, [ddCatOpen, ddSrvOpen, ddMstOpen]);

//   /* ---------- вычисления ---------- */
//   const currentChildren = useMemo<SubService[]>(
//     () => categories.find((c) => c.id === categoryId)?.children ?? [],
//     [categories, categoryId]
//   );
//   const hasChildren = currentChildren.length > 0;
//   const selectedService =
//     currentChildren.find((s) => s.slug === serviceSlug) ?? null;

//   // выбранный слот
//   const slotMap = useMemo(() => {
//     const m = new Map<string, Slot>();
//     for (const s of slots) {
//       if (Number.isFinite(s.start) && Number.isFinite(s.end))
//         m.set(`${s.start}-${s.end}`, s);
//     }
//     return m;
//   }, [slots]);
//   const selectedSlot = selectedKey ? slotMap.get(selectedKey) : undefined;

//   // ответ сервера
//   useEffect(() => {
//     setFormError(serverState.formError ?? "");
//     if (serverState.ok) {
//       setSelectedKey("");
//       setNotes("");
//       setSuccessOpen(true);
//     }
//   }, [serverState]);

//   // смена категории — сброс подуслуги/мастера
//   useEffect(() => {
//     const first = currentChildren[0]?.slug ?? "";
//     setServiceSlug(first);
//     setMasters([]);     // NEW
//     setMasterId("");    // NEW
//     setSlots([]);
//     setSelectedKey("");
//     setSlotsOpen(false);
//   }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

//   // загрузка мастеров при смене подуслуги
//   useEffect(() => {
//     async function run() {
//       setMasters([]);
//       setMasterId("");
//       setSlots([]);
//       setSelectedKey("");
//       setSlotsOpen(false);
//       if (!serviceSlug) return;
//       try {
//         const res = await fetch(
//           `/api/masters?serviceSlug=${encodeURIComponent(serviceSlug)}`,
//           { cache: "no-store" }
//         );
//         if (!res.ok) throw new Error("Не удалось получить мастеров");
//         const data: Master[] = await res.json();
//         setMasters(data);
//       } catch (e) {
//         setFormError(
//           process.env.NODE_ENV === "development"
//             ? `Ошибка загрузки мастеров: ${String(e)}`
//             : "Ошибка загрузки мастеров"
//         );
//       }
//     }
//     run();
//   }, [serviceSlug]);

//   // при наличии слотов — показываем блок
//   useEffect(() => {
//     if (slots.length > 0) setSlotsOpen(true);
//   }, [slots.length]);

//   // автоподстановка ДР по имени/телефону (как договаривались)
//   useEffect(() => {
//     const n = name.trim();
//     const p = phone.trim();
//     if (!n || !p || birthDate) return;
//     const ctrl = new AbortController();
//     const t = setTimeout(async () => {
//       try {
//         const url = `/api/clients/lookup?name=${encodeURIComponent(
//           n
//         )}&phone=${encodeURIComponent(p)}`;
//         const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
//         if (!res.ok) return;
//         const data: { ok: boolean; birthDateISO: string | null } =
//           await res.json();
//         if (data.ok && data.birthDateISO && !birthDate) {
//           setBirthDate(data.birthDateISO);
//         }
//       } catch {}
//     }, 400);
//     return () => {
//       clearTimeout(t);
//       ctrl.abort();
//     };
//   }, [name, phone, birthDate]);

//   // загрузка слотов
//   const loadSlots = React.useCallback(async () => {
//     setFormError("");
//     setSelectedKey("");
//     setSlots([]);
//     setLoading(true);
//     try {
//       if (!serviceSlug && !dateISO) {
//         setFormError("Выберите подуслугу и дату.");
//         return;
//       }
//       if (!serviceSlug) {
//         setFormError("Сначала выберите подуслугу.");
//         return;
//       }
//       if (!masterId) { // NEW
//         setFormError("Выберите мастера.");
//         return;
//       }
//       if (!dateISO) {
//         setFormError("Сначала выберите дату.");
//         return;
//       }

//       const url = `/api/availability?serviceSlug=${encodeURIComponent(
//         serviceSlug
//       )}&dateISO=${encodeURIComponent(dateISO)}&masterId=${encodeURIComponent(
//         masterId
//       )}`; // CHANGED: masterId

//       const res = await fetch(url, { cache: "no-store" });
//       if (!res.ok) throw new Error("Не удалось получить свободные слоты");
//       const data: unknown = await res.json();
//       const clean: Slot[] = Array.isArray(data)
//         ? (data as unknown[])
//             .map((v) => {
//               if (
//                 typeof v === "object" &&
//                 v !== null &&
//                 Number.isFinite((v as { start: number }).start) &&
//                 Number.isFinite((v as { end: number }).end)
//               ) {
//                 const s = (v as { start: number; end: number }).start;
//                 const e = (v as { start: number; end: number }).end;
//                 return { start: s, end: e };
//               }
//               return null;
//             })
//             .filter((v): v is Slot => !!v && v.end > v.start)
//             .sort((a, b) => a.start - b.start)
//         : [];
//       setSlots(clean);
//       if (clean.length === 0) {
//         setFormError(
//           "На выбранную дату и мастера нет свободных окон. Попробуйте другую дату."
//         );
//       }
//     } catch (e) {
//       setFormError(
//         process.env.NODE_ENV === "development"
//           ? `Ошибка загрузки слотов: ${String(e)}`
//           : "Ошибка загрузки слотов. Попробуйте обновить страницу."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [serviceSlug, dateISO, masterId]);

//   // клиентская валидация
//   const { clientOk, clientErrors } = useMemo(() => {
//     const payload = {
//       serviceSlug,
//       dateISO,
//       startMin: selectedSlot?.start ?? Number.NaN,
//       endMin: selectedSlot?.end ?? Number.NaN,
//       name,
//       phone,
//       email,
//       birthDate,
//       source: source || undefined,
//       notes: notes || undefined,
//       masterId, // CHANGED
//     };
//     const r = BookingSchema.safeParse(payload);
//     if (r.success)
//       return { clientOk: true, clientErrors: {} as Record<string, string> };
//     const errs: Record<string, string> = {};
//     for (const issue of r.error.issues) {
//       const key = String(issue.path?.[0] ?? "");
//       if (key && !errs[key]) {
//         errs[key] =
//           key === "startMin"
//             ? "Не выбрано время. Нажмите на свободный слот."
//             : issue.message;
//       }
//     }
//     return { clientOk: false, clientErrors: errs };
//   }, [
//     serviceSlug,
//     dateISO,
//     selectedSlot,
//     name,
//     phone,
//     email,
//     birthDate,
//     source,
//     notes,
//     masterId,
//   ]);

//   const errors = useMemo(() => {
//     const server = (serverState.fieldErrors ?? {}) as Record<string, string>;
//     return { ...clientErrors, ...server };
//   }, [clientErrors, serverState.fieldErrors]);

//   /* ------------------ UI ------------------ */
//   return (
//     <div className="space-y-6">
//       {/* выбор: категория/подуслуга/мастер и дата */}
//       <div className="grid sm:grid-cols-2 gap-3">
//         <div className="space-y-3">
//           {/* Категория */}
//           <Dropdown
//             label="Категория"
//             open={ddCatOpen}
//             setOpen={setDdCatOpen}
//             refEl={ddCatRef}
//             buttonText={
//               categories.find((c) => c.id === categoryId)?.name ||
//               "Выберите категорию…"
//             }
//             items={categories.map((c) => ({
//               key: c.id,
//               text: c.name,
//               active: c.id === categoryId,
//               onClick: () => {
//                 setCategoryId(c.id);
//               },
//             }))}
//           />

//           {/* Подуслуга */}
//           <Dropdown
//             label="Подуслуга"
//             open={ddSrvOpen}
//             setOpen={setDdSrvOpen}
//             refEl={ddSrvRef}
//             disabled={!hasChildren}
//             buttonText={
//               selectedService
//                 ? `${selectedService.name} (${selectedService.durationMin} мин · ${euro(
//                     selectedService.priceCents
//                   )})`
//                 : hasChildren
//                 ? "Выберите подуслугу…"
//                 : "Нет подуслуг"
//             }
//             items={currentChildren.map((s) => ({
//               key: s.slug,
//               text: `${s.name} (${s.durationMin} мин · ${euro(s.priceCents)})`,
//               active: s.slug === serviceSlug,
//               onClick: () => {
//                 setServiceSlug(s.slug);
//               },
//             }))}
//             helpText={
//               !hasChildren
//                 ? "В этой категории пока нет подуслуг. Пожалуйста, выберите другую категорию."
//                 : undefined
//             }
//             error={errors["serviceSlug"]}
//           />

//           {/* Мастер (NEW) */}
//           <Dropdown
//             label="Мастер"
//             open={ddMstOpen}
//             setOpen={setDdMstOpen}
//             refEl={ddMstRef}
//             disabled={!serviceSlug}
//             buttonText={
//               masterId
//                 ? masters.find((m) => m.id === masterId)?.name ?? "Выберите мастера…"
//                 : masters.length
//                 ? "Выберите мастера…"
//                 : "Нет доступных мастеров"
//             }
//             items={masters.map((m) => ({
//               key: m.id,
//               text: m.name,
//               active: m.id === masterId,
//               onClick: () => {
//                 setMasterId(m.id);
//               },
//             }))}
//             error={errors["masterId"]}
//           />
//         </div>

//         {/* Дата */}
//         <div>
//           <label className="block text-sm mb-1">Дата</label>
//           <input
//             type="date"
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             value={dateISO}
//             onChange={(e) => setDateISO(e.target.value)}
//           />
//           {errors["dateISO"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["dateISO"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="button"
//             onClick={loadSlots}
//             className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
//             disabled={loading || !serviceSlug || !masterId || !dateISO}
//           >
//             {loading ? "Загрузка…" : "Показать свободные слоты"}
//           </button>
//           {formError && (
//             <p className="mt-2 text-xs text-amber-400">{formError}</p>
//           )}
//         </div>
//       </div>

//       {/* слоты */}
//       <div>
//         <div className="flex items-center justify-between mb-2">
//           <p className="text-sm opacity-80">Выберите время:</p>
//           <button
//             type="button"
//             onClick={() => setSlotsOpen((v) => !v)}
//             className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
//           >
//             {slotsOpen ? "Скрыть слоты" : "Показать слоты"}
//           </button>
//         </div>

//         {slotsOpen && (
//           <div className="flex flex-wrap gap-2">
//             {slots.length === 0 && !loading && (
//               <span className="opacity-70 text-sm">Нет свободных окон.</span>
//             )}
//             {slots.map((s) => {
//               const key = `${s.start}-${s.end}`;
//               const isSelected = selectedKey === key;
//               return (
//                 <button
//                   key={key}
//                   type="button"
//                   onClick={() => {
//                     const next = selectedKey === key ? "" : key;
//                     setSelectedKey(next);
//                     if (next) setSlotsOpen(false);
//                   }}
//                   className={[
//                     "rounded-full px-3 py-1.5 border transition",
//                     isSelected
//                       ? "bg-white/10 border-white/50"
//                       : "hover:bg-white/10 border-gray-300 dark:border-gray-700",
//                   ].join(" ")}
//                   aria-pressed={isSelected ? "true" : "false"}
//                 >
//                   {m2hhmm(s.start)}–{m2hhmm(s.end)}
//                 </button>
//               );
//             })}
//           </div>
//         )}
//         {errors["startMin"] && (
//           <p className="mt-1 text-xs text-rose-400">{errors["startMin"]}</p>
//         )}
//       </div>

//       {/* форма отправки */}
//       <form action={formAction} className="grid sm:grid-cols-2 gap-3">
//         <input type="hidden" name="serviceSlug" value={serviceSlug} />
//         <input type="hidden" name="dateISO" value={dateISO} />
//         <input type="hidden" name="startMin" value={selectedSlot?.start ?? ""} />
//         <input type="hidden" name="endMin" value={selectedSlot?.end ?? ""} />
//         <input type="hidden" name="masterId" value={masterId} /> {/* CHANGED */}

//         <FieldText
//           label="Имя"
//           name="name"
//           value={name}
//           onChange={setName}
//           error={errors["name"]}
//           gold
//         />
//         <FieldText
//           label="Телефон"
//           name="phone"
//           value={phone}
//           onChange={setPhone}
//           error={errors["phone"]}
//           inputMode="tel"
//           placeholder="+49 ..."
//         />
//         <FieldText
//           label="E-mail"
//           name="email"
//           value={email}
//           onChange={setEmail}
//           error={errors["email"]}
//           type="email"
//           placeholder="you@example.com"
//         />
//         <FieldText
//           label="Дата рождения"
//           name="birthDate"
//           value={birthDate}
//           onChange={setBirthDate}
//           error={errors["birthDate"]}
//           type="date"
//         />

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Как вы узнали о нас</label>
//           <select
//             className="w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700"
//             name="source"
//             value={source}
//             onChange={(e) => setSource(e.target.value)}
//           >
//             <option value="">— выберите вариант —</option>
//             <option value="Google">Google</option>
//             <option value="Instagram">Instagram</option>
//             <option value="Friends">Знакомые</option>
//             <option value="Facebook">Facebook</option>
//             <option value="Other">Другое</option>
//           </select>
//           {errors["source"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["source"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <label className="block text-sm mb-1">Комментарий</label>
//           <textarea
//             className="w-full rounded-lg border bg-transparent px-3 py-2 min-h-[120px] border-gray-300 dark:border-gray-700"
//             name="notes"
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             placeholder="Пожелания…"
//           />
//           {errors["notes"] && (
//             <p className="mt-1 text-xs text-rose-400">{errors["notes"]}</p>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <button
//             type="submit"
//             className="rounded-full border px-5 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700"
//             disabled={
//               isPending ||
//               loading ||
//               !serviceSlug ||
//               !masterId ||     // CHANGED
//               !selectedSlot ||
//               !clientOk
//             }
//           >
//             {isPending ? "Отправляем…" : "Записаться"}
//           </button>
//         </div>
//       </form>

//       {successOpen && <SuccessModal onClose={() => router.push("/")} />}

//       {/* глобальный select в dark */}
//       <style jsx global>{`
//         :root {
//           --site-dark: #0b1220;
//         }
//         .dark select option,
//         .dark select optgroup {
//           background-color: var(--site-dark) !important;
//           color: #e5e7eb !important;
//         }
//         .dark select option:checked,
//         .dark select option:hover {
//           background-color: #0f1a2b !important;
//         }
//       `}</style>
//       {/* «золотое» имя, без деградации на мобилках */}
//       <style jsx>{`
//         .goldy-text {
//           font-weight: 600;
//           color: #f5d76e;
//           text-shadow: 0 0 8px rgba(245, 215, 110, 0.45);
//           caret-color: #ffe08a;
//           transition: text-shadow 200ms ease;
//         }
//         @supports (-webkit-background-clip: text) {
//           .goldy-text:not(input):not(textarea) {
//             background-image: linear-gradient(
//               110deg,
//               #b3903b 0%,
//               #f5d76e 25%,
//               #fff3c4 50%,
//               #f5d76e 75%,
//               #b3903b 100%
//             );
//             background-size: 200% auto;
//             background-position: 0% center;
//             -webkit-background-clip: text;
//             background-clip: text;
//             -webkit-text-fill-color: transparent;
//             color: transparent;
//             animation: goldShimmer 4s linear infinite;
//           }
//         }
//         @keyframes goldShimmer {
//           to {
//             background-position: -200% center;
//           }
//         }
//         input.goldy-text,
//         textarea.goldy-text {
//           background-image: none !important;
//           -webkit-background-clip: border-box !important;
//           background-clip: border-box !important;
//           -webkit-text-fill-color: initial !important;
//           animation: none !important;
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ---------- маленькие подкомпоненты ---------- */

// function SuccessModal({ onClose }: { onClose: () => void }) {
//   return (
//     <div role="dialog" aria-modal="true" className="fixed inset-0 z-40 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-5 shadow-2xl">
//         <h3 className="text-lg font-semibold mb-2">Заявка принята</h3>
//         <p className="opacity-80 mb-4">Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
//         <div className="flex gap-2 justify-end">
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             Ок
//           </button>
//           <button type="button" className="rounded-full border px-4 py-2 hover:bg-white/10 transition border-gray-300 dark:border-gray-700" onClick={onClose}>
//             На главную
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Dropdown(props: {
//   label: string;
//   buttonText: string;
//   items: { key: string; text: string; active: boolean; onClick: () => void }[];
//   open: boolean;
//   setOpen: (v: boolean) => void;
//   refEl: React.RefObject<HTMLDivElement | null>;
//   disabled?: boolean;
//   helpText?: string;
//   error?: string;
// }) {
//   const { label, buttonText, items, open, setOpen, refEl, disabled, helpText, error } = props;
//   return (
//     <div ref={refEl} className="relative">
//       <label className="block text-sm mb-1">{label}</label>
//       <button
//         type="button"
//         aria-haspopup="listbox"
//         aria-expanded={open ? "true" : "false"}
//         onClick={() => !disabled && setOpen(!open)}
//         disabled={disabled}
//         className={[
//           "w-full rounded-lg border px-3 py-2 flex items-center justify-between",
//           "bg-transparent border-gray-300 dark:border-gray-700",
//           "hover:bg-white/5 dark:hover:bg-white/5",
//           disabled ? "opacity-50 cursor-not-allowed" : "",
//         ].join(" ")}
//       >
//         <span className={!buttonText ? "opacity-60" : ""}>{buttonText}</span>
//         <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70" aria-hidden>
//           <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//         </svg>
//       </button>

//       {open && !disabled && (
//         <ul
//           role="listbox"
//           tabIndex={-1}
//           className={[
//             "absolute z-20 mt-2 w-full max-h-72 overflow-auto rounded-lg border shadow-lg",
//             "bg-white text-gray-900 border-gray-200",
//             "dark:bg-[#0B1220] dark:text-gray-100 dark:border-gray-700",
//           ].join(" ")}
//         >
//           <li className="px-3 py-2 text-sm opacity-60 select-none">Выберите…</li>
//           {items.map((it) => (
//             <li key={it.key}>
//               <button
//                 type="button"
//                 role="option"
//                 aria-selected={it.active ? "true" : "false"}
//                 onClick={() => {
//                   it.onClick();
//                   setOpen(false);
//                 }}
//                 className={[
//                   "w-full text-left px-3 py-2 transition",
//                   it.active ? "bg-primary/10 dark:bg-white/10" : "hover:bg-gray-100 dark:hover:bg-white/5",
//                 ].join(" ")}
//               >
//                 {it.text}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}

//       {helpText && <p className="mt-1 text-xs text-amber-500">{helpText}</p>}
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }

// function FieldText({
//   label,
//   name,
//   value,
//   onChange,
//   error,
//   type = "text",
//   inputMode,
//   placeholder,
//   gold,
// }: {
//   label: string;
//   name: string;
//   value: string;
//   onChange: (v: string) => void;
//   error?: string;
//   type?: "text" | "email" | "date";
//   inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
//   placeholder?: string;
//   gold?: boolean;
// }) {
//   return (
//     <div>
//       <label className="block text-sm mb-1">{label}</label>
//       <input
//         className={[
//           "w-full rounded-lg border bg-transparent px-3 py-2 border-gray-300 dark:border-gray-700",
//           gold && value.trim() ? "goldy-text" : "",
//         ].join(" ")}
//         name={name}
//         type={type}
//         inputMode={inputMode}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         required
//       />
//       {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
//     </div>
//   );
// }
