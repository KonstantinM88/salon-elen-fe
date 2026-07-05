import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPhoneDigitsValid, normalizePhoneDigits } from "@/lib/phone";
import { maskEmailForLog, maskPhoneForLog } from "@/lib/telegram/logging";
import { sendTelegramMessage } from "@/lib/telegram/sender";

interface SendCodeDraftRequest {
  phone: string;
  email?: string;
  draftId: string;
}

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
  console.log("=== [Telegram Send Code Draft] START ===");

  try {
    const body: SendCodeDraftRequest = await request.json();
    const { phone, email, draftId } = body;

    console.log("[Telegram Send Code Draft] Request:", {
      phone: maskPhoneForLog(phone),
      email: maskEmailForLog(email),
      draftId,
    });

    if (!phone || !draftId) {
      console.log("[Telegram Send Code Draft] ERROR: Missing fields");
      return NextResponse.json(
        { error: "Missing phone or draftId" },
        { status: 400 },
      );
    }

    const phoneDigits = normalizePhoneDigits(phone);
    if (!isPhoneDigitsValid(phoneDigits)) {
      console.log(
        "[Telegram Send Code Draft] ERROR: Invalid phone format:",
        maskPhoneForLog(phone),
      );
      return NextResponse.json(
        { error: "Invalid phone format. Use format: +380679014039" },
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

    console.log("[Telegram Send Code Draft] Loading draft:", draftId);

    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      console.log("[Telegram Send Code Draft] ERROR: Draft not found");
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 },
      );
    }

    console.log("[Telegram Send Code Draft] Draft loaded:", {
      serviceId: draft.serviceId,
      masterId: draft.masterId,
      startAt: draft.startAt,
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log("[Telegram Send Code Draft] Generated verification:", { sessionId });

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
        serviceId: draft.serviceId,
        masterId: draft.masterId,
        startAt: draft.startAt.toISOString(),
        endAt: draft.endAt.toISOString(),
        email: email || null,
        birthDate: draft.birthDate || null,
        locale: (draft as { locale?: string }).locale || "de",
        expiresAt,
        verified: false,
        telegramUserId: matchedUser.telegramUserId,
      },
    });

    console.log("[Telegram Send Code Draft] Verification created:", {
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
      console.error("[Telegram Send Code Draft] Telegram send error:", {
        phone: maskPhoneForLog(resolvedPhone),
        chatId: telegramResult.chatId,
        error: telegramResult.description,
      });
      return NextResponse.json(
        { error: "Failed to send Telegram code" },
        { status: 502 },
      );
    }

    console.log("[Telegram Send Code Draft] Code sent to Telegram successfully");

    return NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      expiresAt: verification.expiresAt,
      message: "Code sent to Telegram",
    });
  } catch (error) {
    console.error("=== [Telegram Send Code Draft] ERROR ===");
    console.error("Error details:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
