import { prisma } from '@/lib/db';
import { parseTelegramAdminChatIds } from '@/lib/telegram-admin-chat-ids';
import type { GiftStatus } from './gutschein';

export class GiftRequestConflict extends Error {}

/** Save the status and durable notification event atomically, before contacting providers. */
export async function changeGiftStatus(input: {
  id: string; status: GiftStatus; note: string; actorId: string; expectedUpdatedAt: Date;
}) {
  return prisma.$transaction(async tx => {
    const current = await tx.giftVoucherRequest.findUniqueOrThrow({ where: { id: input.id } });
    if (current.updatedAt.getTime() !== input.expectedUpdatedAt.getTime()) throw new GiftRequestConflict();
    const updated = await tx.giftVoucherRequest.updateMany({
      where: { id: input.id, updatedAt: current.updatedAt },
      data: { status: input.status, adminNote: input.note },
    });
    if (updated.count !== 1) throw new GiftRequestConflict();
    // Editing an internal note or re-saving the same status must not message the buyer.
    if (current.status === input.status) return null;
    return tx.giftVoucherStatusEvent.create({ data: {
      requestId: input.id, previousStatus: current.status, status: input.status,
      createdById: input.actorId, adminChatIds: parseTelegramAdminChatIds(),
    } });
  });
}
