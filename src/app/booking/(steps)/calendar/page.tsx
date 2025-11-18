"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

/* ===================== Типы ===================== */

type Slot = {
  startAt: string;
  endAt: string;
  startMinutes: number;
  endMinutes: number;
};

type ApiPayload = {
  slots: Slot[];
  splitRequired: boolean;
};

type Master = { id: string; name: string };

type LoadState = {
  loading: boolean;
  error: string | null;
  slots: Slot[];
};

/* ===================== Константы ===================== */

const BOOKING_STEPS = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

const todayISO = (tz: string = ORG_TZ): string => {
  const s = new Date().toLocaleString("sv-SE", { timeZone: tz, hour12: false });
  return s.split(" ")[0]; // YYYY-MM-DD
};

// Локальная дата без UTC-сдвига
const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDaysISO = (iso: string, days: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
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
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}`;
};

class RequestCache {
  private cache: Map<string, { data: ApiPayload; timestamp: number }>;
  private readonly TTL = 3000;

  constructor() {
    this.cache = new Map();
  }

  get(key: string): ApiPayload | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: ApiPayload): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

const requestCache = new RequestCache();

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/**
 * Календарная сетка с понедельника.
 */
const getDaysInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  const startingDayOfWeek = firstDay.getDay(); // 0 — Вс, 1 — Пн...
  const offset = (startingDayOfWeek + 6) % 7; // сдвигаем так, чтобы 0 был Пн

  const days: (Date | null)[] = [];

  for (let i = 0; i < offset; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month - 1, day));
  }

  return days;
};

const isSameDay = (date1: Date, date2ISO: string): boolean => {
  const [y, m, d] = date2ISO.split("-").map(Number);
  return (
    date1.getDate() === d &&
    date1.getMonth() === m - 1 &&
    date1.getFullYear() === y
  );
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/* ===================== Общая оболочка как на других шагах ===================== */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <header
        className={`
          booking-header fixed top-0 inset-x-0 z-50
          bg-black/45 backdrop-blur-md border-b border-white/10
        `}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
          <PremiumProgressBar currentStep={2} steps={BOOKING_STEPS} />
        </div>
      </header>

      {/* отступ под фикс-хедер */}
      <div className="h-[84px] md:h-[96px]" />

      {children}
    </div>
  );
}

/* ===================== Видео-секция с логотипом ===================== */

function VideoSection() {
  return (
    <section className="relative py-8 sm:py-10">
      <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
        <video
          className={`
            absolute inset-0 h-full w-full
            object-contain 2xl:object-cover
            object-[50%_92%] lg:object-[50%_98%] xl:object-[50%_104%] 2xl:object-[50%_96%]
          `}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/fallback-poster.jpg"
          aria-hidden="true"
        >
          <source src="/SE-logo-video-master.webm" type="video/webm" />
          <source src="/SE-logo-video-master.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/5 pointer-events-none" />
      </div>
    </section>
  );
}

/* ===================== Основная страница календаря ===================== */

function CalendarInner() {
  const router = useRouter();
  const params = useSearchParams();

  const serviceIds = React.useMemo<string[]>(
    () => params.getAll("s").filter(Boolean),
    [params]
  );
  const masterIdFromUrl = params.get("m") ?? "";
  const urlDate = params.get("d") ?? undefined;

  const minISO = todayISO();
  const maxISO = max9WeeksISO();

  const [dateISO, setDateISO] = useState<string>(() => {
    const initial = urlDate ?? minISO;
    return clampISO(initial, minISO, maxISO);
  });

  const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(
    () => {
      const [y, m] = dateISO.split("-").map(Number);
      return { year: y, month: m };
    }
  );

  const [masters, setMasters] = useState<Master[]>([]);
  const [masterId, setMasterId] = useState<string>(masterIdFromUrl);

  const [state, setState] = useState<LoadState>({
    loading: false,
    error: null,
    slots: [],
  });

  const debouncedDate = useDebounce(dateISO, 300);
  const debouncedMasterId = useDebounce(masterId, 300);

  // флаг, чтобы автопрыжок выполнялся один раз
  const autoJumpDoneRef = useRef(false);

  useEffect(() => {
    const [y, m] = dateISO.split("-").map(Number);
    setViewMonth({ year: y, month: m });
  }, [dateISO]);

  const filterTodayCutoff = useCallback(
    (list: Slot[], forDateISO: string): Slot[] => {
      const isTodayFlag = forDateISO === todayISO();
      if (!isTodayFlag) return list;
      const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
      return list.filter((s) => s.startAt >= cutoffISO);
    },
    []
  );

  useEffect(() => {
    let alive = true;

    async function loadMasters() {
      if (serviceIds.length === 0) {
        setMasters([]);
        setMasterId("");
        return;
      }

      try {
        const qs = new URLSearchParams();
        qs.set("serviceIds", serviceIds.join(","));
        const res = await fetch(`/api/masters?${qs.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { masters: Master[] };

        if (!alive) return;

        setMasters(data.masters ?? []);

        if (!masterId || !data.masters.find((m) => m.id === masterId)) {
          const first = data.masters[0]?.id ?? "";
          setMasterId(first);

          if (first) {
            const q = new URLSearchParams();
            serviceIds.forEach((s) => q.append("s", s));
            q.set("m", first);
            q.set("d", dateISO);
            router.replace(`/booking/calendar?${q.toString()}`);
          }
        }
      } catch (err) {
        console.error("Failed to load masters:", err);
      }
    }

    void loadMasters();

    return () => {
      alive = false;
    };
  }, [serviceIds, router, dateISO]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    const abortController = new AbortController();

    async function load() {
      if (serviceIds.length === 0 || !debouncedMasterId) {
        setState({ loading: false, error: null, slots: [] });
        return;
      }

      const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(
        ","
      )}`;

      const cached = requestCache.get(cacheKey);
      if (cached) {
        if (!alive) return;
        const prepared = Array.isArray(cached.slots) ? cached.slots : [];
        setState({
          loading: false,
          error: null,
          slots: filterTodayCutoff(prepared, debouncedDate),
        });
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const qs = new URLSearchParams();
        qs.set("masterId", debouncedMasterId);
        qs.set("dateISO", debouncedDate);
        qs.set("serviceIds", serviceIds.join(","));

        const res = await fetch(`/api/availability?${qs.toString()}`, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: ApiPayload = await res.json();

        if (!alive) return;

        requestCache.set(cacheKey, data);

        const prepared = Array.isArray(data.slots) ? data.slots : [];
        setState({
          loading: false,
          error: null,
          slots: filterTodayCutoff(prepared, debouncedDate),
        });
      } catch (err: unknown) {
        if (!alive) return;
        if (err instanceof Error && err.name === "AbortError") return;

        const msg =
          err instanceof Error ? err.message : "Не удалось загрузить слоты";
        setState({ loading: false, error: msg, slots: [] });
      }
    }

    void load();

    return () => {
      alive = false;
      abortController.abort();
    };
  }, [debouncedDate, debouncedMasterId, serviceIds, filterTodayCutoff]);

  // === поиск ближайшей доступной даты ===
  const findNearestAvailableDate = useCallback(
    async (startISO: string): Promise<string | null> => {
      if (!masterId || serviceIds.length === 0) return null;
      const horizonDays = 60;
      for (let i = 0; i < horizonDays; i++) {
        const d = addDaysISO(startISO, i);
        const qs = new URLSearchParams({
          masterId,
          dateISO: d,
          serviceIds: serviceIds.join(","),
        });
        try {
          const res = await fetch(`/api/availability?${qs.toString()}`, {
            cache: "no-store",
          });
          if (!res.ok) continue;
          const data: ApiPayload = await res.json();
          const count = Array.isArray(data.slots) ? data.slots.length : 0;
          if (count > 0) return d;
        } catch {
          /* ignore */
        }
      }
      return null;
    },
    [masterId, serviceIds]
  );

  // 1) Первый заход без параметра d — сразу прыжок на ближайший день со слотами
  useEffect(() => {
    if (autoJumpDoneRef.current) return;
    if (!masterId || serviceIds.length === 0) return;
    if (urlDate) return; // пользователь явно выбрал дату — не вмешиваемся

    (async () => {
      const nearest = await findNearestAvailableDate(dateISO);
      if (nearest && nearest !== dateISO) {
        autoJumpDoneRef.current = true;
        setDateISO(nearest);
        const q = new URLSearchParams();
        serviceIds.forEach((id) => q.append("s", id));
        q.set("m", masterId);
        q.set("d", nearest);
        router.replace(`/booking/calendar?${q.toString()}`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId, serviceIds, urlDate]);

  // 2) Если выбранная дата без слотов — мягко переведём на ближайшую
  useEffect(() => {
    if (autoJumpDoneRef.current) return;
    if (!masterId || serviceIds.length === 0) return;
    if (state.loading) return;
    if (state.error) return;

    if (state.slots.length === 0) {
      (async () => {
        const nearest = await findNearestAvailableDate(dateISO);
        if (nearest && nearest !== dateISO) {
          autoJumpDoneRef.current = true;
          setDateISO(nearest);
          const q = new URLSearchParams();
          serviceIds.forEach((id) => q.append("s", id));
          q.set("m", masterId);
          q.set("d", nearest);
          router.replace(`/booking/calendar?${q.toString()}`);
        }
      })();
    }
  }, [
    state.loading,
    state.error,
    state.slots.length,
    findNearestAvailableDate,
    dateISO,
    masterId,
    serviceIds,
    router,
  ]);

  const handlePreviousMonth = () => {
    setViewMonth((prev) => {
      const newMonth = prev.month === 1 ? 12 : prev.month - 1;
      const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setViewMonth((prev) => {
      const newMonth = prev.month === 12 ? 1 : prev.month + 1;
      const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  };

  // недоступная дата: выходной или вне диапазона [minISO, maxISO]
  const isDisabledDay = (date: Date): boolean => {
    const iso = toISODate(date);
    const weekday = date.getDay(); // 0 — Вс, 6 — Сб
    const isWeekend = weekday === 0 || weekday === 6;
    const isOutOfRange = iso < minISO || iso > maxISO;
    return isWeekend || isOutOfRange;
  };

  const handleDateSelect = (date: Date) => {
    if (isDisabledDay(date)) return;
    const newISO = toISODate(date);
    const safe = clampISO(newISO, minISO, maxISO);
    setDateISO(safe);
    syncUrl(safe, masterId);
  };

  const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const id = e.target.value;
    setMasterId(id);
    syncUrl(dateISO, id);
    requestCache.clear();
  };

  const syncUrl = (d: string, m: string) => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    if (m) qs.set("m", m);
    qs.set("d", d);
    router.replace(`/booking/calendar?${qs.toString()}`);
  };

  const goClient = (slot: Slot) => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    if (masterId) qs.set("m", masterId);
    qs.set("start", slot.startAt);
    qs.set("end", slot.endAt);
    qs.set("d", dateISO);
    router.push(`/booking/client?${qs.toString()}`);
  };

  const goBackToMaster = () => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    router.push(`/booking/master?${qs.toString()}`);
  };

  const days = getDaysInMonth(viewMonth.year, viewMonth.month);

  // === Длительность услуги и отображаемые слоты ===
  const durationMin = React.useMemo(() => {
    if (!state.slots.length) return 0;
    const first = state.slots[0];
    const diff = first.endMinutes - first.startMinutes;
    return diff > 0 ? diff : 0;
  }, [state.slots]);

  const displaySlots = React.useMemo(() => {
    if (!state.slots.length || !durationMin) return state.slots;
    const base = state.slots[0].startMinutes;
    return state.slots.filter(
      (s) => ((s.startMinutes - base) % durationMin) === 0
    );
  }, [state.slots, durationMin]);

  /* ===================== Рендер ===================== */

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
        {/* Верхняя капсула шага */}
        <div className="w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
          >
            <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
            <div
              className={`
                relative flex items-center gap-2
                px-6 md:px-8 py-2.5 md:py-3
                rounded-full border border-white/15
                bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
                text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
                backdrop-blur-sm
              `}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
                <CalendarIcon className="w-4 h-4 text-black/80" />
              </span>
              <span className="font-serif italic tracking-wide text-sm md:text-base">
                Шаг 3 — Выбор даты и времени
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              mx-auto text-center
              text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
              font-serif italic leading-tight
              mb-3 md:mb-4
              text-transparent bg-clip-text
              bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
              drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
            `}
          >
            Волшебное время для красоты
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              mx-auto text-center max-w-2xl
              font-serif tracking-wide
              text-lg md:text-xl
              text-white/80
            "
          >
            Выберите удобную дату и время, а мы позаботимся обо всём остальном.
          </motion.p>
        </div>

        {/* Блок выбора мастера */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 md:mt-8 mb-6 md:mb-10 bg-white/5 rounded-2xl p-5 md:p-6 border border-white/10 backdrop-blur-sm"
        >
          <label className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="text-white/70 font-medium text-sm md:text-base">
              Мастер:
            </span>
            <select
              className="flex-1 max-w-xs bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-amber-400 focus:outline-none transition-colors"
              value={masterId}
              onChange={onPickMaster}
              disabled={masters.length === 0}
            >
              {masters.length === 0 && <option value="">Загрузка...</option>}
              {masters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        </motion.div>

        {/* Основная сетка: календарь + время */}
        <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 md:gap-8 items-start">
          {/* Календарь */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="relative bg-gradient-to-br from-black/70 via-black/60 to-black/80 rounded-3xl p-5 md:p-6 border border-white/12 shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="pointer-events-none absolute -top-32 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-24 w-80 h-80 rounded-full bg-yellow-400/10 blur-3xl" />

            <div className="relative flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                {monthNames[viewMonth.month - 1]} {viewMonth.year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/70 hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/70 hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white/70" />
                </button>
              </div>
            </div>

            <div className="relative grid grid-cols-7 gap-1.5 md:gap-2 text-xs md:text-sm">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center font-medium text-white/55 pb-1"
                >
                  {day}
                </div>
              ))}

              {days.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square rounded-xl"
                    />
                  );
                }

                const disabled = isDisabledDay(day);
                const selected = !disabled && isSameDay(day, dateISO);
                const todayFlag = !disabled && isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => handleDateSelect(day)}
                    disabled={disabled}
                    className={`
                      relative flex items-center justify-center
                      aspect-square rounded-xl text-xs md:text-sm font-medium
                      transition-all
                      ${
                        disabled
                          ? "cursor-not-allowed bg-black/50 text-white/25 border border-white/10 line-through opacity-70"
                          : "border border-transparent hover:border-amber-400/60 hover:bg-white/10 text-white/80"
                      }
                      ${
                        todayFlag
                          ? "ring-1 ring-amber-300/70 shadow-[0_0_18px_rgba(245,197,24,0.6)]"
                          : ""
                      }
                      ${
                        selected
                          ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-black font-semibold shadow-[0_0_22px_rgba(245,197,24,0.8)] scale-105"
                          : ""
                      }
                    `}
                  >
                    <span>{day.getDate()}</span>
                    {disabled && (
                      <span className="pointer-events-none absolute inset-x-1 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-black/50 rounded-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-amber-400/10 blur-2xl" />
              <div className="relative flex items-center gap-2 text-xs md:text-sm text-white/70">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Выбрана дата:</span>
                <span className="text-white">
                  {new Date(dateISO + "T00:00:00").toLocaleDateString(
                    "ru-RU",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Время */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gradient-to-br from-black/70 via-black/60 to-black/80 rounded-3xl p-5 md:p-6 border border-white/12 shadow-[0_0_50px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                Доступное время
              </h2>
              {durationMin > 0 && (
                <p className="mt-1 text-xs md:text-sm text-white/55">
                  Длительность записи:{" "}
                  <span className="text-amber-300 font-medium">
                    {durationMin} мин
                  </span>
                </p>
              )}
            </div>

            {state.loading && (
              <div className="relative text-center py-10 md:py-12">
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60 text-sm">Загрузка слотов…</p>
              </div>
            )}

            {state.error && (
              <div className="relative rounded-2xl border border-red-400/30 bg-red-500/10 p-4 md:p-5">
                <p className="text-red-300 text-sm md:text-base">
                  Ошибка: {state.error}
                </p>
              </div>
            )}

            {!state.loading &&
              !state.error &&
              displaySlots.length === 0 && (
                <div className="relative text-center py-10 md:py-12">
                  <div className="text-4xl mb-3">😔</div>
                  <p className="text-white/65 text-sm md:text-base">
                    На эту дату нет свободных слотов. Попробуйте выбрать
                    соседний день.
                  </p>
                </div>
              )}

            {!state.loading &&
              !state.error &&
              displaySlots.length > 0 && (
                <div className="relative grid grid-cols-3 gap-2.5 md:gap-3 max-h-[480px] overflow-y-auto pr-1.5">
                  <AnimatePresence>
                    {displaySlots.map((slot, index) => (
                      <motion.button
                        key={slot.startAt}
                        initial={{ opacity: 0, scale: 0.9, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 6 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => goClient(slot)}
                        className={`
                          group relative p-2.5 md:p-3 rounded-2xl
                          bg-white/5 border border-white/10
                          hover:border-amber-400/70 hover:bg-gradient-to-br
                          hover:from-amber-400/15 hover:to-yellow-500/10
                          transition-all text-center
                          shadow-[0_0_18px_rgba(0,0,0,0.4)]
                        `}
                      >
                        <div className="text-xs md:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {formatHM(slot.startMinutes)}–{formatHM(slot.endMinutes)}
                        </div>
                        <Sparkles className="w-3 h-3 text-amber-300 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              )}

            <div className="relative mt-5 md:mt-6 flex items-center justify-between text-xs md:text-sm">
              <span className="text-white/60">Доступно слотов:</span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                {displaySlots.length}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Кнопка "назад" как на других шагах */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`
            fixed inset-x-0 bottom-2 z-20 px-4
            sm:bottom-3 sm:px-6
            lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
            mt-6 md:mt-10
          `}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="mx-auto w-full max-w-screen-2xl">
            <button
              type="button"
              onClick={goBackToMaster}
              className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Вернуться к выбору мастера
            </button>
          </div>
        </motion.div>
      </main>

      <VideoSection />
    </PageShell>
  );
}

/* ===================== Export ===================== */

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CalendarInner />
    </Suspense>
  );
}




//-----------работал 18/11 обновляю дизайн и убираю занятые даты
// // src/app/booking/(steps)/calendar/page.tsx
// "use client";

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   Suspense,
// } from "react";
// import { motion } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   Calendar as CalendarIcon,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Sparkles,
// } from "lucide-react";

// // Типы (как в рабочей версии)
// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// type LoadState = {
//   loading: boolean;
//   error: string | null;
//   slots: Slot[];
// };

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString("sv-SE", { timeZone: tz, hour12: false });
//   return s.split(" ")[0];
// };

// // === фикс UTC-сдвига: локальная дата YYYY-MM-DD ===
// const toISODate = (d: Date): string => {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// };

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split("-").map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, "0");
//   return `${pad(hh)}:${pad(mm)}`;
// };

// class RequestCache {
//   private cache: Map<string, { data: ApiPayload; timestamp: number }>;
//   private readonly TTL = 3000;

//   constructor() {
//     this.cache = new Map();
//   }

//   get(key: string): ApiPayload | null {
//     const entry = this.cache.get(key);
//     if (!entry) return null;

//     const age = Date.now() - entry.timestamp;
//     if (age > this.TTL) {
//       this.cache.delete(key);
//       return null;
//     }

//     return entry.data;
//   }

//   set(key: string, data: ApiPayload): void {
//     this.cache.set(key, { data, timestamp: Date.now() });
//   }

//   clear(): void {
//     this.cache.clear();
//   }
// }

// const requestCache = new RequestCache();

// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

//   React.useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// const monthNames = [
//   "Январь",
//   "Февраль",
//   "Март",
//   "Апрель",
//   "Май",
//   "Июнь",
//   "Июль",
//   "Август",
//   "Сентябрь",
//   "Октябрь",
//   "Ноябрь",
//   "Декабрь",
// ];

// const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// const getDaysInMonth = (year: number, month: number) => {
//   const firstDay = new Date(year, month - 1, 1);
//   const lastDay = new Date(year, month, 0);
//   const daysInMonth = lastDay.getDate();
//   const startingDayOfWeek = firstDay.getDay();

//   const days: (Date | null)[] = [];

//   for (let i = 0; i < startingDayOfWeek; i++) {
//     days.push(null);
//   }

//   for (let day = 1; day <= daysInMonth; day++) {
//     days.push(new Date(year, month - 1, day));
//   }

//   return days;
// };

// const isSameDay = (date1: Date, date2ISO: string): boolean => {
//   const [y, m, d] = date2ISO.split("-").map(Number);
//   return (
//     date1.getDate() === d &&
//     date1.getMonth() === m - 1 &&
//     date1.getFullYear() === y
//   );
// };

// const isToday = (date: Date): boolean => {
//   const today = new Date();
//   return (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   );
// };

// function CalendarInner() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params]
//   );
//   const masterIdFromUrl = params.get("m") ?? "";
//   const urlDate = params.get("d") ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   const [dateISO, setDateISO] = useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(
//     () => {
//       const [y, m] = dateISO.split("-").map(Number);
//       return { year: y, month: m };
//     }
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [masterId, setMasterId] = useState<string>(masterIdFromUrl);

//   const [state, setState] = useState<LoadState>({
//     loading: false,
//     error: null,
//     slots: [],
//   });

//   const debouncedDate = useDebounce(dateISO, 300);
//   const debouncedMasterId = useDebounce(masterId, 300);

//   // флаг, чтобы автопрыжок выполнялся один раз
//   const autoJumpDoneRef = useRef(false);

//   useEffect(() => {
//     const [y, m] = dateISO.split("-").map(Number);
//     setViewMonth({ year: y, month: m });
//   }, [dateISO]);

//   const filterTodayCutoff = useCallback(
//     (list: Slot[], forDateISO: string): Slot[] => {
//       const isTodayFlag = forDateISO === todayISO();
//       if (!isTodayFlag) return list;
//       const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
//       return list.filter((s) => s.startAt >= cutoffISO);
//     },
//     []
//   );

//   useEffect(() => {
//     let alive = true;

//     async function loadMasters() {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId("");
//         return;
//       }

//       try {
//         const qs = new URLSearchParams();
//         qs.set("serviceIds", serviceIds.join(","));
//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: "no-store",
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = (await res.json()) as { masters: Master[] };

//         if (!alive) return;

//         setMasters(data.masters ?? []);

//         if (!masterId || !data.masters.find((m) => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? "";
//           setMasterId(first);

//           if (first) {
//             const q = new URLSearchParams();
//             serviceIds.forEach((s) => q.append("s", s));
//             q.set("m", first);
//             q.set("d", dateISO);
//             router.replace(`/booking/calendar?${q.toString()}`);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load masters:", err);
//       }
//     }

//     void loadMasters();

//     return () => {
//       alive = false;
//     };
//   }, [serviceIds, router, dateISO]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     let alive = true;
//     const abortController = new AbortController();

//     async function load() {
//       if (serviceIds.length === 0 || !debouncedMasterId) {
//         setState({ loading: false, error: null, slots: [] });
//         return;
//       }

//       const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(
//         ","
//       )}`;

//       const cached = requestCache.get(cacheKey);
//       if (cached) {
//         if (!alive) return;
//         const prepared = Array.isArray(cached.slots) ? cached.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//         return;
//       }

//       setState((prev) => ({ ...prev, loading: true, error: null }));

//       try {
//         const qs = new URLSearchParams();
//         qs.set("masterId", debouncedMasterId);
//         qs.set("dateISO", debouncedDate);
//         qs.set("serviceIds", serviceIds.join(","));

//         const res = await fetch(`/api/availability?${qs.toString()}`, {
//           cache: "no-store",
//           signal: abortController.signal,
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiPayload = await res.json();

//         if (!alive) return;

//         requestCache.set(cacheKey, data);

//         const prepared = Array.isArray(data.slots) ? data.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//       } catch (err: unknown) {
//         if (!alive) return;
//         if (err instanceof Error && err.name === "AbortError") return;

//         const msg =
//           err instanceof Error ? err.message : "Не удалось загрузить слоты";
//         setState({ loading: false, error: msg, slots: [] });
//       }
//     }

//     void load();

//     return () => {
//       alive = false;
//       abortController.abort();
//     };
//   }, [debouncedDate, debouncedMasterId, serviceIds, filterTodayCutoff]);

//   // === поиск ближайшей доступной даты ===
//   const findNearestAvailableDate = useCallback(
//     async (startISO: string): Promise<string | null> => {
//       if (!masterId || serviceIds.length === 0) return null;
//       const horizonDays = 60;
//       for (let i = 0; i < horizonDays; i++) {
//         const d = addDaysISO(startISO, i);
//         const qs = new URLSearchParams({
//           masterId,
//           dateISO: d,
//           serviceIds: serviceIds.join(","),
//         });
//         try {
//           const res = await fetch(`/api/availability?${qs.toString()}`, {
//             cache: "no-store",
//           });
//           if (!res.ok) continue;
//           const data: ApiPayload = await res.json();
//           const count = Array.isArray(data.slots) ? data.slots.length : 0;
//           if (count > 0) return d;
//         } catch {
//           /* ignore */
//         }
//       }
//       return null;
//     },
//     [masterId, serviceIds]
//   );

//   // 1) Первый заход без параметра d — сразу прыжок на ближайший день со слотами
//   useEffect(() => {
//     if (autoJumpDoneRef.current) return;
//     if (!masterId || serviceIds.length === 0) return;
//     if (urlDate) return; // пользователь явно выбрал дату — не вмешиваемся

//     (async () => {
//       const nearest = await findNearestAvailableDate(dateISO);
//       if (nearest && nearest !== dateISO) {
//         autoJumpDoneRef.current = true;
//         setDateISO(nearest);
//         const q = new URLSearchParams();
//         serviceIds.forEach((id) => q.append("s", id));
//         q.set("m", masterId);
//         q.set("d", nearest);
//         router.replace(`/booking/calendar?${q.toString()}`);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [masterId, serviceIds, urlDate]);

//   // 2) Если выбранная дата без слотов — мягко переведём на ближайшую
//   useEffect(() => {
//     if (autoJumpDoneRef.current) return;
//     if (!masterId || serviceIds.length === 0) return;
//     if (state.loading) return;
//     if (state.error) return;

//     if (state.slots.length === 0) {
//       (async () => {
//         const nearest = await findNearestAvailableDate(dateISO);
//         if (nearest && nearest !== dateISO) {
//           autoJumpDoneRef.current = true;
//           setDateISO(nearest);
//           const q = new URLSearchParams();
//           serviceIds.forEach((id) => q.append("s", id));
//           q.set("m", masterId);
//           q.set("d", nearest);
//           router.replace(`/booking/calendar?${q.toString()}`);
//         }
//       })();
//     }
//   }, [
//     state.loading,
//     state.error,
//     state.slots.length,
//     findNearestAvailableDate,
//     dateISO,
//     masterId,
//     serviceIds,
//     router,
//   ]);

//   const handlePreviousMonth = () => {
//     setViewMonth((prev) => {
//       const newMonth = prev.month === 1 ? 12 : prev.month - 1;
//       const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleNextMonth = () => {
//     setViewMonth((prev) => {
//       const newMonth = prev.month === 12 ? 1 : prev.month + 1;
//       const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleDateSelect = (date: Date) => {
//     const newISO = toISODate(date); // локально, без UTC-сдвига
//     const safe = clampISO(newISO, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//     requestCache.clear();
//   };

//   const syncUrl = (d: string, m: string) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     if (m) qs.set("m", m);
//     qs.set("d", d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   const goClient = (slot: Slot) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     if (masterId) qs.set("m", masterId);
//     qs.set("start", slot.startAt);
//     qs.set("end", slot.endAt);
//     qs.set("d", dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   const goBackToMaster = () => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     router.push(`/booking/master?${qs.toString()}`);
//   };

//   const days = getDaysInMonth(viewMonth.year, viewMonth.month);

//   // === Длительность услуги и отображаемые слоты ===
//   const durationMin = React.useMemo(() => {
//     if (!state.slots.length) return 0;
//     const first = state.slots[0];
//     const diff = first.endMinutes - first.startMinutes;
//     return diff > 0 ? diff : 0;
//   }, [state.slots]);

//   const displaySlots = React.useMemo(() => {
//     if (!state.slots.length || !durationMin) return state.slots;
//     const base = state.slots[0].startMinutes;
//     return state.slots.filter(
//       (s) => ((s.startMinutes - base) % durationMin) === 0
//     );
//   }, [state.slots, durationMin]);

//   return (
//     <div className="min-h-screen bg-black text-white pb-20">
//       <PremiumProgressBar currentStep={2} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div
//           className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"
//           style={{ animationDelay: "1s" }}
//         ></div>
//       </div>

//       <div className="relative pt-32 pb-20 px-4">
//         <div className="container mx-auto max-w-6xl">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring" }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6"
//             >
//               <CalendarIcon className="w-4 h-4 text-yellow-400" />
//               <span className="text-yellow-400 text-sm font-medium">Шаг 3</span>
//             </motion.div>

//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
//                 Онлайн запись
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Выберите удобные дату и время
//             </p>
//           </motion.div>

//           {/* Master Selector */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="mb-8 bg-white/5 rounded-2xl p-6 border border-white/10"
//           >
//             <label className="flex items-center gap-4">
//               <span className="text-white/60 font-medium">Мастер:</span>
//               <select
//                 className="flex-1 max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
//                 value={masterId}
//                 onChange={onPickMaster}
//                 disabled={masters.length === 0}
//               >
//                 {masters.length === 0 && <option value="">Загрузка...</option>}
//                 {masters.map((m) => (
//                   <option key={m.id} value={m.id}>
//                     {m.name}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </motion.div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Calendar */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//               className="bg-white/5 rounded-3xl p-6 border border-white/10"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                   {monthNames[viewMonth.month - 1]} {viewMonth.year}
//                 </h2>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handlePreviousMonth}
//                     className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
//                   >
//                     <ChevronLeft className="w-5 h-5 text-white/60" />
//                   </button>
//                   <button
//                     onClick={handleNextMonth}
//                     className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
//                   >
//                     <ChevronRight className="w-5 h-5 text-white/60" />
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-7 gap-2">
//                 {dayNames.map((day) => (
//                   <div
//                     key={day}
//                     className="text-center text-sm font-medium text-white/50 py-2"
//                   >
//                     {day}
//                   </div>
//                 ))}

//                 {days.map((day, index) => (
//                   <motion.button
//                     key={index}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: index * 0.01 }}
//                     onClick={() => day && handleDateSelect(day)}
//                     disabled={!day}
//                     className={`
//         aspect-square p-2 rounded-xl text-sm font-medium transition-all
//         ${!day ? "invisible" : ""}
//         ${
//           day && isToday(day)
//             ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
//             : ""
//         }
//         ${
//           day && isSameDay(day, dateISO)
//             ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(255,215,0,0.5)] scale-110"
//             : ""
//         }
//         ${
//           day && !isSameDay(day, dateISO) && !isToday(day)
//             ? "text-white/60 hover:bg-white/10 border border-transparent hover:border-yellow-400/30 hover:text-white"
//             : ""
//         }
//       `}
//                   >
//                     {day ? day.getDate() : ""}
//                   </motion.button>
//                 ))}
//               </div>

//               <div className="mt-6 p-4 bg-black/30 rounded-xl border border-white/10">
//                 <div className="flex items-center gap-2 text-white/60 text-sm">
//                   <Clock className="w-4 h-4 text-yellow-400" />
//                   <span className="font-medium">Выбрана дата:</span>
//                   <span className="text-white">
//                     {new Date(dateISO + "T00:00:00").toLocaleDateString(
//                       "ru-RU",
//                       {
//                         day: "numeric",
//                         month: "long",
//                         year: "numeric",
//                       }
//                     )}
//                   </span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Time Slots */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.5 }}
//               className="bg-white/5 rounded-3xl p-6 border border-white/10"
//             >
//               <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-6">
//                 Доступное время
//               </h2>

//               {state.loading && (
//                 <div className="text-center py-12">
//                   <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
//                   <p className="text-white/60 text-sm">Загрузка...</p>
//                 </div>
//               )}

//               {state.error && (
//                 <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
//                   <p className="text-red-400 text-sm">Ошибка: {state.error}</p>
//                 </div>
//               )}

//               {!state.loading && !state.error && displaySlots.length === 0 && (
//                 <div className="text-center py-12">
//                   <div className="text-4xl mb-4">😔</div>
//                   <p className="text-white/60 text-sm">
//                     На эту дату нет свободных слотов
//                   </p>
//                 </div>
//               )}

//               {!state.loading && !state.error && displaySlots.length > 0 && (
//                 <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
//                   {displaySlots.map((slot, index) => (
//                     <motion.button
//                       key={slot.startAt}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: index * 0.02 }}
//                       onClick={() => goClient(slot)}
//                       className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-gradient-to-br hover:from-yellow-400/10 hover:to-amber-600/10 transition-all text-center"
//                     >
//                       <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
//                         {formatHM(slot.startMinutes)}–{formatHM(slot.endMinutes)}
//                       </div>
//                       <Sparkles className="w-3 h-3 text-yellow-400 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </motion.button>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-6 flex items-center justify-between text-sm">
//                 <span className="text-white/60">Доступно слотов:</span>
//                 <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                   {displaySlots.length}
//                 </span>
//               </div>
//             </motion.div>
//           </div>

//           {/* Ссылка назад к выбору мастера */}
//           <div className="mt-8">
//             <button
//               type="button"
//               onClick={goBackToMaster}
//               className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               Вернуться к выбору мастера
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CalendarPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-black flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }




// //src/app/booking/(steps)/calendar/page.tsx
// "use client";

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   Suspense,
// } from "react";
// import { motion } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   Calendar as CalendarIcon,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Sparkles,
// } from "lucide-react";

// // Типы (как в рабочей версии)
// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// type LoadState = {
//   loading: boolean;
//   error: string | null;
//   slots: Slot[];
// };

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString("sv-SE", { timeZone: tz, hour12: false });
//   return s.split(" ")[0];
// };

// // === фикс UTC-сдвига: локальная дата YYYY-MM-DD ===
// const toISODate = (d: Date): string => {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// };

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split("-").map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, "0");
//   return `${pad(hh)}:${pad(mm)}`;
// };

// class RequestCache {
//   private cache: Map<string, { data: ApiPayload; timestamp: number }>;
//   private readonly TTL = 3000;

//   constructor() {
//     this.cache = new Map();
//   }

//   get(key: string): ApiPayload | null {
//     const entry = this.cache.get(key);
//     if (!entry) return null;

//     const age = Date.now() - entry.timestamp;
//     if (age > this.TTL) {
//       this.cache.delete(key);
//       return null;
//     }

//     return entry.data;
//   }

//   set(key: string, data: ApiPayload): void {
//     this.cache.set(key, { data, timestamp: Date.now() });
//   }

//   clear(): void {
//     this.cache.clear();
//   }
// }

// const requestCache = new RequestCache();

// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

//   React.useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// const monthNames = [
//   "Январь",
//   "Февраль",
//   "Март",
//   "Апрель",
//   "Май",
//   "Июнь",
//   "Июль",
//   "Август",
//   "Сентябрь",
//   "Октябрь",
//   "Ноябрь",
//   "Декабрь",
// ];

// const dayNames = [ "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс" ];

// const getDaysInMonth = (year: number, month: number) => {
//   const firstDay = new Date(year, month - 1, 1);
//   const lastDay = new Date(year, month, 0);
//   const daysInMonth = lastDay.getDate();
//   const startingDayOfWeek = firstDay.getDay();

//   const days: (Date | null)[] = [];

//   for (let i = 0; i < startingDayOfWeek; i++) {
//     days.push(null);
//   }

//   for (let day = 1; day <= daysInMonth; day++) {
//     days.push(new Date(year, month - 1, day));
//   }

//   return days;
// };

// const isSameDay = (date1: Date, date2ISO: string): boolean => {
//   const [y, m, d] = date2ISO.split("-").map(Number);
//   return (
//     date1.getDate() === d &&
//     date1.getMonth() === m - 1 &&
//     date1.getFullYear() === y
//   );
// };

// const isToday = (date: Date): boolean => {
//   const today = new Date();
//   return (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   );
// };

// function CalendarInner() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params]
//   );
//   const masterIdFromUrl = params.get("m") ?? "";
//   const urlDate = params.get("d") ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   const [dateISO, setDateISO] = useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(
//     () => {
//       const [y, m] = dateISO.split("-").map(Number);
//       return { year: y, month: m };
//     }
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [masterId, setMasterId] = useState<string>(masterIdFromUrl);

//   const [state, setState] = useState<LoadState>({
//     loading: false,
//     error: null,
//     slots: [],
//   });

//   const debouncedDate = useDebounce(dateISO, 300);
//   const debouncedMasterId = useDebounce(masterId, 300);

//   // флаг, чтобы автопрыжок выполнялся один раз
//   const autoJumpDoneRef = useRef(false);

//   useEffect(() => {
//     const [y, m] = dateISO.split("-").map(Number);
//     setViewMonth({ year: y, month: m });
//   }, [dateISO]);

//   const filterTodayCutoff = useCallback(
//     (list: Slot[], forDateISO: string): Slot[] => {
//       const isTodayFlag = forDateISO === todayISO();
//       if (!isTodayFlag) return list;
//       const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
//       return list.filter((s) => s.startAt >= cutoffISO);
//     },
//     []
//   );

//   useEffect(() => {
//     let alive = true;

//     async function loadMasters() {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId("");
//         return;
//       }

//       try {
//         const qs = new URLSearchParams();
//         qs.set("serviceIds", serviceIds.join(","));
//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: "no-store",
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = (await res.json()) as { masters: Master[] };

//         if (!alive) return;

//         setMasters(data.masters ?? []);

//         if (!masterId || !data.masters.find((m) => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? "";
//           setMasterId(first);

//           if (first) {
//             const q = new URLSearchParams();
//             serviceIds.forEach((s) => q.append("s", s));
//             q.set("m", first);
//             q.set("d", dateISO);
//             router.replace(`/booking/calendar?${q.toString()}`);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load masters:", err);
//       }
//     }

//     void loadMasters();

//     return () => {
//       alive = false;
//     };
//   }, [serviceIds, router, dateISO]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     let alive = true;
//     const abortController = new AbortController();

//     async function load() {
//       if (serviceIds.length === 0 || !debouncedMasterId) {
//         setState({ loading: false, error: null, slots: [] });
//         return;
//       }

//       const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(
//         ","
//       )}`;

//       const cached = requestCache.get(cacheKey);
//       if (cached) {
//         if (!alive) return;
//         const prepared = Array.isArray(cached.slots) ? cached.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//         return;
//       }

//       setState((prev) => ({ ...prev, loading: true, error: null }));

//       try {
//         const qs = new URLSearchParams();
//         qs.set("masterId", debouncedMasterId);
//         qs.set("dateISO", debouncedDate);
//         qs.set("serviceIds", serviceIds.join(","));

//         const res = await fetch(`/api/availability?${qs.toString()}`, {
//           cache: "no-store",
//           signal: abortController.signal,
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiPayload = await res.json();

//         if (!alive) return;

//         requestCache.set(cacheKey, data);

//         const prepared = Array.isArray(data.slots) ? data.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//       } catch (err: unknown) {
//         if (!alive) return;
//         if (err instanceof Error && err.name === "AbortError") return;

//         const msg =
//           err instanceof Error ? err.message : "Не удалось загрузить слоты";
//         setState({ loading: false, error: msg, slots: [] });
//       }
//     }

//     void load();

//     return () => {
//       alive = false;
//       abortController.abort();
//     };
//   }, [debouncedDate, debouncedMasterId, serviceIds, filterTodayCutoff]);

//   // === поиск ближайшей доступной даты ===
//   const findNearestAvailableDate = useCallback(
//     async (startISO: string): Promise<string | null> => {
//       if (!masterId || serviceIds.length === 0) return null;
//       const horizonDays = 60;
//       for (let i = 0; i < horizonDays; i++) {
//         const d = addDaysISO(startISO, i);
//         const qs = new URLSearchParams({
//           masterId,
//           dateISO: d,
//           serviceIds: serviceIds.join(","),
//         });
//         try {
//           const res = await fetch(`/api/availability?${qs.toString()}`, {
//             cache: "no-store",
//           });
//           if (!res.ok) continue;
//           const data: ApiPayload = await res.json();
//           const count = Array.isArray(data.slots) ? data.slots.length : 0;
//           if (count > 0) return d;
//         } catch {
//           /* ignore */
//         }
//       }
//       return null;
//     },
//     [masterId, serviceIds]
//   );

//   // 1) Первый заход без параметра d — сразу прыжок на ближайший день со слотами
//   useEffect(() => {
//     if (autoJumpDoneRef.current) return;
//     if (!masterId || serviceIds.length === 0) return;
//     if (urlDate) return; // пользователь явно выбрал дату — не вмешиваемся

//     (async () => {
//       const nearest = await findNearestAvailableDate(dateISO);
//       if (nearest && nearest !== dateISO) {
//         autoJumpDoneRef.current = true;
//         setDateISO(nearest);
//         const q = new URLSearchParams();
//         serviceIds.forEach((id) => q.append("s", id));
//         q.set("m", masterId);
//         q.set("d", nearest);
//         router.replace(`/booking/calendar?${q.toString()}`);
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [masterId, serviceIds, urlDate]);

//   // 2) Если выбранная дата без слотов — мягко переведём на ближайшую
//   useEffect(() => {
//     if (autoJumpDoneRef.current) return;
//     if (!masterId || serviceIds.length === 0) return;
//     if (state.loading) return;
//     if (state.error) return;

//     if (state.slots.length === 0) {
//       (async () => {
//         const nearest = await findNearestAvailableDate(dateISO);
//         if (nearest && nearest !== dateISO) {
//           autoJumpDoneRef.current = true;
//           setDateISO(nearest);
//           const q = new URLSearchParams();
//           serviceIds.forEach((id) => q.append("s", id));
//           q.set("m", masterId);
//           q.set("d", nearest);
//           router.replace(`/booking/calendar?${q.toString()}`);
//         }
//       })();
//     }
//   }, [
//     state.loading,
//     state.error,
//     state.slots.length,
//     findNearestAvailableDate,
//     dateISO,
//     masterId,
//     serviceIds,
//     router,
//   ]);

//   const handlePreviousMonth = () => {
//     setViewMonth((prev) => {
//       const newMonth = prev.month === 1 ? 12 : prev.month - 1;
//       const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleNextMonth = () => {
//     setViewMonth((prev) => {
//       const newMonth = prev.month === 12 ? 1 : prev.month + 1;
//       const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleDateSelect = (date: Date) => {
//     const newISO = toISODate(date); // локально, без UTC-сдвига
//     const safe = clampISO(newISO, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//     requestCache.clear();
//   };

//   const syncUrl = (d: string, m: string) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     if (m) qs.set("m", m);
//     qs.set("d", d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   const goClient = (slot: Slot) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     if (masterId) qs.set("m", masterId);
//     qs.set("start", slot.startAt);
//     qs.set("end", slot.endAt);
//     qs.set("d", dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   const days = getDaysInMonth(viewMonth.year, viewMonth.month);

//   return (
//     <div className="min-h-screen bg-black text-white pb-20">
//       <PremiumProgressBar currentStep={2} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div
//           className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"
//           style={{ animationDelay: "1s" }}
//         ></div>
//       </div>

//       <div className="relative pt-32 pb-20 px-4">
//         <div className="container mx-auto max-w-6xl">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring" }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6"
//             >
//               <CalendarIcon className="w-4 h-4 text-yellow-400" />
//               <span className="text-yellow-400 text-sm font-medium">Шаг 3</span>
//             </motion.div>

//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
//                 Онлайн запись
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Выберите удобные дату и время
//             </p>
//           </motion.div>

//           {/* Master Selector */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="mb-8 bg-white/5 rounded-2xl p-6 border border-white/10"
//           >
//             <label className="flex items-center gap-4">
//               <span className="text-white/60 font-medium">Мастер:</span>
//               <select
//                 className="flex-1 max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
//                 value={masterId}
//                 onChange={onPickMaster}
//                 disabled={masters.length === 0}
//               >
//                 {masters.length === 0 && <option value="">Загрузка...</option>}
//                 {masters.map((m) => (
//                   <option key={m.id} value={m.id}>
//                     {m.name}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </motion.div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Calendar */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//               className="bg-white/5 rounded-3xl p-6 border border-white/10"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                   {monthNames[viewMonth.month - 1]} {viewMonth.year}
//                 </h2>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handlePreviousMonth}
//                     className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
//                   >
//                     <ChevronLeft className="w-5 h-5 text-white/60" />
//                   </button>
//                   <button
//                     onClick={handleNextMonth}
//                     className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
//                   >
//                     <ChevronRight className="w-5 h-5 text-white/60" />
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-7 gap-2">
//                 {dayNames.map((day) => (
//                   <div
//                     key={day}
//                     className="text-center text-sm font-medium text-white/50 py-2"
//                   >
//                     {day}
//                   </div>
//                 ))}

//                 {getDaysInMonth(viewMonth.year, viewMonth.month).map(
//                   (day, index) => (
//                     <motion.button
//                       key={index}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: index * 0.01 }}
//                       onClick={() => day && handleDateSelect(day)}
//                       disabled={!day}
//                       className={`
//         aspect-square p-2 rounded-xl text-sm font-medium transition-all
//         ${!day ? "invisible" : ""}
//         ${
//           day && isToday(day)
//             ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
//             : ""
//         }
//         ${
//           day && isSameDay(day, dateISO)
//             ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(255,215,0,0.5)] scale-110"
//             : ""
//         }
//         ${
//           day && !isSameDay(day, dateISO) && !isToday(day)
//             ? "text-white/60 hover:bg-white/10 border border-transparent hover:border-yellow-400/30 hover:text-white"
//             : ""
//         }
//       `}
//                     >
//                       {day ? day.getDate() : ""}
//                     </motion.button>
//                   )
//                 )}
//               </div>

//               <div className="mt-6 p-4 bg-black/30 rounded-xl border border-white/10">
//                 <div className="flex items-center gap-2 text-white/60 text-sm">
//                   <Clock className="w-4 h-4 text-yellow-400" />
//                   <span className="font-medium">Выбрана дата:</span>
//                   <span className="text-white">
//                     {new Date(dateISO + "T00:00:00").toLocaleDateString(
//                       "ru-RU",
//                       {
//                         day: "numeric",
//                         month: "long",
//                         year: "numeric",
//                       }
//                     )}
//                   </span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Time Slots */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.5 }}
//               className="bg-white/5 rounded-3xl p-6 border border-white/10"
//             >
//               <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-6">
//                 Доступное время
//               </h2>

//               {state.loading && (
//                 <div className="text-center py-12">
//                   <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
//                   <p className="text-white/60 text-sm">Загрузка...</p>
//                 </div>
//               )}

//               {state.error && (
//                 <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
//                   <p className="text-red-400 text-sm">Ошибка: {state.error}</p>
//                 </div>
//               )}

//               {!state.loading && !state.error && state.slots.length === 0 && (
//                 <div className="text-center py-12">
//                   <div className="text-4xl mb-4">😔</div>
//                   <p className="text-white/60 text-sm">
//                     На эту дату нет свободных слотов
//                   </p>
//                 </div>
//               )}

//               {!state.loading && !state.error && state.slots.length > 0 && (
//                 <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
//                   {state.slots.map((slot, index) => (
//                     <motion.button
//                       key={slot.startAt}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: index * 0.02 }}
//                       onClick={() => goClient(slot)}
//                       className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-gradient-to-br hover:from-yellow-400/10 hover:to-amber-600/10 transition-all text-center"
//                     >
//                       <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
//                         {formatHM(slot.startMinutes)}
//                       </div>
//                       <Sparkles className="w-3 h-3 text-yellow-400 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </motion.button>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-6 flex items-center justify-between text-sm">
//                 <span className="text-white/60">Доступно слотов:</span>
//                 <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                   {state.slots.length}
//                 </span>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CalendarPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-black flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }

//---------------поиск на ближайшую дату 17/11
// //src/app/booking/(steps)/calendar/page.tsx
// 'use client';

// import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
// import { motion } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';

// // Типы (как в рабочей версии)
// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// type LoadState = {
//   loading: boolean;
//   error: string | null;
//   slots: Slot[];
// };

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// };

// const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split('-').map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, '0');
//   return `${pad(hh)}:${pad(mm)}`;
// };

// class RequestCache {
//   private cache: Map<string, { data: ApiPayload; timestamp: number }>;
//   private readonly TTL = 3000;

//   constructor() {
//     this.cache = new Map();
//   }

//   get(key: string): ApiPayload | null {
//     const entry = this.cache.get(key);
//     if (!entry) return null;

//     const age = Date.now() - entry.timestamp;
//     if (age > this.TTL) {
//       this.cache.delete(key);
//       return null;
//     }

//     return entry.data;
//   }

//   set(key: string, data: ApiPayload): void {
//     this.cache.set(key, { data, timestamp: Date.now() });
//   }

//   clear(): void {
//     this.cache.clear();
//   }
// }

// const requestCache = new RequestCache();

// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

//   React.useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// const monthNames = [
//   'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
//   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
// ];

// const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// const getDaysInMonth = (year: number, month: number) => {
//   const firstDay = new Date(year, month - 1, 1);
//   const lastDay = new Date(year, month, 0);
//   const daysInMonth = lastDay.getDate();
//   const startingDayOfWeek = firstDay.getDay();

//   const days: (Date | null)[] = [];

//   for (let i = 0; i < startingDayOfWeek; i++) {
//     days.push(null);
//   }

//   for (let day = 1; day <= daysInMonth; day++) {
//     days.push(new Date(year, month - 1, day));
//   }

//   return days;
// };

// const isSameDay = (date1: Date, date2ISO: string): boolean => {
//   const [y, m, d] = date2ISO.split('-').map(Number);
//   return (
//     date1.getDate() === d &&
//     date1.getMonth() === m - 1 &&
//     date1.getFullYear() === y
//   );
// };

// const isToday = (date: Date): boolean => {
//   const today = new Date();
//   return (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   );
// };

// function CalendarInner() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterIdFromUrl = params.get('m') ?? '';
//   const urlDate = params.get('d') ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   const [dateISO, setDateISO] = useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   const [viewMonth, setViewMonth] = useState<{ year: number; month: number }>(() => {
//     const [y, m] = dateISO.split('-').map(Number);
//     return { year: y, month: m };
//   });

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [masterId, setMasterId] = useState<string>(masterIdFromUrl);

//   const [state, setState] = useState<LoadState>({
//     loading: false,
//     error: null,
//     slots: [],
//   });

//   const debouncedDate = useDebounce(dateISO, 300);
//   const debouncedMasterId = useDebounce(masterId, 300);

//   useEffect(() => {
//     const [y, m] = dateISO.split('-').map(Number);
//     setViewMonth({ year: y, month: m });
//   }, [dateISO]);

//   const filterTodayCutoff = useCallback((list: Slot[], forDateISO: string): Slot[] => {
//     const isToday = forDateISO === todayISO();
//     if (!isToday) return list;
//     const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
//     return list.filter(s => s.startAt >= cutoffISO);
//   }, []);

//   useEffect(() => {
//     let alive = true;

//     async function loadMasters() {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId('');
//         return;
//       }

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = await res.json() as { masters: Master[] };

//         if (!alive) return;

//         setMasters(data.masters ?? []);

//         if (!masterId || !data.masters.find(m => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? '';
//           setMasterId(first);

//           if (first) {
//             const q = new URLSearchParams();
//             serviceIds.forEach(s => q.append('s', s));
//             q.set('m', first);
//             q.set('d', dateISO);
//             router.replace(`/booking/calendar?${q.toString()}`);
//           }
//         }
//       } catch (err) {
//         console.error('Failed to load masters:', err);
//       }
//     }

//     void loadMasters();

//     return () => {
//       alive = false;
//     };
//   }, [serviceIds, router, dateISO]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     let alive = true;
//     const abortController = new AbortController();

//     async function load() {
//       if (serviceIds.length === 0 || !debouncedMasterId) {
//         setState({ loading: false, error: null, slots: [] });
//         return;
//       }

//       const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(',')}`;

//       const cached = requestCache.get(cacheKey);
//       if (cached) {
//         if (!alive) return;
//         const prepared = Array.isArray(cached.slots) ? cached.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//         return;
//       }

//       setState(prev => ({ ...prev, loading: true, error: null }));

//       try {
//         const qs = new URLSearchParams();
//         qs.set('masterId', debouncedMasterId);
//         qs.set('dateISO', debouncedDate);
//         qs.set('serviceIds', serviceIds.join(','));

//         const res = await fetch(`/api/availability?${qs.toString()}`, {
//           cache: 'no-store',
//           signal: abortController.signal,
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiPayload = await res.json();

//         if (!alive) return;

//         requestCache.set(cacheKey, data);

//         const prepared = Array.isArray(data.slots) ? data.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//       } catch (err: unknown) {
//         if (!alive) return;
//         if (err instanceof Error && err.name === 'AbortError') return;

//         const msg = err instanceof Error ? err.message : 'Не удалось загрузить слоты';
//         setState({ loading: false, error: msg, slots: [] });
//       }
//     }

//     void load();

//     return () => {
//       alive = false;
//       abortController.abort();
//     };
//   }, [debouncedDate, debouncedMasterId, serviceIds, filterTodayCutoff]);

//   const handlePreviousMonth = () => {
//     setViewMonth(prev => {
//       const newMonth = prev.month === 1 ? 12 : prev.month - 1;
//       const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleNextMonth = () => {
//     setViewMonth(prev => {
//       const newMonth = prev.month === 12 ? 1 : prev.month + 1;
//       const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleDateSelect = (date: Date) => {
//     const newISO = toISODate(date);
//     const safe = clampISO(newISO, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = e => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//     requestCache.clear();
//   };

//   const syncUrl = (d: string, m: string) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (m) qs.set('m', m);
//     qs.set('d', d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   const goClient = (slot: Slot) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (masterId) qs.set('m', masterId);
//     qs.set('start', slot.startAt);
//     qs.set('end', slot.endAt);
//     qs.set('d', dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   const days = getDaysInMonth(viewMonth.year, viewMonth.month);

//   return (
//     <div className="min-h-screen bg-black text-white pb-20">
//       <PremiumProgressBar currentStep={2} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
//       </div>

//       <div className="relative pt-32 pb-20 px-4">
//         <div className="container mx-auto max-w-6xl">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: 'spring' }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6"
//             >
//               <CalendarIcon className="w-4 h-4 text-yellow-400" />
//               <span className="text-yellow-400 text-sm font-medium">Шаг 3</span>
//             </motion.div>

//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
//                 Онлайн запись
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Выберите удобные дату и время
//             </p>
//           </motion.div>

//           {/* Master Selector */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="mb-8 bg-white/5 rounded-2xl p-6 border border-white/10"
//           >
//             <label className="flex items-center gap-4">
//               <span className="text-white/60 font-medium">Мастер:</span>
//               <select
//                 className="flex-1 max-w-xs bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none transition-colors"
//                 value={masterId}
//                 onChange={onPickMaster}
//                 disabled={masters.length === 0}
//               >
//                 {masters.length === 0 && <option value="">Загрузка...</option>}
//                 {masters.map(m => (
//                   <option key={m.id} value={m.id}>{m.name}</option>
//                 ))}
//               </select>
//             </label>
//           </motion.div>

//           <div className="grid lg:grid-cols-2 gap-8">
//             {/* Calendar */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//               className="bg-white/5 rounded-3xl p-6 border border-white/10"
//             >
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                   {monthNames[viewMonth.month - 1]} {viewMonth.year}
//                 </h2>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handlePreviousMonth}
//                     className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
//                   >
//                     <ChevronLeft className="w-5 h-5 text-white/60" />
//                   </button>
//                   <button
//                     onClick={handleNextMonth}
//                     className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all"
//                   >
//                     <ChevronRight className="w-5 h-5 text-white/60" />
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-7 gap-2">
//                 {dayNames.map((day) => (
//                   <div
//                     key={day}
//                     className="text-center text-sm font-medium text-white/50 py-2"
//                   >
//                     {day}
//                   </div>
//                 ))}
//                 {days.map((day, index) => (
//                   <motion.button
//                     key={index}
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: index * 0.01 }}
//                     onClick={() => day && handleDateSelect(day)}
//                     disabled={!day}
//                     className={`
//                       aspect-square p-2 rounded-xl text-sm font-medium transition-all
//                       ${!day ? 'invisible' : ''}
//                       ${day && isToday(day) ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : ''}
//                       ${day && isSameDay(day, dateISO) ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(255,215,0,0.5)] scale-110' : ''}
//                       ${day && !isSameDay(day, dateISO) && !isToday(day) ? 'text-white/60 hover:bg-white/10 border border-transparent hover:border-yellow-400/30 hover:text-white' : ''}
//                     `}
//                   >
//                     {day ? day.getDate() : ''}
//                   </motion.button>
//                 ))}
//               </div>

