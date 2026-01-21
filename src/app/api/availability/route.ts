// src/app/api/availability/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFreeSlots, WindowUtc, GetFreeSlotsArgs } from '@/lib/booking/getFreeSlots';
import { ORG_TZ, orgDayRange, wallMinutesToUtc, utcToWallMinutes } from '@/lib/orgTime';

type Slot = {
  startAt: string;
  endAt: string;
  startMinutes: number;
  endMinutes: number;
};

type ApiResponse = {
  slots: Slot[];
  splitRequired: boolean;
  firstDateISO: string | null;
  error?: string;
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

// ✅ Получить временные резервации для мастера на день
async function getTemporaryReservations(
  masterId: string,
  dayStartUtc: Date,
  dayEndUtc: Date
): Promise<WindowUtc[]> {
  const now = new Date();
  
  // Получить активные резервации
  const reservations = await prisma.temporarySlotReservation.findMany({
    where: {
      masterId,
      startAt: { lt: dayEndUtc },
      endAt: { gt: dayStartUtc },
      expiresAt: { gte: now },
    },
    select: {
      startAt: true,
      endAt: true,
    },
  });
  
  return reservations.map(r => ({
    start: r.startAt.toISOString(),
    end: r.endAt.toISOString(),
  }));
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);

    const dateISO = searchParams.get('dateISO');
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

    // Валидация
    if (!masterId) {
      return NextResponse.json(
        { error: 'masterId is required', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
        { status: 400 }
      );
    }

    if (!dateISO || dateISO.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
      return NextResponse.json(
        { error: 'dateISO (YYYY-MM-DD) is required', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
        { status: 400 }
      );
    }

    if (serviceIds.length === 0 && !durationFromQuery) {
      return NextResponse.json(
        { error: 'serviceIds or durationMin is required', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
        { status: 400 }
      );
    }

    // Вычисляем длительность
    const totalDurationMin = durationFromQuery
      ? Math.max(0, Number(durationFromQuery))
      : await calcTotalDurationMin(serviceIds);

    if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
      return NextResponse.json(
        { error: 'invalid duration', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
        { status: 400 }
      );
    }

    // Проверяем мастера
    if (serviceIds.length > 0) {
      const ok = await masterCoversAll(masterId, serviceIds);
      if (!ok) {
        return NextResponse.json(
          { slots: [], splitRequired: true, firstDateISO: null } as ApiResponse,
          { status: 200 }
        );
      }
    }

    // Если дата в прошлом
    const today = todayISO();
    if (dateISO < today) {
      return NextResponse.json(
        { slots: [], splitRequired: false, firstDateISO: dateISO } as ApiResponse,
        { status: 200 }
      );
    }

    // Границы дня в UTC (локальная полуночь в TZ салона)
    const { start: dayStartUtc, end: dayEndUtc } = orgDayRange(dateISO);
    const dayOfWeek = new Date(`${dateISO}T00:00:00Z`).getUTCDay();

    // ✅ ИСПРАВЛЕНО: Используем MasterWorkingHours вместо WorkingHours
    const workingHours = await prisma.masterWorkingHours.findMany({
      where: {
        masterId,
        weekday: dayOfWeek,
        isClosed: false,
      },
      select: {
        startMinutes: true,
        endMinutes: true,
      },
    });

    // ✅ ИСПРАВЛЕНО: status используется как enum, не строка
    const appointments = await prisma.appointment.findMany({
      where: {
        masterId,
        startAt: { lt: dayEndUtc },
        endAt: { gt: dayStartUtc },
        status: { not: 'CANCELED' },
      },
      select: { 
        startAt: true, 
        endAt: true 
      },
    });

    // ✅ ИСПРАВЛЕНО: Используем MasterTimeOff вместо TimeOff
    const timeOffs = await prisma.masterTimeOff.findMany({
      where: {
        masterId,
        date: {
          gte: dayStartUtc,
          lt: dayEndUtc,
        },
      },
      select: { 
        date: true,
        startMinutes: true,
        endMinutes: true,
      },
    });

    // ✅ Получаем временные резервации
    const tempReservations = await getTemporaryReservations(masterId, dayStartUtc, dayEndUtc);

    // ✅ ИСПРАВЛЕНО: Формируем окна из startMinutes/endMinutes в TZ салона
    const workingWindowsUtc: WindowUtc[] = workingHours.map(w => {
      const start = wallMinutesToUtc(dateISO, w.startMinutes);
      const end = wallMinutesToUtc(dateISO, w.endMinutes);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    });

    const busyWindowsUtc: WindowUtc[] = appointments.map(a => ({
      start: a.startAt.toISOString(),
      end: a.endAt.toISOString(),
    }));

    // ✅ ИСПРАВЛЕНО: Формируем timeOff окна из startMinutes/endMinutes в TZ салона
    const timeOffWindowsUtc: WindowUtc[] = timeOffs.map(t => {
      const start = wallMinutesToUtc(dateISO, t.startMinutes);
      const end = wallMinutesToUtc(dateISO, t.endMinutes);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    });

    // ✅ ВАЖНО: Добавляем временные резервации к занятым окнам
    const allBusyWindows = [...busyWindowsUtc, ...tempReservations];

    const nowUtcISO = new Date().toISOString();

    const args: GetFreeSlotsArgs = {
      dayStartUtcISO: dayStartUtc.toISOString(),
      dayEndUtcISO: dayEndUtc.toISOString(),
      workingWindowsUtc,
      timeOffWindowsUtc,
      busyWindowsUtc: allBusyWindows,
      durationMin: totalDurationMin,
      stepMin: 15,
      tz: ORG_TZ,
      nowUtcISO,
    };

    const slotISOList = getFreeSlots(args);

    // Преобразуем в формат Slot
    const slots: Slot[] = slotISOList.map(startISO => {
      const start = new Date(startISO);
      const end = new Date(start.getTime() + totalDurationMin * 60_000);
      
      const startMin = utcToWallMinutes(dateISO, start);
      const endMin = utcToWallMinutes(dateISO, end);
      
      return {
        startAt: startISO,
        endAt: end.toISOString(),
        startMinutes: startMin,
        endMinutes: endMin,
      };
    });

    const response = NextResponse.json(
      { slots, splitRequired: false, firstDateISO: dateISO } as ApiResponse,
      { status: 200 }
    );

    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    
    return response;
  } catch (e) {
    console.error('[availability/route] Error:', e);
    
    const errorMessage = e instanceof Error ? e.message : 'internal_error';
    
    return NextResponse.json(
      { error: errorMessage, slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
      { status: 500 }
    );
  }
}
