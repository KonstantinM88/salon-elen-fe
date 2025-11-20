// src/app/booking/payment/page.tsx
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type PaymentMethod = 'card' | 'paypal' | 'cash';

type PaymentResponse =
  | {
      ok: true;
      message: string;
      paymentUrl?: string | null;
    }
  | {
      ok: false;
      error: string;
    };

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'card',
    name: 'Банковская карта',
    description: 'Visa, Mastercard',
    icon: '💳',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Быстрая оплата через PayPal',
    icon: '🅿️',
  },
  {
    id: 'cash',
    name: 'Наличные',
    description: 'Оплата в салоне',
    icon: '💵',
  },
];

function PaymentContent(): React.JSX.Element {
  const params = useSearchParams();
  const router = useRouter();

  // ⬇️ ТЕПЕРЬ ЧИТАЕМ appointment из URL
  const appointmentId = params.get('appointment') ?? '';

  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    if (!selectedMethod || !appointmentId) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/booking/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,          // ⬅️ ВАЖНО: отправляем appointmentId
          paymentMethod: selectedMethod,
        }),
      });

      const data = (await res.json()) as PaymentResponse;

      if (!res.ok || !data.ok) {
        throw new Error(
          ('error' in data && data.error) ||
            'Ошибка обработки платежа',
        );
      }

      // Если карта или PayPal — пробуем перейти по paymentUrl
      if (
        (selectedMethod === 'card' || selectedMethod === 'paypal') &&
        'paymentUrl' in data &&
        data.paymentUrl
      ) {
        window.location.href = data.paymentUrl;
        return;
      }

      // Наличные или заглушка для онлайн-оплаты → сразу подтверждение
      router.push(
        `/booking/confirmation?id=${encodeURIComponent(
          appointmentId,
        )}`,
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Ошибка обработки оплаты';
      setError(message);
    } finally {
      setProcessing(false);
    }
  }

  // Если нет appointmentId в URL
  if (!appointmentId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">
            Некорректные параметры. Ссылка на оплату устарела или неверна.
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-block text-sm underline"
          >
            Начать запись заново
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Способ оплаты</h1>
      <p className="mb-6 text-muted-foreground">
        Выберите удобный способ оплаты услуг
      </p>

      <div className="mb-6 space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full rounded-lg border p-4 text-left transition ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">{method.icon}</div>
              <div className="flex-1">
                <div className="font-medium">{method.name}</div>
                <div className="text-sm text-muted-foreground">
                  {method.description}
                </div>
              </div>
              {selectedMethod === method.id && (
                <div className="text-2xl text-primary">✓</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={processing}
          className="rounded-md border px-6 py-2 hover:bg-muted disabled:opacity-50"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedMethod || processing}
          className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {processing ? 'Обработка...' : 'Продолжить'}
        </button>
      </div>

      <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
        <p className="text-muted-foreground">
          🔒 <strong>Безопасная оплата.</strong> Все платежи защищены
          SSL-шифрованием. Данные вашей карты не хранятся на наших
          серверах.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border p-4">
          Загрузка...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}



// 'use client';

// import * as React from 'react';
// import { Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';

// type PaymentMethod = 'card' | 'paypal' | 'cash';

// type PaymentResponse =
//   | {
//       ok: true;
//       message: string;
//       paymentUrl?: string;
//     }
//   | {
//       error: string;
//     };

// const PAYMENT_METHODS = [
//   {
//     id: 'card' as PaymentMethod,
//     name: 'Банковская карта',
//     description: 'Visa, Mastercard, МИР',
//     icon: '💳',
//   },
//   {
//     id: 'paypal' as PaymentMethod,
//     name: 'PayPal',
//     description: 'Быстрая оплата через PayPal',
//     icon: '🅿️',
//   },
//   {
//     id: 'cash' as PaymentMethod,
//     name: 'Наличные',
//     description: 'Оплата в салоне',
//     icon: '💵',
//   },
// ];

// function PaymentContent(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   // ⬇️ ВАЖНО: теперь мы ждём appointment, а не draft
//   const appointmentId = params.get('appointment') ?? '';

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod | null>(null);
//   const [processing, setProcessing] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   async function handleSubmit(): Promise<void> {
//     if (!selectedMethod || !appointmentId) return;

//     setProcessing(true);
//     setError(null);

//     try {
//       const res = await fetch('/api/booking/payment', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           appointmentId,
//           paymentMethod: selectedMethod,
//         }),
//       });

//       const data: PaymentResponse = await res.json();

//       if (!res.ok || 'error' in data) {
//         throw new Error(
//           'error' in data
//             ? data.error
//             : 'Ошибка обработки платежа',
//         );
//       }

//       // Если выбрана карта или PayPal - редирект на платёжную систему (пока заглушка)
//       if (
//         selectedMethod === 'card' ||
//         selectedMethod === 'paypal'
//       ) {
//         if (data.paymentUrl) {
//           window.location.href = data.paymentUrl;
//           return;
//         }
//       }

//       // Наличные (или если нет paymentUrl) — сразу на страницу подтверждения
//       router.push(
//         `/booking/confirmation?id=${encodeURIComponent(
//           appointmentId,
//         )}`,
//       );
//     } catch (err) {
//       const msg =
//         err instanceof Error
//           ? err.message
//           : 'Ошибка обработки оплаты';
//       setError(msg);
//     } finally {
//       setProcessing(false);
//     }
//   }

//   if (!appointmentId) {
//     return (
//       <div className="mx-auto max-w-2xl px-4 py-8">
//         <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-destructive">
//             Некорректные параметры. Начните запись заново.
//           </p>
//           <Link
//             href="/booking"
//             className="mt-4 inline-block text-sm underline"
//           >
//             Вернуться к выбору услуг
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-2xl px-4 py-8">
//       <h1 className="mb-2 text-2xl font-semibold">
//         Способ оплаты
//       </h1>
//       <p className="mb-6 text-muted-foreground">
//         Выберите удобный способ оплаты услуг
//       </p>

//       <div className="mb-6 space-y-3">
//         {PAYMENT_METHODS.map((method) => (
//           <button
//             key={method.id}
//             onClick={() => setSelectedMethod(method.id)}
//             className={`w-full rounded-lg border p-4 text-left transition ${
//               selectedMethod === method.id
//                 ? 'border-primary bg-primary/5 ring-2 ring-primary'
//                 : 'border-border hover:border-primary/50'
//             }`}
//           >
//             <div className="flex items-center gap-4">
//               <div className="text-4xl">{method.icon}</div>
//               <div className="flex-1">
//                 <div className="font-medium">{method.name}</div>
//                 <div className="text-sm text-muted-foreground">
//                   {method.description}
//                 </div>
//               </div>
//               {selectedMethod === method.id && (
//                 <div className="text-2xl text-primary">✓</div>
//               )}
//             </div>
//           </button>
//         ))}
//       </div>

//       {error && (
//         <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-sm text-destructive">{error}</p>
//         </div>
//       )}

//       <div className="flex gap-3">
//         <button
//           onClick={() => router.back()}
//           disabled={processing}
//           className="rounded-md border px-6 py-2 hover:bg-muted disabled:opacity-50"
//         >
//           Назад
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={!selectedMethod || processing}
//           className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
//         >
//           {processing ? 'Обработка...' : 'Продолжить'}
//         </button>
//       </div>

//       {/* Информация о безопасности */}
//       <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
//         <p className="text-muted-foreground">
//           🔒 <strong>Безопасная оплата.</strong> Все платежи
//           защищены SSL-шифрованием. Данные вашей карты не
//           хранятся на наших серверах.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function PaymentPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-2xl rounded-lg border p-4">
//           Загрузка...
//         </div>
//       }
//     >
//       <PaymentContent />
//     </Suspense>
//   );
// }





// // src/app/booking/payment/page.tsx
// 'use client';

// import * as React from 'react';
// import { Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';

// type PaymentMethod = 'card' | 'paypal' | 'cash';

// const PAYMENT_METHODS = [
//   {
//     id: 'card' as PaymentMethod,
//     name: 'Банковская карта',
//     description: 'Visa, Mastercard, МИР',
//     icon: '💳',
//   },
//   {
//     id: 'paypal' as PaymentMethod,
//     name: 'PayPal',
//     description: 'Быстрая оплата через PayPal',
//     icon: '🅿️',
//   },
//   {
//     id: 'cash' as PaymentMethod,
//     name: 'Наличные',
//     description: 'Оплата в салоне',
//     icon: '💵',
//   },
// ];

// function PaymentContent(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const draftId = params.get('draft') ?? '';
//   const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod | null>(null);
//   const [processing, setProcessing] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);

//   async function handleSubmit(): Promise<void> {
//     if (!selectedMethod || !draftId) return;

//     setProcessing(true);
//     setError(null);

//     try {
//       // Обновляем запись с выбранным способом оплаты
//       const res = await fetch(`/api/booking/payment`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           draftId,
//           paymentMethod: selectedMethod,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || 'Ошибка обработки платежа');
//       }

//       // Если выбрана карта или PayPal - редирект на платежную систему
//       if (selectedMethod === 'card' || selectedMethod === 'paypal') {
//         const data = await res.json();
        
//         if (data.paymentUrl) {
//           // Редирект на платежную систему (Stripe, PayPal и т.д.)
//           window.location.href = data.paymentUrl;
//           return;
//         }
//       }

//       // Если наличные - сразу на страницу подтверждения
//       router.push(`/booking/confirmation?id=${draftId}`);
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Ошибка обработки оплаты';
//       setError(msg);
//     } finally {
//       setProcessing(false);
//     }
//   }

//   if (!draftId) {
//     return (
//       <div className="mx-auto max-w-2xl px-4 py-8">
//         <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-destructive">Некорректные параметры. Начните запись заново.</p>
//           <Link href="/booking" className="mt-4 inline-block text-sm underline">
//             Вернуться к выбору услуг
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-2xl px-4 py-8">
//       <h1 className="text-2xl font-semibold mb-2">Способ оплаты</h1>
//       <p className="text-muted-foreground mb-6">
//         Выберите удобный способ оплаты услуг
//       </p>

//       <div className="space-y-3 mb-6">
//         {PAYMENT_METHODS.map((method) => (
//           <button
//             key={method.id}
//             onClick={() => setSelectedMethod(method.id)}
//             className={`w-full rounded-lg border p-4 text-left transition ${
//               selectedMethod === method.id
//                 ? 'border-primary bg-primary/5 ring-2 ring-primary'
//                 : 'border-border hover:border-primary/50'
//             }`}
//           >
//             <div className="flex items-center gap-4">
//               <div className="text-4xl">{method.icon}</div>
//               <div className="flex-1">
//                 <div className="font-medium">{method.name}</div>
//                 <div className="text-sm text-muted-foreground">{method.description}</div>
//               </div>
//               {selectedMethod === method.id && (
//                 <div className="text-primary text-2xl">✓</div>
//               )}
//             </div>
//           </button>
//         ))}
//       </div>

//       {error && (
//         <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-sm text-destructive">{error}</p>
//         </div>
//       )}

//       <div className="flex gap-3">
//         <button
//           onClick={() => router.back()}
//           disabled={processing}
//           className="rounded-md border px-6 py-2 hover:bg-muted disabled:opacity-50"
//         >
//           Назад
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={!selectedMethod || processing}
//           className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
//         >
//           {processing ? 'Обработка...' : 'Продолжить'}
//         </button>
//       </div>

//       {/* Информация о безопасности */}
//       <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
//         <p className="text-muted-foreground">
//           🔒 <strong>Безопасная оплата.</strong> Все платежи защищены SSL-шифрованием.
//           Данные вашей карты не хранятся на наших серверах.
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function PaymentPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-2xl rounded-lg border p-4">
//           Загрузка...
//         </div>
//       }
//     >
//       <PaymentContent />
//     </Suspense>
//   );
// }