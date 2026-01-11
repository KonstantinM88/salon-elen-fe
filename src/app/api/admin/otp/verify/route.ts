// src/app/api/admin/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * POST - Проверка OTP кода
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, resourceId, resourceType, action } = body;

    if (!code || !resourceId || !resourceType || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`[Admin OTP] Verifying code: ${code} for ${resourceType}:${resourceId}`);

    // Найти OTP
    const otp = await prisma.adminOTP.findFirst({
      where: {
        code,
        action,
        resourceId,
        resourceType,
        adminEmail: session.user.email!,
        verified: false,
        expiresAt: { gt: new Date() }, // Не истёк
      },
    });

    if (!otp) {
      console.log(`[Admin OTP] Invalid or expired code: ${code}`);
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Пометить как использованный
    await prisma.adminOTP.update({
      where: { id: otp.id },
      data: {
        verified: true,
        usedAt: new Date(),
      },
    });

    console.log(`[Admin OTP] Code verified successfully: ${code}`);

    return NextResponse.json({
      success: true,
      otpId: otp.id,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("[Admin OTP] Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}