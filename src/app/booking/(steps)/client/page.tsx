import { JSX, Suspense } from 'react';
import ClientStep from './ClientStep';

export const dynamic = 'force-dynamic';

export default function ClientPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Контактные данные</h2>

      <Suspense
        fallback={
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            Загружаем форму…
          </div>
        }
      >
        <ClientStep />
      </Suspense>
    </div>
  );
}




// // src/app/booking/(steps)/client/page.tsx
// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { fmtVisitDate, fmtVisitTime } from "@/lib/datetime";

// type Service = {
//   id: string;
//   title: string;
//   durationMin: number;
//   priceCents?: number | null;
//   parentId?: string | null;
// };

// type Promo = { id: string; title: string; percent: number; isGlobal: boolean };

// function parseParams(sp: URLSearchParams) {
//   const masterId = sp.get("masterId") || undefined;
//   const startAt = sp.get("startAt") || undefined; // ISO UTC
//   const durationMin = sp.get("m") ? Number(sp.get("m")) : undefined;

//   const csv = sp.get("serviceIds")?.trim();
//   let serviceIds = csv ? csv.split(",").map(s => s.trim()).filter(Boolean) : [];

//   const legacyOne = sp.get("s") || sp.get("serviceId") || sp.get("serviceSlug") || sp.get("serviceSlugOrId");
//   if (!serviceIds.length && legacyOne) serviceIds = [legacyOne];

//   return { masterId, startAt, durationMin, serviceIds };
// }

// export default function ClientStepPage() {
//   const router = useRouter();
//   const sp = useSearchParams();
//   const { masterId, startAt, durationMin: paramDuration, serviceIds } = useMemo(() => parseParams(sp), [sp]);

//   const [services, setServices] = useState<Service[]>([]);
//   const [promos, setPromos] = useState<Promo[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [code, setCode] = useState("");
//   const [notes, setNotes] = useState("");
//   const [agree, setAgree] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   // Загружаем карточки услуг и активные акции из существующего API
//   const loadServices = useCallback(async () => {
//     try {
//       setLoading(true);
//       // В проекте есть POST /booking/services, который возвращает { groups, services, promotions }
//       const res = await fetch("/booking/services", { method: "POST" });
//       const data = await res.json();

//       const all: Service[] = Array.isArray(data?.services) ? data.services : [];
//       const selected = serviceIds.length ? all.filter(s => serviceIds.includes(s.id)) : [];

//       setServices(selected);
//       setPromos(Array.isArray(data?.promotions) ? data.promotions : []);
//     } catch {
//       setServices([]);
//       setPromos([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [serviceIds]);

//   useEffect(() => {
//     loadServices();
//   }, [loadServices]);

//   // Подсчеты: продолжительность и сумма
//   const totalDuration = useMemo(() => {
//     if (serviceIds.length && services.length) {
//       return services.reduce((acc, s) => acc + (s.durationMin || 0), 0);
//     }
//     return paramDuration || 0;
//   }, [serviceIds, services, paramDuration]);

//   const baseSumCents = useMemo(() => {
//     if (serviceIds.length && services.length) {
//       return services.reduce((acc, s) => acc + (s.priceCents || 0), 0);
//     }
//     return 0;
//   }, [serviceIds, services]);

//   // Применяем максимально возможную промо-скидку
//   const bestPromoPercent = useMemo(() => {
//     if (!promos.length) return 0;
//     // приоритет — глобальные и максимальный процент
//     const max = promos.reduce((m, p) => Math.max(m, p.percent || 0), 0);
//     return max;
//   }, [promos]);

//   const discountCents = Math.floor((baseSumCents * bestPromoPercent) / 100);
//   const totalAfterDiscountCents = Math.max(0, baseSumCents - discountCents);

//   // Валидации
//   const canSubmit =
//     !loading &&
//     !!startAt &&
//     (serviceIds.length > 0 || paramDuration) &&
//     !!masterId &&
//     name.trim().length >= 2 &&
//     phone.trim().length >= 6 &&
//     email.trim().length > 0 &&
//     emailVerified &&
//     agree &&
//     !submitting;