//               <div className="mt-6 p-4 bg-black/30 rounded-xl border border-white/10">
//                 <div className="flex items-center gap-2 text-white/60 text-sm">
//                   <Clock className="w-4 h-4 text-yellow-400" />
//                   <span className="font-medium">Выбрана дата:</span>
//                   <span className="text-white">
//                     {new Date(dateISO + 'T00:00:00').toLocaleDateString('ru-RU', {
//                       day: 'numeric',
//                       month: 'long',
//                       year: 'numeric',
//                     })}
//                   </span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Time Slots */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.5 }}
//               className="bg-white/5 rounded-3xl p-6 border border-white/10"
//             >
//               <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 mb-6">
//                 Доступное время
//               </h2>

//               {state.loading && (
//                 <div className="text-center py-12">
//                   <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
//                   <p className="text-white/60 text-sm">Загрузка...</p>
//                 </div>
//               )}

//               {state.error && (
//                 <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4">
//                   <p className="text-red-400 text-sm">Ошибка: {state.error}</p>
//                 </div>
//               )}

//               {!state.loading && !state.error && state.slots.length === 0 && (
//                 <div className="text-center py-12">
//                   <div className="text-4xl mb-4">😔</div>
//                   <p className="text-white/60 text-sm">
//                     На эту дату нет свободных слотов
//                   </p>
//                 </div>
//               )}

