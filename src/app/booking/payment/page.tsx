// src/app/booking/payment/page.tsx
import { Suspense } from "react";
import PaymentPageClient from "./PaymentPageClient";

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageClient />
    </Suspense>
  );
}







// // src/app/booking/payment/page.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   CalendarDays,
//   Clock3,
//   User2,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({
//   children,
// }: {
//   children: React.ReactNode;
// }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фиксированный хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
//         <video
//           className="
//             absolute inset-0 h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
//           "
//           autoPlay
//           muted
//           loop
//           playsInline
//           preload="metadata"
//           poster="/fallback-poster.jpg"
//           aria-hidden="true"
//         >
//           <source src="/SE-logo-video-master.webm" type="video/webm" />
//           <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//         </video>
//         <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10" />
//       </div>
//     </section>
//   );
// }

// export default function PaymentPage(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [success, setSuccess] = React.useState<string | null>(null);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново."
//       );
//       setSuccess(null);
//       return;
//     }

//     // Здесь пока только UI-подтверждение.
//     // Реальную интеграцию (Stripe/PayPal и т.п.) добавим позже.
//     setError(null);
//     setSuccess(
//       selectedMethod === "onsite"
//         ? "Ваша запись подтверждена. Оплата будет произведена в салоне."
//         : "Онлайн-оплата появится скоро. Пока что запись считается подтверждённой, а оплата — в салоне."
//     );
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* Верхняя часть: back + заголовок + подзаголовок */}
//         <div className="flex flex-col items-center text-center">
//           <div className="mb-4 flex w-full items-center justify-between gap-3">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-amber-300 hover:bg-white/10 hover:text-amber-100"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span>Назад</span>
//             </button>

//             <div className="hidden text-xs font-medium text-white/60 sm:flex sm:items-center sm:gap-2">
//               <span className="rounded-full bg-white/5 px-3 py-1">
//                 Шаг <span className="text-amber-300">6</span> из 6
//               </span>
//             </div>
//           </div>

//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 26 }}
//             className="relative mb-6 inline-block"
//           >
//             <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 blur-xl opacity-70" />
//             <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70 px-6 py-2.5 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)] backdrop-blur-sm">
//               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/15">
//                 <ShieldCheck className="h-4 w-4 text-black/80" />
//               </span>
//               <span className="font-serif text-sm tracking-wide">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="
//               mb-3 mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl
//               font-serif italic leading-tight
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             "
//           >
//             Завершение записи
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//     mx-auto max-w-2xl
//     text-center text-lg md:text-xl
//     font-serif italic
//     text-transparent bg-clip-text
//     bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//     drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//   "
//           >
//             Вы почти у цели. Выберите способ оплаты и подтвердите бронь. Сейчас
//             мы фиксируем время за вами — оплата онлайн появится чуть позже, а
//             пока возможна оплата в салоне.
//           </motion.p>

//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-2 text-xs text-white/50 md:text-sm"
//           >
//             Номер вашей записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>
//         </div>

//         {/* Два столбца: выбор оплаты + резюме записи */}
//         <div className="mt-8 grid items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* Левая колонка: выбор способа оплаты */}
//           <motion.section
//             initial={{ opacity: 0, x: -18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-black/70 to-black/85
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               space-y-6
//             "
//           >
//             <div className="pointer-events-none absolute -top-20 left-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

//             <div className="relative space-y-4">
//               <h2 className="flex items-center gap-2 text-base font-semibold text-white/90 md:text-lg">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15">
//                   <CreditCard className="h-4 w-4 text-amber-300" />
//                 </span>
//                 Способ оплаты
//               </h2>

//               <div className="grid gap-3 md:grid-cols-2">
//                 {/* Оплата в салоне */}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedMethod("onsite");
//                     setError(null);
//                     setSuccess(null);
//                   }}
//                   className={`
//                     flex flex-col items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition
//                     ${
//                       selectedMethod === "onsite"
//                         ? "border-emerald-400/90 bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-emerald-500/25 shadow-[0_0_22px_rgba(16,185,129,0.45)]"
//                         : "border-white/10 bg-white/5 hover:border-emerald-300/70 hover:bg-white/10"
//                     }
//                   `}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
//                       <Wallet className="h-5 w-5 text-emerald-300" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold">
//                         Оплата в салоне
//                       </div>
//                       <div className="text-xs text-white/70">
//                         Оплачиваете услуги на месте перед или после процедуры.
//                       </div>
//                     </div>
//                   </div>
//                   <ul className="mt-1 space-y-1 text-xs text-white/60">
//                     <li>• Подходит для наличных и оплаты картой в салоне.</li>
//                     <li>
//                       • Никаких предоплат — просто приходите в назначенное
//                       время.
//                     </li>
//                   </ul>
//                 </button>

