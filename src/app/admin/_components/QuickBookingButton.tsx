"use client";

import { useMemo, useState } from "react";
import { NotebookPen, CheckCircle2 } from "lucide-react";

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
  notesPlaceholder: "Комментарий для мастера…",
  cancel: "Отмена",
  submit: "Создать заявку",
};

export default function QuickBookingButton({
  masters,
  services,
  defaultDate,
  defaultTime,
  action,
  hints,
  labels,
}: {
  masters: MasterOpt[];
  services: ServiceOpt[];
  defaultDate: string;
  defaultTime: string;
  action: ServerAction;
  hints: Hint[];
  labels?: QuickBookingLabels;
}) {
  const ui = labels ?? DEFAULT_LABELS_RU;
  const [open, setOpen] = useState(false);
  const [masterId, setMasterId] = useState(masters[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);

  const sortedServices = useMemo(() => {
    const withCat = services.map((s) => ({
      ...s,
      sortKey: (s.parentName ?? "") + s.name,
    }));
    return withCat.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [services]);

  const masterHints = useMemo(
    () => hints.filter((h) => h.id === masterId).flatMap((h) => h.slots),
    [hints, masterId]
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-violet-600 hover:bg-violet-500 transition"
      >
        <NotebookPen className="h-4 w-4" />
        {ui.trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* modal */}
          <div className="absolute inset-x-0 top-10 mx-auto w-[92%] max-w-xl rounded-2xl border bg-background shadow-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-medium">{ui.modalTitle}</div>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded-lg border hover:bg-muted/40 text-sm"
              >
                {ui.close}
              </button>
            </div>

            <form action={action} className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span className="opacity-70">{ui.client}</span>
                  <input
                    name="customerName"
                    className="input"
                    placeholder={ui.clientPlaceholder}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="opacity-70">{ui.phone}</span>
                  <input
                    name="phone"
                    className="input"
                    placeholder={ui.phonePlaceholder}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span className="opacity-70">{ui.emailOptional}</span>
                  <input
                    name="email"
                    type="email"
                    className="input"
                    placeholder={ui.emailPlaceholder}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="opacity-70">{ui.master}</span>
                  <select
                    name="masterId"
                    className="input"
                    value={masterId}
                    onChange={(e) => setMasterId(e.target.value)}
                    required
                  >
                    {masters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="opacity-70">{ui.service}</span>
                <select
                  name="serviceId"
                  className="input"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  {sortedServices.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span className="opacity-70">{ui.date}</span>
                  <input
                    name="date"
                    type="date"
                    className="input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="opacity-70">{ui.time}</span>
                  <input
                    name="time"
                    type="time"
                    className="input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </label>
              </div>

              {masterHints.length > 0 && (
                <div className="text-xs">
                  <div className="opacity-70 mb-1">{ui.nearestFree}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {masterHints.slice(0, 6).map((slot, i) => (
                      <button
                        type="button"
                        key={i}
                        className="px-2 py-0.5 rounded-full border hover:bg-muted/40"
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
                <span className="opacity-70">{ui.notesOptional}</span>
                <textarea
                  name="notes"
                  className="input min-h-[70px]"
                  placeholder={ui.notesPlaceholder}
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-muted/40 transition"
                >
                  {ui.cancel}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {ui.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
