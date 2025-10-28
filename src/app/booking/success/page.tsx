import { JSX, Suspense } from 'react';
import SuccessClient from './SuccessClient';

export const dynamic = 'force-dynamic'; // чтобы страница не кешировалась на билде

export default function SuccessPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Успех</h2>

      <Suspense fallback={
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          Загружаем данные…
        </div>
      }>
        <SuccessClient />
      </Suspense>
    </div>
  );
}





// 'use client';

// import * as React from 'react';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
// import { JSX } from 'react';

// export default function SuccessPage(): JSX.Element {
//   const params = useSearchParams();
//   const id = params.get('id');

//   return (
//     <div className="mx-auto max-w-3xl px-4 py-16">
//       <h1 className="text-2xl font-semibold">Запись создана</h1>
//       <p className="mt-3 text-muted-foreground">
//         Спасибо! Ваша запись {id ? <>с номером <code className="rounded bg-muted px-2 py-1">{id}</code></> : null} создана и ожидает подтверждения.
//       </p>

//       <div className="mt-8">
//         <Link
//           href="/"
//           className="inline-block rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
//         >
//           На главную
//         </Link>
//       </div>
//     </div>
//   );
// }





// // src/app/booking/success/page.tsx
// import Link from "next/link";

// export default function SuccessPage() {
//   return (
//     <main className="container mx-auto max-w-3xl px-4 py-12">
//       <h1 className="text-2xl font-semibold mb-4">Спасибо! Запись подтверждена 🎉</h1>
//       <p className="text-white/80 mb-6">
//         Мы отправили подтверждение на вашу почту. Если что-то пойдёт не так — напишите нам.
//       </p>
//       <div className="flex gap-3">
//         <Link
//           href="/"
//           className="inline-flex items-center rounded-lg px-4 py-2 ring-1 ring-white/15 hover:bg-white/10"
//         >
//           На главную
//         </Link>
//         <Link
//           href="/booking"
//           className="inline-flex items-center rounded-lg px-4 py-2 ring-1 ring-white/15 hover:bg-white/10"
//         >
//           Новая запись
//         </Link>
//       </div>
//     </main>
//   );
// }

  