//                 {/* Онлайн-оплата — заглушка */}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedMethod("online_soon");
//                     setError(null);
//                     setSuccess(null);
//                   }}
//                   className={`
//                     flex flex-col items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition
//                     ${
//                       selectedMethod === "online_soon"
//                         ? "border-amber-400/90 bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-500/25 shadow-[0_0_22px_rgba(245,197,24,0.45)]"
//                         : "border-white/10 bg-white/5 hover:border-amber-300/70 hover:bg-white/10"
//                     }
//                   `}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
//                       <CreditCard className="h-5 w-5 text-amber-300" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold">
//                         Онлайн-оплата (скоро)
//                       </div>
//                       <div className="text-xs text-white/70">
//                         В разработке. Скоро вы сможете оплатить бронь заранее.
//                       </div>
//                     </div>
//                   </div>
//                   <ul className="mt-1 space-y-1 text-xs text-white/60">
//                     <li>• Карта, Apple Pay, Google Pay.</li>
//                     <li>
//                       • Сейчас недоступно, но ваша запись всё равно будет
//                       подтверждена.
//                     </li>
//                   </ul>
//                 </button>
//               </div>

//               <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/65 md:text-sm">
//                 <p className="mb-1 font-medium text-white/80">
//                   Как это работает сейчас?
//                 </p>
//                 <p>
//                   Система уже создала запись в расписании салона по вашему
//                   номеру брони. Оплата фиксируется на стороне салона —
//                   администратор видит вашу запись и способ оплаты &laquo;в
//                   салоне&raquo;. Онлайн-оплата будет добавлена отдельным шагом
//                   позже.
//                 </p>
//               </div>

//               {/* Сообщения об ошибке / успехе */}
//               <div className="space-y-3 pt-2">
//                 {error && (
//                   <div className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs md:text-sm text-red-200">
//                     <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <span>{error}</span>
//                   </div>
//                 )}
//                 {success && (
//                   <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs md:text-sm text-emerald-200">
//                     <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <span>{success}</span>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-2">
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   className="
//                     inline-flex w-full items-center justify-center gap-2
//                     rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500
//                     px-5 py-3 text-sm font-semibold text-black
//                     shadow-[0_15px_40px_rgba(245,197,24,0.45)]
//                     transition hover:brightness-110
//                   "
//                 >
//                   <CheckCircle2 className="h-4 w-4" />
//                   Подтвердить запись
//                 </button>
//                 <p className="mt-2 text-center text-xs text-white/55 md:text-xs">
//                   Нажимая &laquo;Подтвердить запись&raquo;, вы соглашаетесь с
//                   условиями салона и политикой отмены визита.
//                 </p>
//               </div>
//             </div>
//           </motion.section>

//           {/* Правая колонка: резюме записи (пока без реального запроса к БД) */}
//           <motion.aside
//             initial={{ opacity: 0, x: 18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.35 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               text-sm md:text-base
//             "
//           >
//             <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

//             <div className="relative space-y-5">
//               <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text md:text-xl">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20">
//                   <Scissors className="h-4 w-4 text-amber-200" />
//                 </span>
//                 Резюме вашей записи
//               </h3>

//               {/* Здесь позже можно подставить реальные данные Appointment */}
//               <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <div className="flex items-center gap-2 text-sm text-white/80">
//                   <User2 className="h-4 w-4 text-amber-300" />
//                   <span>
//                     Ваш визит в SalonElen успешно занесён в расписание.
//                   </span>
//                 </div>
//                 <ul className="mt-1 space-y-1.5 text-xs text-white/65 md:text-sm">
//                   <li>• Услуга: будет подставлена из записи (Appointment).</li>
//                   <li>• Мастер: будет подставлен из записи.</li>
//                   <li>
//                     • Дата и время: подтягиваются по идентификатору{" "}
//                     <span className="font-mono text-amber-300">
//                       {appointmentId}
//                     </span>
//                     .
//                   </li>
//                   <li>• Адрес салона и доп. детали — также из Appointment.</li>
//                 </ul>
//                 <p className="mt-2 flex items-center gap-2 text-xs text-white/55">
//                   <CalendarDays className="h-4 w-4 text-amber-300" />
//                   На текущем этапе мы меняем только оформление страницы, без
//                   изменения бизнес-логики получения данных о записи.
//                 </p>
//               </div>

