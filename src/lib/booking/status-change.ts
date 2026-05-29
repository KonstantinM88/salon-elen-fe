import { sendStatusChangeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/lib/prisma-client";
import { sendAdminAppointmentStatusNotification } from "@/lib/send-admin-notification";
import { notifyClientAppointmentStatus } from "@/lib/telegram-bot";

type LocaleCode = "de" | "ru" | "en";

type StatusChangeSuccess = {
  ok: true;
  changed: boolean;
  appointmentId: string;
  previousStatus: AppointmentStatus;
  status: AppointmentStatus;
  customerName: string;
};

type StatusChangeFailure = {
  ok: false;
  error: "NOT_FOUND" | "UPDATE_FAILED";
  message: string;
};

export type StatusChangeResult = StatusChangeSuccess | StatusChangeFailure;

export async function changeAppointmentStatus({
  appointmentId,
  status,
  changedBy,
  reason,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  changedBy: string;
  reason?: string;
}): Promise<StatusChangeResult> {
  try {
    const appointment = await prisma.appointment.findUnique({
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
      return {
        ok: false,
        error: "NOT_FOUND",
        message: "Appointment not found",
      };
    }

    const previousStatus = appointment.status;
    if (previousStatus === status) {
      return {
        ok: true,
        changed: false,
        appointmentId: appointment.id,
        previousStatus,
        status,
        customerName: appointment.customerName,
      };
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    try {
      await prisma.appointmentStatusLog.create({
        data: {
          appointmentId,
          status,
          previousStatus,
          changedBy,
          reason: reason ?? `Status changed from ${previousStatus} to ${status}`,
        },
      });
      console.log(`Status log created: ${previousStatus} -> ${status}`);
    } catch (error) {
      console.error("Failed to log status change:", error);
    }

    const serviceName = appointment.service?.parent?.name
      ? `${appointment.service.parent.name} / ${appointment.service.name}`
      : appointment.service?.name || "-";
    const masterName = appointment.master?.name || "-";
    const locale = (appointment.locale as LocaleCode) || "de";

    const notificationResults = await Promise.allSettled([
      appointment.email
        ? sendStatusChangeEmail({
            customerName: appointment.customerName,
            email: appointment.email,
            serviceName,
            masterName,
            startAt: appointment.startAt,
            endAt: appointment.endAt,
            status,
            previousStatus,
            locale,
          })
        : Promise.resolve(),
      appointment.phone
        ? notifyClientAppointmentStatus({
            customerName: appointment.customerName,
            email: appointment.email,
            phone: appointment.phone,
            serviceName,
            masterName,
            startAt: appointment.startAt,
            endAt: appointment.endAt,
            status,
            locale,
          })
        : Promise.resolve(),
      sendAdminAppointmentStatusNotification({
        id: appointment.id,
        customerName: appointment.customerName,
        phone: appointment.phone,
        email: appointment.email,
        serviceName,
        masterName,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        status,
        previousStatus,
        changedBy,
      }),
    ]);

    notificationResults.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Status notification error:", result.reason);
      }
    });

    return {
      ok: true,
      changed: true,
      appointmentId: appointment.id,
      previousStatus,
      status,
      customerName: appointment.customerName,
    };
  } catch (error) {
    console.error("Change appointment status error:", error);
    return {
      ok: false,
      error: "UPDATE_FAILED",
      message: "Failed to update appointment status",
    };
  }
}
