import { getAvailableSlots } from "@/lib/booking/availability-service";
import { sendStatusChangeEmail } from "@/lib/email";
import {
  formatInOrgTzDateTime,
  orgDayRange,
  wallMinutesToUtc,
} from "@/lib/orgTime";
import { prisma } from "@/lib/prisma";
import {
  sendAdminAppointmentRescheduledNotification,
} from "@/lib/send-admin-notification";
import { notifyClientAppointmentStatus } from "@/lib/telegram-bot";

type LocaleCode = "de" | "ru" | "en";

export type RescheduleError =
  | "NOT_FOUND"
  | "MISSING_MASTER"
  | "INVALID_DATE"
  | "INVALID_TIME"
  | "PAST"
  | "OUTSIDE_WORKING_HOURS"
  | "TIME_OFF"
  | "CONFLICT"
  | "UPDATE_FAILED";

export type RescheduleResult =
  | {
      ok: true;
      appointmentId: string;
      customerName: string;
      oldStartAt: Date;
      oldEndAt: Date;
      startAt: Date;
      endAt: Date;
    }
  | {
      ok: false;
      error: RescheduleError;
      message: string;
    };

export type AppointmentRescheduleSlot = {
  time: string;
  displayTime: string;
  startAt: string;
  endAt: string;
};

export type AppointmentRescheduleSlotsResult =
  | {
      ok: true;
      slots: AppointmentRescheduleSlot[];
      totalDurationMin: number;
    }
  | {
      ok: false;
      error: Exclude<RescheduleError, "INVALID_TIME" | "OUTSIDE_WORKING_HOURS" | "TIME_OFF" | "CONFLICT">;
      message: string;
    };

function parseTimeToMinutes(time: string): number | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function isValidDateISO(dateISO: string): boolean {
  const match = dateISO.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function overlaps(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

function serviceNameOf(
  service?: { name: string; parent?: { name: string } | null } | null,
): string {
  return service?.parent?.name
    ? `${service.parent.name} / ${service.name}`
    : service?.name || "-";
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export async function getAppointmentRescheduleSlots({
  appointmentId,
  dateISO,
  limit,
}: {
  appointmentId: string;
  dateISO: string;
  limit?: number;
}): Promise<AppointmentRescheduleSlotsResult> {
  if (!isValidDateISO(dateISO)) {
    return { ok: false, error: "INVALID_DATE", message: "Invalid date" };
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        masterId: true,
      },
    });

    if (!appointment) {
      return { ok: false, error: "NOT_FOUND", message: "Appointment not found" };
    }

    if (!appointment.masterId) {
      return { ok: false, error: "MISSING_MASTER", message: "Appointment has no master" };
    }

    const durationMin = Math.max(
      1,
      Math.round((appointment.endAt.getTime() - appointment.startAt.getTime()) / 60_000),
    );

    const availability = await getAvailableSlots({
      masterId: appointment.masterId,
      dateISO,
      serviceIds: [],
      durationMinOverride: durationMin,
      excludeAppointmentId: appointment.id,
    });

    const slots = availability.slots.map((slot) => ({
      time: minutesToTime(slot.startMinutes),
      displayTime: slot.displayTime,
      startAt: slot.startAt,
      endAt: slot.endAt,
    }));

    return {
      ok: true,
      slots: typeof limit === "number" ? slots.slice(0, limit) : slots,
      totalDurationMin: availability.totalDurationMin,
    };
  } catch (error) {
    console.error("Get reschedule slots error:", error);
    return {
      ok: false,
      error: "UPDATE_FAILED",
      message: "Failed to load available slots",
    };
  }
}

