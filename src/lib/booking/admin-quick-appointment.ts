import { getAvailableSlots } from "@/lib/booking/availability-service";
import { sendStatusChangeEmail } from "@/lib/email";
import {
  ORG_TZ,
  formatInOrgTzDateTime,
  orgDayRange,
  wallMinutesToUtc,
} from "@/lib/orgTime";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/lib/prisma-client";
import { sendAdminNotification } from "@/lib/send-admin-notification";
import { notifyClientAppointmentStatus } from "@/lib/telegram-bot";
import {
  formatPhoneForZadarma,
  sendCustomSms,
  validatePhoneNumber,
} from "@/lib/zadarma-sms";

type ClientLookupCondition = { phone?: string; email?: string };

export type AdminQuickBookingServiceOption = {
  id: string;
  name: string;
  parentName: string | null;
  durationMin: number;
  priceCents: number | null;
};

export type AdminQuickBookingMasterOption = {
  id: string;
  name: string;
};

export type AdminQuickBookingDateOption = {
  dateISO: string;
  slotsCount: number;
  firstSlotTime: string | null;
};

export type AdminQuickBookingSlotOption = {
  time: string;
  displayTime: string;
  startAt: string;
  endAt: string;
};

export type AdminQuickAppointmentResult =
  | {
      ok: true;
      appointmentId: string;
      customerName: string;
      startAt: Date;
      endAt: Date;
    }
  | {
      ok: false;
      error:
        | "INVALID_INPUT"
        | "INVALID_PHONE"
        | "SERVICE_NOT_FOUND"
        | "MASTER_NOT_FOUND"
        | "SLOT_TAKEN"
        | "UPDATE_FAILED";
      message: string;
    };

function fallbackDigits(seed: string): string {
  const digits = Array.from(seed)
    .map((ch) => String(ch.charCodeAt(0) % 10))
    .join("");
  return digits.slice(0, 12).padEnd(12, "0");
}

function buildFallbackEmail(phone: string, seed: string): string {
  const phoneToken = phone.replace(/[^\d]+/g, "").slice(-12);
  const token = phoneToken || fallbackDigits(seed);
  const suffix = seed.slice(-6).toLowerCase();
  return `noemail+${token}-${suffix}@client.local`;
}

function buildClientLookupOr(phone?: string, email?: string): ClientLookupCondition[] {
  const digits = phone ? formatPhoneForZadarma(phone) : "";
  const phoneVariants = Array.from(
    new Set([phone, digits, digits ? `+${digits}` : ""].filter(Boolean)),
  ) as string[];

  return [
    ...phoneVariants.map((value) => ({ phone: value })),
    ...(email ? [{ email }] : []),
  ];
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as { code?: unknown }).code === "P2002";
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

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function todayISO(): string {
  return new Date()
    .toLocaleString("sv-SE", { timeZone: ORG_TZ, hour12: false })
    .split(" ")[0];
}

function addDaysISO(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function serviceNameOf(
  service?: { name: string; parent?: { name: string } | null } | null,
): string {
  return service?.parent?.name
    ? `${service.parent.name} / ${service.name}`
    : service?.name || "-";
}

function smsText({
  serviceName,
  masterName,
  startAt,
}: {
  serviceName: string;
  masterName: string;
  startAt: Date;
}): string {
  const when = formatInOrgTzDateTime(startAt, "de-DE");
  return `Salon Elen: Ihr Termin ist bestaetigt. ${when}, ${serviceName}, ${masterName}. Adresse: Lessingstr. 37, Halle.`;
}

export async function listAdminQuickBookingServices(): Promise<
  AdminQuickBookingServiceOption[]
> {
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      isArchived: false,
      OR: [
        { parentId: null },
        { parent: { isActive: true, isArchived: false } },
      ],
    },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      durationMin: true,
      priceCents: true,
      parent: { select: { name: true } },
      children: {
        where: { isActive: true, isArchived: false },
        select: { id: true },
      },
    },
  });

  return services
    .filter((service) => service.children.length === 0)
    .map((service) => ({
      id: service.id,
      name: service.name,
      parentName: service.parent?.name ?? null,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
    }));
}

export async function listAdminQuickBookingMastersForService(
  serviceId: string,
): Promise<AdminQuickBookingMasterOption[]> {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, isActive: true, isArchived: false },
    select: {
      masters: {
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      },
    },
  });

  return service?.masters ?? [];
}

