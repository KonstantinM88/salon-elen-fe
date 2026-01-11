// src/app/admin/bookings/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendStatusChangeEmail } from "@/lib/email";
import { notifyClientAppointmentStatus } from "@/lib/telegram-bot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Получить ID текущего пользователя
 */
async function getCurrentUserId(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Логирование изменения статуса
 */
async function logStatusChange({
  appointmentId,
  newStatus,
  previousStatus,
  changedBy,
  reason,
}: {
  appointmentId: string;
  newStatus: AppointmentStatus;
  previousStatus: AppointmentStatus;
  changedBy: string;
  reason?: string;
}): Promise<void> {
  try {
    await prisma.appointmentStatusLog.create({
      data: {
        appointmentId,
        status: newStatus,
        previousStatus,
        changedBy,
        reason,
      },
    });
    console.log(`📝 Status log created: ${previousStatus} → ${newStatus}`);
  } catch (error) {
    console.error('❌ Failed to log status change:', error);
    // Не прерываем выполнение, если логирование не удалось
  }
}

/**
 * Изменить статус заявки с логированием и уведомлением
 */
export async function setStatus(
  id: string,
  status: AppointmentStatus
): Promise<Result> {
  try {
    // 1. Получаем текущую заявку
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        customerName: true,
        phone: true,
        email: true,
        startAt: true,
        endAt: true,
        service: {
          select: {
            name: true,
            parent: {
              select: { name: true },
            },
          },
        },
        master: {
          select: { name: true },
        },
      },
    });

    if (!appointment) {
      return { ok: false, error: "Запись не найдена" };
    }

    const previousStatus = appointment.status;

    // Если статус не изменился, ничего не делаем
    if (previousStatus === status) {
      return { ok: true };
    }

    // 2. Обновляем статус
    await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    // 3. Логируем изменение
    const userId = await getCurrentUserId();
    await logStatusChange({
      appointmentId: id,
      newStatus: status,
      previousStatus,
      changedBy: userId,
      reason: `Status changed from ${previousStatus} to ${status}`,
    });

    // 4. Отправляем email уведомление (если есть email)
    const serviceName = appointment.service?.parent?.name
      ? `${appointment.service.parent.name} / ${appointment.service.name}`
      : appointment.service?.name || '—';
    const masterName = appointment.master?.name || '—';

    if (appointment.email) {
      // Отправляем асинхронно, не ждём результата
      sendStatusChangeEmail({
        customerName: appointment.customerName,
        email: appointment.email,
        serviceName,
        masterName,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status,
        previousStatus,
      }).catch((error) => {
        console.error('❌ Email send error:', error);
      });

      console.log(`📧 Email queued for ${appointment.email}`);
    }

    if (appointment.phone) {
      notifyClientAppointmentStatus({
        customerName: appointment.customerName,
        email: appointment.email,
        phone: appointment.phone,
        serviceName,
        masterName,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status,
      }).catch((error) => {
        console.error("❌ Telegram send error:", error);
      });
    }

    // 5. Ревалидация
    revalidatePath("/admin/bookings");
    
    console.log(`✅ Status updated: ${id} | ${previousStatus} → ${status}`);
    return { ok: true };
  } catch (error) {
    console.error('❌ Set status error:', error);
    return { 
      ok: false, 
      error: "Не удалось обновить статус" 
    };
  }
}

/**
 * Удалить заявку с логированием
 */
export async function remove(id: string): Promise<Result> {
  try {
    // 1. Получаем информацию о заявке для логирования
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        customerName: true,
      },
    });

    if (!appointment) {
      return { ok: false, error: "Запись не найдена" };
    }

    // 2. Логируем удаление (перед удалением!)
    const userId = await getCurrentUserId();
    await logStatusChange({
      appointmentId: id,
      newStatus: AppointmentStatus.CANCELED,
      previousStatus: appointment.status,
      changedBy: userId,
      reason: `Appointment deleted by ${userId}`,
    });

    // 3. Удаляем заявку (каскадное удаление логов произойдёт автоматически)
    await prisma.appointment.delete({ 
      where: { id } 
    });

    // 4. Ревалидация
    revalidatePath("/admin/bookings");
    
    console.log(`🗑️ Appointment deleted: ${id} | ${appointment.customerName}`);
    return { ok: true };
  } catch (error) {
    console.error('❌ Delete error:', error);
    return { 
      ok: false, 
      error: "Не удалось удалить запись" 
    };
  }
}

/**
 * Получить историю изменений статуса для заявки
 */
export async function getStatusHistory(
  appointmentId: string
): Promise<{
  id: string;
  status: AppointmentStatus;
  previousStatus: AppointmentStatus | null;
  changedAt: Date;
  changedBy: string | null;
  reason: string | null;
}[]> {
  try {
    const logs = await prisma.appointmentStatusLog.findMany({
      where: { appointmentId },
      orderBy: { changedAt: 'desc' },
      select: {
        id: true,
        status: true,
        previousStatus: true,
        changedAt: true,
        changedBy: true,
        reason: true,
      },
    });

    return logs;
  } catch (error) {
    console.error('❌ Get history error:', error);
    return [];
  }
}

/**
 * Массовое изменение статуса (для будущего функционала)
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: AppointmentStatus
): Promise<Result> {
  try {
    const userId = await getCurrentUserId();

    // Обновляем все заявки
    await prisma.appointment.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    // Логируем для каждой заявки
    await Promise.all(
      ids.map((id) =>
        logStatusChange({
          appointmentId: id,
          newStatus: status,
          previousStatus: AppointmentStatus.PENDING, // Не знаем предыдущий
          changedBy: userId,
          reason: 'Bulk status update',
        })
      )
    );

    revalidatePath("/admin/bookings");
    return { ok: true };
  } catch (error) {
    console.error('❌ Bulk update error:', error);
    return { 
      ok: false, 
      error: "Не удалось обновить записи" 
    };
  }
}



//----------работало до 06.02.26 добовляем логирование---------
// // src/app/admin/bookings/actions.ts
// "use server";

// import { prisma } from "@/lib/prisma";
// import { AppointmentStatus } from "@prisma/client";
// import { revalidatePath } from "next/cache";

// type Result = { ok: true } | { ok: false; error: string };

// export async function setStatus(
//   id: string,
//   status: AppointmentStatus
// ): Promise<Result> {
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
