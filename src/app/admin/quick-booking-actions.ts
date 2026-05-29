"use server";

import {
  createAdminQuickAppointment,
  getAdminQuickBookingSlots,
  listAdminQuickBookingMastersForService,
} from "@/lib/booking/admin-quick-appointment";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function safeAdminRedirect(value: string): string {
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

function withQuickStatus(pathWithQuery: string, status: "ok" | "error"): string {
  const [path, query = ""] = pathWithQuery.split("?");
  const params = new URLSearchParams(query);
  params.set("quick", status);
  return `${path}?${params.toString()}`;
}

export async function createQuickAppointmentAction(formData: FormData) {
  const customerName =
    String(formData.get("customerName") ?? "").trim() || "Клиент";
  const phone = String(formData.get("phone") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const email = emailRaw ? emailRaw : null;
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const notes = notesRaw ? notesRaw : null;
  const redirectTo = safeAdminRedirect(
    String(formData.get("redirectTo") ?? "/admin").trim(),
  );

  const masterId = String(formData.get("masterId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const dateISO = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!masterId || !serviceId || !dateISO || !time) {
    redirect(withQuickStatus(redirectTo, "error"));
  }

  const result = await createAdminQuickAppointment({
    serviceId,
    masterId,
    dateISO,
    time,
    phone,
    customerName,
    email,
    notes,
    changedBy: "admin-site",
  });

  if (!result.ok) {
    console.error("[Admin Quick Booking] Failed:", result);
    redirect(withQuickStatus(redirectTo, "error"));
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  redirect(withQuickStatus(redirectTo, "ok"));
}

export async function getQuickBookingSlotsAction({
  masterId,
  serviceId,
  dateISO,
}: {
  masterId: string;
  serviceId: string;
  dateISO: string;
}): Promise<{
  ok: boolean;
  slots: Array<{ time: string; displayTime: string }>;
}> {
  try {
    const slots = await getAdminQuickBookingSlots({
      masterId,
      serviceId,
      dateISO,
    });

    return {
      ok: true,
      slots: slots.map((slot) => ({
        time: slot.time,
        displayTime: slot.displayTime,
      })),
    };
  } catch (error) {
    console.error("Quick booking slots action error:", error);
    return { ok: false, slots: [] };
  }
}

export async function getQuickBookingMastersAction(
  serviceId: string,
): Promise<{
  ok: boolean;
  masters: Array<{ id: string; name: string }>;
}> {
  try {
    const masters = await listAdminQuickBookingMastersForService(serviceId);
    return { ok: true, masters };
  } catch (error) {
    console.error("Quick booking masters action error:", error);
    return { ok: false, masters: [] };
  }
}
