// src/lib/ai/tools/create-draft.ts

import { prisma } from '@/lib/prisma';

interface Args {
  serviceId: string;
  masterId: string;
  startAt: string;
  endAt: string;
  customerName: string;
  phone?: string;
  email: string;
  birthDate?: string;
  notes?: string;
  locale: string;
}

export async function createDraft(args: Args) {
  try {
    const draft = await prisma.bookingDraft.create({
      data: {
        serviceId: args.serviceId,
        masterId: args.masterId,
        startAt: new Date(args.startAt),
        endAt: new Date(args.endAt),
        customerName: args.customerName,
        phone: args.phone || '',
        email: args.email,
        birthDate: args.birthDate ? new Date(args.birthDate) : null,
        notes: args.notes || null,
        locale: args.locale || 'de',
      },
    });

    return { draftId: draft.id };
  } catch (error) {
    console.error('[AI create_draft] Error:', error);
    return { error: 'DRAFT_CREATION_FAILED' };
  }
}
