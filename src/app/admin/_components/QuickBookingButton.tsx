"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, NotebookPen } from "lucide-react";
import {
  getQuickBookingMastersAction,
  getQuickBookingSlotsAction,
} from "../quick-booking-actions";

type MasterOpt = { id: string; name: string };
type ServiceOpt = {
  id: string;
  name: string;
  durationMin: number;
  parentName?: string | null;
};

type Hint = { id: string; name: string; next?: string; slots: string[] };

type ServerAction = (formData: FormData) => void | Promise<void>;

export type QuickBookingLabels = {
  trigger: string;
  modalTitle: string;
  close: string;
  client: string;
  clientPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  emailOptional: string;
  emailPlaceholder: string;
  master: string;
  service: string;
  date: string;
  time: string;
  nearestFree: string;
  useIntervalStartTitle: string;
  notesOptional: string;
  notesPlaceholder: string;
  cancel: string;
  submit: string;
  loadingSlots?: string;
  noSlots?: string;
  noMasters?: string;
};

const DEFAULT_LABELS_RU: QuickBookingLabels = {
  trigger: "Быстрая запись",
  modalTitle: "Быстрая запись",
  close: "Закрыть",
  client: "Клиент",
  clientPlaceholder: "Имя клиента",
  phone: "Телефон",
  phonePlaceholder: "+380...",
  emailOptional: "Email (необязательно)",
  emailPlaceholder: "client@mail.com",
  master: "Мастер",
  service: "Услуга",
  date: "Дата",
  time: "Время",
  nearestFree: "Ближайшие свободные:",
  useIntervalStartTitle: "Подставить начало интервала",
  notesOptional: "Заметка (необязательно)",
  notesPlaceholder: "Комментарий для мастера...",
  cancel: "Отмена",
  submit: "Создать заявку",
  loadingSlots: "Загружаем свободные слоты...",
  noSlots: "Нет свободных слотов",
  noMasters: "Нет доступных мастеров",
};

const INPUT_CLASS =
  "input-glass min-w-0 truncate [color-scheme:dark]";