//               {!state.loading && !state.error && state.slots.length > 0 && (
//                 <div className="grid grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
//                   {state.slots.map((slot, index) => (
//                     <motion.button
//                       key={slot.startAt}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: index * 0.02 }}
//                       onClick={() => goClient(slot)}
//                       className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-gradient-to-br hover:from-yellow-400/10 hover:to-amber-600/10 transition-all text-center"
//                     >
//                       <div className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">
//                         {formatHM(slot.startMinutes)}
//                       </div>
//                       <Sparkles className="w-3 h-3 text-yellow-400 mx-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </motion.button>
//                   ))}
//                 </div>
//               )}

//               <div className="mt-6 flex items-center justify-between text-sm">
//                 <span className="text-white/60">Доступно слотов:</span>
//                 <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                   {state.slots.length}
//                 </span>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CalendarPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-black flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }

//-----------------работал с мастером 03/11
// //src/app/booking/(steps)/calendar/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

// /* =========================
//    Типы
// ========================= */

// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// type LoadState = {
//   loading: boolean;
//   error: string | null;
//   slots: Slot[];
// };

// /* =========================
//    Время/формат
// ========================= */

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// };

// const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split('-').map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, '0');
//   return `${pad(hh)}:${pad(mm)}`;
// };

// /* =========================
//    Кэш для запросов
// ========================= */

