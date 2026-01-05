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



//----------работало добовляем резервацию слота---------
// // src/app/api/availability/route.ts
// import { NextResponse, NextRequest } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getFreeSlots } from '@/lib/booking/getFreeSlots';

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// type ApiResponse = {
//   slots: Slot[];
//   splitRequired: boolean;
//   firstDateISO: string | null;
//   error?: string;
// };

// function parseCsv(input: string | null): string[] {
//   if (!input) return [];
//   return input.split(',').map(s => s.trim()).filter(Boolean);
// }

// async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
//   if (serviceIds.length === 0) return 0;
  
//   const rows = await prisma.service.findMany({
//     where: { id: { in: serviceIds }, isActive: true },
//     select: { durationMin: true },
//   });
  
//   return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
// }

// async function masterCoversAll(masterId: string, serviceIds: string[]): Promise<boolean> {
//   if (serviceIds.length === 0) return true;
  
//   const cnt = await prisma.service.count({
//     where: {
//       id: { in: serviceIds },
//       isActive: true,
//       masters: { some: { id: masterId } },
//     },
//   });
  
//   return cnt === serviceIds.length;
// }

// function todayISO(tz: string = ORG_TZ): string {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// }

// function nowInTZ(tz: string = ORG_TZ): Date {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   const [d, t] = s.split(' ');
//   const [y, m, day] = d.split('-').map(Number);
//   const [hh, mm, ss] = t.split(':').map(Number);
//   return new Date(y, m - 1, day, hh, mm, ss, 0);
// }

// function filterByCutoff(slots: Slot[], dateISO: string): Slot[] {
//   const today = todayISO();
//   if (dateISO !== today) return slots;
  
//   const cutoff = new Date(nowInTZ().getTime() + 60 * 60_000);
//   return slots.filter(s => new Date(s.startAt) >= cutoff);
// }

// export async function GET(req: NextRequest): Promise<Response> {
//   try {
//     const { searchParams } = new URL(req.url);

//     const dateISO = searchParams.get('dateISO');
//     const masterId = searchParams.get('masterId');
//     const serviceIdsParam = parseCsv(searchParams.get('serviceIds'));
//     const singleService = searchParams.get('serviceId');
//     const durationFromQuery = searchParams.get('durationMin');

//     const serviceIds =
//       serviceIdsParam.length > 0
//         ? serviceIdsParam
//         : singleService
//         ? [singleService]
//         : [];

//     // Валидация обязательных параметров
//     if (!masterId) {
//       return NextResponse.json(
//         { error: 'masterId is required', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
//         { status: 400 }
//       );
//     }

//     if (!dateISO || dateISO.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
//       return NextResponse.json(
//         { error: 'dateISO (YYYY-MM-DD) is required', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
//         { status: 400 }
//       );
//     }

//     if (serviceIds.length === 0 && !durationFromQuery) {
//       return NextResponse.json(
//         { error: 'serviceIds or durationMin is required', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
//         { status: 400 }
//       );
//     }

//     // Вычисляем длительность
//     const totalDurationMin = durationFromQuery
//       ? Math.max(0, Number(durationFromQuery))
//       : await calcTotalDurationMin(serviceIds);

//     if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
//       return NextResponse.json(
//         { error: 'invalid duration', slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
//         { status: 400 }
//       );
//     }

//     // Проверяем, что мастер выполняет все услуги
//     if (serviceIds.length > 0) {
//       const ok = await masterCoversAll(masterId, serviceIds);
//       if (!ok) {
//         return NextResponse.json(
//           { slots: [], splitRequired: true, firstDateISO: null } as ApiResponse,
//           { status: 200 }
//         );
//       }
//     }

//     // Если дата в прошлом — ничего не отдаём
//     const today = todayISO();
//     if (dateISO < today) {
//       return NextResponse.json(
//         { slots: [], splitRequired: false, firstDateISO: dateISO } as ApiResponse,
//         { status: 200 }
//       );
//     }

//     // Получаем слоты за один день
//     const raw = await getFreeSlots({
//       dateISO,
//       masterId,
//       durationMin: totalDurationMin,
//     });

//     // Для сегодняшней даты фильтруем слоты, начинающиеся раньше чем now+60 мин
//     const slots = filterByCutoff(raw, dateISO);

//     // Добавляем заголовки для кэширования на короткое время
//     const response = NextResponse.json(
//       { slots, splitRequired: false, firstDateISO: dateISO } as ApiResponse,
//       { status: 200 }
//     );

//     response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    
//     return response;
//   } catch (e) {
//     console.error('[availability/route] Error:', e);
    
//     const errorMessage = e instanceof Error ? e.message : 'internal_error';
    
//     return NextResponse.json(
//       { error: errorMessage, slots: [], splitRequired: false, firstDateISO: null } as ApiResponse,
//       { status: 500 }
//     );
//   }
// }




// // src/app/api/availability/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getFreeSlots } from '@/lib/booking/getFreeSlots';

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// type Slot = {
//   startAt: string;
//   endAt: string;
//   startMinutes: number;
//   endMinutes: number;
// };

// function parseCsv(input: string | null): string[] {
//   if (!input) return [];
//   return input.split(',').map(s => s.trim()).filter(Boolean);
// }

// async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
//   if (serviceIds.length === 0) return 0;
//   const rows = await prisma.service.findMany({
//     where: { id: { in: serviceIds }, isActive: true },
//     select: { durationMin: true },
//   });
//   return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
// }

