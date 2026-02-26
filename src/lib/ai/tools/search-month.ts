// src/lib/ai/tools/search-month.ts

import { prisma } from '@/lib/prisma';
import {
  getFreeSlots,
  type WindowUtc,
  type GetFreeSlotsArgs,
} from '@/lib/booking/getFreeSlots';
import { ORG_TZ, orgDayRange, wallMinutesToUtc } from '@/lib/orgTime';

interface Args {
  masterId: string;
  monthISO: string; // "YYYY-MM"
  serviceIds: string[];
}

async function calcTotalDuration(serviceIds: string[]): Promise<number> {
  if (serviceIds.length === 0) return 0;
  const rows = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { durationMin: true },
  });
  return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
}

function todayISO(): string {
  return new Date()
    .toLocaleString('sv-SE', { timeZone: ORG_TZ, hour12: false })
    .split(' ')[0];
}

export async function searchAvailabilityMonth(args: Args) {
  const { masterId, monthISO, serviceIds } = args;

  const totalDurationMin = await calcTotalDuration(serviceIds);
  if (totalDurationMin <= 0) {
    return { days: {}, error: 'Invalid duration' };
  }

  // Generate days for the month
  const [yearStr, monthStr] = monthISO.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = todayISO();

  const days: Record<string, number> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dateISO = `${yearStr}-${monthStr.padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Skip past dates
    if (dateISO < today) continue;

    const dayOfWeek = new Date(`${dateISO}T00:00:00Z`).getUTCDay();

    // Check working hours
    const wh = await prisma.masterWorkingHours.findMany({
      where: { masterId, weekday: dayOfWeek, isClosed: false },
      select: { startMinutes: true, endMinutes: true },
    });

    if (wh.length === 0) continue; // Day off

    // Get boundaries
    const { start: dayStartUtc, end: dayEndUtc } = orgDayRange(dateISO);
    const now = new Date();

    // Busy windows
    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        startAt: { lt: dayEndUtc },
        endAt: { gt: dayStartUtc },
        status: { not: 'CANCELED' },
      },
      select: { startAt: true, endAt: true },
    });

    const timeOffs = await prisma.masterTimeOff.findMany({
      where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
      select: { startMinutes: true, endMinutes: true },
    });

    const tempRes = await prisma.temporarySlotReservation.findMany({
      where: {
        masterId,
        startAt: { lt: dayEndUtc },
        endAt: { gt: dayStartUtc },
        expiresAt: { gte: now },
      },
      select: { startAt: true, endAt: true },
    });

    const workingWindowsUtc: WindowUtc[] = wh.map((w) => ({
      start: wallMinutesToUtc(dateISO, w.startMinutes).toISOString(),
      end: wallMinutesToUtc(dateISO, w.endMinutes).toISOString(),
    }));

    const busyWindowsUtc: WindowUtc[] = [
      ...appointments.map((a) => ({
        start: a.startAt.toISOString(),
        end: a.endAt.toISOString(),
      })),
      ...tempRes.map((r) => ({
        start: r.startAt.toISOString(),
        end: r.endAt.toISOString(),
      })),
    ];

    const timeOffWindowsUtc: WindowUtc[] = timeOffs.map((t) => ({
      start: wallMinutesToUtc(dateISO, t.startMinutes).toISOString(),
      end: wallMinutesToUtc(dateISO, t.endMinutes).toISOString(),
    }));

    const freeArgs: GetFreeSlotsArgs = {
      dayStartUtcISO: dayStartUtc.toISOString(),
      dayEndUtcISO: dayEndUtc.toISOString(),
      workingWindowsUtc,
      timeOffWindowsUtc,
      busyWindowsUtc,
      durationMin: totalDurationMin,
      stepMin: 15,
      tz: ORG_TZ,
      nowUtcISO: now.toISOString(),
    };

    const slotsCount = getFreeSlots(freeArgs).length;
    if (slotsCount > 0) {
      days[dateISO] = slotsCount;
    }
  }

  return { days };
}