// class RequestCache {
//   private cache: Map<string, { data: ApiPayload; timestamp: number }>;
//   private readonly TTL = 3000; // 3 секунды

//   constructor() {
//     this.cache = new Map();
//   }

//   get(key: string): ApiPayload | null {
//     const entry = this.cache.get(key);
//     if (!entry) return null;

//     const age = Date.now() - entry.timestamp;
//     if (age > this.TTL) {
//       this.cache.delete(key);
//       return null;
//     }

//     return entry.data;
//   }

//   set(key: string, data: ApiPayload): void {
//     this.cache.set(key, { data, timestamp: Date.now() });
//   }

//   clear(): void {
//     this.cache.clear();
//   }
// }

// const requestCache = new RequestCache();

// /* =========================
//    Debounce хук
// ========================= */

// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

//   React.useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// /* =========================
//    Календарные функции
// ========================= */

// const monthNames = [
//   'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
//   'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
// ];

// const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// // Получение дней месяца для отображения в календаре
// // ВАЖНО: принимает год и месяц отдельно!
// const getDaysInMonth = (year: number, month: number) => {
//   const firstDay = new Date(year, month - 1, 1);
//   const lastDay = new Date(year, month, 0);
//   const daysInMonth = lastDay.getDate();
//   const startingDayOfWeek = firstDay.getDay();

