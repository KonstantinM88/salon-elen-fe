"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Loader2,
  Sparkles,
  Star,
  UserRound,
  Zap,
} from "lucide-react";

import PremiumProgressBar from "@/components/PremiumProgressBar";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/messages";
import { useTranslations } from "@/i18n/useTranslations";

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

type DayBusyData = Record<string, number>;

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
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const getDaysInMonth = (year: number, month: number): Array<Date | null> => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const offset = (firstDay.getDay() + 6) % 7;
  const days: Array<Date | null> = [];

  for (let i = 0; i < offset; i += 1) days.push(null);
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month - 1, day));
  }

  return days;
};

const isSameDay = (date: Date, dateISO: string): boolean => {
  const [y, m, d] = dateISO.split("-").map(Number);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
};

const isTodayDate = (date: Date): boolean => toISODate(date) === todayISO();

const monthStart = ({ year, month }: { year: number; month: number }): string =>
  `${year}-${String(month).padStart(2, "0")}-01`;

class RequestCache {
  private cache = new Map<string, { data: ApiPayload; timestamp: number }>();
  private readonly TTL = 3000;

  get(key: string): ApiPayload | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.TTL) {
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
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function LightBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fffafa_0%,#f8eeee_44%,#ead8db_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.78),rgba(255,255,255,0.24)_48%,rgba(126,76,91,0.08))]" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0))]" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(0deg,rgba(126,76,91,0.14),rgba(255,255,255,0))]" />
      <div className="absolute left-[-8rem] top-32 h-80 w-80 rounded-full bg-rose-200/45 blur-3xl" />
      <div className="absolute right-[-7rem] top-72 h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />
    </div>
  );
}

function PageShell({
  children,
  bookingSteps,
}: {
  children: React.ReactNode;
  bookingSteps: Array<{ id: string; label: string; icon: string }>;
}): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
      <div className="fixed inset-x-0 top-0 z-50">
        <PremiumProgressBar currentStep={2} steps={bookingSteps} variant="light" />
      </div>
      <LightBackground />
      <div className="booking-content relative z-10 px-4 pb-18 pt-30 md:px-6 md:pb-22 md:pt-38">
        {children}
      </div>
    </div>
  );
}

function LoadingScreen(): React.JSX.Element {
  const t: (key: MessageKey) => string = useTranslations();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
      <LightBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-rose-200/80 bg-white/82 shadow-[0_24px_70px_rgba(126,76,91,0.16)]">
            <Loader2 className="h-10 w-10 animate-spin text-[#9b5368]" />
          </div>
          <p className="mt-6 text-base font-medium text-[#7d4e5b]/78">
            {t("booking_loading_text")}
          </p>
        </div>
      </div>
    </div>
  );
}

