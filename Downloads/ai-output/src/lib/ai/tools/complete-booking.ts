// src/lib/ai/tools/complete-booking.ts

import { verifyOTP, deleteOTP, type OTPMethod } from '@/lib/otp-store';
import { prisma } from '@/lib/prisma';
import { finalizeBookingFromDraft } from '@/lib/booking/finalize-booking';

interface Args {
  method: string;
  draftId: string;
  code: string;
}

export async function completeBooking(args: Args) {
  const { method, draftId, code } = args;

  if (method !== 'email_otp') {
    return { ok: false, error: 'UNSUPPORTED_METHOD' };
  }

  // Get draft to find the email
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
    select: { email: true },
  });

  if (!draft) {
    return { ok: false, error: 'DRAFT_NOT_FOUND' };
  }

  // Verify OTP
  const isValid = verifyOTP('email' as OTPMethod, draft.email, draftId, code);

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
  deleteOTP('email' as OTPMethod, draft.email, draftId);

  console.log(`[AI complete_booking] Appointment created: ${result.appointmentId}`);

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