//   const days: (Date | null)[] = [];

//   // Добавляем пустые ячейки для дней предыдущего месяца
//   for (let i = 0; i < startingDayOfWeek; i++) {
//     days.push(null);
//   }

//   // Добавляем дни текущего месяца
//   for (let day = 1; day <= daysInMonth; day++) {
//     days.push(new Date(year, month - 1, day));
//   }

//   return days;
// };

// const isSameDay = (date1: Date, date2ISO: string): boolean => {
//   const [y, m, d] = date2ISO.split('-').map(Number);
//   return (
//     date1.getDate() === d &&
//     date1.getMonth() === m - 1 &&
//     date1.getFullYear() === y
//   );
// };

// const isToday = (date: Date): boolean => {
//   const today = new Date();
//   return (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   );
// };

// /* =========================
//    Основной компонент
// ========================= */

// function CalendarInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterIdFromUrl = params.get('m') ?? '';
//   const urlDate = params.get('d') ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   // КРИТИЧНО: dateISO - это выбранная пользователем дата
//   const [dateISO, setDateISO] = React.useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   // НОВОЕ: отдельный state для отображаемого месяца календаря
//   const [viewMonth, setViewMonth] = React.useState<{ year: number; month: number }>(() => {
//     const [y, m] = dateISO.split('-').map(Number);
//     return { year: y, month: m };
//   });

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [masterId, setMasterId] = React.useState<string>(masterIdFromUrl);

//   const [state, setState] = React.useState<LoadState>({
//     loading: false,
//     error: null,
//     slots: [],
//   });

//   const hasDateParam = React.useMemo<boolean>(() => params.has('d'), [params]);

//   // Debounce для dateISO и masterId
//   const debouncedDate = useDebounce(dateISO, 300);
//   const debouncedMasterId = useDebounce(masterId, 300);

//   // Синхронизируем viewMonth когда меняется dateISO
//   React.useEffect(() => {
//     const [y, m] = dateISO.split('-').map(Number);
//     setViewMonth({ year: y, month: m });
//   }, [dateISO]);

//   // Фильтр слотов < now+60m для сегодняшней даты
//   const filterTodayCutoff = React.useCallback((list: Slot[], forDateISO: string): Slot[] => {
//     const isToday = forDateISO === todayISO();
//     if (!isToday) return list;
//     const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
//     return list.filter(s => s.startAt >= cutoffISO);
//   }, []);

//   // Загрузка доступных мастеров для выбранных услуг
//   React.useEffect(() => {
//     let alive = true;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId('');
//         return;
//       }

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = (await res.json()) as { masters: Master[] };

//         if (!alive) return;

//         setMasters(data.masters ?? []);

//         // Если мастер не выбран или не входит в список, выбираем первого
//         if (!masterId || !data.masters.find(m => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? '';
//           setMasterId(first);