//   async function requestCode() {
//     setErrorMsg(null);
//     if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
//       setErrorMsg("Введите корректный e-mail для отправки кода.");
//       return;
//     }
//     const r = await fetch("/api/email/verify/request", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email }),
//     });
//     if (!r.ok) {
//       const j = await r.json().catch(() => ({}));
//       setErrorMsg(j?.error || "Не удалось отправить код подтверждения.");
//       return;
//     }
//     // Подсказка пользователю
//     alert("Код подтверждения отправлен на e-mail. Проверьте почту.");
//   }

//   async function confirmCode() {
//     setErrorMsg(null);
//     if (!email || !code) {
//       setErrorMsg("Укажите e-mail и код подтверждения.");
//       return;
//     }
//     const r = await fetch("/api/email/verify/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, code }),
//     });
//     const j = await r.json().catch(() => ({}));
//     if (!r.ok || !j?.ok) {
//       setEmailVerified(false);
//       setErrorMsg(j?.error === "code_expired" ? "Срок действия кода истек, запросите новый." : "Неверный код.");
//       return;
//     }
//     setEmailVerified(true);
//   }

//   async function submit() {
//     if (!canSubmit) return;
//     setSubmitting(true);
//     setErrorMsg(null);
//     try {
//       // endAt = startAt + totalDuration минут
//       const start = new Date(startAt!);
//       const end = new Date(start.getTime() + totalDuration * 60 * 1000);

//       // Используем первую услугу как primary для совместимости со схемой
//       const primaryServiceId = serviceIds[0] || undefined;

//       const payload = {
//         serviceId: primaryServiceId,
//         serviceIds, // для трассировки и админки
//         masterId,
//         startAt: start.toISOString(),
//         endAt: end.toISOString(),
//         customerName: name.trim(),
//         phone: phone.trim(),
//         email: email.trim(),
//         notes:
//           notes?.trim()
//             ? notes.trim()
//             : serviceIds.length > 1
//             ? `Комплексная запись по услугам: ${serviceIds.join(", ")}`
//             : undefined,
//       };

//       const r = await fetch("/api/appointments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!r.ok) {
//         const j = await r.json().catch(() => ({}));
//         setErrorMsg(j?.error || "Не удалось создать запись.");
//         setSubmitting(false);
//         return;
//       }

//       router.push("/booking?ok=1");
//     } catch {
//       setErrorMsg("Ошибка сети при создании записи.");
//       setSubmitting(false);
//     }
//   }

//   // Отображение
//   const startAtDate = startAt ? new Date(startAt) : null;

//   return (
//     <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Контакты и подтверждение</h1>

//       {/* Сводка визита */}
//       <div className="rounded-xl border p-4">
//         <div className="flex flex-wrap items-center justify-between gap-2">
//           <div>
//             <div className="text-sm text-gray-500">Дата</div>
//             <div className="font-medium">
//               {startAtDate ? `${fmtVisitDate(startAtDate)} в ${fmtVisitTime(startAtDate)}` : "—"}
//             </div>
//           </div>
//           <div>
//             <div className="text-sm text-gray-500">Длительность</div>
//             <div className="font-medium">{totalDuration} мин</div>
//           </div>
//           <div>
//             <div className="text-sm text-gray-500">Мастер</div>
//             <div className="font-medium">{masterId || "—"}</div>
//           </div>
//         </div>

//         {/* Услуги */}
//         {loading ? (
//           <div className="mt-3 text-gray-500">Загрузка услуг…</div>
//         ) : serviceIds.length ? (
//           <div className="mt-3 space-y-1">
//             {services.map(s => (
//               <div key={s.id} className="flex items-center justify-between text-sm">
//                 <div className="truncate">{s.title}</div>
//                 <div className="whitespace-nowrap">
//                   {s.priceCents ? `${(s.priceCents / 100).toFixed(2)} €` : "—"}
//                 </div>
//               </div>
//             ))}
//             <div className="mt-2 h-px bg-gray-200" />
//             <div className="flex items-center justify-between font-medium">
//               <div>Итого</div>
//               <div className="whitespace-nowrap">
//                 {discountCents > 0 ? (
//                   <>
//                     <span className="line-through mr-2 text-gray-400">{(baseSumCents / 100).toFixed(2)} €</span>
//                     <span>{(totalAfterDiscountCents / 100).toFixed(2)} €</span>
//                     <span className="ml-2 text-xs text-green-700">−{bestPromoPercent}%</span>
//                   </>
//                 ) : (
//                   <span>{(baseSumCents / 100).toFixed(2)} €</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="mt-3 text-sm text-gray-500">Услуги не выбраны. Возврат к предыдущему шагу.</div>
//         )}
//       </div>

