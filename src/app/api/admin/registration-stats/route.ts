// src/app/api/admin/registration-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Period = '7d' | '30d' | '90d' | 'all';

type RegistrationStats = {
  success: boolean;
  stats?: {
    total: number;
    byMethod: {
      sms: number;
      telegram: number;
      google: number;
      email: number;
    };
    byStatus: {
      completed: number;
      pending: number;
    };
    timeline: Array<{
      date: string;
      sms: number;
      telegram: number;
      google: number;
      email: number;
    }>;
    recentRegistrations: Array<{
      id: string;
      method: 'sms' | 'telegram' | 'google' | 'email';
      contact: string;
      status: 'completed' | 'pending';
      createdAt: string;
    }>;
  };
  error?: string;
};

export async function GET(request: NextRequest) {
  try {
    // Проверка авторизации
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Получение периода из query параметров
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || '30d') as Period;

    // Вычисление даты начала периода
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0); // начало времен
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Получение данных из всех методов регистрации
    const [smsRegistrations, telegramRegistrations, googleRegistrations, allAppointments] = await Promise.all([
      // SMS регистрации
      prisma.smsPhoneRegistration.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          phone: true,
          verified: true,
          createdAt: true,
          appointmentId: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Telegram регистрации
      prisma.telegramVerification.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          phone: true,
          verified: true,
          createdAt: true,
          appointmentId: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      
      // Google регистрации
      prisma.googleQuickRegistration.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          id: true,
          email: true,
          verified: true,
          createdAt: true,
          appointmentId: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Все appointments для определения Email регистраций
      prisma.appointment.findMany({
        where: {
          createdAt: { gte: startDate },
          email: { not: null },
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Собираем ID appointments из других методов
    const otherMethodAppointmentIds = new Set([
      ...smsRegistrations.filter(r => r.appointmentId).map(r => r.appointmentId!),
      ...telegramRegistrations.filter(r => r.appointmentId).map(r => r.appointmentId!),
      ...googleRegistrations.filter(r => r.appointmentId).map(r => r.appointmentId!),
    ]);

    // Email регистрации = appointments с email, которые НЕ связаны с другими методами
    const emailRegistrations = allAppointments.filter(
      appointment => !otherMethodAppointmentIds.has(appointment.id)
    );

    // Подсчет по методам
    const total = 
      smsRegistrations.length + 
      telegramRegistrations.length + 
      googleRegistrations.length +
      emailRegistrations.length;

    const byMethod = {
      sms: smsRegistrations.length,
      telegram: telegramRegistrations.length,
      google: googleRegistrations.length,
      email: emailRegistrations.length,
    };

    // Подсчет по статусу
    const completedCount =
      smsRegistrations.filter(r => r.verified).length +
      telegramRegistrations.filter(r => r.verified).length +
      googleRegistrations.filter(r => r.verified).length +
      emailRegistrations.length; // Email всегда completed если appointment создан

    const byStatus = {
      completed: completedCount,
      pending: total - completedCount,
    };

    // Формирование timeline (группировка по дням)
    const timelineMap = new Map<string, { sms: number; telegram: number; google: number; email: number }>();

    const addToTimeline = (date: Date, method: 'sms' | 'telegram' | 'google' | 'email') => {
      const dateKey = date.toISOString().split('T')[0];
      if (!timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, { sms: 0, telegram: 0, google: 0, email: 0 });
      }
      const entry = timelineMap.get(dateKey)!;
      entry[method]++;
    };

    smsRegistrations.forEach(r => addToTimeline(r.createdAt, 'sms'));
    telegramRegistrations.forEach(r => addToTimeline(r.createdAt, 'telegram'));
    googleRegistrations.forEach(r => addToTimeline(r.createdAt, 'google'));
    emailRegistrations.forEach(r => addToTimeline(r.createdAt, 'email'));

    const timeline = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Последние регистрации (до 20 штук)
    type RegItem = {
      id: string;
      method: 'sms' | 'telegram' | 'google' | 'email';
      contact: string;
      status: 'completed' | 'pending';
      createdAt: Date;
    };

    const recentItems: RegItem[] = [
      ...smsRegistrations.map(r => ({
        id: r.id,
        method: 'sms' as const,
        contact: r.phone,
        status: (r.verified ? 'completed' : 'pending') as 'completed' | 'pending',
        createdAt: r.createdAt,
      })),
      ...telegramRegistrations.map(r => ({
        id: r.id,
        method: 'telegram' as const,
        contact: r.phone,
        status: (r.verified ? 'completed' : 'pending') as 'completed' | 'pending',
        createdAt: r.createdAt,
      })),
      ...googleRegistrations.map(r => ({
        id: r.id,
        method: 'google' as const,
        contact: r.email || 'N/A',
        status: (r.verified ? 'completed' : 'pending') as 'completed' | 'pending',
        createdAt: r.createdAt,
      })),
      ...emailRegistrations.map(r => ({
        id: r.id,
        method: 'email' as const,
        contact: r.email || 'N/A',
        status: 'completed' as const,
        createdAt: r.createdAt,
      })),
    ];

    const recentRegistrations = recentItems
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
      .map(item => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      }));

    return NextResponse.json({
      success: true,
      stats: {
        total,
        byMethod,
        byStatus,
        timeline,
        recentRegistrations,
      },
    } as RegistrationStats);

  } catch (error) {
    console.error('Registration stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registration statistics' },
      { status: 500 }
    );
  }
}