// async function masterCoversAll(masterId: string, serviceIds: string[]): Promise<boolean> {
//   if (serviceIds.length === 0) return true;
//   const cnt = await prisma.service.count({
//     where: {
//       id: { in: serviceIds },
//       isActive: true,
//       masters: { some: { id: masterId } },
//     },
//   });
//   return cnt === serviceIds.length;
// }

// function todayISO(tz: string = ORG_TZ): string {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   return s.split(' ')[0];
// }

// function nowInTZ(tz: string = ORG_TZ): Date {
//   const s = new Date().toLocaleString('sv-SE', { timeZone: tz, hour12: false });
//   const [d, t] = s.split(' ');
//   const [y, m, day] = d.split('-').map(Number);
//   const [hh, mm, ss] = t.split(':').map(Number);
//   return new Date(y, m - 1, day, hh, mm, ss, 0);
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const dateISO = searchParams.get('dateISO');          // ТЕПЕРЬ ОБЯЗАТЕЛЕН
//     const masterId = searchParams.get('masterId');
//     const serviceIdsParam = parseCsv(searchParams.get('serviceIds'));
//     const singleService = searchParams.get('serviceId');
//     const durationFromQuery = searchParams.get('durationMin');

//     const serviceIds =
//       serviceIdsParam.length > 0
//         ? serviceIdsParam
//         : singleService
//         ? [singleService]
//         : [];

//     if (!masterId) {
//       return NextResponse.json({ error: 'masterId is required' }, { status: 400 });
//     }
//     if (!dateISO || dateISO.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
//       return NextResponse.json({ error: 'dateISO (YYYY-MM-DD) is required' }, { status: 400 });
//     }
//     if (serviceIds.length === 0 && !durationFromQuery) {
//       return NextResponse.json({ error: 'serviceIds or durationMin is required' }, { status: 400 });
//     }

//     const totalDurationMin = durationFromQuery
//       ? Math.max(0, Number(durationFromQuery))
//       : await calcTotalDurationMin(serviceIds);

//     if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
//       return NextResponse.json({ error: 'invalid duration' }, { status: 400 });
//     }

//     if (serviceIds.length > 0) {
//       const ok = await masterCoversAll(masterId, serviceIds);
//       if (!ok) {
//         return NextResponse.json({ slots: [], splitRequired: true, firstDateISO: null });
//       }
//     }

//     // Если дата в прошлом — ничего не отдаём
//     const today = todayISO();
//     if (dateISO < today) {
//       return NextResponse.json({ slots: [], splitRequired: false, firstDateISO: dateISO });
//     }

//     // Слоты за один день
//     const raw = await getFreeSlots({
//       dateISO,
//       masterId,
//       durationMin: totalDurationMin,
//     });

//     // На «сегодня» отфильтруем слоты, начинающиеся раньше чем now+60 мин
//     const slots = filterByCutoff(raw, dateISO);
//     return NextResponse.json({ slots, splitRequired: false, firstDateISO: dateISO });
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error(e);
//     return NextResponse.json({ error: 'internal_error' }, { status: 500 });
//   }
// }

// function filterByCutoff(slots: Slot[], dateISO: string): Slot[] {
//   const today = todayISO();
//   if (dateISO !== today) return slots;
//   const cutoff = new Date(nowInTZ().getTime() + 60 * 60_000);
//   return slots.filter(s => new Date(s.startAt) >= cutoff);
// }




// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getFreeSlots } from "@/lib/booking/getFreeSlots";

// /* =========================
//    Константы времени
// ========================= */

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

// /** YYYY-MM-DD «сегодня» в заданной TZ */
// function todayISO(tz: string = ORG_TZ): string {
//   const s = new Date().toLocaleString("sv-SE", { timeZone: tz, hour12: false });
//   return s.split(" ")[0];
// }

// /** Добавить дни к дате ISO */
// function addDaysISO(iso: string, days: number): string {
//   const [y, m, d] = iso.split("-").map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return dt.toISOString().slice(0, 10);
// }

// /** Порог «через N минут» от текущего UTC-времени */
// function thresholdUtcMinutesFromNow(minutes: number): Date {
//   return new Date(Date.now() + minutes * 60_000);
// }

// /* =========================
//    Типы
// ========================= */

// type Slot = {
//   startAt: string;      // ISO
//   endAt: string;        // ISO
//   startMinutes: number; // минут с 00:00 локального дня мастера
//   endMinutes: number;   // минут с 00:00 локального дня мастера
// };

// /* =========================
//    Утилиты
// ========================= */

// /** Парсер CSV: "a,b , c" -> ["a","b","c"] */
// function parseCsv(input: string | null): string[] {
//   if (!input) return [];
//   return input
//     .split(",")
//     .map(s => s.trim())
//     .filter(s => s.length > 0);
// }

// /** Суммарная длительность активных услуг, игнорируя неактивные/несуществующие */
// async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
//   if (serviceIds.length === 0) return 0;
//   const rows = await prisma.service.findMany({
//     where: { id: { in: serviceIds }, isActive: true },
//     select: { durationMin: true },
//   });
//   return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
// }

// /** Проверка, что мастер выполняет все указанные услуги */
// async function masterCoversAll(masterId: string, serviceIds: string[]): Promise<boolean> {
//   if (serviceIds.length === 0) return true;
//   const cnt = await prisma.service.count({
//     where: {
//       id: { in: serviceIds },
//       isActive: true,
//       masters: { some: { id: masterId } },
//     },
//   });
//   return cnt === serviceIds.length;
// }