//       {/* Форма клиента */}
//       <div className="grid gap-4 sm:grid-cols-2">
//         <div className="sm:col-span-2">
//           <label className="mb-1 block text-sm">Ваше имя</label>
//           <input
//             className="w-full rounded border px-3 py-2"
//             value={name}
//             onChange={e => setName(e.target.value)}
//             placeholder="Иван Иванов"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-sm">Телефон</label>
//           <input
//             className="w-full rounded border px-3 py-2"
//             value={phone}
//             onChange={e => setPhone(e.target.value)}
//             placeholder="+49 123 456789"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-sm">E-mail</label>
//           <div className="flex gap-2">
//             <input
//               className="w-full rounded border px-3 py-2"
//               value={email}
//               onChange={e => {
//                 setEmail(e.target.value);
//                 setEmailVerified(false);
//               }}
//               placeholder="name@example.com"
//             />
//             <button
//               type="button"
//               className="whitespace-nowrap rounded border px-3 py-2 hover:bg-gray-50"
//               onClick={requestCode}
//             >
//               Получить код
//             </button>
//           </div>
//           {emailVerified ? (
//             <div className="mt-1 text-xs text-green-700">E-mail подтвержден.</div>
//           ) : (
//             <div className="mt-2 flex gap-2">
//               <input
//                 className="w-full rounded border px-3 py-2"
//                 value={code}
//                 onChange={e => setCode(e.target.value)}
//                 placeholder="Код из письма"
//               />
//               <button
//                 type="button"
//                 className="whitespace-nowrap rounded border px-3 py-2 hover:bg-gray-50"
//                 onClick={confirmCode}
//               >
//                 Подтвердить
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="sm:col-span-2">
//           <label className="mb-1 block text-sm">Комментарий</label>
//           <textarea
//             className="w-full rounded border px-3 py-2"
//             rows={3}
//             value={notes}
//             onChange={e => setNotes(e.target.value)}
//             placeholder="Пожелания к визиту"
//           />
//         </div>

//         <div className="sm:col-span-2 flex items-start gap-2">
//           <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
//           <div className="text-sm text-gray-700">
//             Согласен с условиями обработки персональных данных и правилами онлайн-записи.
//           </div>
//         </div>
//       </div>

//       {errorMsg && <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errorMsg}</div>}

//       <div className="flex items-center justify-between">
//         <Link href="/booking/calendar?serviceIds=%2C" className="text-sm text-gray-600 hover:underline">
//           ← Назад к времени
//         </Link>
//         <button
//           className={`rounded px-5 py-2 text-white ${
//             canSubmit ? "bg-black hover:opacity-90" : "bg-gray-400 cursor-not-allowed"
//           }`}
//           disabled={!canSubmit}
//           onClick={submit}
//         >
//           Подтвердить запись
//         </button>
//       </div>
//     </div>
//   );
// }





//-----------------27/10
// // src/app/booking/(steps)/client/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// /* ---------- типы ответа ---------- */
// type AppointmentBooking = {
//   id: string;
//   startAt: string;
//   endAt: string;
//   status: "PENDING" | "CONFIRMED" | "CANCELED";
//   masterId: string;
//   serviceId: string;
// };
// type JsonOk = {
//   ok: true;
//   booking: AppointmentBooking;
//   label?: string;
//   timeZone?: string;
// };
// type JsonErr = { error?: string };

// /* ---------- утилиты ---------- */
// function isIso(s: string): boolean {
//   const d = new Date(s);
//   return Number.isFinite(d.getTime());
// }
// function isYmd(s: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(s);
// }

// export default function ClientStep() {
//   const sp = useSearchParams();
//   const router = useRouter();

//   // из URL; поддерживаем и start, и startAt
//   const serviceSlug = sp.get("s") ?? "";
//   const durationMin = Number(sp.get("m") ?? "0");
//   const masterId = sp.get("masterId") ?? "";
//   const startAt = sp.get("start") ?? sp.get("startAt") ?? "";

//   // форма
//   const [name, setName] = useState("");
//   const [birthDate, setBirthDate] = useState(""); // YYYY-MM-DD
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [notes, setNotes] = useState("");
//   const [agree, setAgree] = useState(true);

