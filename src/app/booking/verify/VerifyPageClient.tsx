// src/app/booking/verify/VerifyPageClient.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type VerificationMethod = 'email' | 'google' | 'telegram' | 'whatsapp';

type VerifyResponse =
  | {
      ok: true;
      message: string;
      appointmentId: string;
    }
  | {
      ok: false;
      error: string;
    };

export default function VerifyPageClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const draftId = searchParams.get('draft') ?? '';
  const email = searchParams.get('email') ?? '';

  const [selectedMethod, setSelectedMethod] =
    React.useState<VerificationMethod>('email');
  const [code, setCode] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // защита от повторных запросов
  const sendingRef = React.useRef(false);
  const verifyingRef = React.useRef(false);

  const handleSendCode = async (): Promise<void> => {
    if (!email) {
      setError('Email не указан');
      return;
    }

    if (sendingRef.current) {
      console.log('[OTP] Запрос уже отправляется, пропускаем дубликат');
      return;
    }

    sendingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/booking/verify/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, draftId }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
        devCode?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось отправить код');
      }

      setCodeSent(true);
      setSuccess(`Код отправлен на ${email}`);

      if (data.devCode) {
        console.log(`[DEV] Код для тестирования: ${data.devCode}`);
        setSuccess(
          `Код отправлен на ${email}. Dev код: ${data.devCode}`,
        );
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Ошибка отправки кода';
      setError(msg);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!code || code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    if (verifyingRef.current) {
      console.log(
        '[OTP] Проверка уже выполняется, пропускаем дубликат',
      );
      return;
    }

    verifyingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/booking/verify/email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, draftId }),
      });

      const data: VerifyResponse = await res.json();

      // сначала проверяем HTTP-статус
      if (!res.ok) {
        throw new Error('Ошибка сети при проверке кода');
      }

      // затем уже бизнес-логику
      if (!data.ok) {
        // здесь TypeScript уже знает, что data — ветка с error
        throw new Error(data.error || 'Неверный код');
      }

      // здесь TypeScript знает, что data.ok === true
      const appointmentId = data.appointmentId;

      if (!appointmentId) {
        throw new Error(
          'Не удалось получить идентификатор записи (appointmentId)',
        );
      }

      setSuccess('Верификация успешна! Переход к оплате...');

      // передаём appointmentId, а не draftId
      setTimeout(() => {
        router.push(
          `/booking/payment?appointment=${encodeURIComponent(
            appointmentId,
          )}`,
        );
      }, 1000);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Ошибка проверки кода';
      setError(msg);
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleMethodSelect = (method: VerificationMethod): void => {
    setSelectedMethod(method);
    setCodeSent(false);
    setCode('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">
        Подтверждение личности
      </h2>

      {/* Методы верификации */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-medium">
          Выберите способ подтверждения:
        </h3>

        <div className="grid gap-3">
          {/* Email */}
          <button
            type="button"
            onClick={() => handleMethodSelect('email')}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition
              ${
                selectedMethod === 'email'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-200'
                  : 'border-border hover:border-indigo-300'
              }`}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
              📧
            </div>
            <div className="flex-1">
              <div className="font-medium">Email</div>
              <div className="text-sm text-muted-foreground">
                Получить код на почту
              </div>
            </div>
            {selectedMethod === 'email' && (
              <div className="flex size-5 items-center justify-center rounded-full bg-indigo-600">
                <svg
                  className="size-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>

          {/* Остальные методы — заглушки */}
          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
              🔐
            </div>
            <div className="flex-1">
              <div className="font-medium">Google</div>
              <div className="text-sm text-muted-foreground">
                Скоро будет доступно
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
              ✈️
            </div>
            <div className="flex-1">
              <div className="font-medium">Telegram</div>
              <div className="text-sm text-muted-foreground">
                Скоро будет доступно
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
              💬
            </div>
            <div className="flex-1">
              <div className="font-medium">WhatsApp</div>
              <div className="text-sm text-muted-foreground">
                Скоро будет доступно
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Email верификация */}
      {selectedMethod === 'email' && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-medium">
            Подтверждение через Email
          </h3>

          {!codeSent ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ваш email:
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-muted-foreground"
                />
              </div>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || !email}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Отправить код'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Введите 6-значный код:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="000000"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Проверка...' : 'Подтвердить код'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setCode('');
                  setError(null);
                  setSuccess(null);
                }}
                disabled={loading}
                className="w-full rounded-xl border border-border px-5 py-2 font-medium text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Отправить код повторно
              </button>
            </div>
          )}
        </div>
      )}

      {/* Сообщения */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-emerald-500 bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          ✓ {success}
        </div>
      )}

      {/* Нижняя панель навигации */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Назад
          </button>

          <div className="text-sm text-muted-foreground">
            Шаг 5 из 6
          </div>
        </div>
      </div>
    </div>
  );
}



// 'use client';

// import * as React from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// type VerificationMethod = 'email' | 'google' | 'telegram' | 'whatsapp';

// export default function VerifyPageClient(): React.JSX.Element {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const draftId = searchParams.get('draft') ?? '';
//   const email = searchParams.get('email') ?? '';

//   const [selectedMethod, setSelectedMethod] = React.useState<VerificationMethod>('email');
//   const [code, setCode] = React.useState('');
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [success, setSuccess] = React.useState<string | null>(null);

//   // ✅ ДОБАВЛЕНО: защита от повторных запросов
//   const sendingRef = React.useRef(false);
//   const verifyingRef = React.useRef(false);

//   const handleSendCode = async (): Promise<void> => {
//     if (!email) {
//       setError('Email не указан');
//       return;
//     }

//     // ✅ ЗАЩИТА: если уже отправляется, игнорируем
//     if (sendingRef.current) {
//       console.log('[OTP] Запрос уже отправляется, пропускаем дубликат');
//       return;
//     }

//     sendingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/booking/verify/email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = await res.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Не удалось отправить код');
//       }

//       setCodeSent(true);
//       setSuccess(`Код отправлен на ${email}`);

//       // ✅ ДОБАВЛЕНО: показываем код в dev режиме
//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
//         setSuccess(`Код отправлен на ${email}. Dev код: ${data.devCode}`);
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : 'Ошибка отправки кода';
//       setError(msg);
//     } finally {
//       setLoading(false);
//       sendingRef.current = false;
//     }
//   };

//   const handleVerifyCode = async (): Promise<void> => {
//     if (!code || code.length !== 6) {
//       setError('Введите 6-значный код');
//       return;
//     }

//     // ✅ ЗАЩИТА: если уже проверяется, игнорируем
//     if (verifyingRef.current) {
//       console.log('[OTP] Проверка уже выполняется, пропускаем дубликат');
//       return;
//     }

//     verifyingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/booking/verify/email/confirm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, code, draftId }),
//       });

//       const data = await res.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('Верификация успешна! Переход к оплате...');

//       // Переход к оплате
//       setTimeout(() => {
//         router.push(`/booking/payment?draft=${encodeURIComponent(draftId)}`);
//       }, 1000);
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : 'Ошибка проверки кода';
//       setError(msg);
//     } finally {
//       setLoading(false);
//       verifyingRef.current = false;
//     }
//   };

//   const handleMethodSelect = (method: VerificationMethod): void => {
//     setSelectedMethod(method);
//     setCodeSent(false);
//     setCode('');
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="mx-auto max-w-2xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Подтверждение личности</h2>

//       {/* Методы верификации */}
//       <div className="mt-6 rounded-xl border border-border bg-card p-6">
//         <h3 className="mb-4 font-medium">Выберите способ подтверждения:</h3>

//         <div className="grid gap-3">
//           {/* Email */}
//           <button
//             type="button"
//             onClick={() => handleMethodSelect('email')}
//             className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition
//               ${selectedMethod === 'email'
//                 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-200'
//                 : 'border-border hover:border-indigo-300'}`}
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
//               📧
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Email</div>
//               <div className="text-sm text-muted-foreground">Получить код на почту</div>
//             </div>
//             {selectedMethod === 'email' && (
//               <div className="size-5 rounded-full bg-indigo-600 flex items-center justify-center">
//                 <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//             )}
//           </button>

//           {/* Google - Заглушка */}
//           <button
//             type="button"
//             disabled
//             className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50 cursor-not-allowed"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               🔐
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Google</div>
//               <div className="text-sm text-muted-foreground">Скоро будет доступно</div>
//             </div>
//           </button>

//           {/* Telegram - Заглушка */}
//           <button
//             type="button"
//             disabled
//             className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50 cursor-not-allowed"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               ✈️
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Telegram</div>
//               <div className="text-sm text-muted-foreground">Скоро будет доступно</div>
//             </div>
//           </button>

//           {/* WhatsApp - Заглушка */}
//           <button
//             type="button"
//             disabled
//             className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50 cursor-not-allowed"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               💬
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">WhatsApp</div>
//               <div className="text-sm text-muted-foreground">Скоро будет доступно</div>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Email верификация */}
//       {selectedMethod === 'email' && (
//         <div className="mt-6 rounded-xl border border-border bg-card p-6">
//           <h3 className="mb-4 font-medium">Подтверждение через Email</h3>

//           {!codeSent ? (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Ваш email:</label>
//                 <input
//                   type="email"
//                   value={email}
//                   disabled
//                   className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-muted-foreground"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleSendCode}
//                 disabled={loading || !email}
//                 className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Отправка...' : 'Отправить код'}
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Введите 6-значный код:</label>
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={6}
//                   value={code}
//                   onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
//                   placeholder="000000"
//                   className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl font-mono tracking-widest"
//                   autoFocus
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleVerifyCode}
//                 disabled={loading || code.length !== 6}
//                 className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Проверка...' : 'Подтвердить код'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setCodeSent(false);
//                   setCode('');
//                   setError(null);
//                   setSuccess(null);
//                 }}
//                 disabled={loading}
//                 className="w-full rounded-xl border border-border px-5 py-2 font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Отправить код повторно
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Сообщения */}
//       {error && (
//         <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="mt-4 rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
//           ✓ {success}
//         </div>
//       )}

//       {/* Нижняя панель навигации */}
//       <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Назад
//           </button>

//           <div className="text-sm text-muted-foreground">
//             Шаг 5 из 6
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