function CalendarInnerLight(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useI18n();
  const t: (key: MessageKey) => string = useTranslations();
  const bookingErrorLoadingText = t("booking_error_loading");
  const timeSectionRef = useRef<HTMLElement>(null);

  const bookingSteps = useMemo(
    () => [
      { id: "services", label: t("booking_step_services"), icon: "1" },
      { id: "master", label: t("booking_step_master"), icon: "2" },
      { id: "calendar", label: t("booking_step_date"), icon: "3" },
      { id: "client", label: t("booking_step_client"), icon: "4" },
      { id: "verify", label: t("booking_step_verify"), icon: "5" },
      { id: "payment", label: t("booking_step_payment"), icon: "6" },
    ],
    [t],
  );

  const monthNames = useMemo(
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
    [t],
  );

  const dayNames = useMemo(
    () => [
      t("weekday_mon"),
      t("weekday_tue"),
      t("weekday_wed"),
      t("weekday_thu"),
      t("weekday_fri"),
      t("weekday_sat"),
      t("weekday_sun"),
    ],
    [t],
  );

  const serviceIdsString = params.getAll("s").filter(Boolean).join(",");
  const serviceIds = useMemo(
    () => serviceIdsString.split(",").filter(Boolean),
    [serviceIdsString],
  );
  const serviceIdsKey = useMemo(() => [...serviceIds].sort().join(","), [serviceIds]);

  const masterIdFromUrl = params.get("m") ?? "";
  const urlDate = params.get("d") ?? undefined;
  const minISO = todayISO();
  const maxISO = max9WeeksISO();

  const [dateISO, setDateISO] = useState(() =>
    clampISO(urlDate ?? minISO, minISO, maxISO),
  );
  const [viewMonth, setViewMonth] = useState(() => {
    const [y, m] = dateISO.split("-").map(Number);
    return { year: y, month: m };
  });
  const [masters, setMasters] = useState<Master[]>([]);
  const [masterId, setMasterId] = useState(masterIdFromUrl);
  const [monthBusyData, setMonthBusyData] = useState<DayBusyData>({});
  const [loadingMonthData, setLoadingMonthData] = useState(false);
  const [state, setState] = useState<LoadState>({
    loading: false,
    error: null,
    slots: [],
  });

  const masterIdKey = masterId || "none";
  const debouncedDate = useDebounce(dateISO, 250);
  const debouncedMasterId = useDebounce(masterId, 250);
  const autoJumpDoneRef = useRef(false);

  const selectedMasterName =
    masters.find((master) => master.id === masterId)?.name ?? t("booking_calendar_master_loading");

  const localeCode = locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

  const syncUrl = useCallback(
    (d: string, m: string) => {
      const qs = new URLSearchParams();
      serviceIdsString.split(",").filter(Boolean).forEach((id) => qs.append("s", id));
      if (m) qs.set("m", m);
      qs.set("d", d);
      router.replace(`/booking/calendar?${qs.toString()}`);
    },
    [router, serviceIdsString],
  );

  const filterTodayCutoff = useCallback((list: Slot[], forDateISO: string): Slot[] => {
    if (forDateISO !== todayISO()) return list;
    const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
    return list.filter((slot) => slot.startAt >= cutoffISO);
  }, []);

  useEffect(() => {
    const [y, m] = dateISO.split("-").map(Number);
    setViewMonth({ year: y, month: m });
  }, [dateISO]);

  useEffect(() => {
    let alive = true;

    async function loadMasters(): Promise<void> {
      if (!serviceIdsString) {
        setMasters([]);
        setMasterId("");
        return;
      }

      try {
        const qs = new URLSearchParams();
        qs.set("serviceIds", serviceIdsString);
        const res = await fetch(`/api/masters?${qs.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { masters: Master[] };
        if (!alive) return;

        const loadedMasters = data.masters ?? [];
        setMasters(loadedMasters);

        if (!masterId || !loadedMasters.find((master) => master.id === masterId)) {
          const first = loadedMasters[0]?.id ?? "";
          setMasterId(first);
          if (first) syncUrl(dateISO, first);
        }
      } catch (err) {
        console.error("Failed to load masters:", err);
      }
    }

    void loadMasters();

    return () => {
      alive = false;
    };
  }, [serviceIdsKey, serviceIdsString, masterIdKey, dateISO, syncUrl, masterId]);

  useEffect(() => {
    let alive = true;

    async function loadMonthBusyData(): Promise<void> {
      if (!masterId || serviceIds.length === 0) {
        setMonthBusyData({});
        return;
      }

      setLoadingMonthData(true);

      try {
        const month = `${viewMonth.year}-${String(viewMonth.month).padStart(2, "0")}`;
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
        if (alive) setLoadingMonthData(false);
      }
    }

    void loadMonthBusyData();

    return () => {
      alive = false;
    };
  }, [viewMonth, masterIdKey, masterId, serviceIds.length, serviceIdsKey]);

  useEffect(() => {
    let alive = true;
    const abortController = new AbortController();

    async function loadSlots(): Promise<void> {
      if (!serviceIdsString || !debouncedMasterId) {
        setState({ loading: false, error: null, slots: [] });
        return;
      }

      const cacheKey = `${debouncedMasterId}_${debouncedDate}_${serviceIdsKey}`;
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
        qs.set("serviceIds", serviceIdsString);

        const res = await fetch(`/api/availability?${qs.toString()}`, {
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ApiPayload;
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
        setState({
          loading: false,
          error: err instanceof Error ? err.message : bookingErrorLoadingText,
          slots: [],
        });
      }
    }

    void loadSlots();

    return () => {
      alive = false;
      abortController.abort();
    };
  }, [
    debouncedDate,
    debouncedMasterId,
    filterTodayCutoff,
    serviceIdsString,
    serviceIdsKey,
    bookingErrorLoadingText,
  ]);

  const findNearestAvailableDate = useCallback(
    async (startISO: string): Promise<string | null> => {
      if (!masterId || !serviceIdsString) return null;

      for (let i = 0; i < 60; i += 1) {
        const d = addDaysISO(startISO, i);
        const qs = new URLSearchParams({
          masterId,
          dateISO: d,
          serviceIds: serviceIdsString,
        });

        try {
          const res = await fetch(`/api/availability?${qs.toString()}`, {
            cache: "no-store",
          });
          if (!res.ok) continue;
          const data = (await res.json()) as ApiPayload;
          const count = Array.isArray(data.slots) ? data.slots.length : 0;
          if (count > 0) return d;
        } catch {
          /* ignore */
        }
      }

      return null;
    },
    [masterId, serviceIdsString],
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
        syncUrl(nearest, masterId);
      }
    })();
  }, [
    dateISO,
    findNearestAvailableDate,
    masterId,
    serviceIds.length,
    syncUrl,
    urlDate,
  ]);

  const days = getDaysInMonth(viewMonth.year, viewMonth.month);
  const minMonthStart = `${minISO.slice(0, 7)}-01`;
  const maxMonthStart = `${maxISO.slice(0, 7)}-01`;
  const currentMonthStart = monthStart(viewMonth);
  const canGoPrev = currentMonthStart > minMonthStart;
  const canGoNext = currentMonthStart < maxMonthStart;

  const durationMin = useMemo(() => {
    if (!state.slots.length) return 0;
    const first = state.slots[0];
    const diff = first.endMinutes - first.startMinutes;
    return diff > 0 ? diff : 0;
  }, [state.slots]);

  const displaySlots = useMemo(() => {
    if (!state.slots.length || !durationMin) return state.slots;
    const base = state.slots[0].startMinutes;
    return state.slots.filter((slot) => (slot.startMinutes - base) % durationMin === 0);
  }, [durationMin, state.slots]);

  const maxSlotsInMonth = Math.max(...Object.values(monthBusyData), 1);

  const selectedDateLabel = new Date(`${dateISO}T00:00:00`).toLocaleDateString(localeCode, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const changeMonth = (direction: -1 | 1): void => {
    setViewMonth((current) => {
      const dt = new Date(current.year, current.month - 1 + direction, 1);
      return { year: dt.getFullYear(), month: dt.getMonth() + 1 };
    });
  };

  const isDisabledDay = (date: Date): boolean => {
    const iso = toISODate(date);
    const weekday = date.getDay();
    return weekday === 0 || weekday === 6 || iso < minISO || iso > maxISO;
  };

  const handleDateSelect = (date: Date): void => {
    if (isDisabledDay(date)) return;

    const safe = clampISO(toISODate(date), minISO, maxISO);
    setDateISO(safe);
    syncUrl(safe, masterId);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      window.setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 350);
    }
  };

  const reserveSlot = useCallback(
    async (slot: Slot): Promise<boolean> => {
      try {
        let sessionId = "";
        if (typeof window !== "undefined") {
          sessionId = localStorage.getItem("booking_session_id") || "";
          if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("booking_session_id", sessionId);
          }
        }

        const res = await fetch("/api/booking/reserve-slot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            masterId,
            startAt: slot.startAt,
            endAt: slot.endAt,
            sessionId,
          }),
        });

        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          if (res.status === 409) {
            alert(t("booking_calendar_slot_taken"));
            requestCache.clear();
            setState((prev) => ({ ...prev, slots: [] }));
            window.location.reload();
            return false;
          }
          throw new Error(data.error || "Failed to reserve slot");
        }

        return true;
      } catch (error) {
        console.error("[Reserve Slot] Error:", error);
        alert(t("booking_calendar_reserve_error"));
        return false;
      }
    },
    [masterId, t],
  );

  const goClient = useCallback(
    async (slot: Slot): Promise<void> => {
      const reserved = await reserveSlot(slot);
      if (!reserved) return;

      const qs = new URLSearchParams();
      serviceIds.forEach((id) => qs.append("s", id));
      if (masterId) qs.set("m", masterId);
      qs.set("start", slot.startAt);
      qs.set("end", slot.endAt);
      qs.set("d", dateISO);
      router.push(`/booking/client?${qs.toString()}`);
    },
    [dateISO, masterId, reserveSlot, router, serviceIds],
  );

  const goBackToMaster = (): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    router.push(`/booking/master?${qs.toString()}`);
  };

  return (
    <PageShell bookingSteps={bookingSteps}>
      <main className="mx-auto w-full max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:mb-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/60 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b5368] shadow-sm backdrop-blur">
            <CalendarDays className="h-3.5 w-3.5 text-[#9b5368]" />
            <span>{t("booking_calendar_step_badge")}</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          </div>

          <h1 className="font-playfair text-4xl font-light leading-tight tracking-tight text-[#38272d] sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-[#7d4e5b] via-[#c06b86] to-[#d89a54] bg-clip-text text-transparent">
              {t("booking_calendar_hero_title")}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f5860] md:text-lg">
            {t("booking_calendar_hero_subtitle")}
          </p>
        </motion.section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:items-start">
          <motion.section
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-[2rem] border border-rose-300/80 bg-white/94 p-5 shadow-[0_26px_86px_rgba(126,76,91,0.16)] backdrop-blur md:p-7"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b5368]">
                  {t("booking_calendar_master_select_label")}
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-bold text-[#2f2026] md:text-3xl">
                  {selectedMasterName}
                </h2>
              </div>

              <label className="relative min-w-0 sm:w-72">
                <span className="sr-only">{t("booking_calendar_master_label")}</span>
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9b5368]" />
                <select
                  value={masterId}
                  onChange={(event) => {
                    const nextMasterId = event.target.value;
                    setMasterId(nextMasterId);
                    syncUrl(dateISO, nextMasterId);
                    requestCache.clear();
                  }}
                  className="h-12 w-full rounded-2xl border border-rose-300/80 bg-white pl-10 pr-4 text-sm font-bold text-[#7d4e5b] shadow-sm outline-none transition focus:border-[#c06b86] focus:ring-4 focus:ring-rose-200/55"
                >
                  {masters.length === 0 && (
                    <option value="">{t("booking_calendar_master_loading")}</option>
                  )}
                  {masters.map((master) => (
                    <option key={master.id} value={master.id}>
                      {master.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => changeMonth(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-[#7d4e5b] shadow-sm transition hover:border-rose-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="text-center">
                <h3 className="font-playfair text-2xl font-bold text-[#2f2026] md:text-3xl">
                  {monthNames[viewMonth.month - 1]} {viewMonth.year}
                </h3>
                <p className="mt-1 text-xs font-semibold text-[#7d4e5b]">
                  {t("booking_calendar_select_day_hint")}
                </p>
              </div>

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => changeMonth(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-white/80 text-[#7d4e5b] shadow-sm transition hover:border-rose-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9b5368]"
                >
                  {day}
                </div>
              ))}

              {days.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

                const iso = toISODate(date);
                const selected = isSameDay(date, dateISO);
                const today = isTodayDate(date);
                const disabled = isDisabledDay(date);
                const slotCount = monthBusyData[iso] ?? 0;
                const fill = loadingMonthData ? 0 : Math.min(slotCount / maxSlotsInMonth, 1);
                const hasSlots = slotCount > 0;

                return (
                  <motion.button
                    key={iso}
                    type="button"
                    whileHover={!disabled ? { y: -2 } : undefined}
                    whileTap={!disabled ? { scale: 0.98 } : undefined}
                    disabled={disabled}
                    onClick={() => handleDateSelect(date)}
                    className={`group relative aspect-square overflow-hidden rounded-2xl border text-sm font-semibold transition md:text-base ${
                      selected
                        ? "border-[#7d4e5b] bg-[#7d4e5b] text-white shadow-[0_18px_38px_rgba(126,76,91,0.28)]"
                        : disabled
                          ? "border-rose-200 bg-white/60 text-[#9b5368]/46"
                          : "border-rose-300/80 bg-white text-[#3c2830] shadow-sm hover:border-[#d97891] hover:bg-white"
                    }`}
                  >
                    {!selected && !disabled && hasSlots && (
                      <span
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#e996aa]/56 to-transparent"
                        style={{ height: `${Math.max(22, fill * 100)}%` }}
                      />
                    )}
                    {today && (
                      <span
                        className={`absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-full ${
                          selected ? "bg-white" : "bg-[#d97891]"
                        }`}
                      />
                    )}
                    <span className="relative z-10">{date.getDate()}</span>
                    {!disabled && hasSlots && !selected && (
                      <span className="absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/82 px-1.5 text-[10px] font-bold text-[#9b5368] shadow-sm">
                        {slotCount}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-rose-200 bg-rose-50/76 p-4 text-sm font-semibold text-[#6f5860] sm:grid-cols-3">
              <div className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#d97891]" />
                {t("booking_calendar_today_slots")}
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#7d4e5b]" />
                {t("booking_calendar_selected_date_label")}
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border border-rose-200 bg-white/70" />
                {t("booking_calendar_weekend")}
              </div>
            </div>
          </motion.section>

          <motion.section
            ref={timeSectionRef}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-[2rem] border border-rose-300/80 bg-white/96 p-5 shadow-[0_26px_86px_rgba(126,76,91,0.16)] backdrop-blur md:p-7"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/82 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#9b5368]">
                <Clock3 className="h-3.5 w-3.5" />
                {t("booking_calendar_time_title")}
              </div>
              <h2 className="mt-4 font-playfair text-3xl font-bold text-[#2f2026]">
                {selectedDateLabel}
              </h2>
              {durationMin > 0 && (
                <p className="mt-2 text-sm font-semibold text-[#6f5860]">
                  {t("booking_calendar_duration_label")}{" "}
                  <span className="font-semibold text-[#7d4e5b]">
                    {durationMin} {t("booking_calendar_minutes_label")}
                  </span>
                </p>
              )}
            </div>

            {!state.loading && !state.error && displaySlots.length > 0 && (
              <button
                type="button"
                onClick={() => void goClient(displaySlots[0])}
                className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7d4e5b] via-[#d97891] to-[#f0b66e] px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_42px_rgba(184,91,117,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(184,91,117,0.38)]"
              >
                <Zap className="h-4 w-4" />
                {t("booking_calendar_nearest_slot")} {formatHM(displaySlots[0].startMinutes)}
              </button>
            )}

            <div className="min-h-[320px]">
              {state.loading && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-2xl border border-rose-200 bg-rose-50/85"
                    />
                  ))}
                </div>
              )}

              {state.error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  {t("booking_calendar_error_prefix")} {state.error}
                </div>
              )}

              {!state.loading && !state.error && displaySlots.length === 0 && (
                <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/76 p-8 text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#9b5368] shadow-sm">
                      <CalendarDays className="h-8 w-8" />
                    </div>
                    <p className="font-bold text-[#7d4e5b]">
                      {t("booking_calendar_no_slots_message")}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#6f5860]">
                      {t("booking_calendar_try_another_day")}
                    </p>
                  </div>
                </div>
              )}

              {!state.loading && !state.error && displaySlots.length > 0 && (
                <div className="grid max-h-[520px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                  <AnimatePresence>
                    {displaySlots.map((slot, index) => {
                      const startHour = Math.floor(slot.startMinutes / 60);
                      const vip = (startHour >= 9 && startHour < 11) || (startHour >= 17 && startHour < 19);

                      return (
                        <motion.button
                          key={slot.startAt}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ delay: index * 0.015 }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => void goClient(slot)}
                          className={`relative overflow-hidden rounded-2xl border px-3 py-4 text-center transition ${
                            vip
                              ? "border-amber-300 bg-amber-50 shadow-[0_14px_34px_rgba(217,151,57,0.18)] hover:border-amber-400"
                              : "border-rose-300/80 bg-white shadow-sm hover:border-[#d97891] hover:bg-white"
                          }`}
                        >
                          {vip && (
                            <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-200 px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#7d4e5b]">
                              <Crown className="h-2.5 w-2.5" />
                              {t("booking_calendar_vip_badge")}
                            </span>
                          )}
                          <span className="block text-sm font-bold text-[#2f2026] md:text-base">
                            {formatHM(slot.startMinutes)} - {formatHM(slot.endMinutes)}
                          </span>
                          <span className="mt-1 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-[#7d4e5b]">
                            <Clock3 className="h-3 w-3" />
                            {durationMin} {t("booking_calendar_minutes_label")}
                          </span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/76 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#7d4e5b]">
                <Star className="h-4 w-4 text-[#d97891]" />
                {t("booking_calendar_available_slots")}
              </div>
              <span className="text-lg font-bold text-[#7d4e5b]">
                {displaySlots.length}
              </span>
            </div>
          </motion.section>
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={goBackToMaster}
            className="inline-flex items-center gap-2 rounded-full border border-rose-300/80 bg-white/84 px-5 py-3 text-sm font-bold text-[#7d4e5b] shadow-sm backdrop-blur transition hover:border-[#d97891] hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("booking_calendar_back_to_master")}
          </button>
        </div>
      </main>
    </PageShell>
  );
}

export default function CalendarStepLightClient(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CalendarInnerLight />
    </Suspense>
  );
}