//           // Синхронизируем URL
//           if (first) {
//             const q = new URLSearchParams();
//             serviceIds.forEach(s => q.append('s', s));
//             q.set('m', first);
//             q.set('d', dateISO);
//             router.replace(`/booking/calendar?${q.toString()}`);
//           }
//         }
//       } catch (err) {
//         console.error('Failed to load masters:', err);
//       }
//     }

//     void loadMasters();

//     return () => {
//       alive = false;
//     };
//   }, [serviceIds, router, dateISO]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Загрузка слотов с кэшированием
//   React.useEffect(() => {
//     let alive = true;
//     const abortController = new AbortController();

//     async function load(): Promise<void> {
//       if (serviceIds.length === 0 || !debouncedMasterId) {
//         setState({ loading: false, error: null, slots: [] });
//         return;
//       }

//       // Генерируем ключ кэша
//       const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(',')}`;

//       // Проверяем кэш
//       const cached = requestCache.get(cacheKey);
//       if (cached) {
//         if (!alive) return;
//         const prepared = Array.isArray(cached.slots) ? cached.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//         return;
//       }

//       setState(prev => ({ ...prev, loading: true, error: null }));

//       try {
//         const qs = new URLSearchParams();
//         qs.set('masterId', debouncedMasterId);
//         qs.set('dateISO', debouncedDate);
//         qs.set('serviceIds', serviceIds.join(','));

//         const res = await fetch(`/api/availability?${qs.toString()}`, {
//           cache: 'no-store',
//           signal: abortController.signal,
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiPayload = await res.json();

//         if (!alive) return;

//         // Сохраняем в кэш
//         requestCache.set(cacheKey, data);

//         const prepared = Array.isArray(data.slots) ? data.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//       } catch (err: unknown) {
//         if (!alive) return;
//         if (err instanceof Error && err.name === 'AbortError') return;

//         const msg = err instanceof Error ? err.message : 'Не удалось загрузить слоты';
//         setState({ loading: false, error: msg, slots: [] });
//       }
//     }

//     void load();

//     return () => {
//       alive = false;
//       abortController.abort();
//     };
//   }, [debouncedDate, debouncedMasterId, serviceIds, filterTodayCutoff]);

//   // Оптимизированное сканирование ближайшей даты
//   const scanningRef = React.useRef(false);
//   const lastScanRef = React.useRef<string>('');

//   const scanForwardForFirstDayWithSlots = React.useCallback(async (): Promise<void> => {
//     if (scanningRef.current) return;
//     if (!debouncedMasterId || serviceIds.length === 0) return;

//     const scanKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(',')}`;
//     if (lastScanRef.current === scanKey) return;

//     scanningRef.current = true;
//     lastScanRef.current = scanKey;

//     try {
//       let d = debouncedDate;
//       let attempts = 0;
//       const maxAttempts = 14;

//       while (d <= maxISO && attempts < maxAttempts) {
//         attempts++;

//         const cacheKey = `${debouncedMasterId}_${d}_${serviceIds.join(',')}`;
//         let data = requestCache.get(cacheKey);

//         if (!data) {
//           const qs = new URLSearchParams();
//           qs.set('masterId', debouncedMasterId);
//           qs.set('dateISO', d);
//           qs.set('serviceIds', serviceIds.join(','));

//           try {
//             const res = await fetch(`/api/availability?${qs.toString()}`, {
//               cache: 'no-store',
//             });

//             if (!res.ok) break;

//             data = await res.json() as ApiPayload;
//             requestCache.set(cacheKey, data);
//           } catch {
//             break;
//           }
//         }

//         const filtered = filterTodayCutoff(Array.isArray(data.slots) ? data.slots : [], d);

//         if (filtered.length > 0) {
//           setDateISO(d);
//           setState({ loading: false, error: null, slots: filtered });

//           const urlQS = new URLSearchParams();
//           serviceIds.forEach(id => urlQS.append('s', id));
//           if (debouncedMasterId) urlQS.set('m', debouncedMasterId);
//           urlQS.set('d', d);
//           router.replace(`/booking/calendar?${urlQS.toString()}`);
//           break;
//         }

//         d = addDaysISO(d, 1);
//       }
//     } finally {
//       scanningRef.current = false;
//     }
//   }, [debouncedDate, debouncedMasterId, serviceIds, maxISO, router, filterTodayCutoff]);

//   React.useEffect(() => {
//     if (!hasDateParam && !state.loading && !state.error && state.slots.length === 0) {
//       void scanForwardForFirstDayWithSlots();
//     }
//   }, [hasDateParam, state.loading, state.error, state.slots.length, scanForwardForFirstDayWithSlots]);

//   // Навигация календаря по месяцам (только меняет отображение, не дату!)
//   const handlePreviousMonth = (): void => {
//     setViewMonth(prev => {
//       const newMonth = prev.month === 1 ? 12 : prev.month - 1;
//       const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleNextMonth = (): void => {
//     setViewMonth(prev => {
//       const newMonth = prev.month === 12 ? 1 : prev.month + 1;
//       const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
//       return { year: newYear, month: newMonth };
//     });
//   };

//   const handleDateSelect = (date: Date): void => {
//     const newISO = toISODate(date);
//     const safe = clampISO(newISO, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = e => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//     requestCache.clear();
//   };

//   const syncUrl = (d: string, m: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (m) qs.set('m', m);
//     qs.set('d', d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   // Переход к форме клиента
//   const goClient = (slot: Slot): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (masterId) qs.set('m', masterId);
//     qs.set('start', slot.startAt);
//     qs.set('end', slot.endAt);
//     qs.set('d', dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   // Генерация дней для ОТОБРАЖАЕМОГО месяца
//   const days = getDaysInMonth(viewMonth.year, viewMonth.month);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <CalendarIcon className="w-8 h-8" />
//               Онлайн запись
//             </h1>
//             <p className="text-blue-100 mt-2">Выберите удобные дату и время</p>
//           </div>

//           {/* Выбор мастера */}
//           <div className="p-6 border-b border-gray-200">
//             <label className="flex items-center gap-3">
//               <span className="text-sm font-medium text-gray-700">Мастер:</span>
//               <select
//                 className="flex-1 max-w-xs rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                 value={masterId}
//                 onChange={onPickMaster}
//                 disabled={masters.length === 0}
//               >
//                 {masters.length === 0 && <option value="">Загрузка...</option>}
//                 {masters.map(m => (
//                   <option key={m.id} value={m.id}>{m.name}</option>
//                 ))}
//               </select>
//             </label>
//           </div>

//           <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
//             {/* Календарь */}
//             <div>
//               <div className="bg-gray-50 rounded-xl p-4 md:p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <h2 className="text-xl font-semibold text-gray-800">
//                     {monthNames[viewMonth.month - 1]} {viewMonth.year}
//                   </h2>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={handlePreviousMonth}
//                       className="p-2 hover:bg-white rounded-lg transition-colors"
//                       aria-label="Предыдущий месяц"
//                     >
//                       <ChevronLeft className="w-5 h-5 text-gray-600" />
//                     </button>
//                     <button
//                       onClick={handleNextMonth}
//                       className="p-2 hover:bg-white rounded-lg transition-colors"
//                       aria-label="Следующий месяц"
//                     >
//                       <ChevronRight className="w-5 h-5 text-gray-600" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-7 gap-2">
//                   {dayNames.map((day) => (
//                     <div
//                       key={day}
//                       className="text-center text-sm font-medium text-gray-500 py-2"
//                     >
//                       {day}
//                     </div>
//                   ))}
//                   {days.map((day, index) => (
//                     <button
//                       key={index}
//                       onClick={() => day && handleDateSelect(day)}
//                       disabled={!day}
//                       className={`
//                         aspect-square p-2 rounded-lg text-sm font-medium transition-all
//                         ${!day ? 'invisible' : ''}
//                         ${day && isToday(day) ? 'bg-blue-100 text-blue-600' : ''}
//                         ${day && isSameDay(day, dateISO) ? 'bg-blue-600 text-white shadow-lg scale-105' : ''}
//                         ${day && !isSameDay(day, dateISO) && !isToday(day) ? 'hover:bg-gray-200 text-gray-700' : ''}
//                       `}
//                     >
//                       {day ? day.getDate() : ''}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="mt-4 p-4 bg-blue-50 rounded-xl">
//                 <p className="text-sm text-gray-600">
//                   <span className="font-semibold">Выбрана дата:</span>{' '}
//                   {new Date(dateISO + 'T00:00:00').toLocaleDateString('ru-RU', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric',
//                   })}
//                 </p>
//               </div>
//             </div>

//             {/* Слоты времени */}
//             <div>
//               <div className="bg-gray-50 rounded-xl p-4 md:p-6">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                   Доступное время
//                 </h2>

//                 {state.loading && (
//                   <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Загрузка свободных окон…</p>
//                   </div>
//                 )}

//                 {state.error && (
//                   <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
//                     Ошибка: {state.error}
//                   </div>
//                 )}

//                 {!state.loading && !state.error && state.slots.length === 0 && (
//                   <div className="text-center py-8">
//                     <div className="text-6xl mb-4">😔</div>
//                     <p className="text-gray-600">
//                       На эту дату нет свободных слотов
//                     </p>
//                   </div>
//                 )}

//                 {!state.loading && !state.error && state.slots.length > 0 && (
//                   <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-2">
//                     {state.slots.map((slot) => (
//                       <button
//                         key={slot.startAt}
//                         onClick={() => goClient(slot)}
//                         className="p-3 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 transition-all"
//                       >
//                         {formatHM(slot.startMinutes)}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 text-sm text-gray-600">
//                 Доступно слотов: <span className="font-semibold">{state.slots.length}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Обёртка
// ========================= */

// export default function CalendarPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-8 shadow-xl">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Инициализация календаря…</p>
//           </div>
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }

//-----------работал меняем дизайн 02/11
// //src/app/booking/(steps)/calendar/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// /* =========================
//    Типы
// ========================= */

// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// type LoadState = {
//   loading: boolean;
//   error: string | null;
//   slots: Slot[];
// };

// /* =========================
//    Время/формат
// ========================= */

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// };

// const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split('-').map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, '0');
//   return `${pad(hh)}:${pad(mm)}`;
// };

// /* =========================
//    Кэш для запросов
// ========================= */

// class RequestCache {
//   private cache: Map<string, { data: ApiPayload; timestamp: number }>;
//   private readonly TTL = 3000; // 3 секунды

//   constructor() {
//     this.cache = new Map();
//   }

//   get(key: string): ApiPayload | null {
//     const entry = this.cache.get(key);
//     if (!entry) return null;

//     const age = Date.now() - entry.timestamp;
//     if (age > this.TTL) {
//       this.cache.delete(key);
//       return null;
//     }

//     return entry.data;
//   }

//   set(key: string, data: ApiPayload): void {
//     this.cache.set(key, { data, timestamp: Date.now() });
//   }

//   clear(): void {
//     this.cache.clear();
//   }
// }

// const requestCache = new RequestCache();

// /* =========================
//    Debounce хук
// ========================= */

// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

//   React.useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// /* =========================
//    Основной компонент
// ========================= */

// function CalendarInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterIdFromUrl = params.get('m') ?? '';
//   const urlDate = params.get('d') ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   const [dateISO, setDateISO] = React.useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [masterId, setMasterId] = React.useState<string>(masterIdFromUrl);

//   const [state, setState] = React.useState<LoadState>({
//     loading: false,
//     error: null,
//     slots: [],
//   });

//   const hasDateParam = React.useMemo<boolean>(() => params.has('d'), [params]);

//   // Debounce для dateISO и masterId
//   const debouncedDate = useDebounce(dateISO, 300);
//   const debouncedMasterId = useDebounce(masterId, 300);

//   // Фильтр слотов < now+60m для сегодняшней даты
//   const filterTodayCutoff = React.useCallback((list: Slot[], forDateISO: string): Slot[] => {
//     const isToday = forDateISO === todayISO();
//     if (!isToday) return list;
//     const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
//     return list.filter(s => s.startAt >= cutoffISO);
//   }, []);

//   // Загрузка доступных мастеров для выбранных услуг
//   React.useEffect(() => {
//     let alive = true;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId('');
//         return;
//       }

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = (await res.json()) as { masters: Master[] };

//         if (!alive) return;

//         setMasters(data.masters ?? []);

//         // Если мастер не выбран или не входит в список, выбираем первого
//         if (!masterId || !data.masters.find(m => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? '';
//           setMasterId(first);

//           // Синхронизируем URL
//           if (first) {
//             const q = new URLSearchParams();
//             serviceIds.forEach(s => q.append('s', s));
//             q.set('m', first);
//             q.set('d', dateISO);
//             router.replace(`/booking/calendar?${q.toString()}`);
//           }
//         }
//       } catch (err) {
//         console.error('Failed to load masters:', err);
//       }
//     }

//     void loadMasters();