//---------добавляем статистику по Email---------
// // src/app/api/admin/registration-stats/route.ts
// /**
//  * API endpoint для статистики регистраций клиентов
//  * GET /api/admin/registration-stats?period=7d|30d|90d|all
//  * 
//  * Поддерживает 3 метода регистрации:
//  * - SMS (SmsPhoneRegistration)
//  * - Telegram (TelegramVerification)
//  * - Google (GoogleQuickRegistration)
//  * 
//  * Требуется роль ADMIN (проверяется middleware)
//  */

// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import { prisma } from '@/lib/db';

// type Period = '7d' | '30d' | '90d' | 'all';

// interface RegistrationStats {
//   total: number;
//   byMethod: {
//     sms: number;
//     telegram: number;
//     google: number;
//   };
//   byStatus: {
//     completed: number;
//     pending: number;
//   };
//   timeline: Array<{
//     date: string;
//     sms: number;
//     telegram: number;
//     google: number;
//     total: number;
//   }>;
//   recentRegistrations: Array<{
//     id: string;
//     method: 'sms' | 'telegram' | 'google';
//     phone?: string;
//     email?: string;
//     telegramUserId?: string;
//     createdAt: string;
//     verified: boolean;
//   }>;
// }

// function getPeriodDate(period: Period): Date | null {
//   const now = new Date();
  
//   switch (period) {
//     case '7d':
//       return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//     case '30d':
//       return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//     case '90d':
//       return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
//     case 'all':
//       return null;
//     default:
//       return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     // Проверяем авторизацию через JWT токен
//     const token = await getToken({
//       req,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     if (!token) {
//       return NextResponse.json(
//         { error: 'Необходима авторизация' },
//         { status: 401 }
//       );
//     }

//     // Проверяем роль администратора
//     if (token.role !== 'ADMIN') {
//       return NextResponse.json(
//         { error: 'Доступ запрещён. Требуются права администратора.' },
//         { status: 403 }
//       );
//     }

//     // Получаем период из query параметров
//     const { searchParams } = new URL(req.url);
//     const period = (searchParams.get('period') || '30d') as Period;
//     const periodDate = getPeriodDate(period);

//     console.log('[Admin API] Fetching registration stats for period:', period);

//     // Формируем фильтр по дате
//     const dateFilter = periodDate ? { gte: periodDate } : undefined;