export async function rescheduleAppointment({
  appointmentId,
  dateISO,
  time,
  changedBy,
  reason,
}: {
  appointmentId: string;
  dateISO: string;
  time: string;
  changedBy: string;
  reason?: string;
}): Promise<RescheduleResult> {
  if (!isValidDateISO(dateISO)) {
    return { ok: false, error: "INVALID_DATE", message: "Invalid date" };
  }

  const startMinutes = parseTimeToMinutes(time);
  if (startMinutes === null) {
    return { ok: false, error: "INVALID_TIME", message: "Invalid time" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT 1
        FROM "Appointment"
        WHERE "id" = ${appointmentId}
        FOR UPDATE
      `;

      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        select: {
          id: true,
          status: true,
          customerName: true,
          phone: true,
          email: true,
          locale: true,
          startAt: true,
          endAt: true,
          masterId: true,
          service: {
            select: {
              name: true,
              parent: { select: { name: true } },
            },
          },
          master: {
            select: { name: true },
          },
        },
      });

      if (!appointment) {
        return { ok: false as const, error: "NOT_FOUND" as const, message: "Appointment not found" };
      }

      if (!appointment.masterId) {
        return { ok: false as const, error: "MISSING_MASTER" as const, message: "Appointment has no master" };
      }

      const durationMin = Math.max(
        1,
        Math.round((appointment.endAt.getTime() - appointment.startAt.getTime()) / 60_000),
      );
      const endMinutes = startMinutes + durationMin;

      if (endMinutes > 1440) {
        return {
          ok: false as const,
          error: "OUTSIDE_WORKING_HOURS" as const,
          message: "Appointment would end after local midnight",
        };
      }

      const newStartAt = wallMinutesToUtc(dateISO, startMinutes);
      const newEndAt = new Date(newStartAt.getTime() + durationMin * 60_000);

      if (newStartAt < new Date()) {
        return { ok: false as const, error: "PAST" as const, message: "Cannot reschedule to the past" };
      }

      const weekday = new Date(`${dateISO}T00:00:00.000Z`).getUTCDay();
      const workingHours = await tx.masterWorkingHours.findMany({
        where: {
          masterId: appointment.masterId,
          weekday,
          isClosed: false,
        },
        select: {
          startMinutes: true,
          endMinutes: true,
        },
      });

      const insideWorkingHours = workingHours.some(
        (window) =>
          startMinutes >= window.startMinutes && endMinutes <= window.endMinutes,
      );

      if (!insideWorkingHours) {
        return {
          ok: false as const,
          error: "OUTSIDE_WORKING_HOURS" as const,
          message: "Selected time is outside master's working hours",
        };
      }

      const { start: dayStartUtc, end: dayEndUtc } = orgDayRange(dateISO);
      const timeOffs = await tx.masterTimeOff.findMany({
        where: {
          masterId: appointment.masterId,
          date: { gte: dayStartUtc, lt: dayEndUtc },
        },
        select: {
          startMinutes: true,
          endMinutes: true,
        },
      });

      const overlapsTimeOff = timeOffs.some((timeOff) =>
        overlaps(startMinutes, endMinutes, timeOff.startMinutes, timeOff.endMinutes),
      );

      if (overlapsTimeOff) {
        return {
          ok: false as const,
          error: "TIME_OFF" as const,
          message: "Selected time overlaps master's time off",
        };
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          id: { not: appointmentId },
          masterId: appointment.masterId,
          deletedAt: null,
          status: { not: "CANCELED" },
          startAt: { lt: newEndAt },
          endAt: { gt: newStartAt },
        },
        select: { id: true },
      });

      if (conflict) {
        return {
          ok: false as const,
          error: "CONFLICT" as const,
          message: "Selected time overlaps another appointment",
        };
      }

      const temporaryConflict = await tx.temporarySlotReservation.findFirst({
        where: {
          masterId: appointment.masterId,
          startAt: { lt: newEndAt },
          endAt: { gt: newStartAt },
          expiresAt: { gte: new Date() },
        },
        select: { id: true },
      });

      if (temporaryConflict) {
        return {
          ok: false as const,
          error: "CONFLICT" as const,
          message: "Selected time overlaps a temporary slot reservation",
        };
      }

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          startAt: newStartAt,
          endAt: newEndAt,
        },
        select: {
          id: true,
          status: true,
          customerName: true,
          phone: true,
          email: true,
          locale: true,
          startAt: true,
          endAt: true,
          service: {
            select: {
              name: true,
              parent: { select: { name: true } },
            },
          },
          master: {
            select: { name: true },
          },
        },
      });

      await tx.appointmentStatusLog.create({
        data: {
          appointmentId,
          status: appointment.status,
          previousStatus: appointment.status,
          changedBy,
          reason:
            reason ??
            `Rescheduled from ${formatInOrgTzDateTime(appointment.startAt)} to ${formatInOrgTzDateTime(newStartAt)}`,
        },
      });

      return {
        ok: true as const,
        appointment,
        updated,
        oldStartAt: appointment.startAt,
        oldEndAt: appointment.endAt,
      };
    });

    if (!result.ok) {
      return result;
    }

    const serviceName = serviceNameOf(result.updated.service);
    const masterName = result.updated.master?.name || "-";
    const locale = (result.updated.locale as LocaleCode) || "de";

    const notifications = await Promise.allSettled([
      result.updated.email
        ? sendStatusChangeEmail({
            customerName: result.updated.customerName,
            email: result.updated.email,
            serviceName,
            masterName,
            startAt: result.updated.startAt,
            endAt: result.updated.endAt,
            status: result.updated.status,
            previousStatus: result.appointment.status,
            locale,
          })
        : Promise.resolve(),
      result.updated.phone
        ? notifyClientAppointmentStatus({
            customerName: result.updated.customerName,
            email: result.updated.email,
            phone: result.updated.phone,
            serviceName,
            masterName,
            startAt: result.updated.startAt,
            endAt: result.updated.endAt,
            status: result.updated.status,
            locale,
          })
        : Promise.resolve(),
      sendAdminAppointmentRescheduledNotification({
        id: result.updated.id,
        customerName: result.updated.customerName,
        phone: result.updated.phone,
        email: result.updated.email,
        serviceName,
        masterName,
        oldStartAt: result.oldStartAt,
        oldEndAt: result.oldEndAt,
        startAt: result.updated.startAt,
        endAt: result.updated.endAt,
        status: result.updated.status,
        changedBy,
      }),
    ]);

    notifications.forEach((notification) => {
      if (notification.status === "rejected") {
        console.error("Reschedule notification error:", notification.reason);
      }
    });

    return {
      ok: true,
      appointmentId: result.updated.id,
      customerName: result.updated.customerName,
      oldStartAt: result.oldStartAt,
      oldEndAt: result.oldEndAt,
      startAt: result.updated.startAt,
      endAt: result.updated.endAt,
    };
  } catch (error) {
    console.error("Reschedule appointment error:", error);
    return {
      ok: false,
      error: "UPDATE_FAILED",
      message: "Failed to reschedule appointment",
    };
  }
}
