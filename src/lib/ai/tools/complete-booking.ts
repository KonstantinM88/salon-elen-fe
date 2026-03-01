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

export async function completeBooking(args: Args): Promise<CompleteResult> {
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


// // src/lib/ai/tools/complete-booking.ts

// import { verifyOTP, deleteOTP, type OTPMethod } from '@/lib/otp-store';
// import { prisma } from '@/lib/prisma';
// import { finalizeBookingFromDraft } from '@/lib/booking/finalize-booking';

// interface Args {
//   method: string;
//   draftId: string;
//   code: string;
// }

// export async function completeBooking(args: Args) {
//   const { method, draftId, code } = args;

//   if (method !== 'email_otp') {
//     return { ok: false, error: 'UNSUPPORTED_METHOD' };
//   }

//   // Get draft to find the email
//   const draft = await prisma.bookingDraft.findUnique({
//     where: { id: draftId },
//     select: { email: true },
//   });

//   if (!draft) {
//     return { ok: false, error: 'DRAFT_NOT_FOUND' };
//   }

//   // Verify OTP
//   const isValid = verifyOTP('email' as OTPMethod, draft.email, draftId, code);

//   if (!isValid) {
//     return {
//       ok: false,
//       error: 'INVALID_CODE',
//       message: 'Invalid or expired verification code',
//     };
//   }

//   // Finalize booking (create Appointment from draft)
//   const result = await finalizeBookingFromDraft(draftId);

//   if (!result.ok) {
//     return result;
//   }

//   // Cleanup OTP
//   deleteOTP('email' as OTPMethod, draft.email, draftId);

//   console.log(`[AI complete_booking] Appointment created: ${result.appointmentId}`);

//   // Send admin notification (fire-and-forget)
//   try {
//     const { sendAdminNotification } = await import('@/lib/send-admin-notification');
//     const appt = await prisma.appointment.findUnique({
//       where: { id: result.appointmentId },
//       include: {
//         service: { select: { name: true } },
//         master: { select: { name: true } },
//       },
//     });
//     if (appt) {
//       void sendAdminNotification({
//         id: appt.id,
//         customerName: appt.customerName,
//         phone: appt.phone,
//         email: appt.email,
//         serviceName: appt.service.name,
//         masterName: appt.master?.name ?? 'N/A',
//         masterId: appt.masterId,
//         startAt: appt.startAt,
//         endAt: appt.endAt,
//         paymentStatus: appt.paymentStatus,
//       });
//     }
//   } catch (e) {
//     console.warn('[AI complete_booking] Admin notification failed:', e);
//   }

//   return result;
// }