//     // 1. Статистика SMS регистраций
//     const smsRegistrations = await prisma.smsPhoneRegistration.findMany({
//       where: {
//         createdAt: dateFilter,
//       },
//       select: {
//         id: true,
//         phone: true,
//         verified: true,
//         createdAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // 2. Статистика Telegram регистраций  
//     const telegramRegistrations = await prisma.telegramVerification.findMany({
//       where: {
//         createdAt: dateFilter,
//       },
//       select: {
//         id: true,
//         phone: true,
//         telegramUserId: true,
//         verified: true,
//         createdAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // 3. Статистика Google регистраций
//     const googleRegistrations = await prisma.googleQuickRegistration.findMany({
//       where: {
//         createdAt: dateFilter,
//       },
//       select: {
//         id: true,
//         email: true,
//         verified: true,
//         createdAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // Подсчёт по методам
//     const byMethod = {
//       sms: smsRegistrations.length,
//       telegram: telegramRegistrations.length,
//       google: googleRegistrations.length,
//     };

//     // Подсчёт по статусу
//     const byStatus = {
//       completed: smsRegistrations.filter(r => r.verified).length + 
//                 telegramRegistrations.filter(r => r.verified).length +
//                 googleRegistrations.filter(r => r.verified).length,
//       pending: smsRegistrations.filter(r => !r.verified).length +
//                telegramRegistrations.filter(r => !r.verified).length +
//                googleRegistrations.filter(r => !r.verified).length,
//     };

//     // Timeline - группировка по дням
//     const timelineMap = new Map<string, { sms: number; telegram: number; google: number }>();

//     smsRegistrations.forEach(r => {
//       const date = r.createdAt.toISOString().split('T')[0];
//       const existing = timelineMap.get(date) || { sms: 0, telegram: 0, google: 0 };
//       existing.sms++;
//       timelineMap.set(date, existing);
//     });

//     telegramRegistrations.forEach(r => {
//       const date = r.createdAt.toISOString().split('T')[0];
//       const existing = timelineMap.get(date) || { sms: 0, telegram: 0, google: 0 };
//       existing.telegram++;
//       timelineMap.set(date, existing);
//     });

//     googleRegistrations.forEach(r => {
//       const date = r.createdAt.toISOString().split('T')[0];
//       const existing = timelineMap.get(date) || { sms: 0, telegram: 0, google: 0 };
//       existing.google++;
//       timelineMap.set(date, existing);
//     });

//     const timeline = Array.from(timelineMap.entries())
//       .map(([date, counts]) => ({
//         date,
//         sms: counts.sms,
//         telegram: counts.telegram,
//         google: counts.google,
//         total: counts.sms + counts.telegram + counts.google,
//       }))
//       .sort((a, b) => a.date.localeCompare(b.date));

//     // Последние регистрации (топ 20)
//     const recentRegistrations = [
//       ...smsRegistrations.slice(0, 10).map(r => ({
//         id: r.id,
//         method: 'sms' as const,
//         phone: r.phone,
//         createdAt: r.createdAt.toISOString(),
//         verified: r.verified,
//       })),
//       ...telegramRegistrations.slice(0, 10).map(r => ({
//         id: r.id,
//         method: 'telegram' as const,
//         phone: r.phone,
//         telegramUserId: r.telegramUserId?.toString(),
//         createdAt: r.createdAt.toISOString(),
//         verified: r.verified,
//       })),
//       ...googleRegistrations.slice(0, 10).map(r => ({
//         id: r.id,
//         method: 'google' as const,
//         email: r.email || undefined,
//         createdAt: r.createdAt.toISOString(),
//         verified: r.verified,
//       })),
//     ]
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//       .slice(0, 20);

//     const stats: RegistrationStats = {
//       total: byMethod.sms + byMethod.telegram + byMethod.google,
//       byMethod,
//       byStatus,
//       timeline,
//       recentRegistrations,
//     };

//     console.log('[Admin API] Registration stats:', {
//       total: stats.total,
//       byMethod: stats.byMethod,
//       byStatus: stats.byStatus,
//     });

//     return NextResponse.json({
//       success: true,
//       period,
//       stats,
//       timestamp: new Date().toISOString(),
//     });

//   } catch (error) {
//     console.error('[Admin API] Error fetching registration stats:', error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : 'Ошибка сервера',
//       },
//       { status: 500 }
//     );
//   }
// }