//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState<string | null>(null);
//   const [ok, setOk] = useState<string | null>(null);

//   // готовность URL-части и формы
//   const urlReady = Boolean(serviceSlug) && Boolean(startAt) && isIso(startAt);
//   const formReady = name.trim().length > 0 && isYmd(birthDate) && agree;
//   const canSubmit = urlReady && formReady && durationMin > 0 && !busy;

//   async function onSubmit() {
//     if (!canSubmit) return;

//     setBusy(true);
//     setErr(null);
//     setOk(null);

//     try {
//       const res = await fetch("/api/appointments", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({
//           serviceSlug,
//           masterId: masterId || undefined,
//           startAt,                 // ISO UTC строки из календаря
//           durationMin,             // из параметра m
//           name: name.trim(),       // ВАЖНО: поле называется name
//           birthDate,               // YYYY-MM-DD
//           phone: phone.trim() || undefined,
//           email: email.trim() || undefined,
//           notes: notes.trim() || undefined,
//         }),
//         cache: "no-store",
//       });

//       if (res.ok) {
//         const j = (await res.json()) as JsonOk;
//         setOk("Заявка создана. Мы свяжемся с вами для подтверждения.");
//         // редирект на первую страницу бронирования
//         setTimeout(() => router.push("/booking"), 1000);
//         return;
//       }

//       if (res.status === 409) {
//         setErr("Этот слот уже занят. Выберите другое время.");
//         return;
//       }

//       // пробуем разобрать тело ошибки
//       let msg = `Ошибка (${res.status})`;
//       try {
//         const j = (await res.json()) as JsonErr;
//         if (j.error) msg = j.error;
//         if (res.status === 400 && !j.error) msg = "Проверьте обязательные поля.";
//         if (res.status === 404 && !j.error) msg = "Услуга или мастер не найдены.";
//       } catch {
//         /* игнорируем, оставляем msg по статусу */
//       }
//       setErr(msg);
//     } catch {
//       setErr("Сеть недоступна. Попробуйте ещё раз.");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="container mx-auto max-w-3xl p-4 text-white">
//       <h1 className="text-2xl font-semibold mb-6">Онлайн-запись</h1>

//       {/* Резюме выбранного слота */}
//       <div className="mb-6 rounded-2xl bg-neutral-800/60 ring-1 ring-white/10 p-4 text-sm">
//         <div className="opacity-80">
//           Услуга: <b className="opacity-100 break-all">{serviceSlug || "—"}</b>
//         </div>
//         <div className="opacity-80">
//           Длительность: <b className="opacity-100">{durationMin || "—"} мин</b>
//         </div>
//         <div className="opacity-80">
//           Мастер: <b className="opacity-100 break-all">{masterId || "—"}</b>
//         </div>
//         <div className="opacity-80">
//           Время:{" "}
//           <b className="opacity-100">
//             {startAt
//               ? new Date(startAt).toLocaleString("de-DE", {
//                   hour12: false,
//                   timeZone: "Europe/Berlin",
//                 })
//               : "—"}
//           </b>
//         </div>
//       </div>

//       {/* Форма клиента */}
//       <div className="rounded-2xl bg-neutral-800/60 ring-1 ring-white/10 p-4">
//         <div className="grid gap-3">
//           <input
//             className="rounded-xl bg-neutral-900/60 ring-1 ring-white/10 px-3 py-2"
//             placeholder="Имя и фамилия *"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//           <input
//             className="rounded-xl bg-neutral-900/60 ring-1 ring-white/10 px-3 py-2"
//             placeholder="E-mail"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             type="email"
//           />
//           <input
//             className="rounded-xl bg-neutral-900/60 ring-1 ring-white/10 px-3 py-2"
//             placeholder="Телефон"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             inputMode="tel"
//           />
//           <input
//             className="rounded-xl bg-neutral-900/60 ring-1 ring-white/10 px-3 py-2"
//             placeholder="Дата рождения (ГГГГ-ММ-ДД) *"
//             value={birthDate}
//             onChange={(e) => setBirthDate(e.target.value)}
//             type="date"
//           />
//           <textarea
//             className="rounded-xl bg-neutral-900/60 ring-1 ring-white/10 px-3 py-2 min-h-[90px]"
//             placeholder="Комментарий"
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//           />
//           <label className="flex items-center gap-2 text-sm text-white/80">
//             <input
//               type="checkbox"
//               checked={agree}
//               onChange={(e) => setAgree(e.target.checked)}
//             />
//             Согласие на обработку персональных данных
//           </label>

