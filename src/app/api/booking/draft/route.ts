import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type DraftResponse =
  | {
      phone: string | null;
      email: string | null;
    }
  | {
      error: string;
    };

export async function GET(
  request: NextRequest
): Promise<NextResponse<DraftResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const draftId = searchParams.get('draft') ?? searchParams.get('draftId');

  if (!draftId) {
    return NextResponse.json(
      { error: 'Missing draftId' },
      { status: 400 }
    );
  }

  try {
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: { phone: true, email: true },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      phone: draft.phone ?? null,
      email: draft.email ?? null,
    });
  } catch (error) {
    console.error('[api/booking/draft] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