//     return () => {
//       alive = false;
//     };
//   }, [serviceIds, router, dateISO]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Загрузка слотов с кэшированием
//   React.useEffect(() => {
//     let alive = true;
//     const abortController = new AbortController();

//     async function load(): Promise<void> {
//       if (serviceIds.length === 0 || !debouncedMasterId) {
//         setState({ loading: false, error: null, slots: [] });
//         return;
//       }

//       // Генерируем ключ кэша
//       const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(',')}`;

//       // Проверяем кэш
//       const cached = requestCache.get(cacheKey);
//       if (cached) {
//         if (!alive) return;
//         const prepared = Array.isArray(cached.slots) ? cached.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//         return;
//       }

//       setState(prev => ({ ...prev, loading: true, error: null }));

//       try {
//         const qs = new URLSearchParams();
//         qs.set('masterId', debouncedMasterId);
//         qs.set('dateISO', debouncedDate);
//         qs.set('serviceIds', serviceIds.join(','));

//         const res = await fetch(`/api/availability?${qs.toString()}`, {
//           cache: 'no-store',
//           signal: abortController.signal,
//         });

//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data: ApiPayload = await res.json();

//         if (!alive) return;

//         // Сохраняем в кэш
//         requestCache.set(cacheKey, data);

//         const prepared = Array.isArray(data.slots) ? data.slots : [];
//         setState({
//           loading: false,
//           error: null,
//           slots: filterTodayCutoff(prepared, debouncedDate),
//         });
//       } catch (err: unknown) {
//         if (!alive) return;
//         if (err instanceof Error && err.name === 'AbortError') return;

//         const msg = err instanceof Error ? err.message : 'Не удалось загрузить слоты';
//         setState({ loading: false, error: msg, slots: [] });
//       }
//     }

//     void load();

//     return () => {
//       alive = false;
//       abortController.abort();
//     };
//   }, [debouncedDate, debouncedMasterId, serviceIds, filterTodayCutoff]);

//   // Оптимизированное сканирование ближайшей даты
//   const scanningRef = React.useRef(false);
//   const lastScanRef = React.useRef<string>('');

//   // ✅ Правильно
// const scanForwardForFirstDayWithSlots = React.useCallback(async (): Promise<void> => {
//     // Предотвращаем повторный запуск
//     if (scanningRef.current) return;
//     if (!debouncedMasterId || serviceIds.length === 0) return;

//     // Не сканируем повторно для той же даты
//     const scanKey = `${debouncedMasterId}_${debouncedDate}_${serviceIds.join(',')}`;
//     if (lastScanRef.current === scanKey) return;

//     scanningRef.current = true;
//     lastScanRef.current = scanKey;

//     try {
//       let d = debouncedDate;
//       let attempts = 0;
//       const maxAttempts = 14; // Ограничиваем 2 неделями вместо 9

//       while (d <= maxISO && attempts < maxAttempts) {
//         attempts++;

//         // Проверяем кэш сначала
//         const cacheKey = `${debouncedMasterId}_${d}_${serviceIds.join(',')}`;
//         let data = requestCache.get(cacheKey);

//         // Если в кэше нет, делаем запрос
//         if (!data) {
//           const qs = new URLSearchParams();
//           qs.set('masterId', debouncedMasterId);
//           qs.set('dateISO', d);
//           qs.set('serviceIds', serviceIds.join(','));

//           try {
//             const res = await fetch(`/api/availability?${qs.toString()}`, {
//               cache: 'no-store',
//             });

//             if (!res.ok) break;

//             data = await res.json() as ApiPayload;
//             requestCache.set(cacheKey, data);
//           } catch {
//             break;
//           }
//         }

//         const filtered = filterTodayCutoff(Array.isArray(data.slots) ? data.slots : [], d);

//         if (filtered.length > 0) {
//           setDateISO(d);
//           setState({ loading: false, error: null, slots: filtered });

//           const urlQS = new URLSearchParams();
//           serviceIds.forEach(id => urlQS.append('s', id));
//           if (debouncedMasterId) urlQS.set('m', debouncedMasterId);
//           urlQS.set('d', d);
//           router.replace(`/booking/calendar?${urlQS.toString()}`);
//           break;
//         }

//         d = addDaysISO(d, 1);
//       }
//     } finally {
//       scanningRef.current = false;
//     }
//   }, [debouncedDate, debouncedMasterId, serviceIds, maxISO, router, filterTodayCutoff]);

//   React.useEffect(() => {
//     if (!hasDateParam && !state.loading && !state.error && state.slots.length === 0) {
//       void scanForwardForFirstDayWithSlots();
//     }
//   }, [hasDateParam, state.loading, state.error, state.slots.length, scanForwardForFirstDayWithSlots]);

//   // Навигация по датам
//   const canPrev = dateISO > minISO;
//   const canNext = dateISO < maxISO;

//   const goPrev = (): void => {
//     if (!canPrev) return;
//     const d = addDaysISO(dateISO, -1);
//     const safe = clampISO(d, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const goNext = (): void => {
//     if (!canNext) return;
//     const d = addDaysISO(dateISO, +1);
//     const safe = clampISO(d, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const onPickDate: React.ChangeEventHandler<HTMLInputElement> = e => {
//     const raw = e.target.value;
//     if (!raw) return;
//     const d = clampISO(raw, minISO, maxISO);
//     setDateISO(d);
//     syncUrl(d, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = e => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//     // Очищаем кэш при смене мастера
//     requestCache.clear();
//   };

//   const syncUrl = (d: string, m: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (m) qs.set('m', m);
//     qs.set('d', d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   // Переход к форме клиента
//   const goClient = (slot: Slot): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (masterId) qs.set('m', masterId);
//     qs.set('start', slot.startAt);
//     qs.set('end', slot.endAt);
//     qs.set('d', dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   return (
//     <div className="mx-auto max-w-5xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Календарь</h2>

//       {/* Панель выбора мастера и даты */}
//       <div className="mt-6 flex flex-wrap items-center gap-3">
//         <label className="text-sm text-muted-foreground">Мастер:</label>
//         <select
//           className="rounded-md border bg-background px-3 py-1 text-sm"
//           value={masterId}
//           onChange={onPickMaster}
//           disabled={masters.length === 0}
//         >
//           {masters.length === 0 && <option value="">Загрузка...</option>}
//           {masters.map(m => (
//             <option key={m.id} value={m.id}>{m.name}</option>
//           ))}
//         </select>

//         <span className="ml-3 text-sm text-muted-foreground">Дата:</span>
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={goPrev}
//             disabled={!canPrev || state.loading}
//             className={`rounded-md border px-3 py-1 text-sm ${
//               canPrev && !state.loading ? 'hover:bg-muted' : 'opacity-50'
//             }`}
//           >
//             ←
//           </button>

//           <input
//             type="date"
//             value={dateISO}
//             min={minISO}
//             max={maxISO}
//             onChange={onPickDate}
//             disabled={state.loading}
//             className="rounded-md border bg-background px-3 py-1 text-sm disabled:opacity-50"
//           />

//           <button
//             type="button"
//             onClick={goNext}
//             disabled={!canNext || state.loading}
//             className={`rounded-md border px-3 py-1 text-sm ${
//               canNext && !state.loading ? 'hover:bg-muted' : 'opacity-50'
//             }`}
//           >
//             →
//           </button>
//         </div>
//       </div>

//       {/* Слоты */}
//       <section className="mt-4">
//         {state.loading && (
//           <div className="rounded-lg border border-border bg-card p-4">
//             Загрузка свободных окон…
//           </div>
//         )}

//         {state.error && (
//           <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//             Ошибка: {state.error}
//           </div>
//         )}

//         {!state.loading && !state.error && state.slots.length === 0 && (
//           <div className="rounded-lg border border-border bg-card p-4">
//             На выбранную дату нет свободных окон. Попробуйте выбрать другую дату.
//           </div>
//         )}

//         {!state.loading && !state.error && state.slots.length > 0 && (
//           <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
//             {state.slots.map((t) => (
//               <li key={t.startAt}>
//                 <button
//                   type="button"
//                   onClick={() => goClient(t)}
//                   className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition-colors"
//                 >
//                   {formatHM(t.startMinutes)}–{formatHM(t.endMinutes)}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       <div className="mt-6 text-xs text-muted-foreground">
//         Доступно слотов: <span className="font-medium text-foreground">{state.slots.length}</span>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Обёртка
// ========================= */

// export default function CalendarPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-5xl rounded-lg border border-border bg-card p-4">
//           Инициализация календаря…
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }

// //see src/app/booking/(steps)/calendar/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// /* =========================
//    Типы
// ========================= */

// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// /* =========================
//    Время/формат
// ========================= */

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// };

// const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split('-').map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, '0');
//   return `${pad(hh)}:${pad(mm)}`;
// };

// /* =========================
//    Внутренний компонент
// ========================= */

// function CalendarInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterIdFromUrl = params.get('m') ?? '';
//   const urlDate = params.get('d') ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   const [dateISO, setDateISO] = React.useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [masterId, setMasterId] = React.useState<string>(masterIdFromUrl);

//   const [slots, setSlots] = React.useState<Slot[]>([]);
//   const [loading, setLoading] = React.useState<boolean>(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const hasDateParam = React.useMemo<boolean>(() => params.has('d'), [params]);

//   // ВСПОМОГАТЕЛЬНО: фильтр слотов < now+60m для сегодняшней даты
//   const filterTodayCutoff = React.useCallback((list: Slot[], forDateISO: string): Slot[] => {
//     const isToday = forDateISO === todayISO();
//     if (!isToday) return list;
//     const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString(); // now+60m в UTC
//     return list.filter(s => s.startAt >= cutoffISO);
//   }, []);

//   // Загрузка доступных мастеров для выбранных услуг
//   React.useEffect(() => {
//     let alive = true;
//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId('');
//         return;
//       }
//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!alive) return;
//         setMasters(data.masters ?? []);
//         // если мастер не выбран или не входит в список, выбираем первого
//         if (!masterId || !data.masters.find(m => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? '';
//           setMasterId(first);
//           // синхронизируем URL
//           const q = new URLSearchParams();
//           serviceIds.forEach(s => q.append('s', s));
//           if (first) q.set('m', first);
//           q.set('d', dateISO);
//           router.replace(`/booking/calendar?${q.toString()}`);
//         }
//       } catch {
//         /* игнорируем, UI продолжит без мастеров */
//       }
//     }
//     void loadMasters();
//     return () => { alive = false; };
//   }, [serviceIds]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Загрузка слотов
//   React.useEffect(() => {
//     let alive = true;
//     async function load(): Promise<void> {
//       if (serviceIds.length === 0 || !masterId) {
//         setSlots([]);
//         return;
//       }
//       setLoading(true);
//       setError(null);
//       setSlots([]);
//       try {
//         const qs = new URLSearchParams();
//         qs.set('masterId', masterId);
//         qs.set('dateISO', dateISO);
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/availability?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data: ApiPayload = await res.json();
//         if (!alive) return;
//         const prepared = Array.isArray(data.slots) ? data.slots : [];
//         // фильтрация слотов для сегодняшней даты: только >= now+60m
//         setSlots(filterTodayCutoff(prepared, dateISO));
//       } catch (e: unknown) {
//         if (!alive) return;
//         const msg = e instanceof Error ? e.message : 'Не удалось загрузить слоты';
//         setError(msg);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     }
//     void load();
//     return () => { alive = false; };
//   }, [dateISO, masterId, serviceIds, filterTodayCutoff]);

//   // Сканирование ближайшей даты со слотами, если пользователь пришел без d=
//   const scanningRef = React.useRef(false);
//   const scanForwardForFirstDayWithSlots = React.useCallback(async (): Promise<void> => {
//     if (scanningRef.current) return;
//     if (!masterId || serviceIds.length === 0) return;

//     scanningRef.current = true;
//     try {
//       let d = dateISO;
//       while (d <= maxISO) {
//         const qs = new URLSearchParams();
//         qs.set('masterId', masterId);
//         qs.set('dateISO', d);
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/availability?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) break;
//         const { slots: s }: ApiPayload = await res.json();
//         const filtered = filterTodayCutoff(Array.isArray(s) ? s : [], d);
//         if (filtered.length > 0) {
//           setDateISO(d);
//           setSlots(filtered);
//           const urlQS = new URLSearchParams();
//           serviceIds.forEach(id => urlQS.append('s', id));
//           if (masterId) urlQS.set('m', masterId);
//           urlQS.set('d', d);
//           router.replace(`/booking/calendar?${urlQS.toString()}`);
//           break;
//         }
//         d = addDaysISO(d, 1);
//       }
//     } finally {
//       scanningRef.current = false;
//     }
//   }, [dateISO, masterId, serviceIds, maxISO, router, filterTodayCutoff]);

//   React.useEffect(() => {
//     if (!hasDateParam && !loading && !error && slots.length === 0) {
//       void scanForwardForFirstDayWithSlots();
//     }
//   }, [hasDateParam, loading, error, slots.length, scanForwardForFirstDayWithSlots]);

