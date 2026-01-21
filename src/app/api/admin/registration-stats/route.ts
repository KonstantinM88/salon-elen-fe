// src/app/api/admin/registration-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Period = '7d' | '30d' | '90d' | 'all';

type RegistrationMethod = 'sms' | 'telegram' | 'google' | 'email';

type RegItem = {
  id: string;
  method: RegistrationMethod;
  contact: string;
  status: 'completed' | 'pending';
  createdAt: Date;
  appointmentId: string | null;
};

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
      method: RegistrationMethod;
      contact: string;
      status: 'completed' | 'pending';
      createdAt: string;
      appointmentId: string | null;
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
    const [smsRegistrations, telegramRegistrations, googleRegistrations] = await Promise.all([
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

      // Google регистрации (используем GoogleQuickRegistration)
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
    ]);

    // Подсчет по методам
    const total = 
      smsRegistrations.length + 
      telegramRegistrations.length + 
      googleRegistrations.length;

    const byMethod = {
      sms: smsRegistrations.length,
      telegram: telegramRegistrations.length,
      google: googleRegistrations.length,
      email: 0, // Email объединяем с Google
    };

    // Подсчет по статусу
    const completedCount =
      smsRegistrations.filter(r => r.verified).length +
      telegramRegistrations.filter(r => r.verified).length +
      googleRegistrations.filter(r => r.verified).length;

    const byStatus = {
      completed: completedCount,
      pending: total - completedCount,
    };

    // Формирование timeline (группировка по дням)
    const timelineMap = new Map<string, { sms: number; telegram: number; google: number; email: number }>();

    const addToTimeline = (date: Date, method: RegistrationMethod) => {
      const dateKey = date.toISOString().split('T')[0];
      if (!timelineMap.has(dateKey)) {
        timelineMap.set(dateKey, { sms: 0, telegram: 0, google: 0, email: 0 });
      }
      const entry = timelineMap.get(dateKey);
      if (entry) {
        entry[method]++;
      }
    };

    smsRegistrations.forEach(r => addToTimeline(r.createdAt, 'sms'));
    telegramRegistrations.forEach(r => addToTimeline(r.createdAt, 'telegram'));
    googleRegistrations.forEach(r => addToTimeline(r.createdAt, 'google'));

    const timeline = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Последние регистрации (до 20 штук)
    const recentItems: RegItem[] = [
      ...smsRegistrations.map(r => ({
        id: r.id,
        method: 'sms' as const,
        contact: r.phone,
        status: (r.verified ? 'completed' : 'pending') as 'completed' | 'pending',
        createdAt: r.createdAt,
        appointmentId: r.appointmentId,
      })),
      ...telegramRegistrations.map(r => ({
        id: r.id,
        method: 'telegram' as const,
        contact: r.phone,
        status: (r.verified ? 'completed' : 'pending') as 'completed' | 'pending',
        createdAt: r.createdAt,
        appointmentId: r.appointmentId,
      })),
      ...googleRegistrations.map(r => ({
        id: r.id,
        method: 'google' as const,
        contact: r.email || 'N/A',
        status: (r.verified ? 'completed' : 'pending') as 'completed' | 'pending',
        createdAt: r.createdAt,
        appointmentId: r.appointmentId,
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
    });
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}