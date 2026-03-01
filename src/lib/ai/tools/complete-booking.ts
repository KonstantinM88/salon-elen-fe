// src/lib/ai/tools/complete-booking.ts

import { verifyOTP, deleteOTP, type OTPMethod } from '@/lib/otp-store';
import { prisma } from '@/lib/prisma';
import { finalizeBookingFromDraft, type FinalizeResult, type FinalizeError } from '@/lib/booking/finalize-booking';

interface Args {
  method: string;
  draftId: string;
  code: string;
}

type CompleteError = { ok: false; error: string; message?: string };
type CompleteResult = FinalizeResult | FinalizeError | CompleteError;

const COMPLETE_BOOKING_IN_FLIGHT = new Map<string, Promise<CompleteResult>>();
const COMPLETE_BOOKING_RECENT = new Map<
  string,
  { result: FinalizeResult; expiresAt: number }
>();
const COMPLETE_BOOKING_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Resolve the OTP method and contact info from the method string and draft.
 */
function resolveOtpLookup(
  method: string,
  draft: { email: string; phone: string | null },
): { otpMethod: OTPMethod; contact: string } | { error: string } {
  switch (method) {
    case 'email_otp':
      return { otpMethod: 'email', contact: draft.email };

    case 'sms_otp':
      if (!draft.phone) return { error: 'NO_PHONE' };
      return { otpMethod: 'sms', contact: draft.phone };

    case 'telegram_otp':
      if (!draft.phone) return { error: 'NO_PHONE' };
      return { otpMethod: 'telegram', contact: draft.phone };

    default:
      return { error: 'UNSUPPORTED_METHOD' };
  }
}

async function completeBookingInternal(args: Args): Promise<CompleteResult> {
  const { method, draftId, code } = args;

  // Get draft
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
    select: { email: true, phone: true },
  });

  if (!draft) {
    return { ok: false, error: 'DRAFT_NOT_FOUND' };
  }

  // Resolve OTP lookup params
  const lookup = resolveOtpLookup(method, draft);
  if ('error' in lookup) {
    return { ok: false, error: lookup.error };
  }

  // Verify OTP
  const isValid = verifyOTP(lookup.otpMethod, lookup.contact, draftId, code);

  if (!isValid) {
    return {
      ok: false,
      error: 'INVALID_CODE',
      message: 'Invalid or expired verification code',
    };
  }

  // Finalize booking (create Appointment from draft)
  const result = await finalizeBookingFromDraft(draftId);

  if (!result.ok) {
    return result;
  }

  // Cleanup OTP
  deleteOTP(lookup.otpMethod, lookup.contact, draftId);

  console.log(`[AI complete_booking] Appointment created: ${result.appointmentId} via ${method}`);

  // Send client confirmation email (fire-and-forget)
  try {
    const { sendStatusChangeEmail } = await import('@/lib/email');
    const appt = await prisma.appointment.findUnique({
      where: { id: result.appointmentId },
      include: {
        service: {
          select: {
            name: true,
            parent: { select: { name: true } },
          },
        },
        master: { select: { name: true } },
      },
    });

    if (appt?.email) {
      const serviceName = appt.service?.parent?.name
        ? `${appt.service.parent.name} / ${appt.service.name}`
        : appt.service?.name || '—';
      const masterName = appt.master?.name || '—';

      void sendStatusChangeEmail({
        customerName: appt.customerName,
        email: appt.email,
        serviceName,
        masterName,
        startAt: appt.startAt,
        endAt: appt.endAt,
        status: appt.status,
        locale: (appt.locale as 'de' | 'ru' | 'en') || 'de',
      });
    }
  } catch (e) {
    console.warn('[AI complete_booking] Client email notification failed:', e);
  }

  // Send client Telegram status notification (only for Telegram-verified flow)
  if (method === 'telegram_otp') {
    try {
      const { notifyClientAppointmentStatus } = await import('@/lib/telegram-bot');
      const appt = await prisma.appointment.findUnique({
        where: { id: result.appointmentId },
        include: {
          service: {
            select: {
              name: true,
              parent: { select: { name: true } },
            },
          },
          master: { select: { name: true } },
        },
      });

      if (appt?.phone) {
        const serviceName = appt.service?.parent?.name
          ? `${appt.service.parent.name} / ${appt.service.name}`
          : appt.service?.name || '—';
        const masterName = appt.master?.name || '—';

        void notifyClientAppointmentStatus({
          customerName: appt.customerName,
          email: appt.email,
          phone: appt.phone,
          serviceName,
          masterName,
          startAt: appt.startAt,
          endAt: appt.endAt,
          status: appt.status,
          locale: (appt.locale as 'de' | 'ru' | 'en') || 'de',
        });
      }
    } catch (e) {
      console.warn('[AI complete_booking] Client Telegram notification failed:', e);
    }
  }

  // Send admin notification (fire-and-forget)
  try {
    const { sendAdminNotification } = await import('@/lib/send-admin-notification');
    const appt = await prisma.appointment.findUnique({
      where: { id: result.appointmentId },
      include: {
        service: { select: { name: true } },
        master: { select: { name: true } },
      },
    });
    if (appt) {
      void sendAdminNotification({
        id: appt.id,
        customerName: appt.customerName,
        phone: appt.phone,
        email: appt.email,
        serviceName: appt.service.name,
        masterName: appt.master?.name ?? 'N/A',
        masterId: appt.masterId,
        startAt: appt.startAt,
        endAt: appt.endAt,
        paymentStatus: appt.paymentStatus,
      });
    }
  } catch (e) {
    console.warn('[AI complete_booking] Admin notification failed:', e);
  }

  return result;
}

export async function completeBooking(args: Args): Promise<CompleteResult> {
  const { draftId } = args;
  const now = Date.now();

  const cached = COMPLETE_BOOKING_RECENT.get(draftId);
  if (cached) {
    if (cached.expiresAt > now) {
      return cached.result;
    }
    COMPLETE_BOOKING_RECENT.delete(draftId);
  }

  const inFlight = COMPLETE_BOOKING_IN_FLIGHT.get(draftId);
  if (inFlight) {
    return inFlight;
  }

  const promise = completeBookingInternal(args)
    .then((res) => {
      if (res.ok) {
        COMPLETE_BOOKING_RECENT.set(draftId, {
          result: res,
          expiresAt: Date.now() + COMPLETE_BOOKING_CACHE_TTL_MS,
        });
      }
      return res;
    })
    .finally(() => {
      COMPLETE_BOOKING_IN_FLIGHT.delete(draftId);

      if (COMPLETE_BOOKING_RECENT.size > 200) {
        const ts = Date.now();
        for (const [key, value] of COMPLETE_BOOKING_RECENT.entries()) {
          if (value.expiresAt <= ts) {
            COMPLETE_BOOKING_RECENT.delete(key);
          }
        }
      }
    });

  COMPLETE_BOOKING_IN_FLIGHT.set(draftId, promise);
  return promise;
}
