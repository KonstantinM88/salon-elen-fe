// src/lib/availability.ts
import { prisma } from "@/lib/prisma";
import { addMinutes, areIntervalsOverlapping, set } from "date-fns";

export type Slot = { start: string; end: string }; // ISO строки

/** Возвращает свободные интервалы для конкретной даты/услуги. */
export async function getFreeSlots(params: {
  dateISO: string;         // '2025-10-05'
  serviceSlug: string;
  tz?: string;             // например, 'Europe/Berlin' (пока не используем офсет)
}): Promise<Slot[]> {
  const { dateISO, serviceSlug } = params;

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
    select: { id: true, durationMin: true, isActive: true },
  });
  if (!service || !service.isActive) return [];

  // дата «полуночь локальная»
  const day = new Date(`${dateISO}T00:00:00`);

  // рабочие часы (0..6; 0=вс)
  const weekday = day.getDay();
  const wh = await prisma.workingHours.findUnique({ where: { weekday } });
  if (!wh || wh.isClosed) return [];

  // границы рабочего дня (в UTC времени сервера)
  const workStart = set(day, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const start = addMinutes(workStart, wh.startMinutes);
  const end = addMinutes(workStart, wh.endMinutes);

  // перерывы на конкретную дату
  const dayOffs = await prisma.timeOff.findMany({
    where: {
      date: day,
    },
  });

  // существующие записи по услуге за день
  const appointments = await prisma.appointment.findMany({
    where: {
      serviceId: service.id,
      startAt: { gte: start, lt: end },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { startAt: true, endAt: true },
  });

  // дискретизация шагом длительности услуги
  const stepMin = service.durationMin;
  const slots: Slot[] = [];
  let cursor = start;

  while (addMinutes(cursor, stepMin) <= end) {
    const slotStart = cursor;
    const slotEnd = addMinutes(cursor, stepMin);

    // отсекаем, если пересекается с перерывами
    const blocked = dayOffs.some(off => {
      const offStart = addMinutes(workStart, off.startMinutes);
      const offEnd = addMinutes(workStart, off.endMinutes);
      return areIntervalsOverlapping({ start: slotStart, end: slotEnd }, { start: offStart, end: offEnd });
    });

    // отсекаем, если пересекается с чужими апвт.
    const busy = appointments.some(a =>
      areIntervalsOverlapping({ start: slotStart, end: slotEnd }, { start: a.startAt, end: a.endAt })
    );

    if (!blocked && !busy) {
      slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
    }

    cursor = addMinutes(cursor, stepMin);
  }

  return slots;
}
