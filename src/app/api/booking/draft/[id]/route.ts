// src/app/api/booking/draft/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type DraftResponse =
  | {
      ok: true;
      email: string;
      draftId: string;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * GET /api/booking/draft/[id]
 * 
 * Получает email из BookingDraft по ID
 * Используется ботом для получения email из короткого payload
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<DraftResponse>> {
  try {
    // ✅ Next.js 15: await params
    const params = await context.params;
    const draftId = params.id;

    if (!draftId) {
      return NextResponse.json(
        { ok: false, error: 'Draft ID обязателен' },
        { status: 400 }
      );
    }

    // Получаем draft из БД
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { ok: false, error: 'Черновик не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      email: draft.email,
      draftId: draft.id,
    });
  } catch (error) {
    console.error('[Draft API Error]:', error);

    return NextResponse.json(
      { ok: false, error: 'Ошибка получения черновика' },
      { status: 500 }
    );
  }
}