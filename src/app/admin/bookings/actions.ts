"use server";

import { prisma } from "@/lib/db";
import type { Booking } from "@prisma/client";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };
type BookingStatus = Booking["status"];

export const dynamic = "force-dynamic";

export async function setStatus(id: number, status: BookingStatus): Promise<Result> {
  try {
    await prisma.booking.update({ where: { id }, data: { status } });
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка" };
  }
}

export async function removeBooking(id: number): Promise<Result> {
  try {
    await prisma.booking.delete({ where: { id } });
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка" };
  }
}