export async function getAdminQuickBookingSlots({
  masterId,
  serviceId,
  dateISO,
  limit,
}: {
  masterId: string;
  serviceId: string;
  dateISO: string;
  limit?: number;
}): Promise<AdminQuickBookingSlotOption[]> {
  if (!masterId || !serviceId || !isValidDateISO(dateISO)) return [];

  const availability = await getAvailableSlots({
    masterId,
    dateISO,
    serviceIds: [serviceId],
  });

  const slots = availability.slots.map((slot) => ({
    time: minutesToTime(slot.startMinutes),
    displayTime: slot.displayTime,
    startAt: slot.startAt,
    endAt: slot.endAt,
  }));

  return typeof limit === "number" ? slots.slice(0, limit) : slots;
}

export async function getAdminQuickBookingDateOptions({
  masterId,
  serviceId,
  startDateISO,
  daysToScan = 45,
  limit = 12,
}: {
  masterId: string;
  serviceId: string;
  startDateISO?: string;
  daysToScan?: number;
  limit?: number;
}): Promise<AdminQuickBookingDateOption[]> {
  const fromDateISO = startDateISO ?? todayISO();
  if (!masterId || !serviceId || !isValidDateISO(fromDateISO)) return [];

  const dates: AdminQuickBookingDateOption[] = [];
  for (
    let dayOffset = 0;
    dayOffset < daysToScan && dates.length < limit;
    dayOffset += 1
  ) {
    const dateISO = addDaysISO(fromDateISO, dayOffset);
    const slots = await getAdminQuickBookingSlots({
      masterId,
      serviceId,
      dateISO,
    });

    if (slots.length === 0) continue;
    dates.push({
      dateISO,
      slotsCount: slots.length,
      firstSlotTime: slots[0]?.time ?? null,
    });
  }

  return dates;
}

