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
