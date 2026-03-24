// src/app/booking/payment/page.tsx
import { Suspense } from "react";
import PaymentPageClient from "./PaymentPageClient";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleSearchParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

async function getInitialPaymentAmount(appointmentId: string): Promise<number> {
  if (!appointmentId) {
    return 5000;
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        service: {
          select: {
            priceCents: true,
          },
        },
      },
    });

    return appointment?.service.priceCents ?? 5000;
  } catch (error) {
    console.error("[Payment Page] Failed to preload appointment amount:", error);
    return 5000;
  }
}

export default async function PaymentPage(props: {
  searchParams?: SearchParams;
}) {
  const sp = props.searchParams ? await props.searchParams : {};
  const appointmentId = getSingleSearchParam(sp.appointment);
  const initialPaymentAmount = await getInitialPaymentAmount(appointmentId);

  return (
    <Suspense fallback={null}>
      <PaymentPageClient
        appointmentId={appointmentId}
        initialPaymentAmount={initialPaymentAmount}
      />
    </Suspense>
  );
}