//           {err && <div className="text-red-300 text-sm">{err}</div>}
//           {ok && <div className="text-emerald-300 text-sm">{ok}</div>}

//           <div className="pt-2">
//             <button
//               type="button"
//               disabled={!canSubmit}
//               onClick={onSubmit}
//               className="rounded-full bg-white/10 text-white px-5 py-2 disabled:opacity-50 hover:bg-white/20 transition"
//             >
//               {busy ? "Отправка…" : "Записаться"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }









// // src/app/booking/(steps)/client/page.tsx
// "use client";

// import { useMemo, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// /* ───────── API types ───────── */

// type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELED";

// type PostOk = {
//   ok: true;
//   booking: {
//     id: string;
//     startAt: string;
//     endAt: string;
//     status: BookingStatus;
//     masterId: string;
//     serviceId: string;
//   };
//   label: string;
//   timeZone: string;
// };

// type PostErr = { error: string; details?: unknown };

// type NewPayload = {
//   serviceSlug: string; // отправляем slug (или id — сервер поддерживает оба в этом поле)
//   masterId: string;
//   startAt: string; // ISO 8601
//   durationMin?: number;
//   name: string;
//   phone?: string;
//   email?: string;
//   notes?: string;
//   birthDate?: string; // YYYY-MM-DD (опционально для автосоздания клиента)
// };

// /* ───────── utils ───────── */

// function isIsoDate(s: string): boolean {
//   const d = new Date(s);
//   return Number.isFinite(d.getTime());
// }
// function isYmd(s: string): boolean {
//   // мягкая проверка YYYY-MM-DD
//   return /^\d{4}-\d{2}-\d{2}$/.test(s);
// }

// /* ───────── component ───────── */

// export default function ClientPage() {
//   const router = useRouter();
//   const sp = useSearchParams();

//   // из URL:
//   // s — slug/ID услуги, m — длительность (мин), masterId — мастер, startAt — ISO
//   const serviceSlug = useMemo(() => (sp.get("s") ?? "").trim(), [sp]);
//   const durationMin = useMemo(() => {
//     const n = Number(sp.get("m") ?? "0");
//     return Number.isFinite(n) && n > 0 ? n : undefined;
//   }, [sp]);
//   const masterId = useMemo(() => (sp.get("masterId") ?? "").trim(), [sp]);
//   const startAt = useMemo(() => (sp.get("startAt") ?? "").trim(), [sp]);

//   // поля формы
//   const [name, setName] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [email, setEmail] = useState<string>("");
//   const [birthDate, setBirthDate] = useState<string>(""); // YYYY-MM-DD
//   const [notes, setNotes] = useState<string>("");

//   const [busy, setBusy] = useState(false);
//   const [err, setErr] = useState<string | null>(null);
//   const [okLabel, setOkLabel] = useState<string | null>(null);

//   // валидация обязательных значений из URL и формы
//   const urlReady =
//     serviceSlug.length > 0 &&
//     masterId.length > 0 &&
//     startAt.length > 0 &&
//     isIsoDate(startAt);

//   const formReady = name.trim().length > 0;

//   const canSubmit = urlReady && formReady && !busy;

//   async function submit() {
//     if (!canSubmit) return;

//     setBusy(true);
//     setErr(null);
//     setOkLabel(null);

//     // формируем новый контракт без any/unknown
//     const payload: NewPayload = {
//       serviceSlug,
//       masterId,
//       startAt,
//       name: name.trim(),
//       ...(durationMin ? { durationMin } : {}),
//       ...(phone.trim() ? { phone: phone.trim() } : {}),
//       ...(email.trim() ? { email: email.trim() } : {}),
//       ...(notes.trim() ? { notes: notes.trim() } : {}),
//       ...(birthDate && isYmd(birthDate) ? { birthDate } : {}),
//     };