//               <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
//                   Политика отмены
//                 </p>
//                 <p className="text-xs text-white/65 md:text-sm">
//                   Если вы не сможете прийти, пожалуйста, отмените запись заранее
//                   — это позволит освободить время для других гостей салона. При
//                   необходимости администратор свяжется с вами для уточнения
//                   деталей.
//                 </p>
//               </div>

//               <div className="mt-2 border-t border-white/10 pt-3 text-xs text-white/50 md:text-sm">
//                 После запуска онлайн-оплаты сюда будет добавлен блок выбора
//                 платёжного метода (Stripe / PayPal / Klarna) и отображение
//                 статуса платежа.
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       <VideoSection />
//     </PageShell>
//   );
// }

//--------рабочий файл далее делаем дизайн для страницы оплаты --------------
// // src/app/booking/payment/page.tsx
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
//       paymentUrl?: string | null;
//     }
//   | {
//       ok: false;
//       error: string;
//     };

// const PAYMENT_METHODS: Array<{
//   id: PaymentMethod;
//   name: string;
//   description: string;
//   icon: string;
// }> = [
//   {
//     id: 'card',
//     name: 'Банковская карта',
//     description: 'Visa, Mastercard',
//     icon: '💳',
//   },
//   {
//     id: 'paypal',
//     name: 'PayPal',
//     description: 'Быстрая оплата через PayPal',
//     icon: '🅿️',
//   },
//   {
//     id: 'cash',
//     name: 'Наличные',
//     description: 'Оплата в салоне',
//     icon: '💵',
//   },
// ];

// function PaymentContent(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   // ⬇️ ТЕПЕРЬ ЧИТАЕМ appointment из URL
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
//           appointmentId,          // ⬅️ ВАЖНО: отправляем appointmentId
//           paymentMethod: selectedMethod,
//         }),
//       });

//       const data = (await res.json()) as PaymentResponse;

//       if (!res.ok || !data.ok) {
//         throw new Error(
//           ('error' in data && data.error) ||
//             'Ошибка обработки платежа',
//         );
//       }

//       // Если карта или PayPal — пробуем перейти по paymentUrl
//       if (
//         (selectedMethod === 'card' || selectedMethod === 'paypal') &&
//         'paymentUrl' in data &&
//         data.paymentUrl
//       ) {
//         window.location.href = data.paymentUrl;
//         return;
//       }

//       // Наличные или заглушка для онлайн-оплаты → сразу подтверждение
//       router.push(
//         `/booking/confirmation?id=${encodeURIComponent(
//           appointmentId,
//         )}`,
//       );
//     } catch (e) {
//       const message =
//         e instanceof Error ? e.message : 'Ошибка обработки оплаты';
//       setError(message);
//     } finally {
//       setProcessing(false);
//     }
//   }

//   // Если нет appointmentId в URL
//   if (!appointmentId) {
//     return (
//       <div className="mx-auto max-w-2xl px-4 py-8">
//         <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-destructive">
//             Некорректные параметры. Ссылка на оплату устарела или неверна.
//           </p>
//           <Link
//             href="/booking"
//             className="mt-4 inline-block text-sm underline"
//           >
//             Начать запись заново
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-2xl px-4 py-8">
//       <h1 className="mb-2 text-2xl font-semibold">Способ оплаты</h1>
//       <p className="mb-6 text-muted-foreground">
//         Выберите удобный способ оплаты услуг
//       </p>

//       <div className="mb-6 space-y-3">
//         {PAYMENT_METHODS.map((method) => (
//           <button
//             key={method.id}
//             type="button"
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
//           type="button"
//           onClick={() => router.back()}
//           disabled={processing}
//           className="rounded-md border px-6 py-2 hover:bg-muted disabled:opacity-50"
//         >
//           Назад
//         </button>
//         <button
//           type="button"
//           onClick={handleSubmit}
//           disabled={!selectedMethod || processing}
//           className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
//         >
//           {processing ? 'Обработка...' : 'Продолжить'}
//         </button>
//       </div>

//       <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
//         <p className="text-muted-foreground">
//           🔒 <strong>Безопасная оплата.</strong> Все платежи защищены
//           SSL-шифрованием. Данные вашей карты не хранятся на наших
//           серверах.
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