// /* =========================
//    Handler
// ========================= */

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // Входные параметры
//     const dateISOParam = searchParams.get("dateISO");              // опционально: YYYY-MM-DD
//     const masterId = searchParams.get("masterId");                 // обязательно
//     const serviceIdsParam = parseCsv(searchParams.get("serviceIds"));
//     const singleService = searchParams.get("serviceId");
//     const durationFromQuery = searchParams.get("durationMin");     // опционально

//     // Нормализация списка услуг
//     const serviceIds: string[] =
//       serviceIdsParam.length > 0
//         ? serviceIdsParam
//         : singleService
//         ? [singleService]
//         : [];

//     // Валидация обязательных полей
//     if (!masterId) {
//       return NextResponse.json({ error: "masterId is required" }, { status: 400 });
//     }
//     if (serviceIds.length === 0 && !durationFromQuery) {
//       return NextResponse.json({ error: "serviceIds or durationMin is required" }, { status: 400 });
//     }

//     // Длительность услуги/набора услуг
//     const totalDurationMin = durationFromQuery
//       ? Math.max(0, Number(durationFromQuery))
//       : await calcTotalDurationMin(serviceIds);

//     if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
//       return NextResponse.json({ error: "invalid duration" }, { status: 400 });
//     }

//     // Проверка покрытия услуг мастером
//     if (serviceIds.length > 0) {
//       const ok = await masterCoversAll(masterId, serviceIds);
//       if (!ok) {
//         return NextResponse.json({ slots: [], splitRequired: true, firstDateISO: null });
//       }
//     }

//     // Текущая дата в TZ организации
//     const orgToday = todayISO(ORG_TZ);

//     // Если дата не задана, ищем первую доступную, начиная с «сегодня» в TZ организации, в пределах 9 недель
//     if (!dateISOParam) {
//       const maxDate = addDaysISO(orgToday, 9 * 7 - 1);

//       let currentDate = orgToday;
//       while (currentDate <= maxDate) {
//         try {
//           let daySlots: Slot[] = await getFreeSlots({
//             dateISO: currentDate,
//             masterId,
//             durationMin: totalDurationMin,
//           });

//           // На «сегодня» применяем порог 60 минут
//           if (currentDate === orgToday && daySlots.length > 0) {
//             const threshold = thresholdUtcMinutesFromNow(60);
//             daySlots = daySlots.filter(s => new Date(s.startAt) >= threshold);
//           }

//           if (daySlots.length > 0) {
//             return NextResponse.json({
//               slots: daySlots,
//               splitRequired: false,
//               firstDateISO: currentDate,
//             });
//           }
//         } catch {
//           // Игнорируем ошибки отдельного дня и продолжаем
//         }
//         currentDate = addDaysISO(currentDate, 1);
//       }

//       // Ничего не найдено в пределах 9 недель
//       return NextResponse.json({
//         slots: [],
//         splitRequired: false,
//         firstDateISO: null,
//       });
//     }

//     // Валидация формата dateISO
//     const dateISO = dateISOParam;
//     if (dateISO.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
//       return NextResponse.json({ error: "invalid dateISO format (expected YYYY-MM-DD)" }, { status: 400 });
//     }

//     // Блокируем прошедшие даты и «вчерашнее число» в TZ организации
//     if (dateISO < orgToday) {
//       return NextResponse.json({ slots: [], splitRequired: false, firstDateISO: dateISO });
//     }

//     // Слоты на запрошенный день
//     let slots: Slot[] = await getFreeSlots({
//       dateISO,
//       masterId,
//       durationMin: totalDurationMin,
//     });

//     // Для «сегодня» отсекаем слоты с началом раньше чем через 60 минут
//     if (dateISO === orgToday && slots.length > 0) {
//       const threshold = thresholdUtcMinutesFromNow(60);
//       slots = slots.filter(s => new Date(s.startAt) >= threshold);
//     }

//     return NextResponse.json({ slots, splitRequired: false, firstDateISO: dateISO });
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error(e);
//     return NextResponse.json({ error: "internal_error" }, { status: 500 });
//   }
// }





// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { getFreeSlots } from "@/lib/booking/getFreeSlots";

// /** Парсер CSV: "a,b , c" -> ["a","b","c"] */
// function parseCsv(input: string | null): string[] {
//   if (!input) return [];
//   return input
//     .split(",")
//     .map(s => s.trim())
//     .filter(s => s.length > 0);
// }

// /** Суммарная длительность активных услуг, игнорируя неактивные/несуществующие */
// async function calcTotalDurationMin(serviceIds: string[]): Promise<number> {
//   if (serviceIds.length === 0) return 0;
//   const rows = await prisma.service.findMany({
//     where: { id: { in: serviceIds }, isActive: true },
//     select: { durationMin: true },
//   });
//   return rows.reduce((acc, r) => acc + (r.durationMin ?? 0), 0);
// }

// /** Проверка, что мастер выполняет все указанные услуги */
// async function masterCoversAll(masterId: string, serviceIds: string[]): Promise<boolean> {
//   if (serviceIds.length === 0) return true;
//   const cnt = await prisma.service.count({
//     where: {
//       id: { in: serviceIds },
//       isActive: true,
//       masters: { some: { id: masterId } },
//     },
//   });
//   return cnt === serviceIds.length;
// }

// /** Добавить дни к дате ISO */
// function addDaysISO(iso: string, days: number): string {
//   const [y, m, d] = iso.split('-').map(Number);
//   const dt = new Date(y, m - 1, d);
//   dt.setDate(dt.getDate() + days);
//   return dt.toISOString().slice(0, 10);
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);

