// src/app/admin/appointments/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/booking";

export async function markDone(appointmentId: string): Promise<ActionResult> {
  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "DONE" },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось обновить статус" };
  }
}

