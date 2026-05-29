"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock } from "lucide-react";
import {
  getRescheduleSlotsAction,
  rescheduleAppointmentAction,
} from "../actions";

type Labels = {
  action: string;
  date: string;
  time: string;
  submit: string;
  success: string;
  loading: string;
  noSlots: string;
};

type SlotOption = {
  time: string;
  displayTime: string;
};

export function RescheduleAppointmentForm({
  appointmentId,
  defaultDate,
  defaultTime,
  labels,
}: {
  appointmentId: string;
  defaultDate: string;
  defaultTime: string;
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const [dateISO, setDateISO] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !dateISO) return;

    let cancelled = false;
    setIsLoadingSlots(true);
    setMessage(null);

    getRescheduleSlotsAction(appointmentId, dateISO)
      .then((result) => {
        if (cancelled) return;

        if (!result.ok) {
          setSlots([]);
          setMessage(result.error);
          return;
        }

        setSlots(result.slots);
        setTime((current) => {
          if (result.slots.some((slot) => slot.time === current)) {
            return current;
          }
          return result.slots[0]?.time ?? "";
        });
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setMessage(labels.noSlots);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appointmentId, dateISO, labels.noSlots, open]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setMessage(null);
        }}
        className="rounded-full text-xs px-3 py-1.5 bg-violet-600/90 text-white hover:bg-violet-600 transition-all inline-flex items-center gap-1 hover:scale-105 active:scale-95 border border-violet-500/50"
      >
        <CalendarClock className="h-3.5 w-3.5" />
        <span>{labels.action}</span>
      </button>

      {open && (
        <form
          className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            startTransition(async () => {
              const result = await rescheduleAppointmentAction(
                appointmentId,
                dateISO,
                time,
              );
              setMessage(result.ok ? labels.success : result.error);
              if (result.ok) {
                setOpen(false);
              }
            });
          }}
        >
          <label className="sr-only" htmlFor={`reschedule-date-${appointmentId}`}>
            {labels.date}
          </label>
          <input
            id={`reschedule-date-${appointmentId}`}
            type="date"
            value={dateISO}
            onChange={(event) => setDateISO(event.target.value)}
            className="h-8 rounded-lg border border-white/10 bg-slate-950/80 px-2 text-xs text-slate-100 outline-none focus:border-violet-400"
            required
          />
          <label className="sr-only" htmlFor={`reschedule-time-${appointmentId}`}>
            {labels.time}
          </label>
          <select
            id={`reschedule-time-${appointmentId}`}
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="h-8 min-w-[138px] rounded-lg border border-white/10 bg-slate-950/80 px-2 text-xs text-slate-100 outline-none focus:border-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoadingSlots || slots.length === 0}
            required
          >
            {isLoadingSlots ? (
              <option value="">{labels.loading}</option>
            ) : slots.length === 0 ? (
              <option value="">{labels.noSlots}</option>
            ) : (
              slots.map((slot) => (
                <option key={slot.time} value={slot.time}>
                  {slot.displayTime}
                </option>
              ))
            )}
          </select>
          <button
            type="submit"
            disabled={isPending || isLoadingSlots || slots.length === 0}
            className="h-8 rounded-lg bg-violet-500 px-3 text-xs font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "..." : labels.submit}
          </button>
        </form>
      )}

      {message && (
        <span className="text-xs text-slate-300" aria-live="polite">
          {message}
        </span>
      )}
    </div>
  );
}