//     // входные параметры
//     const dateISO = searchParams.get("dateISO");                   // опциональный день в формате YYYY-MM-DD
//     const masterId = searchParams.get("masterId");                 // обязательный для персонального графика
//     const serviceIdsParam = parseCsv(searchParams.get("serviceIds"));
//     const singleService = searchParams.get("serviceId");
//     const durationFromQuery = searchParams.get("durationMin");     // опционально, перегружает расчёт по услугам

//     // формируем список услуг: serviceIds приоритетнее, затем serviceId
//     const serviceIds: string[] =
//       serviceIdsParam.length > 0
//         ? serviceIdsParam
//         : singleService
//         ? [singleService]
//         : [];

//     // валидация обязательных полей
//     if (!masterId) {
//       // Клиент должен сначала выбрать мастера, чтобы слоты считались по его персональному графику
//       return NextResponse.json({ error: "masterId is required" }, { status: 400 });
//     }
//     if (serviceIds.length === 0 && !durationFromQuery) {
//       // либо услуги, либо явная длительность
//       return NextResponse.json({ error: "serviceIds or durationMin is required" }, { status: 400 });
//     }

//     // длительность
//     const totalDurationMin = durationFromQuery
//       ? Math.max(0, Number(durationFromQuery))
//       : await calcTotalDurationMin(serviceIds);

//     if (!Number.isFinite(totalDurationMin) || totalDurationMin <= 0) {
//       return NextResponse.json({ error: "invalid duration" }, { status: 400 });
//     }

//     // мастер должен уметь выполнять все услуги, иначе предлагаем разделить запись
//     if (serviceIds.length > 0) {
//       const ok = await masterCoversAll(masterId, serviceIds);
//       if (!ok) {
//         return NextResponse.json({ slots: [], splitRequired: true, firstDateISO: null });
//       }
//     }

//     // Если dateISO не передан, ищем первую доступную дату в пределах 9 недель
//     if (!dateISO) {
//       const today = new Date().toISOString().slice(0, 10);
//       const maxDate = addDaysISO(today, 9 * 7 - 1);

//       let currentDate = today;
//       while (currentDate <= maxDate) {
//         try {
//           const slots = await getFreeSlots({
//             dateISO: currentDate,
//             masterId,
//             durationMin: totalDurationMin,
//           });

//           if (slots.length > 0) {
//             return NextResponse.json({
//               slots,
//               splitRequired: false,
//               firstDateISO: currentDate
//             });
//           }
//         } catch {
//           // Игнорируем ошибки для отдельных дат и продолжаем поиск
//         }
//         currentDate = addDaysISO(currentDate, 1);
//       }

//       // Не найдено доступных дат в пределах 9 недель
//       return NextResponse.json({
//         slots: [],
//         splitRequired: false,
//         firstDateISO: null
//       });
//     }

//     // Валидация формата dateISO
//     if (dateISO.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
//       return NextResponse.json({ error: "invalid dateISO format (expected YYYY-MM-DD)" }, { status: 400 });
//     }

//     // свободные слоты на указанный день
//     const slots = await getFreeSlots({
//       dateISO,
//       masterId,
//       durationMin: totalDurationMin,
//     });

//     return NextResponse.json({ slots, splitRequired: false, firstDateISO: dateISO });
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error(e);
//     return NextResponse.json({ error: "internal_error" }, { status: 500 });
//   }
// }







//----------------до 27.10
// // src/app/api/availability/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { AppointmentStatus } from "@prisma/client";
// import { prisma } from "@/lib/prisma";
// import { buildDayUtcRange, minutesToUtcISO, tzNowUtcISO } from "@/lib/datetime";
// import { getFreeSlots } from "./getFreeSlots";

// // важное: не кэшировать и рендерить на Node, чтобы Next не отдавал HTML
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// // Организационная тайм-зона (по умолчанию Берлин)
// const ORG_TZ = process.env.ORG_TZ ?? "Europe/Berlin";

// // Включать «резервные» часы, если не заведены рабочие
// const FALLBACK_HOURS_ENABLED = process.env.FALLBACK_HOURS_ENABLED === "true";

// // Какие статусы считаем занятыми
// const BUSY_STATUSES: Readonly<AppointmentStatus[]> = [
//   AppointmentStatus.CONFIRMED,
//   AppointmentStatus.PENDING,
// ];

// // Локальные типы (без any)
// type Iso = string;
// type WindowUtc = { start: Iso; end: Iso };

// export async function GET(req: NextRequest) {
//   try {
//     const search = new URL(req.url).searchParams;

//     // Поддерживаем как новые, так и старые имена query-параметров
//     const serviceParam = search.get("service") ?? search.get("serviceSlug") ?? "";
//     const masterId = search.get("masterId") ?? "";
//     const dateISO = search.get("dateISO") ?? "";
//     const maybeDuration = Number(search.get("durationMin") ?? search.get("m") ?? NaN);
//     const debug = search.get("debug") === "1";

//     if (!serviceParam) {
//       return NextResponse.json(
//         { ok: false, error: "Missing query param: service" },
//         { status: 400 },
//       );
//     }
//     if (!dateISO) {
//       return NextResponse.json(
//         { ok: false, error: "Missing query param: dateISO" },
//         { status: 400 },
//       );
//     }
//     if (!masterId) {
//       return NextResponse.json(
//         { ok: false, error: "Missing query param: masterId" },
//         { status: 400 },
//       );
//     }