//   // Навигация по датам
//   const canPrev = dateISO > minISO;
//   const canNext = dateISO < maxISO;

//   const goPrev = (): void => {
//     if (!canPrev) return;
//     const d = addDaysISO(dateISO, -1);
//     // гарантируем, что не уйдём раньше minISO
//     const safe = clampISO(d, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const goNext = (): void => {
//     if (!canNext) return;
//     const d = addDaysISO(dateISO, +1);
//     const safe = clampISO(d, minISO, maxISO);
//     setDateISO(safe);
//     syncUrl(safe, masterId);
//   };

//   const onPickDate: React.ChangeEventHandler<HTMLInputElement> = e => {
//     const raw = e.target.value;
//     if (!raw) return;
//     const d = clampISO(raw, minISO, maxISO);
//     setDateISO(d);
//     syncUrl(d, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = e => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//   };

//   const syncUrl = (d: string, m: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (m) qs.set('m', m);
//     qs.set('d', d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   // Переход к форме клиента
//   const goClient = (slot: Slot): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (masterId) qs.set('m', masterId);
//     qs.set('start', slot.startAt);
//     qs.set('end', slot.endAt);
//     qs.set('d', dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   return (
//     <div className="mx-auto max-w-5xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Календарь</h2>

//       {/* Панель выбора мастера и даты */}
//       <div className="mt-6 flex flex-wrap items-center gap-3">
//         <label className="text-sm text-muted-foreground">Мастер:</label>
//         <select
//           className="rounded-md border bg-background px-3 py-1 text-sm"
//           value={masterId}
//           onChange={onPickMaster}
//         >
//           {masters.map(m => (
//             <option key={m.id} value={m.id}>{m.name}</option>
//           ))}
//         </select>

//         <span className="ml-3 text-sm text-muted-foreground">Дата:</span>
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={goPrev}
//             disabled={!canPrev}
//             className={`rounded-md border px-3 py-1 text-sm ${canPrev ? 'hover:bg-muted' : 'opacity-50'}`}
//           >
//             ←
//           </button>

//           <input
//             type="date"
//             value={dateISO}
//             min={minISO}
//             max={maxISO}
//             onChange={onPickDate}
//             className="rounded-md border bg-background px-3 py-1 text-sm"
//           />

//           <button
//             type="button"
//             onClick={goNext}
//             disabled={!canNext}
//             className={`rounded-md border px-3 py-1 text-sm ${canNext ? 'hover:bg-muted' : 'opacity-50'}`}
//           >
//             →
//           </button>
//         </div>
//       </div>

//       {/* Слоты */}
//       <section className="mt-4">
//         {loading && (
//           <div className="rounded-lg border border-border bg-card p-4">
//             Загрузка свободных окон…
//           </div>
//         )}

//         {error && (
//           <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//             Ошибка: {error}
//           </div>
//         )}

//         {!loading && !error && slots.length === 0 && (
//           <div className="rounded-lg border border-border bg-card p-4">
//             На выбранную дату нет свободных окон. Попробуйте выбрать другую дату.
//           </div>
//         )}

//         {!loading && !error && slots.length > 0 && (
//           <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
//             {slots.map((t) => (
//               <li key={t.startAt}>
//                 <button
//                   type="button"
//                   onClick={() => goClient(t)}
//                   className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
//                 >
//                   {formatHM(t.startMinutes)}–{formatHM(t.endMinutes)}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       <div className="mt-6 text-xs text-muted-foreground">
//         Доступно слотов: <span className="font-medium text-foreground">{slots.length}</span>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Обёртка
// ========================= */

// export default function CalendarPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-5xl rounded-lg border border-border bg-card p-4">
//           Инициализация календаря…
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }

//------работал до 01.11 но можно было взять запись в нерабочее время
// 'use client';

// import * as React from 'react';
// import { JSX, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// /* =========================
//    Типы
// ========================= */

// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiPayload = {
//   slots: Slot[];
//   splitRequired: boolean;
// };

// type Master = { id: string; name: string };

// /* =========================
//    Время/формат
// ========================= */

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// const todayISO = (tz: string = ORG_TZ): string => {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// };

// const toISODate = (d: Date): string => d.toISOString().slice(0, 10);

// const addDaysISO = (iso: string, days: number): string => {
//   const [y, m, d] = iso.split('-').map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return toISODate(dt);
// };

// const max9WeeksISO = (): string => addDaysISO(todayISO(), 9 * 7 - 1);

// const clampISO = (iso: string, minISO: string, maxISO: string): string => {
//   if (iso < minISO) return minISO;
//   if (iso > maxISO) return maxISO;
//   return iso;
// };

// const formatHM = (minutes: number): string => {
//   const hh = Math.floor(minutes / 60);
//   const mm = minutes % 60;
//   const pad = (n: number): string => String(n).padStart(2, '0');
//   return `${pad(hh)}:${pad(mm)}`;
// };

// /* =========================
//    Внутренний компонент
// ========================= */

// function CalendarInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterIdFromUrl = params.get('m') ?? '';
//   const urlDate = params.get('d') ?? undefined;

//   const minISO = todayISO();
//   const maxISO = max9WeeksISO();

//   const [dateISO, setDateISO] = React.useState<string>(() => {
//     const initial = urlDate ?? minISO;
//     return clampISO(initial, minISO, maxISO);
//   });

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [masterId, setMasterId] = React.useState<string>(masterIdFromUrl);

//   const [slots, setSlots] = React.useState<Slot[]>([]);
//   const [loading, setLoading] = React.useState<boolean>(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const hasDateParam = React.useMemo<boolean>(() => params.has('d'), [params]);

//   // Загрузка доступных мастеров для выбранных услуг
//   React.useEffect(() => {
//     let alive = true;
//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setMasters([]);
//         setMasterId('');
//         return;
//       }
//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!alive) return;
//         setMasters(data.masters ?? []);
//         // если мастер не выбран или не входит в список, выбираем первого
//         if (!masterId || !data.masters.find(m => m.id === masterId)) {
//           const first = data.masters[0]?.id ?? '';
//           setMasterId(first);
//           // синхронизируем URL
//           const q = new URLSearchParams();
//           serviceIds.forEach(s => q.append('s', s));
//           if (first) q.set('m', first);
//           q.set('d', dateISO);
//           router.replace(`/booking/calendar?${q.toString()}`);
//         }
//       } catch {
//         /* игнорируем, UI продолжит без мастеров */
//       }
//     }
//     void loadMasters();
//     return () => { alive = false; };
//   }, [serviceIds]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Загрузка слотов
//   React.useEffect(() => {
//     let alive = true;
//     async function load(): Promise<void> {
//       if (serviceIds.length === 0 || !masterId) {
//         setSlots([]);
//         return;
//       }
//       setLoading(true);
//       setError(null);
//       setSlots([]);
//       try {
//         const qs = new URLSearchParams();
//         qs.set('masterId', masterId);
//         qs.set('dateISO', dateISO);
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/availability?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data: ApiPayload = await res.json();
//         if (!alive) return;
//         setSlots(Array.isArray(data.slots) ? data.slots : []);
//       } catch (e: unknown) {
//         if (!alive) return;
//         const msg = e instanceof Error ? e.message : 'Не удалось загрузить слоты';
//         setError(msg);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     }
//     void load();
//     return () => { alive = false; };
//   }, [dateISO, masterId, serviceIds]);

//   // Сканирование ближайшей даты со слотами, если пользователь пришел без d=
//   const scanningRef = React.useRef(false);
//   const scanForwardForFirstDayWithSlots = React.useCallback(async (): Promise<void> => {
//     if (scanningRef.current) return;
//     if (!masterId || serviceIds.length === 0) return;

//     scanningRef.current = true;
//     try {
//       let d = dateISO;
//       while (d <= maxISO) {
//         const qs = new URLSearchParams();
//         qs.set('masterId', masterId);
//         qs.set('dateISO', d);
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/availability?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) break;
//         const { slots: s }: ApiPayload = await res.json();
//         if (Array.isArray(s) && s.length > 0) {
//           setDateISO(d);
//           setSlots(s);
//           const urlQS = new URLSearchParams();
//           serviceIds.forEach(id => urlQS.append('s', id));
//           if (masterId) urlQS.set('m', masterId);
//           urlQS.set('d', d);
//           router.replace(`/booking/calendar?${urlQS.toString()}`);
//           break;
//         }
//         d = addDaysISO(d, 1);
//       }
//     } finally {
//       scanningRef.current = false;
//     }
//   }, [dateISO, masterId, serviceIds, maxISO, router]);

//   React.useEffect(() => {
//     if (!hasDateParam && !loading && !error && slots.length === 0) {
//       void scanForwardForFirstDayWithSlots();
//     }
//   }, [hasDateParam, loading, error, slots.length, scanForwardForFirstDayWithSlots]);

//   // Навигация по датам
//   const canPrev = dateISO > minISO;
//   const canNext = dateISO < maxISO;

//   const goPrev = (): void => {
//     if (!canPrev) return;
//     const d = addDaysISO(dateISO, -1);
//     setDateISO(d);
//     syncUrl(d, masterId);
//   };

//   const goNext = (): void => {
//     if (!canNext) return;
//     const d = addDaysISO(dateISO, +1);
//     setDateISO(d);
//     syncUrl(d, masterId);
//   };

//   const onPickDate: React.ChangeEventHandler<HTMLInputElement> = e => {
//     const raw = e.target.value;
//     if (!raw) return;
//     const d = clampISO(raw, minISO, maxISO);
//     setDateISO(d);
//     syncUrl(d, masterId);
//   };

//   const onPickMaster: React.ChangeEventHandler<HTMLSelectElement> = e => {
//     const id = e.target.value;
//     setMasterId(id);
//     syncUrl(dateISO, id);
//   };

//   const syncUrl = (d: string, m: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (m) qs.set('m', m);
//     qs.set('d', d);
//     router.replace(`/booking/calendar?${qs.toString()}`);
//   };

//   // Переход к форме клиента
//   const goClient = (slot: Slot): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     if (masterId) qs.set('m', masterId);
//     qs.set('start', slot.startAt);
//     qs.set('end', slot.endAt);
//     qs.set('d', dateISO);
//     router.push(`/booking/client?${qs.toString()}`);
//   };

//   return (
//     <div className="mx-auto max-w-5xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Календарь</h2>

//       {/* Панель выбора мастера и даты */}
//       <div className="mt-6 flex flex-wrap items-center gap-3">
//         <label className="text-sm text-muted-foreground">Мастер:</label>
//         <select
//           className="rounded-md border bg-background px-3 py-1 text-sm"
//           value={masterId}
//           onChange={onPickMaster}
//         >
//           {masters.map(m => (
//             <option key={m.id} value={m.id}>{m.name}</option>
//           ))}
//         </select>

//         <span className="ml-3 text-sm text-muted-foreground">Дата:</span>
//         <div className="flex items-center gap-2">
//           <button
//             type="button"
//             onClick={goPrev}
//             disabled={!canPrev}
//             className={`rounded-md border px-3 py-1 text-sm ${canPrev ? 'hover:bg-muted' : 'opacity-50'}`}
//           >
//             ←
//           </button>

//           <input
//             type="date"
//             value={dateISO}
//             min={minISO}
//             max={maxISO}
//             onChange={onPickDate}
//             className="rounded-md border bg-background px-3 py-1 text-sm"
//           />

//           <button
//             type="button"
//             onClick={goNext}
//             disabled={!canNext}
//             className={`rounded-md border px-3 py-1 text-sm ${canNext ? 'hover:bg-muted' : 'opacity-50'}`}
//           >
//             →
//           </button>
//         </div>
//       </div>

//       {/* Слоты */}
//       <section className="mt-4">
//         {loading && (
//           <div className="rounded-lg border border-border bg-card p-4">
//             Загрузка свободных окон…
//           </div>
//         )}

//         {error && (
//           <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//             Ошибка: {error}
//           </div>
//         )}

//         {!loading && !error && slots.length === 0 && (
//           <div className="rounded-lg border border-border bg-card p-4">
//             На выбранную дату нет свободных окон. Попробуйте выбрать другую дату.
//           </div>
//         )}

//         {!loading && !error && slots.length > 0 && (
//           <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
//             {slots.map((t) => (
//               <li key={t.startAt}>
//                 <button
//                   type="button"
//                   onClick={() => goClient(t)}
//                   className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
//                 >
//                   {formatHM(t.startMinutes)}–{formatHM(t.endMinutes)}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       <div className="mt-6 text-xs text-muted-foreground">
//         Доступно слотов: <span className="font-medium text-foreground">{slots.length}</span>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Обёртка
// ========================= */

// export default function CalendarPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-5xl rounded-lg border border-border bg-card p-4">
//           Инициализация календаря…
//         </div>
//       }
//     >
//       <CalendarInner />
//     </Suspense>
//   );
// }
