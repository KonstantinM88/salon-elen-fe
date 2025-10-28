'use client';

import * as React from 'react';
import { JSX, Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type PostResult =
  | { ok: true; id: string }
  | { ok: false; status: number; code: string };

function formatCurrencyEUR(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Избегаем жалобы Next.js на отсутствие Suspense вокруг useSearchParams:
 * сам хук используется внутри ConfirmInner, а страница возвращает Suspense boundary.
 */
export default function ConfirmPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-12">Загрузка данных записи…</div>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}

function ConfirmInner(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  // Вытаскиваем входные параметры из query
  const serviceIds = useMemo<string[]>(() => {
    const all = params.getAll('s').filter(Boolean);
    // Удалим дубли, сохраним порядок
    const seen = new Set<string>();
    const uniq: string[] = [];
    for (const id of all) {
      if (!seen.has(id)) {
        seen.add(id);
        uniq.push(id);
      }
    }
    return uniq;
  }, [params]);

  const masterId = params.get('m') ?? undefined;
  const startISO = params.get('start') ?? undefined;
  const endISO = params.get('end') ?? undefined;

  // Валидация наличия обязательных параметров URL
  const urlError = useMemo<string | null>(() => {
    if (serviceIds.length === 0) return 'Не выбраны услуги.';
    if (!masterId) return 'Не выбран мастер.';
    if (!startISO) return 'Не выбрано время начала.';
    return null;
  }, [serviceIds, masterId, startISO]);

  // Локальная форма клиента
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Состояния отправки
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!startISO) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        serviceIds,
        masterId,
        startAt: startISO,
        endAt: endISO,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!res.ok) {
        const code =
          (await res.json().catch(() => ({} as { error?: string }))).error ??
          'unknown_error';
        const fail: PostResult = { ok: false, status: res.status, code };
        onPostFailed(fail);
        return;
      }

      const data = (await res.json()) as { id: string };
      const success: PostResult = { ok: true, id: data.id };
      onPostSuccess(success);
    } catch {
      setSubmitError('Не удалось отправить заявку. Проверьте подключение и повторите попытку.');
    } finally {
      setSubmitting(false);
    }
  }, [customerName, email, endISO, masterId, notes, phone, serviceIds, startISO]);

  function onPostSuccess(_r: { ok: true; id: string }): void {
    // После успешного создания можно вести в личный кабинет или на главную.
    router.replace('/'); // при необходимости поменяйте на страницу кабинета
  }

  function onPostFailed(r: { ok: false; status: number; code: string }): void {
    // Читаемые сообщения для известных кодов API
    const map: Record<string, string> = {
      contact_required: 'Заполните имя и телефон.',
      service_required: 'Не выбран ни один сервис.',
      startAt_required: 'Не выбрано время начала.',
      duration_invalid: 'Невалидная суммарная длительность.',
      endAt_invalid: 'Невалидное время окончания.',
      split_required:
        'Выбранный мастер не выполняет часть услуг. Разделите заказ на несколько записей.',
      time_overlaps:
        'Выбранный слот уже занят. Вернитесь к календарю и выберите другое время.',
    };
    setSubmitError(map[r.code] ?? `Ошибка создания записи (${r.status}).`);
  }

  // UI
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <h1 className="mt-6 text-2xl font-semibold">Подтверждение записи</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">
        Проверьте данные и укажите контакты
      </h2>

      {urlError && (
        <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {urlError}
        </div>
      )}

      {!urlError && (
        <>
          <section className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Мастер: </span>
                <span className="font-medium">{masterId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Услуги: </span>
                <span className="font-medium">{serviceIds.join(', ')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Начало: </span>
                <span className="font-medium">{formatDateTimeLocal(startISO!)}</span>
              </div>
              {endISO && (
                <div>
                  <span className="text-muted-foreground">Окончание: </span>
                  <span className="font-medium">{formatDateTimeLocal(endISO)}</span>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="name">
                  Имя клиента
                </label>
                <input
                  id="name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="Имя и фамилия"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="phone">
                  Телефон
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="+49 ..."
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="name@example.com"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="notes">
                  Комментарий
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[90px] rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="Пожелания к визиту"
                />
              </div>

              {submitError && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-destructive">
                  {submitError}
                </div>
              )}
            </div>
          </section>

          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
              <Link
                href={{
                  pathname: '/booking/calendar',
                  query: {
                    m: masterId!,
                    ...(serviceIds.length > 0
                      ? Object.fromEntries(serviceIds.map((s) => ['s', s]))
                      : {}),
                  },
                }}
                className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Назад к календарю
              </Link>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !customerName.trim() || !phone.trim()}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                  submitting || !customerName.trim() || !phone.trim()
                    ? 'pointer-events-none bg-muted text-muted-foreground'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {submitting ? 'Отправляем…' : 'Подтвердить запись'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}





// 'use client';

// import * as React from 'react';
// import Link from 'next/link';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { JSX } from 'react';

// type CreateOk = {
//   id: string;
//   startAt: string;
//   endAt: string;
//   status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
//   masterId: string;
// };

// type CreateErr =
//   | 'service_required'
//   | 'contact_required'
//   | 'startAt_invalid'
//   | 'startAt_past'
//   | 'duration_invalid'
//   | 'split_required'
//   | 'time_overlaps'
//   | 'unknown';

// type PostResult =
//   | { ok: true; data: CreateOk }
//   | { ok: false; error: CreateErr; message?: string };

// type Referral = 'google' | 'facebook' | 'instagram' | 'friends' | 'other';
// type Payment = 'card' | 'paypal' | 'cash';

// function usePayloadFromQuery(): {
//   serviceIds: string[];
//   masterId: string | null;
//   start: string | null;
//   end: string | null;
//   totalCents: number | null;
// } {
//   const params = useSearchParams();
//   const serviceIds = React.useMemo(
//     () => Array.from(new Set(new URLSearchParams(params.toString()).getAll('s').filter(Boolean))),
//     [params]
//   );
//   const masterId = params.get('m');
//   const start = params.get('start');
//   const end = params.get('end');
//   const totalCents = (() => {
//     const v = params.get('totalCents');
//     if (!v) return null;
//     const n = Number(v);
//     return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
//   })();
//   return { serviceIds, masterId, start, end, totalCents };
// }

// function isAbortError(e: unknown): boolean {
//   return typeof e === 'object' && e !== null && (e as { name?: unknown }).name === 'AbortError';
// }

// export default function ConfirmStepPage(): JSX.Element {
//   const router = useRouter();
//   const { serviceIds, masterId, start, end, totalCents } = usePayloadFromQuery();

//   // контакты
//   const [customerName, setCustomerName] = React.useState<string>('');
//   const [phone, setPhone] = React.useState<string>('');
//   const [email, setEmail] = React.useState<string>('');
//   const [emailOk, setEmailOk] = React.useState<boolean | null>(null);
//   const [birthDate, setBirthDate] = React.useState<string>(''); // YYYY-MM-DD
//   const [referral, setReferral] = React.useState<Referral>('google');
//   const [referralOther, setReferralOther] = React.useState<string>('');
//   const [payment, setPayment] = React.useState<Payment>('card');
//   const [notes, setNotes] = React.useState<string>('');

//   const [submitting, setSubmitting] = React.useState<boolean>(false);
//   const [checkingEmail, setCheckingEmail] = React.useState<boolean>(false);
//   const [error, setError] = React.useState<string | null>(null);

//   const durationMin: number | null = React.useMemo(() => {
//     if (!start || !end) return null;
//     const a = Date.parse(start);
//     const b = Date.parse(end);
//     if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return null;
//     return Math.round((b - a) / 60000);
//   }, [start, end]);

//   const canSubmit =
//     serviceIds.length > 0 &&
//     Boolean(masterId) &&
//     Boolean(start) &&
//     customerName.trim().length > 1 &&
//     phone.trim().length > 5 &&
//     birthDate.length === 10 && // минимальная проверка формата YYYY-MM-DD
//     (email === '' || emailOk === true); // e-mail либо пустой, либо подтвержден

//   async function verifyEmailSandbox(): Promise<void> {
//     if (email.trim() === '') {
//       setEmailOk(null);
//       return;
//     }
//     setCheckingEmail(true);
//     setEmailOk(null);
//     try {
//       const res = await fetch(`/api/email/verify?email=${encodeURIComponent(email)}`, {
//         method: 'GET',
//         cache: 'no-store',
//       });
//       const ok = res.ok ? await res.json() : { valid: false };
//       setEmailOk(Boolean(ok?.valid));
//     } catch {
//       setEmailOk(false);
//     } finally {
//       setCheckingEmail(false);
//     }
//   }

//   async function createAppointment(): Promise<PostResult> {
//     try {
//       const res = await fetch('/api/appointments', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         cache: 'no-store',
//         body: JSON.stringify({
//           serviceIds,
//           masterId,
//           startAt: start,
//           customerName,
//           phone,
//           notes: [
//             notes,
//             `DOB:${birthDate}`,
//             `REF:${referral}${referral === 'other' && referralOther ? `(${referralOther})` : ''}`,
//             email ? `EMAIL:${email}` : null,
//             `PAY:${payment}`,
//             totalCents !== null ? `TOTAL:${totalCents}` : null,
//           ]
//             .filter(Boolean)
//             .join(' | '),
//         }),
//       });

//       if (res.ok) {
//         const data: CreateOk = await res.json();
//         return { ok: true, data };
//       }

//       const json = await res.json().catch(() => null as unknown);
//       const errCode =
//         json && typeof json === 'object' && 'error' in (json as Record<string, unknown>)
//           ? String((json as { error: unknown }).error)
//           : 'unknown';
//       return { ok: false, error: errCode as CreateErr };
//     } catch (e: unknown) {
//       if (isAbortError(e)) return { ok: false, error: 'unknown', message: 'Отмена запроса' };
//       return { ok: false, error: 'unknown', message: 'Сбой сети' };
//     }
//   }

//   async function onSubmit(ev: React.FormEvent<HTMLFormElement>): Promise<void> {
//     ev.preventDefault();
//     if (!canSubmit) return;

//     setSubmitting(true);
//     setError(null);
//     const result = await createAppointment();
//     setSubmitting(false);

//     if (result.ok) {
//       // здесь включите интеграцию с оплатой: переадресация на платеж или на success
//       router.replace(`/booking/success?id=${encodeURIComponent(result.data.id)}`);
//       return;
//     }

//     const map: Record<CreateErr, string> = {
//       service_required: 'Не переданы услуги.',
//       contact_required: 'Укажите имя и телефон.',
//       startAt_invalid: 'Неверная дата/время начала.',
//       startAt_past: 'Нельзя записаться в прошедшее время.',
//       duration_invalid: 'Некорректная длительность услуг.',
//       split_required: 'Выбран набор услуг, требующий раздельной записи.',
//       time_overlaps: 'Это время уже занято. Выберите другой слот.',
//       unknown: 'Не удалось создать запись.',
//     };
//     setError(map[result.error]);
//   }

//   const amount = React.useMemo(
//     () => (totalCents !== null ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalCents / 100) : '—'),
//     [totalCents]
//   );

//   return (
//     <div className="mx-auto max-w-3xl px-4 pb-24">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Подтверждение</h2>

//       <div className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 text-sm">
//         <div>Услуг: <b>{serviceIds.length}</b></div>
//         <div>Мастер: <b>{masterId ?? '—'}</b></div>
//         <div>Начало: <b>{start ?? '—'}</b></div>
//         <div>Окончание: <b>{end ?? '—'}</b></div>
//         <div>Длительность: <b>{durationMin ?? '—'} мин</b></div>
//         <div>Сумма: <b className="text-foreground">{amount}</b></div>
//       </div>

//       <form onSubmit={onSubmit} className="mt-6 grid gap-4">
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1 block text-sm">Ваше имя</label>
//             <input
//               type="text"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.currentTarget.value)}
//               className="w-full rounded-xl border border-border bg-background px-3 py-2"
//               required
//             />
//           </div>
//           <div>
//             <label className="mb-1 block text-sm">Телефон</label>
//             <input
//               type="tel"
//               value={phone}
//               onChange={(e) => setPhone(e.currentTarget.value)}
//               className="w-full rounded-xl border border-border bg-background px-3 py-2"
//               required
//             />
//           </div>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1 block text-sm">E-mail (для подтверждения)</label>
//             <div className="flex gap-2">
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => {
//                   setEmail(e.currentTarget.value);
//                   setEmailOk(null);
//                 }}
//                 className="w-full rounded-xl border border-border bg-background px-3 py-2"
//                 placeholder="optional@example.com"
//               />
//               <button
//                 type="button"
//                 onClick={verifyEmailSandbox}
//                 disabled={checkingEmail || email.trim() === ''}
//                 className="rounded-xl border px-3 py-2 text-sm"
//               >
//                 {checkingEmail ? 'Проверка…' : 'Проверить'}
//               </button>
//             </div>
//             {emailOk === true && <div className="mt-1 text-xs text-emerald-500">E-mail подтвержден</div>}
//             {emailOk === false && <div className="mt-1 text-xs text-destructive">E-mail не прошел проверку</div>}
//           </div>

//           <div>
//             <label className="mb-1 block text-sm">Дата рождения</label>
//             <input
//               type="date"
//               value={birthDate}
//               onChange={(e) => setBirthDate(e.currentTarget.value)}
//               className="w-full rounded-xl border border-border bg-background px-3 py-2"
//               required
//             />
//           </div>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <div>
//             <label className="mb-1 block text-sm">Как узнали о нас</label>
//             <select
//               value={referral}
//               onChange={(e) => setReferral(e.currentTarget.value as Referral)}
//               className="w-full rounded-xl border border-border bg-background px-3 py-2"
//             >
//               <option value="google">Google</option>
//               <option value="facebook">Facebook</option>
//               <option value="instagram">Instagram</option>
//               <option value="friends">Знакомые</option>
//               <option value="other">Другое</option>
//             </select>
//             {referral === 'other' && (
//               <input
//                 type="text"
//                 value={referralOther}
//                 onChange={(e) => setReferralOther(e.currentTarget.value)}
//                 className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2"
//                 placeholder="Уточните"
//               />
//             )}
//           </div>

//           <div>
//             <label className="mb-1 block text-sm">Способ оплаты</label>
//             <div className="grid grid-cols-3 gap-2">
//               <label className="flex items-center gap-2 text-sm">
//                 <input type="radio" checked={payment === 'card'} onChange={() => setPayment('card')} /> Карта
//               </label>
//               <label className="flex items-center gap-2 text-sm">
//                 <input type="radio" checked={payment === 'paypal'} onChange={() => setPayment('paypal')} /> PayPal
//               </label>
//               <label className="flex items-center gap-2 text-sm">
//                 <input type="radio" checked={payment === 'cash'} onChange={() => setPayment('cash')} /> Наличные
//               </label>
//             </div>
//           </div>
//         </div>

//         <div>
//           <label className="mb-1 block text-sm">Пожелания</label>
//           <textarea
//             value={notes}
//             onChange={(e) => setNotes(e.currentTarget.value)}
//             className="w-full rounded-xl border border-border bg-background px-3 py-2"
//             rows={3}
//           />
//         </div>

//         {error && (
//           <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-destructive">
//             {error}
//           </div>
//         )}

//         <div className="mt-2 flex items-center justify-between">
//           <Link
//             href={`/booking/calendar?${serviceIds.map((s) => `s=${encodeURIComponent(s)}`).join('&')}${masterId ? `&m=${encodeURIComponent(masterId)}` : ''}`}
//             className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Назад
//           </Link>

//           <button
//             type="submit"
//             disabled={!canSubmit || submitting}
//             className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
//               !canSubmit || submitting
//                 ? 'pointer-events-none bg-muted text-muted-foreground'
//                 : 'bg-indigo-600 text-white hover:bg-indigo-500'
//             }`}
//           >
//             {submitting ? 'Создаем…' : 'Подтвердить запись'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

