// src/app/admin/bookings/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; error: string };

export async function setStatus(
  id: string,
  status: AppointmentStatus
): Promise<Result> {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Не удалось обновить статус" };
  }
}

export async function remove(id: string): Promise<Result> {
  try {
    await prisma.appointment.delete({ where: { id } });
    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить запись" };
  }
}




//---------работало до 05.01.26 делаем адаптацию----------
// // src/app/admin/bookings/actions.ts
// "use server";

// import { prisma } from "@/lib/prisma";
// import { AppointmentStatus } from "@prisma/client";
// import { revalidatePath } from "next/cache";

// type Result = { ok: true } | { ok: false; error: string };

// export async function setStatus(id: string, status: AppointmentStatus): Promise<Result> {
//   try {
//     await prisma.appointment.update({
//       where: { id },
//       data: { status },
//     });
//     revalidatePath("/admin/bookings");
//     return { ok: true };
//   } catch (e) {
//     return { ok: false, error: "Не удалось обновить статус" };
//   }
// }

// export async function remove(id: string): Promise<Result> {
//   try {
//     await prisma.appointment.delete({ where: { id } });
//     revalidatePath("/admin/bookings");
//     return { ok: true };
//   } catch {
//     return { ok: false, error: "Не удалось удалить запись" };
//   }
// }
