"use server";

import {
  getAdminQuickBookingSlots,
  listAdminQuickBookingMastersForService,
} from "@/lib/booking/admin-quick-appointment";

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