//     // 1) Услуга и длительность
//     const service = await prisma.service.findFirst({
//       where: { OR: [{ id: serviceParam }, { slug: serviceParam }] },
//       select: { id: true, isActive: true, durationMin: true },
//     });

//     if (!service || !service.isActive) {
//       return NextResponse.json(
//         { ok: false, error: "Service not found or inactive" },
//         { status: 404 },
//       );
//     }

//     const durationMin = Number.isFinite(maybeDuration)
//       ? maybeDuration
//       : service.durationMin;

//     // 2) Границы дня в UTC, построенные из «локального» дня ORG_TZ
//     const { dayStartUtc, dayEndUtc, weekday } = buildDayUtcRange(dateISO, ORG_TZ);
//     const dayStartUtcISO = dayStartUtc;
//     const dayEndUtcISO = dayEndUtc;

//     // 3) Рабочие окна мастера в этот день
//     const wh = await prisma.masterWorkingHours.findFirst({
//       where: { masterId, weekday },
//       select: { isClosed: true, startMinutes: true, endMinutes: true },
//     });

//     const workingWindowsUtc: WindowUtc[] = [];
//     let usedFallback = false;

//     if (
//       wh &&
//       !wh.isClosed &&
//       wh.startMinutes != null &&
//       wh.endMinutes != null &&
//       wh.endMinutes > wh.startMinutes
//     ) {
//       const startISO = minutesToUtcISO(dayStartUtcISO, wh.startMinutes);
//       const endISO = minutesToUtcISO(dayStartUtcISO, wh.endMinutes);
//       workingWindowsUtc.push({ start: startISO, end: endISO });
//     } else if (FALLBACK_HOURS_ENABLED) {
//       // Fallback: пн–сб 10:00–19:00, вс — выходной
//       if (weekday >= 1 && weekday <= 6) {
//         const startISO = minutesToUtcISO(dayStartUtcISO, 10 * 60);
//         const endISO = minutesToUtcISO(dayStartUtcISO, 19 * 60);
//         workingWindowsUtc.push({ start: startISO, end: endISO });
//         usedFallback = true;
//       }
//     }

//     // Если вообще нет рабочих окон — возвращаем пусто
//     if (workingWindowsUtc.length === 0) {
//       return NextResponse.json({
//         ok: true,
//         slots: [],
//         meta: { durationMin, workingWindowsUtc, usedFallback, tz: ORG_TZ },
//       });
//     }

//     // 4) Отпуска/блокировки в этот день
//     const timeOff: { startMinutes: number | null; endMinutes: number | null }[] =
//       await prisma.masterTimeOff.findMany({
//         where: { masterId, date: new Date(`${dateISO}T00:00:00.000Z`) },
//         select: { startMinutes: true, endMinutes: true },
//       });

//     const timeOffWindowsUtc: WindowUtc[] = timeOff
//       .filter(
//         (t): t is { startMinutes: number; endMinutes: number } =>
//           t.startMinutes != null &&
//           t.endMinutes != null &&
//           t.endMinutes > t.startMinutes,
//       )
//       .map((t) => ({
//         start: minutesToUtcISO(dayStartUtcISO, t.startMinutes),
//         end: minutesToUtcISO(dayStartUtcISO, t.endMinutes),
//       }));

//     // 5) Уже занятые записи (пересекающиеся с нашим днём)
//     const busy = await prisma.appointment.findMany({
//       where: {
//         masterId,
//         status: { in: [...BUSY_STATUSES] },
//         startAt: { lt: new Date(dayEndUtcISO) },
//         endAt: { gt: new Date(dayStartUtcISO) },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const busyWindowsUtc: WindowUtc[] = busy.map((b) => ({
//       start: b.startAt.toISOString(),
//       end: b.endAt.toISOString(),
//     }));

//     // 6) Считаем свободные слоты
//     const stepMin = 5;
//     const nowUtcISO = tzNowUtcISO(ORG_TZ); // для «сегодня» клиент сам отсечёт прошлое по nowUtcISO

//     const slots = getFreeSlots({
//       dayStartUtcISO,
//       dayEndUtcISO,
//       workingWindowsUtc,
//       timeOffWindowsUtc,
//       busyWindowsUtc,
//       durationMin,
//       stepMin,
//       tz: ORG_TZ,
//       nowUtcISO,
//     });

//     // 7) Ответ
//     return NextResponse.json({
//       ok: true,
//       slots,
//       meta: {
//         serviceId: service.id,
//         durationMin,
//         dayStartUtcISO,
//         dayEndUtcISO,
//         workingWindowsUtc,
//         timeOffWindowsUtc,
//         busyWindowsUtc,
//         usedFallback,
//         tz: ORG_TZ,
//         debug,
//       },
//     });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     // Всегда JSON, чтобы на фронте не было "Unexpected token '<'"
//     return NextResponse.json({ ok: false, error: message }, { status: 400 });
//   }
// }











// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { addMinutes } from "date-fns";
// import { getAvailability } from "@/app/booking/actions";

