import { createHmac, timingSafeEqual } from "node:crypto";
import { buildPublicUrl } from "@/lib/public-url";

export type ClientAppointmentAction = "cancel" | "reschedule";

export type ClientAppointmentActionLinks = {
  cancelUrl: string;
  rescheduleUrl: string;
};

const ACTIONS: ClientAppointmentAction[] = ["cancel", "reschedule"];

function getSecret(): string | null {
  return (
    process.env.APPOINTMENT_ACTION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.CRON_SECRET ||
    null
  );
}

function signPayload(appointmentId: string, action: ClientAppointmentAction): string | null {
  const secret = getSecret();
  if (!secret) {
    console.warn(
      "[Client Appointment Links] Missing APPOINTMENT_ACTION_SECRET/NEXTAUTH_SECRET/CRON_SECRET; links disabled",
    );
    return null;
  }

  return createHmac("sha256", secret)
    .update(`${appointmentId}:${action}`)
    .digest("base64url");
}

export function isClientAppointmentAction(value: string | null | undefined): value is ClientAppointmentAction {
  return ACTIONS.includes(value as ClientAppointmentAction);
}

export function verifyClientAppointmentActionToken({
  appointmentId,
  action,
  token,
}: {
  appointmentId: string;
  action: ClientAppointmentAction;
  token: string | null | undefined;
}): boolean {
  if (!token) return false;

  const expected = signPayload(appointmentId, action);
  if (!expected) return false;

  const expectedBuffer = Buffer.from(expected);
  const tokenBuffer = Buffer.from(token);

  return (
    expectedBuffer.length === tokenBuffer.length &&
    timingSafeEqual(expectedBuffer, tokenBuffer)
  );
}

export function buildClientAppointmentActionUrl({
  appointmentId,
  action,
}: {
  appointmentId: string;
  action: ClientAppointmentAction;
}): string | null {
  const token = signPayload(appointmentId, action);
  if (!token) return null;

  const params = new URLSearchParams({
    action,
    token,
  });

  return `${buildPublicUrl(`/appointments/${encodeURIComponent(appointmentId)}/manage`)}?${params.toString()}`;
}

export function buildClientAppointmentActionLinks(
  appointmentId: string | null | undefined,
): ClientAppointmentActionLinks | null {
  if (!appointmentId) return null;

  const cancelUrl = buildClientAppointmentActionUrl({
    appointmentId,
    action: "cancel",
  });
  const rescheduleUrl = buildClientAppointmentActionUrl({
    appointmentId,
    action: "reschedule",
  });

  if (!cancelUrl || !rescheduleUrl) return null;
  return { cancelUrl, rescheduleUrl };
}
