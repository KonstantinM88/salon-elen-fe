// src/lib/booking/finalize-booking.ts
// Shared finalization logic — used by email confirm, SMS, Telegram, Google, and AI assistant.
// Extracted from /api/booking/verify/email/confirm to avoid duplication.

import { prisma } from '@/lib/prisma';
import { ORG_TZ } from '@/lib/orgTime';

// ─── Types ──────────────────────────────────────────────────────

export interface FinalizeResult {
  ok: true;
  appointmentId: string;
  summary: {
    service: string;
    master: string;
    date: string;
    time: string;
    durationMin: number;
    address: string;
  };
}

export interface FinalizeError {
  ok: false;
  error: 'DRAFT_NOT_FOUND' | 'SLOT_TAKEN' | 'INTERNAL_ERROR';
  message: string;
}

// ─── Main function ──────────────────────────────────────────────

/**
 * Creates an Appointment from a BookingDraft.
 * Uses a transaction with `FOR UPDATE` lock to prevent race conditions.
 * Also creates/links Client record and deletes the draft.
 */
export async function finalizeBookingFromDraft(
  draftId: string,
): Promise<FinalizeResult | FinalizeError> {
  try {
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return { ok: false, error: 'DRAFT_NOT_FOUND', message: 'Draft not found' };
    }

    const appointment = await prisma.$transaction(async (tx) => {
      // Lock the master row to prevent concurrent booking
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${draft.masterId} FOR UPDATE`;

      // Check for conflicting appointments
      const conflicting = await tx.appointment.findFirst({
        where: {
          masterId: draft.masterId,
          status: { not: 'CANCELED' },
          startAt: { lt: draft.endAt },
          endAt: { gt: draft.startAt },
        },
        select: { id: true },
      });

      if (conflicting) {
        throw new Error('SLOT_TAKEN');
      }

      // Find or create Client
      const phoneStr = (draft.phone ?? '').trim();
      const emailStr = (draft.email ?? '').trim();
      let clientId: string | null = null;

      if (phoneStr || emailStr) {
        const existing = await tx.client.findFirst({
          where: {
            OR: [
              ...(phoneStr ? [{ phone: phoneStr }] : []),
              ...(emailStr ? [{ email: emailStr }] : []),
            ],
          },
          select: { id: true },
        });

        if (existing) {
          clientId = existing.id;
        }
      }

      if (!clientId && (phoneStr || emailStr)) {
        const newClient = await tx.client.create({
          data: {
            name: draft.customerName,
            phone: phoneStr,
            email: emailStr,
            birthDate: draft.birthDate || new Date('1990-01-01'),
            referral: draft.referral || null,
          },
          select: { id: true },
        });
        clientId = newClient.id;
      }

      // Create appointment
      const created = await tx.appointment.create({
        data: {
          serviceId: draft.serviceId,
          clientId,
          masterId: draft.masterId,
          startAt: draft.startAt,
          endAt: draft.endAt,
          customerName: draft.customerName,
          phone: draft.phone,
          email: draft.email,
          birthDate: draft.birthDate || null,
          referral: draft.referral || null,
          notes: draft.notes || null,
          locale: draft.locale || 'de',
          status: 'PENDING',
        },
        include: {
          service: {
            select: { name: true },
          },
          master: {
            select: { name: true },
          },
        },
      });

      // Delete draft
      await tx.bookingDraft.delete({ where: { id: draftId } });

      // Clean up temp reservation for this session (best-effort)
      // Sessions from AI use the sessionId as the chat session UUID
      await tx.temporarySlotReservation
        .deleteMany({
          where: {
            masterId: draft.masterId,
            startAt: draft.startAt,
            endAt: draft.endAt,
          },
        })
        .catch(() => {
          /* ignore cleanup errors */
        });

      return created;
    });

    // Format summary
    const fmtDate = appointment.startAt.toLocaleDateString('de-DE', {
      timeZone: ORG_TZ,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const fmtTime = (d: Date) =>
      d.toLocaleTimeString('de-DE', {
        timeZone: ORG_TZ,
        hour: '2-digit',
        minute: '2-digit',
      });

    const durationMin = Math.round(
      (appointment.endAt.getTime() - appointment.startAt.getTime()) / 60_000,
    );

    return {
      ok: true,
      appointmentId: appointment.id,
      summary: {
        service: (appointment as Record<string, unknown> & { service: { name: string } }).service.name,
        master: (appointment as Record<string, unknown> & { master: { name: string } }).master?.name ?? 'N/A',
        date: fmtDate,
        time: `${fmtTime(appointment.startAt)}–${fmtTime(appointment.endAt)}`,
        durationMin,
        address: 'Lessingstraße 37, 06114 Halle (Saale)',
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return {
        ok: false,
        error: 'SLOT_TAKEN',
        message: 'Slot was taken by another client',
      };
    }
    console.error('[finalizeBookingFromDraft] Error:', error);
    return {
      ok: false,
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