// // приватная функция для одного дня (повторяет buildDaySlotsByDb из actions)
// async function daySlots(masterId: string, dateISO: string, durationMin: number): Promise<string[]> {
//   // чтобы не дублировать много логики, попросим actions найти первый день, если dateISO не задан
//   // но если dateISO есть — actions сейчас ищет первый день; нам нужен именно указанный день,
//   // поэтому вместо импорта внутренней функции делаем proxy-эндпойнт на actions.getAvailability,
//   // а если firstDateISO !== dateISO — просто вернём пусто (слоты на другой день не нужны).
//   const res = await getAvailability(masterId, durationMin);
//   if (!res.ok) return [];
//   if (res.data.firstDateISO !== dateISO) {
//     // пользователь переключил день — отдаём слоты ровно для этого дня:
//     // для точности лучше вынести buildDaySlotsByDb в отдельный модуль и импортнуть здесь.
//     // Временная прокладка: берём все слоты за 8 недель и фильтруем по дню.
//     const allSlots = res.data.slots;
//     return allSlots.filter((iso) => iso.slice(0, 10) === dateISO);
//   }
//   return res.data.slots;
// }

// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const masterId = url.searchParams.get("masterId") ?? "";
//   const durationMin = Number(url.searchParams.get("durationMin") ?? 0);
//   const dateISO = url.searchParams.get("dateISO"); // YYYY-MM-DD

//   if (!masterId || !durationMin) {
//     return NextResponse.json({ slots: [], error: "masterId и durationMin обязательны" }, { status: 200 });
//   }

//   if (!dateISO) {
//     // отдать первый день с подходящими слотами (старое поведение)
//     const res = await getAvailability(masterId, durationMin);
//     if (!res.ok) return NextResponse.json({ slots: [], error: res.error }, { status: 200 });
//     return NextResponse.json({ firstDateISO: res.data.firstDateISO, slots: res.data.slots }, { status: 200 });
//   }

//   // конкретная дата
//   const slots = await daySlots(masterId, dateISO, durationMin);
//   return NextResponse.json({ firstDateISO: dateISO, slots }, { status: 200 });
// }





//---------работал меняем структуру
// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ORG_TZ, wallMinutesToUtc } from "@/lib/orgTime";

// type SlotMin = { startMin: number; endMin: number };

// // минимальный «лид» до начала слота (минут)
// const MIN_LEAD_MIN = 30;
// // шаг, если у услуги нет duration (safety)
// const STEP_FALLBACK_MIN = 10;

// function isYmd(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// type UtcIntv = { start: Date; end: Date };
// type DebugInfo = {
//   params: { serviceSlug: string; dateISO: string; masterId?: string };
//   tz: string;
//   weekday: number;
//   workingHours: { startMin: number; endMin: number };
//   duration: number;
//   step: number;
//   timeOffUtc: { start: string; end: string }[];
//   apptsUtc: { start: string; end: string }[];
//   busyUtc: { start: string; end: string }[];
// };

// /** Склейка занятостей в полуоткрытой логике [start,end) */
// function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
//   const out: UtcIntv[] = [];
//   let cur: UtcIntv = { start: new Date(sorted[0].start), end: new Date(sorted[0].end) };

//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     // объединяем только при реальном пересечении (полуоткрытые интервалы)
//     if (it.start.getTime() < cur.end.getTime()) {
//       if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
//     } else {
//       out.push(cur);
//       cur = { start: new Date(it.start), end: new Date(it.end) };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// /** true, если dateISO — «сегодня» в таймзоне салона */
// function isOrgToday(dateISO: string): boolean {
//   const now = new Date();
//   // получаем YYYY-MM-DD «сейчас» в ORG_TZ
//   const parts = new Intl.DateTimeFormat("en-CA", {
//     timeZone: ORG_TZ,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   })
//     .format(now)
//     .split("-");
//   const todayISO = `${parts[0]}-${parts[1]}-${parts[2]}`;
//   return todayISO === dateISO;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ?? url.searchParams.get("staffId") ?? ""
//     ).trim();
//     const wantDebug = url.searchParams.get("debug") === "1";

//     if (!serviceSlug || !isYmd(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });

//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Границы дня (UTC) и weekday (в локальной TZ)
//     const dayStartUtc = wallMinutesToUtc(dateISO, 0);
//     const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
//     const weekday = new Date(dayStartUtc).getUTCDay();

//     // Рабочие часы — мастера или общие
//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) {
//         const res = NextResponse.json<SlotMin[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(1440, wh.startMinutes));
//       endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed || !Number.isFinite(wh.startMinutes) || !Number.isFinite(wh.endMinutes)) {
//         const res = NextResponse.json<SlotMin[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(1440, wh.startMinutes));
//       endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
//     }

//     // Перерывы/отпуска за день (UTC-диапазон дня)
//     const timeOffRaw = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const timeOffUtc: UtcIntv[] = timeOffRaw
//       .map(({ startMinutes, endMinutes }) => ({
//         start: wallMinutesToUtc(dateISO, startMinutes),
//         end: wallMinutesToUtc(dateISO, endMinutes),
//       }))
//       .filter((x) => x.end.getTime() > x.start.getTime());

//     // Уже забронированные (полуоткрытые [start,end))
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         ...(masterId ? { masterId } : {}),
//         startAt: { lt: dayEndUtc },
//         endAt: { gt: dayStartUtc },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const duration: number = service.durationMin ?? STEP_FALLBACK_MIN;
//     const step: number = duration;

//     const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({
//       start: startAt,
//       end: endAt,
//     }));
//     const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

//     // генерация слотов (в минутах локального дня)
//     const out: SlotMin[] = [];

//     // «лид» применяем только для выбранного «сегодня»
//     const applyLead = isOrgToday(dateISO);
//     const nowWithLeadUtc = applyLead
//       ? new Date(Date.now() + MIN_LEAD_MIN * 60_000)
//       : null;

//     const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

//     let s = alignUp(startMin, step);
//     const lastStart = endMin - duration;