//     try {
//       const res = await fetch("/api/appointments", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify(payload),
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         // читаем тело строго по типу ошибки
//         const j: PostErr = await res.json();
//         if (res.status === 409) {
//           setErr("Увы, этот слот уже занят. Выберите другое время.");
//         } else if (res.status === 404 && j.error === "Service not found or inactive") {
//           setErr("Услуга не найдена или отключена.");
//         } else if (res.status === 400 && j.error === "Invalid body") {
//           setErr("Заполните обязательные поля (услуга, мастер, время, имя).");
//         } else if (res.status === 400 && j.error === "This master does not provide the selected service") {
//           setErr("Выбранный мастер не оказывает эту услугу.");
//         } else {
//           setErr(j.error || "Ошибка создания записи");
//         }
//         return;
//       }

//       const j: PostOk = await res.json();
//       setOkLabel(j.label);

//       // при желании — редирект на страницу успеха
//       // router.replace(`/booking/success?id=${j.booking.id}`);
//     } catch (e) {
//       setErr(e instanceof Error ? e.message : "Сбой сети");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div className="max-w-xl space-y-6">
//       <h1 className="text-xl font-semibold">Онлайн-запись</h1>

//       {!urlReady && (
//         <div className="text-sm text-red-600">
//           В ссылке не хватает данных. Вернитесь и выберите услугу, мастера и время.
//         </div>
//       )}

//       {err && <div className="text-sm text-red-600">{err}</div>}

//       {okLabel && (
//         <div className="text-sm rounded-lg bg-green-600/10 text-green-700 p-3">
//           Запись создана: {okLabel}.
//         </div>
//       )}

//       <div className="grid grid-cols-1 gap-3">
//         <input
//           className="rounded-xl px-3 py-2 ring-1 ring-black/10 bg-white/90 text-black"
//           placeholder="Как вас зовут *"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />

//         <input
//           className="rounded-xl px-3 py-2 ring-1 ring-black/10 bg-white/90 text-black"
//           placeholder="Телефон"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//         />

//         <input
//           type="email"
//           className="rounded-xl px-3 py-2 ring-1 ring-black/10 bg-white/90 text-black"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="date"
//           className="rounded-xl px-3 py-2 ring-1 ring-black/10 bg-white/90 text-black"
//           placeholder="Дата рождения (YYYY-MM-DD)"
//           value={birthDate}
//           onChange={(e) => setBirthDate(e.target.value)}
//         />

//         <textarea
//           className="rounded-xl px-3 py-2 ring-1 ring-black/10 bg-white/90 text-black"
//           placeholder="Комментарий"
//           rows={3}
//           value={notes}
//           onChange={(e) => setNotes(e.target.value)}
//         />
//       </div>

//       <button
//         disabled={!canSubmit}
//         onClick={submit}
//         className="rounded-full bg-black text-white px-5 py-2 disabled:opacity-50"
//       >
//         {busy ? "Отправка…" : "Подтвердить запись"}
//       </button>
//     </div>
//   );
// }








// // src/app/booking/(steps)/client/page.tsx
// "use client";

// import { useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import { checkout } from "../../actions";

// // страница не будет пререндериться статически (устраняет build-ошибку)
// export const dynamic = "force-dynamic";

// // строгая типизация ответа fetch
// type JsonOk = { ok: true; sentTo?: string | null; draftId?: string | null };
// type JsonErr = { ok: false; error: string };

// export default function ClientPage() {
//   return (
//     <Suspense fallback={<div className="px-4 py-6 text-sm text-white/60">Загрузка шага клиента…</div>}>
//       <ClientStepInner />
//     </Suspense>
//   );
// }

// function ClientStepInner() {
//   const sp = useSearchParams();
//   const payload = {
//     masterId: sp.get("mid") ?? "",
//     serviceIds: (sp.get("s") ?? "").split(",").filter(Boolean),
//     startAt: sp.get("start") ?? "",
//   };

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [agree, setAgree] = useState(false);

//   // OTP UI
//   const [otpPhase, setOtpPhase] = useState<"idle" | "sent">("idle");
//   const [otp, setOtp] = useState("");
//   const [draftId, setDraftId] = useState<string>("");

//   const [msg, setMsg] = useState<string | null>(null);
//   const [busy, setBusy] = useState(false);

//   async function sendOtp(emailVal: string, draft: string) {
//     const res = await fetch("/api/booking/verify/email", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: emailVal, draftId: draft }),
//     });
//     const data = (await res.json()) as JsonOk | JsonErr;
//     if (!data.ok) throw new Error(data.error);
//     return data;
//   }

