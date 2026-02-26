// src/lib/booking/availability-service.ts
// Shared availability logic — used by both /api/availability and AI tools.
// Extracted from src/app/api/availability/route.ts to avoid duplication.

import { prisma } from '@/lib/prisma';
import {
  getFreeSlots,
  type WindowUtc,
  type GetFreeSlotsArgs,
} from '@/lib/booking/getFreeSlots';
import {
  ORG_TZ,
  orgDayRange,
  wallMinutesToUtc,
  utcToWallMinutes,
} from '@/lib/orgTime';

// ─── Types ──────────────────────────────────────────────────────

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  startMinutes: number;
  endMinutes: number;
  /** Human-readable time range in Berlin TZ, e.g. "10:00–10:45" */
  displayTime: string;
}

export interface AvailabilityResult {
  slots: AvailabilitySlot[];
  splitRequired: boolean;
  firstDateISO: string | null;
  totalDurationMin: number;
}

export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'any';

interface GetAvailabilityArgs {
  masterId: string;
  dateISO: string;
  serviceIds: string[];
  durationMinOverride?: number;
  preferredTime?: PreferredTime;
}

// ─── Helpers ────────────────────────────────────────────────────

async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
  if (serviceIds.length === 0) return 0;
  const rows = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { durationMin: true },
  });
  return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
}

async function masterCoversAll(
  masterId: string,
  serviceIds: string[],
): Promise<boolean> {
  if (serviceIds.length === 0) return true;
  const cnt = await prisma.service.count({
    where: {
      id: { in: serviceIds },
      isActive: true,
      masters: { some: { id: masterId } },
    },
  });
  return cnt === serviceIds.length;
}

function todayISO(): string {
  const s = new Date().toLocaleString('sv-SE', {
    timeZone: ORG_TZ,
    hour12: false,
  });
  return s.split(' ')[0];
}

function formatTimeRange(startUtc: Date, endUtc: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString('de-DE', {
      timeZone: ORG_TZ,
      hour: '2-digit',
      minute: '2-digit',
    });
  return `${fmt(startUtc)}–${fmt(endUtc)}`;
}

function filterByPreference(
  slots: AvailabilitySlot[],
  pref: PreferredTime,
): AvailabilitySlot[] {
  if (pref === 'any') return slots;
  return slots.filter((s) => {
    const m = s.startMinutes;
    switch (pref) {
      case 'morning':
        return m < 720; // <12:00
      case 'afternoon':
        return m >= 720 && m < 1020; // 12:00–17:00
      case 'evening':
        return m >= 1020; // ≥17:00
      default:
        return true;
    }
  });
}

// ─── Main function ──────────────────────────────────────────────

export async function getAvailableSlots(
  args: GetAvailabilityArgs,
): Promise<AvailabilityResult> {
  const { masterId, dateISO, serviceIds, durationMinOverride, preferredTime } =
    args;

  // Duration
  const totalDurationMin =
    durationMinOverride ?? (await calcTotalDurationMin(serviceIds));

  if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
    return { slots: [], splitRequired: false, firstDateISO: dateISO, totalDurationMin: 0 };
  }

  // Master covers all services?
  if (serviceIds.length > 0) {
    const ok = await masterCoversAll(masterId, serviceIds);
    if (!ok) {
      return { slots: [], splitRequired: true, firstDateISO: null, totalDurationMin };
    }
  }

  // Past date?
  const today = todayISO();
  if (dateISO < today) {
    return { slots: [], splitRequired: false, firstDateISO: dateISO, totalDurationMin };
  }

  // Day boundaries in UTC
  const { start: dayStartUtc, end: dayEndUtc } = orgDayRange(dateISO);
  const dayOfWeek = new Date(`${dateISO}T00:00:00Z`).getUTCDay();

  // Working hours
  const workingHours = await prisma.masterWorkingHours.findMany({
    where: { masterId, weekday: dayOfWeek, isClosed: false },
    select: { startMinutes: true, endMinutes: true },
  });

  // Appointments
  const appointments = await prisma.appointment.findMany({
    where: {
      masterId,
      startAt: { lt: dayEndUtc },
      endAt: { gt: dayStartUtc },
      status: { not: 'CANCELED' },
    },
    select: { startAt: true, endAt: true },
  });

  // Time offs
  const timeOffs = await prisma.masterTimeOff.findMany({
    where: {
      masterId,
      date: { gte: dayStartUtc, lt: dayEndUtc },
    },
    select: { date: true, startMinutes: true, endMinutes: true },
  });

  // Temporary reservations
  const now = new Date();
  const tempReservations = await prisma.temporarySlotReservation.findMany({
    where: {
      masterId,
      startAt: { lt: dayEndUtc },
      endAt: { gt: dayStartUtc },
      expiresAt: { gte: now },
    },
    select: { startAt: true, endAt: true },
  });

  // Build windows
  const workingWindowsUtc: WindowUtc[] = workingHours.map((w) => ({
    start: wallMinutesToUtc(dateISO, w.startMinutes).toISOString(),
    end: wallMinutesToUtc(dateISO, w.endMinutes).toISOString(),
  }));

  const busyWindowsUtc: WindowUtc[] = [
    ...appointments.map((a) => ({
      start: a.startAt.toISOString(),
      end: a.endAt.toISOString(),
    })),
    ...tempReservations.map((r) => ({
      start: r.startAt.toISOString(),
      end: r.endAt.toISOString(),
    })),
  ];

  const timeOffWindowsUtc: WindowUtc[] = timeOffs.map((t) => ({
    start: wallMinutesToUtc(dateISO, t.startMinutes).toISOString(),
    end: wallMinutesToUtc(dateISO, t.endMinutes).toISOString(),
  }));

  // Get free slots
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

  const slotISOList = getFreeSlots(freeArgs);

  // Build result slots
  let slots: AvailabilitySlot[] = slotISOList.map((startISO) => {
    const start = new Date(startISO);
    const end = new Date(start.getTime() + totalDurationMin * 60_000);

    return {
      startAt: startISO,
      endAt: end.toISOString(),
      startMinutes: utcToWallMinutes(dateISO, start),
      endMinutes: utcToWallMinutes(dateISO, end),
      displayTime: formatTimeRange(start, end),
    };
  });

  // Apply preference filter
  if (preferredTime && preferredTime !== 'any') {
    const filtered = filterByPreference(slots, preferredTime);
    // If filter yields results, use them; otherwise fall back to all
    if (filtered.length > 0) {
      slots = filtered;
    }
  }

  return {
    slots,
    splitRequired: false,
    firstDateISO: dateISO,
    totalDurationMin,
  };
}