export default function QuickBookingButton({
  masters,
  services,
  defaultDate,
  defaultTime,
  action,
  hints,
  labels,
  redirectTo,
}: {
  masters: MasterOpt[];
  services: ServiceOpt[];
  defaultDate: string;
  defaultTime: string;
  action: ServerAction;
  hints: Hint[];
  labels?: QuickBookingLabels;
  redirectTo?: string;
}) {
  const ui = labels ?? DEFAULT_LABELS_RU;
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [masterId, setMasterId] = useState(masters[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [availableMasters, setAvailableMasters] = useState(masters);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [slots, setSlots] = useState<Array<{ time: string; displayTime: string }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const sortedServices = useMemo(() => {
    const withCat = services.map((service) => ({
      ...service,
      sortKey: (service.parentName ?? "") + service.name,
    }));
    return withCat.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [services]);

  const masterHints = useMemo(
    () => hints.filter((hint) => hint.id === masterId).flatMap((hint) => hint.slots),
    [hints, masterId],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("quick") === "open") {
      setOpen(true);
    }
  }, [mounted]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !serviceId) return;

    let cancelled = false;
    getQuickBookingMastersAction(serviceId).then((result) => {
      if (cancelled || !result.ok) return;
      setAvailableMasters(result.masters);
      setMasterId((current) => {
        if (result.masters.some((master) => master.id === current)) return current;
        return result.masters[0]?.id ?? "";
      });
    });

    return () => {
      cancelled = true;
    };
  }, [open, serviceId]);

  useEffect(() => {
    if (!open) return;
    if (!masterId || !serviceId || !date) {
      setSlots([]);
      setTime("");
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    getQuickBookingSlotsAction({ masterId, serviceId, dateISO: date })
      .then((result) => {
        if (cancelled) return;
        const nextSlots = result.ok ? result.slots : [];
        setSlots(nextSlots);
        setTime((current) => {
          if (nextSlots.some((slot) => slot.time === current)) return current;
          return nextSlots[0]?.time ?? "";
        });
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, masterId, open, serviceId]);

  const modal = open ? (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/70 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-8">
      <button
        type="button"
        aria-label={ui.close}
        className="fixed inset-0 -z-10 cursor-default"
        onClick={() => setOpen(false)}
      />

      <div className="mx-auto flex min-h-full w-full max-w-2xl items-start justify-center sm:items-center">
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-slate-100 shadow-2xl shadow-black/50 ring-1 ring-cyan-400/20">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="min-w-0 text-base font-semibold text-white sm:text-lg">
              {ui.modalTitle}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-white/10"
            >
              {ui.close}
            </button>
          </div>

          <form
            action={action}
            className="max-h-[calc(100dvh-7rem)] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[min(760px,calc(100dvh-8rem))] sm:px-5"
          >
            {redirectTo && (
              <input type="hidden" name="redirectTo" value={redirectTo} />
            )}

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">{ui.client}</span>
                <input
                  name="customerName"
                  className="input-glass min-w-0"
                  placeholder={ui.clientPlaceholder}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">{ui.phone}</span>
                <input
                  name="phone"
                  className="input-glass min-w-0"
                  placeholder={ui.phonePlaceholder}
                  required
                />
              </label>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">{ui.emailOptional}</span>
                <input
                  name="email"
                  type="email"
                  className="input-glass min-w-0"
                  placeholder={ui.emailPlaceholder}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">{ui.master}</span>
                <select
                  name="masterId"
                  className={INPUT_CLASS}
                  value={masterId}
                  onChange={(event) => setMasterId(event.target.value)}
                  required
                >
                  {availableMasters.map((master) => (
                    <option key={master.id} value={master.id}>
                      {master.name}
                    </option>
                  ))}
                  {availableMasters.length === 0 && (
                    <option value="">{ui.noMasters ?? "No masters"}</option>
                  )}
                </select>
              </label>
            </div>

            <label className="grid min-w-0 gap-1 text-sm">
              <span className="text-slate-300">{ui.service}</span>
              <select
                name="serviceId"
                className={INPUT_CLASS}
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                required
              >
                {sortedServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">{ui.date}</span>
                <input
                  name="date"
                  type="date"
                  className="input-glass min-w-0 [color-scheme:dark]"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-slate-300">{ui.time}</span>
                <select
                  name="time"
                  className={INPUT_CLASS}
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  disabled={loadingSlots || slots.length === 0}
                  required
                >
                  {loadingSlots ? (
                    <option value="">{ui.loadingSlots ?? "Loading..."}</option>
                  ) : slots.length === 0 ? (
                    <option value="">{ui.noSlots ?? "No free slots"}</option>
                  ) : (
                    slots.map((slot) => (
                      <option key={slot.time} value={slot.time}>
                        {slot.displayTime}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

            {masterHints.length > 0 && slots.length > 0 && (
              <div className="text-xs">
                <div className="mb-1 text-slate-400">{ui.nearestFree}</div>
                <div className="flex flex-wrap gap-1.5">
                  {masterHints.slice(0, 6).map((slot, index) => (
                    <button
                      type="button"
                      key={index}
                      className="rounded-full border border-white/10 px-2 py-0.5 text-slate-200 transition hover:bg-white/10"
                      onClick={() => setTime(slot.split("–")[0])}
                      title={ui.useIntervalStartTitle}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="grid gap-1 text-sm">
              <span className="text-slate-300">{ui.notesOptional}</span>
              <textarea
                name="notes"
                className="input-glass min-h-20 min-w-0 resize-y"
                placeholder={ui.notesPlaceholder}
              />
            </label>

            <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-white/10 bg-slate-950/95 px-4 pb-1 pt-3 backdrop-blur sm:-mx-5 sm:flex-row sm:items-center sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-xl border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/10 sm:w-auto"
              >
                {ui.cancel}
              </button>
              <button
                type="submit"
                disabled={loadingSlots || slots.length === 0 || !masterId}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                {ui.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-white transition hover:bg-violet-500"
      >
        <NotebookPen className="h-4 w-4" />
        {ui.trigger}
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