//   async function confirmOtp(emailVal: string, code: string, draft: string) {
//     const res = await fetch("/api/booking/verify/email/confirm", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email: emailVal, code, draftId: draft }),
//     });
//     const data = (await res.json()) as JsonOk | JsonErr;
//     if (!data.ok) throw new Error(data.error);
//     return data;
//   }

//   const onSubmit = async () => {
//     setMsg(null);
//     setBusy(true);
//     try {
//       // 1) создаём черновик (PENDING) и возвращаем draftId
//       const r = await checkout({
//         ...payload,
//         client: { name, email, phone },
//       });
//       if (!r.ok) throw new Error(r.error);

//       const draft = r.data.draftId;
//       setDraftId(draft);

//       // 2) отправляем OTP на email
//       await sendOtp(email, draft);

//       // 3) показываем поле ввода кода
//       setOtpPhase("sent");
//     } catch (e) {
//       const text = e instanceof Error ? e.message : "Ошибка отправки";
//       setMsg(text);
//     } finally {
//       setBusy(false);
//     }
//   };

//   const onConfirm = async () => {
//     setMsg(null);
//     setBusy(true);
//     try {
//       await confirmOtp(email, otp, draftId);
//       // успех — переходим к оплате
//       const qp = new URLSearchParams(Array.from(sp.entries()));
//       qp.set("draft", draftId);
//       window.location.assign(`/booking/payment?${qp.toString()}`);
//     } catch (e) {
//       const text = e instanceof Error ? e.message : "Ошибка подтверждения";
//       setMsg(text);
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Форма клиента */}
//       <div className="grid gap-3">
//         <input
//           className="w-full rounded-xl ring-1 ring-black/10 px-3 py-2"
//           placeholder="Имя"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <input
//           className="w-full rounded-xl ring-1 ring-black/10 px-3 py-2"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           type="email"
//         />
//         <input
//           className="w-full rounded-xl ring-1 ring-black/10 px-3 py-2"
//           placeholder="Телефон"
//           value={phone}
//           onChange={(e) => setPhone(e.target.value)}
//         />
//         <label className="flex items-center gap-2 text-sm">
//           <input
//             type="checkbox"
//             checked={agree}
//             onChange={(e) => setAgree(e.target.checked)}
//           />{" "}
//           Согласие на обработку данных
//         </label>
//       </div>

//       {/* Сообщение/ошибка */}
//       {msg && <p className="text-sm text-red-600">{msg}</p>}

//       {/* Кнопки */}
//       {otpPhase === "idle" && (
//         <div className="flex justify-end">
//           <button
//             disabled={!agree || busy}
//             onClick={onSubmit}
//             className="rounded-full bg-black text-white px-5 py-2 disabled:opacity-50"
//           >
//             {busy ? "Отправка…" : "Записаться"}
//           </button>
//         </div>
//       )}

//       {otpPhase === "sent" && (
//         <div className="rounded-2xl ring-1 ring-black/10 p-4 bg-white/70 dark:bg-neutral-800/60">
//           <div className="text-sm mb-2">
//             Мы отправили код подтверждения на <b>{email}</b>. Введите его ниже.
//           </div>
//           <div className="flex items-center gap-2">
//             <input
//               className="w-40 rounded-xl ring-1 ring-black/10 px-3 py-2 text-center tracking-widest"
//               placeholder="Код (6 цифр)"
//               value={otp}
//               maxLength={6}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//             />
//             <button
//               disabled={busy || otp.length !== 6}
//               onClick={onConfirm}
//               className="rounded-full bg-black text-white px-5 py-2 disabled:opacity-50"
//             >
//               {busy ? "Проверяем…" : "Подтвердить"}
//             </button>
//           </div>
//           <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-300">
//             Код действует 10 минут.{" "}
//             <button
//               className="underline"
//               onClick={async () => {
//                 try {
//                   setBusy(true);
//                   await sendOtp(email, draftId);
//                   setMsg("Код повторно отправлен.");
//                 } catch (e) {
//                   const text = e instanceof Error ? e.message : "Не удалось отправить код";
//                   setMsg(text);
//                 } finally {
//                   setBusy(false);
//                 }
//               }}
//             >
//               Отправить ещё раз
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