//     // пересечение полуоткрытых интервалов: aStart < bEnd && bStart < aEnd
//     const overlapsUtc = (aStart: Date, aEnd: Date): boolean =>
//       busyUtc.some((x) => aStart < x.end && x.start < aEnd);

//     while (s <= lastStart) {
//       const slotStartUtc = wallMinutesToUtc(dateISO, s);
//       const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

//       // скрываем «слишком близкие» к текущему моменту только для сегодняшней даты
//       if (nowWithLeadUtc && slotStartUtc.getTime() < nowWithLeadUtc.getTime()) {
//         s += step;
//         continue;
//       }

//       if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
//         out.push({ startMin: s, endMin: s + duration });
//       }
//       s += step;
//     }

//     if (wantDebug) {
//       const payload: { slots: SlotMin[]; debug: DebugInfo } = {
//         slots: out,
//         debug: {
//           params: { serviceSlug, dateISO, masterId: masterId || undefined },
//           tz: ORG_TZ,
//           weekday,
//           workingHours: { startMin, endMin },
//           duration,
//           step,
//           timeOffUtc: timeOffUtc.map((t) => ({
//             start: t.start.toISOString(),
//             end: t.end.toISOString(),
//           })),
//           apptsUtc: apptsUtc.map((a) => ({
//             start: a.start.toISOString(),
//             end: a.end.toISOString(),
//           })),
//           busyUtc: busyUtc.map((b) => ({
//             start: b.start.toISOString(),
//             end: b.end.toISOString(),
//           })),
//         },
//       };
//       const res = NextResponse.json(payload, { status: 200 });
//       res.headers.set("Cache-Control", "no-store");
//       return res;
//     }

//     // Отдаём в минутах (фронт это умеет)
//     const res = NextResponse.json<SlotMin[]>(out, { status: 200 });
//     res.headers.set("Cache-Control", "no-store");
//     return res;
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }







// -----------------работал 
// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ORG_TZ, wallMinutesToUtc } from "@/lib/orgTime";

// type Slot = { start: string; end: string };

// // минимальный «лид» до начала слота (минут)
// const MIN_LEAD_MIN = 30;
// // шаг, если у услуги нет duration (safety)
// const STEP_FALLBACK_MIN = 10; 

// function isYmd(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// type UtcIntv = { start: Date; end: Date };
// type DebugInfo = {
//   params: { serviceSlug: string; dateISO: string; masterId?: string };
//   tz: string;
//   weekday: number;
//   workingHours: { startMin: number; endMin: number };
//   duration: number;
//   step: number;
//   timeOffUtc: { start: string; end: string }[];
//   apptsUtc: { start: string; end: string }[];
//   busyUtc: { start: string; end: string }[];
// };

// /** Склейка занятостей в полуоткрытой логике [start,end) */
// function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
//   const out: UtcIntv[] = [];
//   let cur = { ...sorted[0] };

//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     // ВАЖНО: полуоткрытая граница — только если it.start < cur.end, а не <=
//     if (it.start.getTime() < cur.end.getTime()) {
//       if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
//     } else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (url.searchParams.get("masterId") ?? url.searchParams.get("staffId") ?? "").trim();
//     const wantDebug = url.searchParams.get("debug") === "1";

//     if (!serviceSlug || !isYmd(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });

//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
//     }

//     // Границы дня (UTC) и weekday в локальной TZ
//     const dayStartUtc = wallMinutesToUtc(dateISO, 0);
//     const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
//     const weekday = new Date(dayStartUtc).getUTCDay();

//     // Рабочие часы мастера/общие
//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(1440, wh.startMinutes));
//       endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || !wh.startMinutes || !wh.endMinutes || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(1440, wh.startMinutes));
//       endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
//     }

//     // Перерывы/отпуска за день (UTC-диапазон дня!)
//     const timeOffRaw = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const timeOffUtc: UtcIntv[] = timeOffRaw
//       .map(({ startMinutes, endMinutes }) => ({
//         start: wallMinutesToUtc(dateISO, startMinutes),
//         end: wallMinutesToUtc(dateISO, endMinutes),
//       }))
//       .filter((x) => x.end.getTime() > x.start.getTime());

//     // Уже забронированные (полуоткрытые [start,end))
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         ...(masterId ? { masterId } : {}),
//         startAt: { lt: dayEndUtc },
//         endAt: { gt: dayStartUtc },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const duration = service.durationMin || STEP_FALLBACK_MIN;
//     const step = duration;

//     const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({ start: startAt, end: endAt }));
//     const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

//     // генерация слотов
//     const leadThresholdUtc = new Date(Date.now() + MIN_LEAD_MIN * 60_000);
//     const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = alignUp(startMin, step);
//     const lastStart = endMin - duration;

//     // полуоткрытые интервалы: конфликт если aStart < bEnd && bStart < aEnd
//     const overlapsUtc = (aStart: Date, aEnd: Date): boolean =>
//       busyUtc.some((x) => aStart < x.end && x.start < aEnd);

//     while (s <= lastStart) {
//       const slotStartUtc = wallMinutesToUtc(dateISO, s);
//       const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

//       // скрываем «слишком близкие» к текущему моменту
//       if (slotStartUtc.getTime() < leadThresholdUtc.getTime()) {
//         s += step;
//         continue;
//       }

//       if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
//         out.push({ start: slotStartUtc.toISOString(), end: slotEndUtc.toISOString() });
//       }
//       s += step;
//     }

