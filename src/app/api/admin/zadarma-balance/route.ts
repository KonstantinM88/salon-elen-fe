// src/app/api/admin/zadarma-balance/route.ts
/**
 * API endpoint для получения баланса Zadarma
 * GET /api/admin/zadarma-balance
 * 
 * Требуется роль ADMIN (проверяется middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getZadarmaBalance } from '@/lib/zadarma-sms';

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

    console.log('[Admin API] Fetching Zadarma balance...');

    // Получаем баланс из Zadarma
    const result = await getZadarmaBalance();

    if (!result.success) {
      console.error('[Admin API] Zadarma balance error:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          raw: result.raw,
        },
        { status: result.httpStatus || 500 }
      );
    }

    console.log('[Admin API] Zadarma balance:', result.balance, result.currency);

    return NextResponse.json({
      success: true,
      balance: result.balance,
      currency: result.currency,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Admin API] Error fetching Zadarma balance:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка сервера',
      },
      { status: 500 }
    );
  }
}