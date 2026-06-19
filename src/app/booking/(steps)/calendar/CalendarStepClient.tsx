// src/app/booking/(steps)/calendar/page.tsx
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
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft,
  Sparkles,
  Crown,
  Zap,
  Star,
  TrendingUp,
} from "lucide-react";

// ✅ Импорты i18n
import { useI18n } from "@/i18n/I18nProvider";
import { useTranslations } from "@/i18n/useTranslations";
import type { MessageKey } from "@/i18n/messages";

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

type DayBusyData = {
  [dateISO: string]: number;
};

/* ===================== Константы ===================== */

const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

const todayISO = (tz: string = ORG_TZ): string => {
  const s = new Date().toLocaleString("sv-SE", { timeZone: tz, hour12: false });
  return s.split(" ")[0];
};

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
    const handler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const getDaysInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  const startingDayOfWeek = firstDay.getDay();
  const offset = (startingDayOfWeek + 6) % 7;

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

/* ===================== PREMIUM Floating Particles ===================== */

function FloatingParticles() {
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; id: number; color: string }>
  >([]);

  useEffect(() => {
    const colors = [
      "bg-amber-400/30",
      "bg-fuchsia-400/25",
      "bg-sky-400/25",
      "bg-emerald-400/25",
      "bg-purple-400/25",
    ];

    const newParticles = [...Array(30)].map((_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute h-1 w-1 rounded-full ${particle.color}`}
          initial={{ x: particle.x, y: particle.y, opacity: 0 }}
          animate={{
            x: [particle.x, Math.random() * window.innerWidth, particle.x],
            y: [particle.y, Math.random() * window.innerHeight, particle.y],
            scale: [1, 2, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ===================== PREMIUM Page Shell ===================== */

function PageShell({ 
  children, 
  bookingSteps 
}: { 
  children: React.ReactNode;
  bookingSteps: Array<{ id: string; label: string; icon: string }>;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

      <BookingAnimatedBackground />
      <FloatingParticles />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen">
        <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
            <PremiumProgressBar currentStep={2} steps={bookingSteps} />
          </div>
        </header>

        <div className="h-[84px] md:h-[96px]" />

        {children}
      </div>
    </div>
  );
}

/* ===================== Calendar Inner ===================== */

function CalendarInner() {
  const router = useRouter();
  const params = useSearchParams();

  const { locale } = useI18n();
  const t: (key: MessageKey) => string = useTranslations();
  const bookingErrorLoadingText = t("booking_error_loading");

  const bookingSteps = React.useMemo(
    () => [
      { id: "services", label: t("booking_step_services"), icon: "✨" },
      { id: "master", label: t("booking_step_master"), icon: "👤" },
      { id: "calendar", label: t("booking_step_date"), icon: "📅" },
      { id: "client", label: t("booking_step_client"), icon: "📝" },
      { id: "verify", label: t("booking_step_verify"), icon: "✓" },
      { id: "payment", label: t("booking_step_payment"), icon: "💳" },
    ],
    [t]
  );

  const monthNames = React.useMemo(
    () => [
      t("month_january"),
      t("month_february"),
      t("month_march"),
      t("month_april"),
      t("month_may"),
      t("month_june"),
      t("month_july"),
      t("month_august"),
      t("month_september"),
      t("month_october"),
      t("month_november"),
      t("month_december"),
    ],
    [t]
  );

  const dayNames = React.useMemo(
    () => [
      t("weekday_mon"),
      t("weekday_tue"),
      t("weekday_wed"),
      t("weekday_thu"),
      t("weekday_fri"),
      t("weekday_sat"),
      t("weekday_sun"),
    ],
    [t]
  );

  const weekdaysFull = React.useMemo(
    () => [
      t("weekday_full_sunday"),
      t("weekday_full_monday"),
      t("weekday_full_tuesday"),
      t("weekday_full_wednesday"),
      t("weekday_full_thursday"),
      t("weekday_full_friday"),
      t("weekday_full_saturday"),
    ],
    [t]
  );

  const getPluralForm = useCallback(
    (count: number): string => {
      if (locale !== "ru") {
        return count === 1
          ? t("booking_calendar_slot_singular")
          : t("booking_calendar_slot_many");
      }

      const mod10 = count % 10;
      const mod100 = count % 100;

      if (mod10 === 1 && mod100 !== 11) {
        return t("booking_calendar_slot_singular");
      }
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return t("booking_calendar_slot_few");
      }
      return t("booking_calendar_slot_many");
    },
    [locale, t]
  );

  const serviceIdsString = params.getAll("s").filter(Boolean).join(",");
  const serviceIds = React.useMemo<string[]>(
    () => serviceIdsString.split(",").filter(Boolean),
    [serviceIdsString]
  );
  const serviceIdsKey = React.useMemo(
    () => [...serviceIds].sort().join(","),
    [serviceIds]
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const masterIdKey = React.useMemo(() => masterId || "none", [masterId]);

  const [state, setState] = useState<LoadState>({
    loading: false,
    error: null,
    slots: [],
  });

  const [monthBusyData, setMonthBusyData] = useState<DayBusyData>({});
  const [loadingMonthData, setLoadingMonthData] = useState(false);

  const timeSectionRef = useRef<HTMLElement>(null);

  const debouncedDate = useDebounce(dateISO, 300);
  const debouncedMasterId = useDebounce(masterId, 300);

  const autoJumpDoneRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  // Загрузка мастеров
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
  }, [serviceIdsKey, router, dateISO, masterIdKey]);

  // Загрузка данных занятости для всего месяца
  useEffect(() => {
    let alive = true;

    async function loadMonthBusyData() {
      if (!masterId || serviceIds.length === 0) {
        setMonthBusyData({});
        return;
      }

      setLoadingMonthData(true);

      try {
        const month = `${viewMonth.year}-${String(viewMonth.month).padStart(
          2,
          "0"
        )}`;
        const qs = new URLSearchParams();
        qs.set("masterId", masterId);
        qs.set("month", month);
        qs.set("serviceIds", serviceIdsKey);

        const res = await fetch(`/api/availability/month?${qs.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { days?: DayBusyData };

        if (!alive) return;

        setMonthBusyData(data.days ?? {});
      } catch (err) {
        console.error("Failed to load month busy data:", err);
      } finally {
        if (alive) {
          setLoadingMonthData(false);
        }
      }
    }

    void loadMonthBusyData();

    return () => {
      alive = false;
    };
  }, [viewMonth, masterIdKey, serviceIdsKey]);

  const getBusyRatio = useCallback(
    (dayISO: string): number => {
      const count = monthBusyData[dayISO];
      if (count === undefined) return 0;

      const counts = Object.values(monthBusyData);
      if (counts.length === 0) return 0;

      const maxSlots = Math.max(...counts, 1);

      return 1 - count / maxSlots;
    },
    [monthBusyData]
  );

  // Загрузка слотов для выбранной даты
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
      } catch (err) {
        if (!alive) return;
        if (err instanceof Error && err.name === "AbortError") return;

        const msg =
          err instanceof Error ? err.message : bookingErrorLoadingText;
        setState({ loading: false, error: msg, slots: [] });
      }
    }

    void load();

    return () => {
      alive = false;
      abortController.abort();
    };
  }, [
    debouncedDate,
    debouncedMasterId,
    serviceIdsKey,
    filterTodayCutoff,
    bookingErrorLoadingText,
  ]);

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

  useEffect(() => {
    if (autoJumpDoneRef.current) return;
    if (!masterId || serviceIds.length === 0) return;
    if (urlDate) return;

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
  }, [
    masterIdKey,
    urlDate,
    findNearestAvailableDate,
    dateISO,
    router,
    serviceIdsKey,
  ]);

  useEffect(() => {
    if (autoJumpDoneRef.current) return;
    if (!masterId || serviceIds.length === 0) return;
    if (state.loading || state.error) return;

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
    masterIdKey,
    router,
    serviceIdsKey,
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

  const isDisabledDay = (date: Date): boolean => {
    const iso = toISODate(date);
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const isOutOfRange = iso < minISO || iso > maxISO;
    return isWeekend || isOutOfRange;
  };

  const handleDateSelect = (date: Date) => {
    if (isDisabledDay(date)) return;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    const newISO = toISODate(date);
    const safe = clampISO(newISO, minISO, maxISO);
    setDateISO(safe);
    syncUrl(safe, masterId);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 1200);
    }
  };

  const syncUrl = (d: string, m: string) => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    if (m) qs.set("m", m);
    qs.set("d", d);
    router.replace(`/booking/calendar?${qs.toString()}`);
  };

  // ✅ Резервирование слота перед переходом
  const reserveSlot = useCallback(async (slot: Slot): Promise<boolean> => {
    try {
      // Генерируем или получаем sessionId из localStorage
      let sessionId = '';
      if (typeof window !== 'undefined') {
        sessionId = localStorage.getItem('booking_session_id') || '';
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          localStorage.setItem('booking_session_id', sessionId);
        }
      }

      const res = await fetch('/api/booking/reserve-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterId,
          startAt: slot.startAt,
          endAt: slot.endAt,
          sessionId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 409) {
          // Слот уже зарезервирован другим клиентом
          alert(t('booking_calendar_slot_taken') || 'Этот слот только что забронировал другой клиент. Пожалуйста, выберите другое время.');
          // Обновить список слотов
          requestCache.clear();
          setState(prev => ({ ...prev, slots: [] }));
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
          return false;
        }
        throw new Error(data.error || 'Failed to reserve slot');
      }

      return true;
    } catch (error) {
      console.error('[Reserve Slot] Error:', error);
      alert(t('booking_calendar_reserve_error') || 'Ошибка резервирования. Попробуйте еще раз.');
      return false;
    }
  }, [masterId, t]);

  const goClient = useCallback(async (slot: Slot) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }

    // ✅ РЕЗЕРВИРУЕМ СЛОТ
    const reserved = await reserveSlot(slot);
    if (!reserved) return;

    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    if (masterId) qs.set("m", masterId);
    qs.set("start", slot.startAt);
    qs.set("end", slot.endAt);
    qs.set("d", dateISO);
    router.push(`/booking/client?${qs.toString()}`);
  }, [reserveSlot, serviceIds, masterId, dateISO, router]);

  const goBackToMaster = () => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    router.push(`/booking/master?${qs.toString()}`);
  };

  const days = getDaysInMonth(viewMonth.year, viewMonth.month);

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
      (s) => (s.startMinutes - base) % durationMin === 0
    );
  }, [state.slots, durationMin]);

  /* ===================== RENDER ===================== */

  return (
    <PageShell bookingSteps={bookingSteps}>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
        {/* Hero / Heading */}
        <div className="flex w-full flex-col items-center text-center pt-8 md:pt-12">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative mb-8 md:mb-10"
          >
            <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 opacity-60 blur-2xl" />
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-10 py-4 shadow-[0_15px_50px_rgba(251,191,36,0.6)] ring-1 ring-amber-200/50"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <CalendarIcon className="h-6 w-6 text-black md:h-7 md:w-7 drop-shadow-lg" />
              </motion.div>
              <span className="font-serif text-lg font-bold italic text-black md:text-xl drop-shadow-sm">
                {t("booking_calendar_step_badge")}
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-black md:h-7 md:w-7 drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring" }}
            className="relative mb-5 font-serif text-3xl italic leading-tight md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl"
          >
            <span
              className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent blur-2xl opacity-60"
              aria-hidden="true"
            >
              {t("booking_calendar_hero_title")}
            </span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent blur-xl opacity-75"
              aria-hidden="true"
            >
              {t("booking_calendar_hero_title")}
            </span>
            <span
              className="absolute inset-0 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent blur-md opacity-85"
              aria-hidden="true"
            >
              {t("booking_calendar_hero_title")}
            </span>

            <span className="relative bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
              {t("booking_calendar_hero_title")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="brand-script brand-subtitle mx-auto max-w-2xl text-xl md:text-2xl"
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic"
            }}
          >
            {t("booking_calendar_hero_subtitle")}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-4 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent md:mt-5 md:w-40"
          />
        </div>

        {/* Блок выбора мастера */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="relative z-40 mx-auto mt-6 mb-6 max-w-3xl overflow-visible rounded-[32px] bg-gradient-to-br from-amber-400/80 via-yellow-300/20 to-amber-500/60 p-[1.5px] shadow-[0_0_45px_rgba(251,191,36,0.5)] md:mt-8 md:mb-8"
        >
          <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.25),transparent_65%)] blur-3xl" />

          <div className="relative overflow-visible rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-7 ring-1 ring-amber-300/20 backdrop-blur-xl md:p-8">
            <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-yellow-400/18 blur-3xl" />

            <label className="relative flex flex-col gap-5 overflow-visible sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                >
                  <Crown className="h-6 w-6 text-black drop-shadow-sm" />
                </motion.div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-serif text-xs uppercase tracking-wider text-amber-300/80 md:text-sm">
                    {t("booking_calendar_master_select_label")}
                  </span>
                  <span className="font-serif text-xl font-bold italic text-amber-200 md:text-2xl">
                    {t("booking_calendar_master_label")}
                  </span>
                </div>
              </div>

              {/* Кнопка + dropdown */}
              <div className="relative flex-1 overflow-visible">
                <div className="rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                  <motion.button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsDropdownOpen((open) => !open)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={masters.length === 0}
                    className="w-full rounded-full bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 px-8 py-5 pr-14 text-left font-serif text-lg font-medium italic text-amber-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-300 hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_0_30px_rgba(168,85,247,0.25)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:px-10 md:py-6 md:text-xl"
                    style={{
                      textShadow: "0 0 12px rgba(251,191,36,0.4)",
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      {masters.find((m) => m.id === masterId)?.name ||
                        t("booking_calendar_master_loading")}
                    </span>
                  </motion.button>
                </div>

                <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 md:right-6">
                  <motion.div
                    animate={{
                      y: [0, 3, 0],
                      rotate: isDropdownOpen ? 180 : 0,
                    }}
                    transition={{
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 0.3 },
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                  >
                    <ChevronRight className="h-4 w-4 rotate-90 text-black" />
                  </motion.div>
                </div>

                {/* dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && masters.length > 0 && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 right-0 z-[60] mt-3 max-h-80 space-y-2 overflow-y-auto rounded-3xl border border-amber-300/20 bg-slate-900/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(251,191,36,0.2)] backdrop-blur-xl"
                    >
                      {masters.map((master, index) => (
                        <motion.button
                          key={master.id}
                          type="button"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.03, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setMasterId(master.id);
                            syncUrl(dateISO, master.id);
                            requestCache.clear();
                            setIsDropdownOpen(false);
                          }}
                          className={`group relative w-full overflow-hidden rounded-full border-2 px-6 py-4 text-left font-serif text-base font-medium italic transition-all duration-300 md:px-8 md:py-5 md:text-lg ${
                            master.id === masterId
                              ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                              : "border-amber-300/20 bg-slate-800/50 text-amber-200/80 hover:border-amber-300/50 hover:bg-slate-800/80 hover:text-amber-100"
                          }`}
                          style={{
                            textShadow:
                              master.id === masterId
                                ? "0 0 15px rgba(251,191,36,0.5)"
                                : "none",
                          }}
                        >
                          {master.id === masterId && (
                            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-300/10 to-amber-400/20 blur-sm" />
                          )}

                          <span className="relative flex items-center gap-3">
                            <motion.div
                              animate={
                                master.id === masterId
                                  ? {
                                      rotate: [0, 360],
                                      scale: [1, 1.2, 1],
                                    }
                                  : undefined
                              }
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sparkles
                                className={`h-4 w-4 ${
                                  master.id === masterId
                                    ? "text-amber-400"
                                    : "text-amber-500/60"
                                }`}
                              />
                            </motion.div>
                            <span className="flex-1">{master.name}</span>
                            {master.id === masterId && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                }}
                              >
                                <Crown className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                              </motion.div>
                            )}
                          </span>

                          <span className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent transition-all duration-300 group-hover:via-amber-400/60" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </label>

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 blur-2xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="pointer-events-none absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 blur-2xl"
            />

            <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          </div>
        </motion.div>

        {/* Сетка: календарь + время */}
        <div className="mt-16 grid items-stretch gap-8 md:mt-20 md:gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Календарь с визуализацией занятости */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.5)]"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x;
              const swipeVelocity = velocity.x;
              
              if (swipe < -50 || swipeVelocity < -500) {
                handleNextMonth();
              } else if (swipe > 50 || swipeVelocity > 500) {
                handlePreviousMonth();
              }
            }}
          >
            <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.25),transparent_65%)] blur-3xl" />

            <div className="relative rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 px-5 py-5 ring-1 ring-white/10 backdrop-blur-xl shadow-inner md:px-7 md:py-6">
              <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-purple-400/20 blur-3xl" />
              <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-fuchsia-400/18 blur-3xl" />

              <div className="mb-5 flex items-center justify-between md:mb-6">
                <div className="flex flex-col gap-1.5">
                  <h2 className="bg-gradient-to-r from-purple-200 via-fuchsia-100 to-pink-200 bg-clip-text font-serif text-xl font-bold italic text-transparent md:text-2xl lg:text-3xl drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                    {monthNames[viewMonth.month - 1]} {viewMonth.year}
                  </h2>
                  <p className="flex items-center gap-1.5 font-serif text-xs italic text-purple-200/80 md:text-sm">
                    <Sparkles className="h-3 w-3 text-purple-300" />
                    {t("booking_calendar_select_day_hint")}
                  </p>
                  
                  {!loadingMonthData && dateISO === todayISO() && !state.loading && displaySlots.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-1 inline-flex items-center gap-2 self-start rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-amber-500/20 px-3 py-1.5 backdrop-blur-sm"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-300" />
                      </motion.div>
                      <span className="font-serif text-xs font-semibold italic text-amber-100">
                        {t("booking_calendar_today_slots")}{" "}{displaySlots.length}{" "}{getPluralForm(displaySlots.length)}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handlePreviousMonth}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/50 bg-purple-500/10 text-purple-200 backdrop-blur-sm transition-all hover:bg-purple-500/20 hover:border-purple-300/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleNextMonth}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/50 bg-purple-500/10 text-purple-200 backdrop-blur-sm transition-all hover:bg-purple-500/20 hover:border-purple-300/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-7 gap-2 md:mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold uppercase tracking-wider text-purple-200/90 md:text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-2.5">
                {loadingMonthData ? (
                  [...Array(35)].map((_, index) => (
                    <motion.div
                      key={`skeleton-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className="relative aspect-square overflow-hidden rounded-2xl border-2 border-purple-300/20 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60"
                    >
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-slate-700/50" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  days.map((day, index) => {
                    if (!day)
                      return <div key={`empty-${index}`} className="aspect-square" />;

                    const disabled = isDisabledDay(day);
                    const isTodayDay = isToday(day);
                    const isSelected = isSameDay(day, dateISO);
                    const dayISO = toISODate(day);
                    const busyRatio = getBusyRatio(dayISO);
                    const slotsCount = monthBusyData[dayISO] || 0;

                    const baseClasses =
                      "relative aspect-square flex items-center justify-center rounded-2xl border text-sm md:text-base font-bold transition-all duration-300 overflow-hidden";

                    let variant = "";
                    if (disabled) {
                      variant =
                        "cursor-not-allowed border-slate-700/70 bg-slate-900/50 text-slate-600/70";
                    } else if (isSelected) {
                      variant =
                        "border-fuchsia-300 bg-gradient-to-br from-fuchsia-400 via-purple-500 to-pink-500 text-white shadow-[0_0_40px_rgba(236,72,153,0.95)] scale-[1.08]";
                    } else if (isTodayDay) {
                      variant =
                        "border-emerald-300/80 bg-emerald-500/25 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.7)] ring-1 ring-emerald-300/50";
                    } else {
                      variant =
                        "border-purple-300/30 bg-slate-900/60 text-purple-100 hover:border-purple-300/70 hover:bg-slate-800/80 hover:scale-105";
                    }

                    return (
                      <motion.button
                        key={dayISO}
                        type="button"
                        initial={{ opacity: 0, scale: 0.85, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.008 }}
                        whileHover={!disabled ? { scale: 1.1 } : undefined}
                        onClick={() => !disabled && handleDateSelect(day)}
                        disabled={disabled}
                        className={`${baseClasses} ${variant} group`}
                        title={
                          !disabled && slotsCount > 0
                            ? `${slotsCount} ${t("booking_calendar_slots_tooltip")}`
                            : disabled
                            ? t("booking_calendar_weekend")
                            : t("booking_calendar_no_slots")
                        }
                      >
                        {!disabled && busyRatio > 0 && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${busyRatio * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.01 }}
                            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-400/40 via-amber-500/30 to-amber-600/20 blur-[1px]"
                          />
                        )}

                        {!disabled && slotsCount > 0 && (
                          <span className="pointer-events-none absolute -top-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-emerald-400/40 bg-slate-900/95 px-3 py-1.5 text-xs font-medium text-emerald-100 opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-opacity group-hover:opacity-100">
                            <Sparkles className="inline h-3 w-3 text-emerald-300 mr-1" />
                            {slotsCount} {t("booking_calendar_slots_tooltip")}
                            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-emerald-400/40 bg-slate-900/95" />
                          </span>
                        )}

                        {isSelected && (
                          <span className="pointer-events-none absolute -inset-2 rounded-2xl bg-fuchsia-400/60 blur-xl" />
                        )}

                        {disabled && (
                          <span className="pointer-events-none absolute inset-x-2 top-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-slate-500/60 to-transparent" />
                        )}

                        <span className="relative z-10">{day.getDate()}</span>
                      </motion.button>
                    );
                  })
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative mt-6 rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-yellow-500/10 p-4 backdrop-blur-sm md:mt-7 md:p-5"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl" />
                <div className="relative flex items-center gap-3 text-sm text-amber-100 md:text-base">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
                  >
                    <TrendingUp className="h-5 w-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <span className="font-serif text-xs italic text-amber-200/70 md:text-sm">
                      {t("booking_calendar_legend_title")}
                    </span>
                    <p className="font-serif text-base font-semibold italic text-white md:text-lg">
                      {loadingMonthData
                        ? t("booking_calendar_legend_loading")
                        : t("booking_calendar_legend_subtitle")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {!loadingMonthData && !state.loading && displaySlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="relative mt-4 rounded-2xl border border-sky-300/30 bg-gradient-to-br from-sky-500/10 via-cyan-400/5 to-sky-500/10 p-4 backdrop-blur-sm md:p-5"
                >
                  <div className="pointer-events-none absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-sky-400/20 blur-2xl" />
                  <div className="relative flex items-start gap-3 text-sm text-sky-100 md:text-base">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 shadow-[0_0_20px_rgba(56,189,248,0.6)]">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-serif text-xs italic text-sky-200/70 md:text-sm">
                        {t("booking_calendar_smart_tip_label")}
                      </span>
                      <p className="mt-1 font-serif text-base font-semibold italic text-white md:text-lg">
                        {(() => {
                          const selectedDate = new Date(dateISO + 'T00:00:00');
                          const dayName = weekdaysFull[selectedDate.getDay()];
                          
                          const morningSlots = displaySlots.filter(s => {
                            const hour = Math.floor(s.startMinutes / 60);
                            return hour >= 9 && hour < 12;
                          }).length;
                          
                          const eveningSlots = displaySlots.filter(s => {
                            const hour = Math.floor(s.startMinutes / 60);
                            return hour >= 17 && hour < 19;
                          }).length;
                          
                          const onDay = locale === "ru" ? "На" : locale === "de" ? "Am" : "On";
                          
                          if (morningSlots > eveningSlots && morningSlots > 0) {
                            return `${onDay} ${dayName} ${t("booking_calendar_smart_tip_morning")}`;
                          } else if (eveningSlots > morningSlots && eveningSlots > 0) {
                            return `${onDay} ${dayName} ${t("booking_calendar_smart_tip_evening")}`;
                          } else if (displaySlots.length > 5) {
                            return `${t("booking_calendar_smart_tip_many")} ${onDay} ${dayName}`;
                          } else {
                            return `${t("booking_calendar_smart_tip_few")} ${onDay} ${dayName}`;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="relative mt-4 rounded-2xl border border-purple-300/40 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 p-4 backdrop-blur-sm md:p-5"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-purple-400/30 blur-2xl" />
                <div className="relative flex items-center gap-3 text-sm text-purple-100 md:text-base">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-serif text-xs italic text-purple-200/70 md:text-sm">
                      {t("booking_calendar_selected_date_label")}
                    </span>
                    <p className="font-serif text-base font-semibold italic text-white md:text-lg">
                      {new Date(dateISO + "T00:00:00").toLocaleDateString(
                        locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Время */}
          <motion.section
            ref={timeSectionRef}
            key={`time-${dateISO}`}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
              }
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-teal-300/20 to-sky-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.5)]"
          >
            <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.25),transparent_65%)] blur-3xl" />

            <div className="relative flex h-full flex-col rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 px-5 py-5 ring-1 ring-white/10 backdrop-blur-xl shadow-inner md:px-7 md:py-6">
              <div className="pointer-events-none absolute -top-16 right-10 h-40 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="pointer-events-none absolute left-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

              <div className="mb-5 flex flex-col gap-2 md:mb-6">
                <h2 className="bg-gradient-to-r from-emerald-200 via-teal-100 to-sky-200 bg-clip-text font-serif text-xl font-bold italic text-transparent md:text-2xl lg:text-3xl drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                  {t("booking_calendar_time_title")}
                </h2>
                {durationMin > 0 && (
                  <p className="flex items-center gap-1.5 font-serif text-xs italic text-emerald-200/80 md:text-sm">
                    <Zap className="h-3 w-3 text-emerald-300" />
                    {t("booking_calendar_duration_label")}{" "}
                    <span className="font-bold text-emerald-100">
                      {durationMin} {t("booking_calendar_minutes_label")}
                    </span>
                  </p>
                )}
                
                {!state.loading && !state.error && displaySlots.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => goClient(displaySlots[0])}
                    className="group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-amber-500/20 px-5 py-2.5 font-serif text-sm font-bold italic text-amber-100 backdrop-blur-sm transition-all hover:border-amber-400/80 hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] md:text-base"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    
                    <motion.span
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/30 to-yellow-400/30 blur-xl"
                    />
                    
                    <Zap className="relative h-4 w-4 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    <span className="relative drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                      {t("booking_calendar_nearest_slot")}{" "}{formatHM(displaySlots[0].startMinutes)}
                    </span>
                  </motion.button>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                {state.loading && (
                  <div className="flex-1 grid auto-rows-min content-start grid-cols-3 gap-3 p-1 pr-3 md:gap-3.5 md:p-1.5 md:pr-3.5">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative overflow-hidden rounded-2xl border-2 border-emerald-300/20 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 px-3 py-3.5 md:px-4 md:py-4"
                      >
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        
                        <div className="relative z-10 flex flex-col gap-2">
                          <div className="mx-auto h-4 w-24 rounded-full bg-slate-700/50 md:h-5 md:w-28" />
                          <div className="mx-auto h-3 w-16 rounded-full bg-slate-700/30" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {state.error && (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-base text-red-200 backdrop-blur-sm md:p-6 md:text-lg">
                      {t("booking_calendar_error_prefix")} {state.error}
                    </div>
                  </div>
                )}

                {!state.loading &&
                  !state.error &&
                  displaySlots.length === 0 && (
                    <div className="flex flex-1 items-center justify-center py-10 md:py-12">
                      <div className="text-center">
                        <div className="mb-4 text-5xl md:text-6xl">😔</div>
                        <p className="text-sm text-slate-300 md:text-base">
                          {t("booking_calendar_no_slots_message")}
                          <br />
                          {t("booking_calendar_try_another_day")}
                        </p>
                      </div>
                    </div>
                  )}

                {!state.loading && !state.error && displaySlots.length > 0 && (
                  <div className="flex-1 grid auto-rows-min content-start grid-cols-3 gap-3 overflow-y-auto p-1 pr-3 md:gap-3.5 md:p-1.5 md:pr-3.5">
                    <AnimatePresence>
                      {displaySlots.map((slot, index) => {
                        const slotStartTime = new Date(slot.startAt).getTime();
                        const now = Date.now();
                        const twoHoursFromNow = now + 2 * 60 * 60 * 1000;
                        const isHotSlot = dateISO === todayISO() && slotStartTime <= twoHoursFromNow && slotStartTime > now;
                        
                        const startHour = Math.floor(slot.startMinutes / 60);
                        const isVipSlot = (startHour >= 9 && startHour < 11) || (startHour >= 17 && startHour < 19);
                        
                        return (
                          <motion.button
                            key={slot.startAt}
                            type="button"
                            initial={{ opacity: 0, scale: 0.85, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 8 }}
                            transition={{ delay: index * 0.015 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => goClient(slot)}
                            className={`group relative overflow-hidden rounded-2xl px-3 py-3.5 text-center transition-all duration-300 md:px-4 md:py-4 ${
                              isVipSlot
                                ? "border-2 border-amber-400/80 bg-gradient-to-br from-amber-900/50 via-yellow-800/40 to-amber-900/50 shadow-[0_8px_25px_rgba(251,191,36,0.5)] hover:border-amber-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.7)]"
                                : isHotSlot
                                ? "border-2 border-amber-400/70 bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40 shadow-[0_8px_25px_rgba(251,191,36,0.4)] hover:border-amber-400/90 hover:shadow-[0_0_35px_rgba(251,191,36,0.6)]"
                                : "border-2 border-emerald-300/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_8px_25px_rgba(15,23,42,0.95)] hover:border-emerald-400/70 hover:shadow-[0_0_35px_rgba(16,185,129,0.7)]"
                            }`}
                          >
                            {isVipSlot && (
                              <motion.span
                                animate={{
                                  opacity: [0.4, 0.7, 0.4],
                                  scale: [1, 1.08, 1],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="pointer-events-none absolute -inset-8 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.5),transparent_70%)]"
                              />
                            )}

                            {!isVipSlot && isHotSlot && (
                              <motion.span
                                animate={{
                                  opacity: [0.3, 0.6, 0.3],
                                  scale: [1, 1.05, 1],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="pointer-events-none absolute -inset-8 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)]"
                              />
                            )}

                            <span className={`pointer-events-none absolute -inset-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                              isVipSlot || isHotSlot
                                ? "bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.3),transparent_70%)]"
                                : "bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.25),transparent_70%)]"
                            }`} />

                            {isVipSlot && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1 right-1 z-10 flex items-center gap-0.5 rounded-full border border-amber-400/80 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-1.5 py-0.5 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
                              >
                                <Crown className="h-2.5 w-2.5 text-black drop-shadow-sm" />
                                <span className="text-[8px] font-bold uppercase tracking-wide text-black">{t("booking_calendar_vip_badge")}</span>
                              </motion.div>
                            )}
                            
                            {!isVipSlot && isHotSlot && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1 right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/60 bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_10px_rgba(251,191,36,0.7)]"
                              >
                                <Zap className="h-2.5 w-2.5 text-white drop-shadow-sm" />
                              </motion.div>
                            )}

                            <div className="relative z-10 flex flex-col gap-1.5">
                              <span className={`flex items-center justify-center gap-1 text-xs font-bold whitespace-nowrap md:text-base ${
                                isVipSlot ? "text-amber-50 group-hover:text-white" : isHotSlot ? "text-amber-100 group-hover:text-amber-50" : "text-white group-hover:text-emerald-50"
                              }`}>
                                <span className="whitespace-nowrap">{formatHM(slot.startMinutes)}&nbsp;–&nbsp;{formatHM(slot.endMinutes)}</span>
                              </span>
                              <span className={`flex items-center justify-center gap-1 text-[10px] font-medium whitespace-nowrap md:text-xs ${
                                isVipSlot ? "text-amber-200/90 group-hover:text-amber-100" : isHotSlot ? "text-amber-300/90 group-hover:text-amber-200" : "text-slate-400 group-hover:text-emerald-200"
                              }`}>
                                <Clock className="h-3 w-3 opacity-70 flex-shrink-0 md:h-3.5 md:w-3.5" />
                                {durationMin} {t("booking_calendar_minutes_label")}
                              </span>
                            </div>

                            <span className={`pointer-events-none absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity ${
                              isVipSlot || isHotSlot
                                ? "via-amber-400/0 group-hover:via-amber-400/80 group-hover:opacity-100"
                                : "via-emerald-400/0 group-hover:via-emerald-400/80 group-hover:opacity-100"
                            }`} />
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-5 flex items-center justify-between rounded-xl border border-emerald-300/20 bg-emerald-500/5 px-4 py-3 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-emerald-300" />
                  <span className="text-xs font-medium text-emerald-200 md:text-sm">
                    {t("booking_calendar_available_slots")}
                  </span>
                </div>
                <span className="text-base font-bold text-emerald-100 md:text-lg">
                  {displaySlots.length}
                </span>
              </motion.div>
            </div>
          </motion.section>
        </div>

        {/* Кнопка назад */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 mb-10 text-center md:mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={goBackToMaster}
            className="inline-flex items-center gap-3 rounded-full border border-purple-300/30 bg-purple-500/10 px-6 py-3 font-medium text-purple-200 backdrop-blur-sm transition-all hover:border-purple-400/60 hover:bg-purple-500/20 hover:text-purple-100"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("booking_calendar_back_to_master")}
          </motion.button>
        </motion.div>
      </main>
    </PageShell>
  );
}

/* ===================== Export ===================== */

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
          <div className="h-24 w-24 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.6)]" />
        </div>
      }
    >
      <CalendarInner />
    </Suspense>
  );
}
