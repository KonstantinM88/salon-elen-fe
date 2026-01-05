import { NextRequest, NextResponse } from "next/server";
import { Temporal } from "@js-temporal/polyfill";
import { prisma } from "@/lib/prisma";
import { ORG_TZ } from "@/lib/orgTime";

type DetailsResponse = {
  ok: boolean;
  serviceId?: string;
  masterId?: string;
  dateISO?: string;
  error?: string;
};

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function formatDateISOInOrgTz(date: Date): string {
  const zdt = Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(ORG_TZ);
  return `${zdt.year}-${pad2(zdt.month)}-${pad2(zdt.day)}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get("registrationId");

    if (!registrationId) {
      return NextResponse.json(
        { ok: false, error: "registrationId обязателен" } satisfies DetailsResponse,
        { status: 400 }
      );
    }

    const quickReg = await prisma.googleQuickRegistration.findUnique({
      where: { id: registrationId },
      select: {
        serviceId: true,
        masterId: true,
        startAt: true,
        expiresAt: true,
      },
    });

    if (!quickReg || quickReg.expiresAt < new Date()) {
      return NextResponse.json(
        { ok: false, error: "Запрос не найден или истёк" } satisfies DetailsResponse,
        { status: 404 }
      );
    }

    const dateISO = formatDateISOInOrgTz(quickReg.startAt);

    return NextResponse.json({
      ok: true,
      serviceId: quickReg.serviceId,
      masterId: quickReg.masterId ?? undefined,
      dateISO,
    } satisfies DetailsResponse);
  } catch (error) {
    console.error("[Google Quick Reg Details] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Внутренняя ошибка сервера",
      } satisfies DetailsResponse,
      { status: 500 }
    );
  }
}