//     if (wantDebug) {
//       const payload: { slots: Slot[]; debug: DebugInfo } = {
//         slots: out,
//         debug: {
//           params: { serviceSlug, dateISO, masterId: masterId || undefined },
//           tz: ORG_TZ,
//           weekday,
//           workingHours: { startMin, endMin },
//           duration,
//           step,
//           timeOffUtc: timeOffUtc.map((t) => ({ start: t.start.toISOString(), end: t.end.toISOString() })),
//           apptsUtc: apptsUtc.map((a) => ({ start: a.start.toISOString(), end: a.end.toISOString() })),
//           busyUtc: busyUtc.map((b) => ({ start: b.start.toISOString(), end: b.end.toISOString() })),
//         },
//       };
//       const res = NextResponse.json(payload, { status: 200 });
//       res.headers.set("Cache-Control", "no-store");
//       return res;
//     }

//     const res = NextResponse.json<Slot[]>(out, { status: 200 });
//     res.headers.set("Cache-Control", "no-store");
//     return res;
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }









//----------работало но показывало занятые слоты и не давало брать свободные интервальные----------
// /* eslint-disable no-console */
// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// // import { addMinutes } from "date-fns";
// import { ORG_TZ, wallMinutesToUtc } from "@/lib/orgTime";

// type Slot = { start: string; end: string };

// // минимальный «лид» до начала слота (минут)
// const MIN_LEAD_MIN = 30;
// // шаг, если у услуги нет duration (safety)
// const STEP_FALLBACK_MIN = 10;

// function isYmd(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// type UtcIntv = { start: Date; end: Date };
// type DebugInfo = {
//   params: { serviceSlug: string; dateISO: string; masterId?: string };
//   tz: string;
//   weekday: number;
//   workingHours: { startMin: number; endMin: number };
//   duration: number;
//   step: number;
//   timeOffUtc: { start: string; end: string }[];
//   apptsUtc: { start: string; end: string }[];
//   busyUtc: { start: string; end: string }[];
// };

// function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
//   const out: UtcIntv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start.getTime() <= cur.end.getTime()) {
//       if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
//     } else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ?? url.searchParams.get("staffId") ?? ""
//     ).trim();
//     const wantDebug = url.searchParams.get("debug") === "1";

//     if (!serviceSlug || !isYmd(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });

//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Локальная полуночь → UTC границы дня и weekday в локальном часовом поясе
//     // weekday считаем как у тебя раньше (UTC getUTCDay на UTC-полуночи локального дня)
//     const dayStartUtc = wallMinutesToUtc(dateISO, 0);
//     const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
//     const weekday = new Date(dayStartUtc).getUTCDay();

//     // рабочие часы: либо мастера, либо общие
//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || !wh.startMinutes || !wh.endMinutes || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // Time off (перерывы/отпуска) — всё в UTC
//     const timeOffRaw = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const timeOffUtc: UtcIntv[] = timeOffRaw
//       .map(({ startMinutes, endMinutes }) => ({
//         start: wallMinutesToUtc(dateISO, startMinutes),
//         end: wallMinutesToUtc(dateISO, endMinutes),
//       }))
//       .filter((x) => x.end.getTime() > x.start.getTime());

//     // уже забронированные (строго [start,end) — без искусственных буферов)
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         ...(masterId ? { masterId } : {}),
//         startAt: { lt: dayEndUtc },
//         endAt: { gt: dayStartUtc },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const duration = service.durationMin || STEP_FALLBACK_MIN;
//     const step = duration;

//     const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({
//       start: startAt,
//       end: endAt,
//     }));

//     const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

//     // генерация слотов
//     const leadThresholdUtc = new Date(Date.now() + MIN_LEAD_MIN * 60_000);
//     const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = alignUp(startMin, step);
//     const lastStart = endMin - duration;

//     // пересечение для полуоткрытых [a,b) и [x,y): конфликт если a < y && x < b
//     const overlapsUtc = (aStart: Date, aEnd: Date): boolean =>
//       busyUtc.some((x) => aStart < x.end && x.start < aEnd);

//     while (s <= lastStart) {
//       const slotStartUtc = wallMinutesToUtc(dateISO, s);
//       const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

//       // скрываем слишком «близкие» к текущему моменту
//       if (slotStartUtc.getTime() < leadThresholdUtc.getTime()) {
//         s += step;
//         continue;
//       }

//       if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
//         out.push({
//           start: slotStartUtc.toISOString(),
//           end: slotEndUtc.toISOString(),
//         });
//       }
//       s += step;
//     }

//     if (wantDebug) {
//       const payload: { slots: Slot[]; debug: DebugInfo } = {
//         slots: out,
//         debug: {
//           params: { serviceSlug, dateISO, masterId: masterId || undefined },
//           tz: ORG_TZ,
//           weekday,
//           workingHours: { startMin, endMin },
//           duration,
//           step,
//           timeOffUtc: timeOffUtc.map((t) => ({
//             start: t.start.toISOString(),
//             end: t.end.toISOString(),
//           })),
//           apptsUtc: apptsUtc.map((a) => ({
//             start: a.start.toISOString(),
//             end: a.end.toISOString(),
//           })),
//           busyUtc: busyUtc.map((b) => ({
//             start: b.start.toISOString(),
//             end: b.end.toISOString(),
//           })),
//         },
//       };
//       const res = NextResponse.json(payload, { status: 200 });
//       res.headers.set("Cache-Control", "no-store");
//       return res;
//     }

//     const res = NextResponse.json<Slot[]>(out, { status: 200 });
//     res.headers.set("Cache-Control", "no-store");
//     return res;
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }
