import { NextRequest, NextResponse } from "next/server";

import {
  verifyClientAppointmentActionToken,
} from "@/lib/booking/client-appointment-links";
import { changeAppointmentStatus } from "@/lib/booking/status-change";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/lib/prisma-client";
import { buildPublicUrl } from "@/lib/public-url";

function redirectToManage(
  appointmentId: string,
  token: string,
  params: Record<string, string>,
): NextResponse {
  const url = new URL(buildPublicUrl(`/appointments/${encodeURIComponent(appointmentId)}/manage`));
  url.searchParams.set("action", "cancel");
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

  if (
    !verifyClientAppointmentActionToken({
      appointmentId,
      action: "cancel",
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

  const result = await changeAppointmentStatus({
    appointmentId,
    status: AppointmentStatus.CANCELED,
    changedBy: "client:self-service",
    reason: "Client canceled via secure self-service link",
  });

  if (!result.ok) {
    return redirectToManage(appointmentId, token, { error: result.error });
  }

  return redirectToManage(appointmentId, token, { result: "canceled" });
}