export async function createAdminQuickAppointment({
  serviceId,
  masterId,
  dateISO,
  time,
  phone,
  customerName,
  email,
  notes,
  changedBy,
}: {
  serviceId: string;
  masterId: string;
  dateISO: string;
  time: string;
  phone: string;
  customerName?: string | null;
  email?: string | null;
  notes?: string | null;
  changedBy?: string | null;
}): Promise<AdminQuickAppointmentResult> {
  const phoneDigits = formatPhoneForZadarma(phone);
  const phoneValidation = validatePhoneNumber(phoneDigits);
  if (!phoneValidation.valid) {
    return {
      ok: false,
      error: "INVALID_PHONE",
      message: phoneValidation.error ?? "Invalid phone number",
    };
  }

  if (!serviceId || !masterId || !isValidDateISO(dateISO)) {
    return { ok: false, error: "INVALID_INPUT", message: "Invalid booking data" };
  }

  const startMinutes = parseTimeToMinutes(time);
  if (startMinutes === null) {
    return { ok: false, error: "INVALID_INPUT", message: "Invalid time" };
  }

  const normalizedPhone = `+${phoneDigits}`;
  const emailStr = email?.trim().toLowerCase() || null;
  const clientEmail = emailStr || buildFallbackEmail(normalizedPhone, `${serviceId}-${dateISO}-${time}`);
  const displayName = customerName?.trim() || "Клиент";

  const slots = await getAdminQuickBookingSlots({
    masterId,
    serviceId,
    dateISO,
  });
  if (!slots.some((slot) => slot.time === minutesToTime(startMinutes))) {
    return {
      ok: false,
      error: "SLOT_TAKEN",
      message: "Selected slot is no longer available",
    };
  }

  const newStartAt = wallMinutesToUtc(dateISO, startMinutes);

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${masterId} FOR UPDATE`;

      const service = await tx.service.findFirst({
        where: {
          id: serviceId,
          isActive: true,
          isArchived: false,
          masters: { some: { id: masterId } },
        },
        select: {
          id: true,
          name: true,
          durationMin: true,
          priceCents: true,
          parent: { select: { name: true } },
        },
      });

      if (!service) {
        return { ok: false as const, error: "SERVICE_NOT_FOUND" as const, message: "Service not found" };
      }

      const master = await tx.master.findUnique({
        where: { id: masterId },
        select: { id: true, name: true },
      });

      if (!master) {
        return { ok: false as const, error: "MASTER_NOT_FOUND" as const, message: "Master not found" };
      }

      const endAt = new Date(newStartAt.getTime() + service.durationMin * 60_000);
      const conflict = await tx.appointment.findFirst({
        where: {
          masterId,
          deletedAt: null,
          status: { not: AppointmentStatus.CANCELED },
          startAt: { lt: endAt },
          endAt: { gt: newStartAt },
        },
        select: { id: true },
      });

      if (conflict) {
        return { ok: false as const, error: "SLOT_TAKEN" as const, message: "Selected slot is no longer available" };
      }

      const { start: dayStartUtc, end: dayEndUtc } = orgDayRange(dateISO);
      const tempReservation = await tx.temporarySlotReservation.findFirst({
        where: {
          masterId,
          startAt: { lt: endAt },
          endAt: { gt: newStartAt },
          expiresAt: { gte: new Date() },
        },
        select: { id: true },
      });

      if (tempReservation || newStartAt < dayStartUtc || newStartAt >= dayEndUtc) {
        return { ok: false as const, error: "SLOT_TAKEN" as const, message: "Selected slot is no longer available" };
      }

      let clientId: string | null = null;
      const existingClient = await tx.client.findFirst({
        where: {
          OR: buildClientLookupOr(normalizedPhone, emailStr ?? undefined),
        },
        select: { id: true },
      });

      if (existingClient) {
        clientId = existingClient.id;
        await tx.client.update({
          where: { id: existingClient.id },
          data: {
            name: displayName,
          },
        });
      }

      if (!clientId) {
        try {
          const createdClient = await tx.client.create({
            data: {
              name: displayName,
              phone: normalizedPhone,
              email: clientEmail,
              birthDate: new Date("1990-01-01"),
              referral: null,
            },
            select: { id: true },
          });
          clientId = createdClient.id;
        } catch (error) {
          if (!isUniqueConstraintError(error)) throw error;

          const existingAfterConflict = await tx.client.findFirst({
            where: {
              OR: [
                ...buildClientLookupOr(normalizedPhone, emailStr ?? undefined),
                ...buildClientLookupOr(normalizedPhone, clientEmail),
              ],
            },
            select: { id: true },
          });

          if (!existingAfterConflict) throw error;
          clientId = existingAfterConflict.id;
        }
      }

      const appointment = await tx.appointment.create({
        data: {
          serviceId,
          masterId,
          clientId,
          startAt: newStartAt,
          endAt,
          customerName: displayName,
          phone: normalizedPhone,
          email: emailStr,
          notes,
          status: AppointmentStatus.CONFIRMED,
          paymentStatus: "PENDING",
        },
        select: {
          id: true,
          customerName: true,
          phone: true,
          email: true,
          startAt: true,
          endAt: true,
          status: true,
        },
      });

      await tx.appointmentStatusLog.create({
        data: {
          appointmentId: appointment.id,
          status: AppointmentStatus.CONFIRMED,
          previousStatus: null,
          changedBy: changedBy ?? "admin-quick-booking",
          reason: "Created by admin quick booking",
        },
      });

      return {
        ok: true as const,
        appointment,
        service,
        master,
      };
    });

    if (!result.ok) {
      return result;
    }

    const serviceName = serviceNameOf(result.service);
    const masterName = result.master.name;

    const notifications = await Promise.allSettled([
      emailStr
        ? sendStatusChangeEmail({
            customerName: result.appointment.customerName,
            email: emailStr,
            serviceName,
            masterName,
            startAt: result.appointment.startAt,
            endAt: result.appointment.endAt,
            status: AppointmentStatus.CONFIRMED,
            previousStatus: AppointmentStatus.PENDING,
            locale: "de",
          })
        : Promise.resolve(),
      notifyClientAppointmentStatus({
        customerName: result.appointment.customerName,
        email: emailStr,
        phone: normalizedPhone,
        serviceName,
        masterName,
        startAt: result.appointment.startAt,
        endAt: result.appointment.endAt,
        status: AppointmentStatus.CONFIRMED,
        locale: "de",
      }),
      !emailStr
        ? sendCustomSms(
            normalizedPhone,
            smsText({
              serviceName,
              masterName,
              startAt: result.appointment.startAt,
            }),
          )
        : Promise.resolve(),
      sendAdminNotification({
        id: result.appointment.id,
        customerName: result.appointment.customerName,
        phone: normalizedPhone,
        email: emailStr,
        serviceName,
        masterName,
        masterId,
        startAt: result.appointment.startAt,
        endAt: result.appointment.endAt,
        status: AppointmentStatus.CONFIRMED,
        paymentStatus: "PENDING",
      }),
    ]);

    notifications.forEach((notification) => {
      if (notification.status === "rejected") {
        console.error("Admin quick booking notification error:", notification.reason);
      }
    });

    return {
      ok: true,
      appointmentId: result.appointment.id,
      customerName: result.appointment.customerName,
      startAt: result.appointment.startAt,
      endAt: result.appointment.endAt,
    };
  } catch (error) {
    console.error("Create admin quick appointment error:", error);
    return {
      ok: false,
      error: "UPDATE_FAILED",
      message: "Failed to create quick appointment",
    };
  }
}
