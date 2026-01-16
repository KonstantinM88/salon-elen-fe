// src/app/api/admin/registration-stats/route.ts
/**
 * API endpoint для статистики регистраций клиентов
 * GET /api/admin/registration-stats?period=7d|30d|90d|all
 * 
 * Поддерживает 3 метода регистрации:
 * - SMS (SmsPhoneRegistration)
 * - Telegram (TelegramVerification)
 * - Google (GoogleQuickRegistration)
 * 
 * Требуется роль ADMIN (проверяется middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

type Period = '7d' | '30d' | '90d' | 'all';

interface RegistrationStats {
  total: number;
  byMethod: {
    sms: number;
    telegram: number;
    google: number;
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
    total: number;
  }>;
  recentRegistrations: Array<{
    id: string;
    method: 'sms' | 'telegram' | 'google';
    phone?: string;
    email?: string;
    telegramUserId?: string;
    createdAt: string;
    verified: boolean;
  }>;
}

function getPeriodDate(period: Period): Date | null {
  const now = new Date();
  
  switch (period) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'all':
      return null;
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export async function GET(req: NextRequest) {
  try {
    // Проверяем авторизацию через JWT токен
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      );
    }

    // Проверяем роль администратора
    if (token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ запрещён. Требуются права администратора.' },
        { status: 403 }
      );
    }

    // Получаем период из query параметров
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') || '30d') as Period;
    const periodDate = getPeriodDate(period);

    console.log('[Admin API] Fetching registration stats for period:', period);

    // Формируем фильтр по дате
    const dateFilter = periodDate ? { gte: periodDate } : undefined;

    // 1. Статистика SMS регистраций
    const smsRegistrations = await prisma.smsPhoneRegistration.findMany({
      where: {
        createdAt: dateFilter,
      },
      select: {
        id: true,
        phone: true,
        verified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 2. Статистика Telegram регистраций  
    const telegramRegistrations = await prisma.telegramVerification.findMany({
      where: {
        createdAt: dateFilter,
      },
      select: {
        id: true,
        phone: true,
        telegramUserId: true,
        verified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Статистика Google регистраций
    const googleRegistrations = await prisma.googleQuickRegistration.findMany({
      where: {
        createdAt: dateFilter,
      },
      select: {
        id: true,
        email: true,
        verified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Подсчёт по методам
    const byMethod = {
      sms: smsRegistrations.length,
      telegram: telegramRegistrations.length,
      google: googleRegistrations.length,
    };

    // Подсчёт по статусу
    const byStatus = {
      completed: smsRegistrations.filter(r => r.verified).length + 
                telegramRegistrations.filter(r => r.verified).length +
                googleRegistrations.filter(r => r.verified).length,
      pending: smsRegistrations.filter(r => !r.verified).length +
               telegramRegistrations.filter(r => !r.verified).length +
               googleRegistrations.filter(r => !r.verified).length,
    };

    // Timeline - группировка по дням
    const timelineMap = new Map<string, { sms: number; telegram: number; google: number }>();

    smsRegistrations.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      const existing = timelineMap.get(date) || { sms: 0, telegram: 0, google: 0 };
      existing.sms++;
      timelineMap.set(date, existing);
    });

    telegramRegistrations.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      const existing = timelineMap.get(date) || { sms: 0, telegram: 0, google: 0 };
      existing.telegram++;
      timelineMap.set(date, existing);
    });

    googleRegistrations.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      const existing = timelineMap.get(date) || { sms: 0, telegram: 0, google: 0 };
      existing.google++;
      timelineMap.set(date, existing);
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, counts]) => ({
        date,
        sms: counts.sms,
        telegram: counts.telegram,
        google: counts.google,
        total: counts.sms + counts.telegram + counts.google,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Последние регистрации (топ 20)
    const recentRegistrations = [
      ...smsRegistrations.slice(0, 10).map(r => ({
        id: r.id,
        method: 'sms' as const,
        phone: r.phone,
        createdAt: r.createdAt.toISOString(),
        verified: r.verified,
      })),
      ...telegramRegistrations.slice(0, 10).map(r => ({
        id: r.id,
        method: 'telegram' as const,
        phone: r.phone,
        telegramUserId: r.telegramUserId?.toString(),
        createdAt: r.createdAt.toISOString(),
        verified: r.verified,
      })),
      ...googleRegistrations.slice(0, 10).map(r => ({
        id: r.id,
        method: 'google' as const,
        email: r.email || undefined,
        createdAt: r.createdAt.toISOString(),
        verified: r.verified,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    const stats: RegistrationStats = {
      total: byMethod.sms + byMethod.telegram + byMethod.google,
      byMethod,
      byStatus,
      timeline,
      recentRegistrations,
    };

    console.log('[Admin API] Registration stats:', {
      total: stats.total,
      byMethod: stats.byMethod,
      byStatus: stats.byStatus,
    });

    return NextResponse.json({
      success: true,
      period,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Admin API] Error fetching registration stats:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}