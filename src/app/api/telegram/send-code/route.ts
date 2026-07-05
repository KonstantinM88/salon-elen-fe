import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPhoneDigitsValid, normalizePhoneDigits } from "@/lib/phone";
import { maskPhoneForLog } from "@/lib/telegram/logging";
import { sendTelegramMessage } from "@/lib/telegram/sender";

function buildTelegramCodeMessage(code: string): string {
  return [
    "🔐 <b>Код подтверждения для записи:</b>",
    "",
    `<code>${code}</code>`,
    "",
    "⏰ Действителен <b>10 минут</b>",
    "",
    "Введите этот код на сайте для завершения записи.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, serviceId, masterId, startAt, endAt } = body;

    console.log("[Telegram Send Code] Request:", {
      phone: maskPhoneForLog(phone),
      serviceId,
      masterId,
      startAt,
      endAt,
    });

    if (!phone || !serviceId || !masterId || !startAt || !endAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const phoneDigits = normalizePhoneDigits(phone);
    if (!isPhoneDigitsValid(phoneDigits)) {
      console.log("[Telegram Send Code] Invalid phone format:", maskPhoneForLog(phone));
      return NextResponse.json(
        { error: "Invalid phone format. Use format: +4917789951064" },
        { status: 400 },
      );
    }

    const matches = await prisma.telegramUser.findMany({
      where: { phone: { endsWith: phoneDigits } },
      select: {
        phone: true,
        telegramChatId: true,
        telegramUserId: true,
      },
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "Phone not registered in Telegram bot" },
        { status: 404 },
      );
    }

    if (matches.length > 1) {
      return NextResponse.json(
        { error: "Multiple users found. Use full phone number with country code." },
        { status: 409 },
      );
    }

    const matchedUser = matches[0];
    const resolvedPhone = matchedUser.phone;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log("[Telegram Send Code] Generated verification:", { sessionId });

    await prisma.telegramVerification.deleteMany({
      where: {
        phone: resolvedPhone,
        verified: false,
        expiresAt: { lt: new Date() },
      },
    });

    const verification = await prisma.telegramVerification.create({
      data: {
        phone: resolvedPhone,
        code,
        sessionId,
        serviceId,
        masterId,
        startAt,
        endAt,
        expiresAt,
        verified: false,
        telegramUserId: matchedUser.telegramUserId,
      },
    });

    console.log("[Telegram Send Code] Verification created:", {
      id: verification.id,
      phone: maskPhoneForLog(resolvedPhone),
      sessionId: verification.sessionId,
    });

    const telegramResult = await sendTelegramMessage({
      chatId: Number(matchedUser.telegramChatId),
      text: buildTelegramCodeMessage(code),
      parseMode: "HTML",
    });

    if (!telegramResult.ok) {
      console.error("[Telegram Send Code] Telegram send error:", {
        phone: maskPhoneForLog(resolvedPhone),
        chatId: telegramResult.chatId,
        error: telegramResult.description,
      });
      return NextResponse.json(
        { error: "Failed to send Telegram code" },
        { status: 502 },
      );
    }

    console.log("[Telegram Send Code] Code sent to Telegram successfully");

    return NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      expiresAt: verification.expiresAt,
      message: "Code sent to Telegram",
    });
  } catch (error) {
    console.error("[Telegram Send Code] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
