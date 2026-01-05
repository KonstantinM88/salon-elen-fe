// src/app/api/availability/month/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFreeSlots, WindowUtc, GetFreeSlotsArgs } from '@/lib/booking/getFreeSlots';
import { ORG_TZ, orgDayRange, wallMinutesToUtc } from '@/lib/orgTime';

type DayBusyData = Record<string, number>;

type ApiResponse = {
  days: DayBusyData;
  splitRequired?: boolean;
  error?: string;
};

type TimeOffWindow = {
  startMinutes: number;
  endMinutes: number;
};

function parseCsv(input: string | null): string[] {
  if (!input) return [];
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
  if (serviceIds.length === 0) return 0;
  const rows = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true },
    select: { durationMin: true },
  });
  return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
}

async function masterCoversAll(masterId: string, serviceIds: string[]): Promise<boolean> {
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

function todayISO(tz: string = ORG_TZ): string {
  const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
  return s.split(' ')[0];
}

function toOrgDateISO(d: Date, tz: string = ORG_TZ): string {
  const s = d.toLocaleString('sv-SE', { timeZone: tz, hour12: false });
  return s.split(' ')[0];
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);

    const monthISO = searchParams.get('month');
    const masterId = searchParams.get('masterId');
    const serviceIdsParam = parseCsv(searchParams.get('serviceIds'));
    const singleService = searchParams.get('serviceId');
    const durationFromQuery = searchParams.get('durationMin');

    const serviceIds =
      serviceIdsParam.length > 0
        ? serviceIdsParam
        : singleService
        ? [singleService]
        : [];

    if (!masterId) {
      return NextResponse.json(
        { error: 'masterId is required', days: {} } as ApiResponse,
        { status: 400 }
      );
    }

    if (!monthISO || !/^\d{4}-\d{2}$/.test(monthISO)) {
      return NextResponse.json(
        { error: 'month (YYYY-MM) is required', days: {} } as ApiResponse,
        { status: 400 }
      );
    }

    if (serviceIds.length === 0 && !durationFromQuery) {
      return NextResponse.json(
        { error: 'serviceIds or durationMin is required', days: {} } as ApiResponse,
        { status: 400 }
      );
    }

    const totalDurationMin = durationFromQuery
      ? Math.max(0, Number(durationFromQuery))
      : await calcTotalDurationMin(serviceIds);

    if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
      return NextResponse.json(
        { error: 'invalid duration', days: {} } as ApiResponse,
        { status: 400 }
      );
    }

    if (serviceIds.length > 0) {
      const ok = await masterCoversAll(masterId, serviceIds);
      if (!ok) {
        return NextResponse.json(
          { days: {}, splitRequired: true } as ApiResponse,
          { status: 200 }
        );
      }
    }

    const [yearStr, monthStr] = monthISO.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'invalid month', days: {} } as ApiResponse,
        { status: 400 }
      );
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStartISO = `${yearStr}-${monthStr}-01`;
    const monthEndISO = `${yearStr}-${monthStr}-${pad2(daysInMonth)}`;
    const rangeStart = orgDayRange(monthStartISO).start;
    const rangeEnd = orgDayRange(monthEndISO).end;
    const now = new Date();

    const workingHours = await prisma.masterWorkingHours.findMany({
      where: { masterId },
      select: {
        weekday: true,
        startMinutes: true,
        endMinutes: true,
        isClosed: true,
      },
    });

    const workingByWeekday = new Map<number, typeof workingHours[number]>();
    workingHours.forEach((wh) => {
      workingByWeekday.set(wh.weekday, wh);
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        status: { not: 'CANCELED' },
        startAt: { lt: rangeEnd },
        endAt: { gt: rangeStart },
      },
      select: { startAt: true, endAt: true },
    });

    const timeOffs = await prisma.masterTimeOff.findMany({
      where: {
        masterId,
        date: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      select: { date: true, startMinutes: true, endMinutes: true },
    });

    const tempReservations = await prisma.temporarySlotReservation.findMany({
      where: {
        masterId,
        expiresAt: { gte: now },
        startAt: { lt: rangeEnd },
        endAt: { gt: rangeStart },
      },
      select: { startAt: true, endAt: true },
    });

    const appointmentMap: Record<string, WindowUtc[]> = {};
    const reservationMap: Record<string, WindowUtc[]> = {};
    const timeOffMap: Record<string, TimeOffWindow[]> = {};

    const addWindow = (map: Record<string, WindowUtc[]>, dateKey: string, window: WindowUtc) => {
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(window);
    };

    const addTimeOff = (dateKey: string, item: TimeOffWindow) => {
      if (!timeOffMap[dateKey]) timeOffMap[dateKey] = [];
      timeOffMap[dateKey].push(item);
    };

    appointments.forEach((a) => {
      const window: WindowUtc = {
        start: a.startAt.toISOString(),
        end: a.endAt.toISOString(),
      };
      const startDay = toOrgDateISO(a.startAt);
      const endDay = toOrgDateISO(a.endAt);
      addWindow(appointmentMap, startDay, window);
      if (endDay !== startDay) addWindow(appointmentMap, endDay, window);
    });

    tempReservations.forEach((r) => {
      const window: WindowUtc = {
        start: r.startAt.toISOString(),
        end: r.endAt.toISOString(),
      };
      const startDay = toOrgDateISO(r.startAt);
      const endDay = toOrgDateISO(r.endAt);
      addWindow(reservationMap, startDay, window);
      if (endDay !== startDay) addWindow(reservationMap, endDay, window);
    });

    timeOffs.forEach((t) => {
      const dateKey = toOrgDateISO(t.date);
      addTimeOff(dateKey, { startMinutes: t.startMinutes, endMinutes: t.endMinutes });
    });

    const days: DayBusyData = {};
    const nowUtcISO = new Date().toISOString();
    const today = todayISO();

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayISO = `${yearStr}-${monthStr}-${pad2(day)}`;
      if (dayISO < today) {
        days[dayISO] = 0;
        continue;
      }

      const weekday = new Date(`${dayISO}T00:00:00Z`).getUTCDay();
      const wh = workingByWeekday.get(weekday);

      if (!wh || wh.isClosed || wh.startMinutes >= wh.endMinutes) {
        days[dayISO] = 0;
        continue;
      }

      const dayRange = orgDayRange(dayISO);
      const workingWindowsUtc: WindowUtc[] = [
        {
          start: wallMinutesToUtc(dayISO, wh.startMinutes).toISOString(),
          end: wallMinutesToUtc(dayISO, wh.endMinutes).toISOString(),
        },
      ];

      const timeOffWindowsUtc: WindowUtc[] = (timeOffMap[dayISO] ?? []).map((t) => ({
        start: wallMinutesToUtc(dayISO, t.startMinutes).toISOString(),
        end: wallMinutesToUtc(dayISO, t.endMinutes).toISOString(),
      }));

      const busyWindowsUtc: WindowUtc[] = [
        ...(appointmentMap[dayISO] ?? []),
        ...(reservationMap[dayISO] ?? []),
      ];

      const args: GetFreeSlotsArgs = {
        dayStartUtcISO: dayRange.start.toISOString(),
        dayEndUtcISO: dayRange.end.toISOString(),
        workingWindowsUtc,
        timeOffWindowsUtc,
        busyWindowsUtc,
        durationMin: totalDurationMin,
        stepMin: 15,
        tz: ORG_TZ,
        nowUtcISO,
      };

      let slots = getFreeSlots(args);

      if (dayISO === today) {
        const cutoffISO = new Date(Date.now() + 60 * 60_000).toISOString();
        slots = slots.filter((s) => s >= cutoffISO);
      }

      days[dayISO] = slots.length;
    }

    const response = NextResponse.json({ days } as ApiResponse, { status: 200 });
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return response;
  } catch (e) {
    console.error('[availability/month] Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'internal_error';
    return NextResponse.json(
      { error: errorMessage, days: {} } as ApiResponse,
      { status: 500 }
    );
  }
}
