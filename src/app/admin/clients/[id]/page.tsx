// src/app/admin/clients/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { updateClient as _updateClient } from "./actions";
import ClientViewClient from "./ClientViewClient";

export const dynamic = "force-dynamic";

// Next 15: params/searchParams — async
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Обёртка для server action: после успешного обновления уходим в список */
async function submitUpdate(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const res = await _updateClient(undefined, formData);
  if (res?.ok) {
    redirect("/admin/clients");
  } else {
    // остаться в режиме редактирования
    redirect(`/admin/clients/${id}?edit=1&err=1`);
  }
}

export default async function AdminClientPage(props: PageProps) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const editMode =
    sp?.edit === "1" || sp?.edit === "true" || (Array.isArray(sp?.edit) && sp?.edit[0] === "1");
  const hasError = sp?.err === "1" || (Array.isArray(sp?.err) && sp?.err[0] === "1");

  // ✅ Загружаем клиента с фильтром активных appointments
  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      birthDate: true,
      referral: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      appointments: {
        where: {
          deletedAt: null,  // ← ВАЖНО! Только активные заявки
        },
        orderBy: { startAt: "desc" as const },
        select: {
          id: true,
          startAt: true,
          endAt: true,
          status: true,
          service: { 
            select: { 
              id: true,
              slug: true, 
              name: true,  // ✅ Используем name (не title!)
              priceCents: true 
            } 
          },
          master: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        },
      },
    },
  });

  if (!client) return notFound();

  // Активные статусы — CONFIRMED + DONE
  const ACTIVE = new Set<AppointmentStatus>([
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.DONE,
  ]);

  const visits = client.appointments.filter((appointment) => ACTIVE.has(appointment.status));
  const lastVisit = visits[0]?.startAt ?? null;
  
  // Подсчёт статистики
  const totalVisits = visits.length;
  const totalSpent = visits.reduce((sum: number, appointment) => {
    return sum + (appointment.service?.priceCents ?? 0);
  }, 0);
  const avgVisitValue = totalVisits > 0 ? totalSpent / totalVisits : 0;

  return (
    <ClientViewClient
      client={client}
      visits={visits}
      lastVisit={lastVisit}
      totalVisits={totalVisits}
      totalSpent={totalSpent}
      avgVisitValue={avgVisitValue}
      editMode={editMode}
      hasError={hasError}
      submitUpdate={submitUpdate}
    />
  );
}

