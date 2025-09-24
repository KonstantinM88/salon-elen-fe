"use client";

import { useState } from "react";
import { createBooking } from "@/app/actions/book";

type Service = { id: number; title: string; durationMin: number };

export default function BookingForm({ services }: { services: Service[] }) {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onAction(formData: FormData) {
    setStatus("idle");
    setMsg("");

    const res = await createBooking(formData);
    if (res.ok) {
      setStatus("ok");
      (document.getElementById("booking-form") as HTMLFormElement)?.reset();
    } else {
      setStatus("err");
      setMsg(res.error || "Ошибка");
    }
  }

  return (
    <form id="booking-form" action={onAction} className="max-w-xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Имя*</span>
          <input
            name="customer"
            required
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Телефон*</span>
          <input
            name="phone"
            required
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-300">Email</span>
        <input
          type="email"
          name="email"
          className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-300">Услуга*</span>
        <select
          name="serviceId"
          required
          defaultValue=""
          aria-label="Выберите услугу"
          className="
            rounded-xl border
            border-gray-300 dark:border-gray-700
            bg-white dark:bg-slate-900
            text-gray-900 dark:text-gray-100
            w-full h-11 px-3
            focus-visible:ring-2 focus-visible:ring-sky-400/40
          "
          style={{ colorScheme: "dark" }}
        >
          <option value="" disabled>
            Выберите услугу…
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} — {s.durationMin} мин
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Дата*</span>
          <input
            type="date"
            name="date"
            required
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">Время*</span>
          <input
            type="time"
            name="time"
            required
            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600 dark:text-gray-300">Комментарий</span>
        <textarea
          name="note"
          rows={4}
          className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
        />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn">
          Записаться
        </button>

        {status === "ok" && (
          <span className="text-green-600">Заявка отправлена!</span>
        )}
        {status === "err" && <span className="text-red-600">{msg}</span>}
      </div>
    </form>
  );
}
