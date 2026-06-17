import { NextRequest, NextResponse } from "next/server";

import {
  verifyClientAppointmentActionToken,
} from "@/lib/booking/client-appointment-links";
import { rescheduleAppointment } from "@/lib/booking/reschedule-appointment";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/lib/prisma-client";
import { buildPublicUrl } from "@/lib/public-url";

function redirectToManage(
  appointmentId: string,
  token: string,
  params: Record<string, string>,
): NextResponse {
  const url = new URL(buildPublicUrl(`/appointments/${encodeURIComponent(appointmentId)}/manage`));
  url.searchParams.set("action", "reschedule");
  url.searchParams.set("token", token);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: appointmentId } = await params;
  const formData = await request.formData();
  const token = String(formData.get("token") || "");
  const dateISO = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");

  if (
    !verifyClientAppointmentActionToken({
      appointmentId,
      action: "reschedule",
      token,
    })
  ) {
    return redirectToManage(appointmentId, token, { error: "invalid_link" });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true, startAt: true, deletedAt: true },
  });

  if (!appointment || appointment.deletedAt) {
    return redirectToManage(appointmentId, token, { error: "not_found" });
  }

  if (
    appointment.startAt <= new Date() ||
    appointment.status === AppointmentStatus.CANCELED ||
    appointment.status === AppointmentStatus.DONE
  ) {
    return redirectToManage(appointmentId, token, { error: "not_available" });
  }

  const result = await rescheduleAppointment({
    appointmentId,
    dateISO,
    time,
    changedBy: "client:self-service",
    reason: "Client rescheduled via secure self-service link",
  });

  if (!result.ok) {
    return redirectToManage(appointmentId, token, {
      date: dateISO,
      error: result.error,
    });
  }

  return redirectToManage(appointmentId, token, { result: "rescheduled" });
}
