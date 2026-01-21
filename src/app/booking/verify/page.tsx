// src/app/booking/verify/page.tsx
import { JSX, Suspense } from 'react';
import VerifyPageClient from './VerifyPageClient';

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<div className="p-6">Загрузка…</div>}>
      <VerifyPageClient />
    </Suspense>
  );
}