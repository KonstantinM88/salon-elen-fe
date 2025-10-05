// src/components/booking-form.tsx
"use client";

import { useState } from "react";
import { book, type BookForm } from "@/app/actions/book";

type Service = {
  slug: string;
  name: string;
  durationMin: number;
};

type Props = {
  services: Service[];
};

export default function BookingForm({ services }: Props) {
  const [serviceSlug, setServiceSlug] = useState<string>(services[0]?.slug ?? "");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const payload: BookForm = {
      serviceSlug,
      date,
      time,
      name,
      phone,
      email: email.trim() ? email.trim() : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    setPending(true);
    const res = await book(payload);
    setPending(false);

    if (res.ok) {
      setMsg("Заявка отправлена! Мы свяжемся для подтверждения ✅");
      // сбросим форму
      setTime("");
      setNotes("");
    } else {
      setMsg(res.error || "Не удалось создать запись");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 max-w-xl">
      <div>
        <label className="block text-sm mb-1">Услуга</label>
        <select
          className="w-full rounded-lg bg-transparent border px-3 py-2"
          value={serviceSlug}
          onChange={(e) => setServiceSlug(e.target.value)}
          required
        >
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name} — {s.durationMin} мин
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Дата</label>
          <input
            type="date"
            className="w-full rounded-lg bg-transparent border px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Время</label>
          <input
            type="time"
            className="w-full rounded-lg bg-transparent border px-3 py-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Имя</label>
          <input
            className="w-full rounded-lg bg-transparent border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            name="name"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Телефон</label>
          <input
            className="w-full rounded-lg bg-transparent border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            name="phone"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Email (необязательно)</label>
        <input
          type="email"
          className="w-full rounded-lg bg-transparent border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Комментарий (необязательно)</label>
        <textarea
          className="w-full rounded-lg bg-transparent border px-3 py-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          name="notes"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-5 py-2.5 text-sm font-medium border hover:bg-white/10 disabled:opacity-60"
        >
          {pending ? "Отправляем…" : "Записаться"}
        </button>
        {msg && <div className="text-sm opacity-80">{msg}</div>}
      </div>
    </form>
  );
}
