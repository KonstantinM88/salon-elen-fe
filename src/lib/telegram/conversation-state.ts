import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/prisma-client";

export type TelegramConversationFlow = "admin_quick_booking" | "admin_reschedule";

export interface TelegramConversationRecord<TPayload extends Record<string, unknown>> {
  key: TelegramConversationKey;
  payload: TPayload;
  step: string | null;
  expiresAt: Date;
}

export interface TelegramConversationKey {
  chatId: string;
  fromId: string;
  flow: TelegramConversationFlow;
}

export function telegramConversationKey({
  chatId,
  fromId,
  flow,
}: {
  chatId: string | number;
  fromId: string | number;
  flow: TelegramConversationFlow;
}): TelegramConversationKey {
  return {
    chatId: String(chatId),
    fromId: String(fromId),
    flow,
  };
}

export function conversationExpiresIn(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function saveTelegramConversationState<TPayload extends Record<string, unknown>>({
  key,
  payload,
  step = null,
  expiresAt,
}: {
  key: TelegramConversationKey;
  payload: TPayload;
  step?: string | null;
  expiresAt: Date;
}): Promise<void> {
  await prisma.telegramConversationState.upsert({
    where: {
      chatId_fromId_flow: key,
    },
    update: {
      payload: payload as Prisma.InputJsonObject,
      step,
      expiresAt,
    },
    create: {
      ...key,
      payload: payload as Prisma.InputJsonObject,
      step,
      expiresAt,
    },
  });
}

export async function getTelegramConversationState<TPayload extends Record<string, unknown>>(
  key: TelegramConversationKey,
): Promise<TelegramConversationRecord<TPayload> | null> {
  const state = await prisma.telegramConversationState.findUnique({
    where: {
      chatId_fromId_flow: key,
    },
  });

  if (!state) return null;

  if (state.expiresAt.getTime() <= Date.now()) {
    await deleteTelegramConversationState(key);
    return null;
  }

  return {
    key,
    payload: state.payload as TPayload,
    step: state.step,
    expiresAt: state.expiresAt,
  };
}

export async function deleteTelegramConversationState(
  key: TelegramConversationKey,
): Promise<void> {
  await prisma.telegramConversationState.deleteMany({
    where: key,
  });
}

export async function cleanupExpiredTelegramConversationStates(now = new Date()): Promise<number> {
  const result = await prisma.telegramConversationState.deleteMany({
    where: {
      expiresAt: { lte: now },
    },
  });

  return result.count;
}
