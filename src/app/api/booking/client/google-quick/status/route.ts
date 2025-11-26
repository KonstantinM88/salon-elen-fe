// src/app/api/booking/client/google-quick/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/booking/client/google-quick/status
 * 
 * Проверяет статус быстрой регистрации через Google.
 * Используется для polling из фронтенда.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        {
          error: "requestId обязателен",
        },
        { status: 400 }
      );
    }

    console.log("[Google Quick Reg Status] Checking status for:", requestId);

    // Ищем запрос
    const quickReg = await prisma.googleQuickRegistration.findFirst({
      where: {
        id: requestId,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        verified: true,
        appointmentId: true,
        expiresAt: true,
      },
    });

    if (!quickReg) {
      console.log("[Google Quick Reg Status] Request not found or expired");
      return NextResponse.json({
        error: "Запрос не найден или истёк",
      });
    }

    if (quickReg.verified && quickReg.appointmentId) {
      console.log("[Google Quick Reg Status] ✅ Verified! Appointment:", quickReg.appointmentId);
      return NextResponse.json({
        verified: true,
        appointmentId: quickReg.appointmentId,
      });
    }

    console.log("[Google Quick Reg Status] ⏳ Still pending...");
    return NextResponse.json({
      verified: false,
      pending: true,
    });
  } catch (error) {
    console.error("[Google Quick Reg Status] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Внутренняя ошибка сервера",
      },
      { status: 500 }
    );
  }
}