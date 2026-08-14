import { parseTelegramAdminChatIds } from "@/lib/telegram-admin-chat-ids";

export type TelegramParseMode = "HTML" | "Markdown" | "MarkdownV2";

export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramForceReplyMarkup {
  force_reply: true;
  input_field_placeholder?: string;
  selective?: boolean;
}

export type TelegramReplyMarkup =
  | TelegramInlineKeyboardMarkup
  | TelegramForceReplyMarkup;

export interface TelegramSendOptions {
  chatId: string | number;
  text: string;
  parseMode?: TelegramParseMode;
  replyMarkup?: TelegramReplyMarkup;
  disableWebPagePreview?: boolean;
  fallbackToPlainText?: boolean;
}

export interface TelegramSendResult {
  ok: boolean;
  chatId: string;
  description?: string;
  partsSent?: number;
  totalParts?: number;
}

interface TelegramApiResponse {
  ok?: boolean;
  description?: string;
}

function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

function isEntityParseError(description?: string): boolean {
  return Boolean(description?.toLowerCase().includes("can't parse entities"));
}

function normalizeChatId(chatId: string | number): string {
  return String(chatId);
}

export const TELEGRAM_TEXT_LIMIT = 4_000;

export function splitTelegramText(
  text: string,
  maxLength = TELEGRAM_TEXT_LIMIT,
): string[] {
  if (!Number.isInteger(maxLength) || maxLength < 1 || maxLength > 4_096) {
    throw new Error("Telegram chunk length must be between 1 and 4096");
  }

  if (text.length <= maxLength) {
    return [text];
  }

  const parts: string[] = [];
  let offset = 0;

  while (text.length - offset > maxLength) {
    const windowEnd = offset + maxLength;
    const newlineIndex = text.lastIndexOf("\n", windowEnd);
    const splitAt = newlineIndex >= offset ? newlineIndex + 1 : windowEnd;

    parts.push(text.slice(offset, splitAt));
    offset = splitAt;
  }

  if (offset < text.length) {
    parts.push(text.slice(offset));
  }

  return parts;
}

async function sendRawTelegramMessage({
  token,
  chatId,
  text,
  parseMode,
  replyMarkup,
  disableWebPagePreview,
}: TelegramSendOptions & { token: string }): Promise<{
  responseOk: boolean;
  result: TelegramApiResponse | null;
}> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      disable_web_page_preview: disableWebPagePreview ?? true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }),
  });

  const result = (await response.json().catch(() => null)) as TelegramApiResponse | null;
  return { responseOk: response.ok, result };
}

export async function sendTelegramMessage({
  fallbackToPlainText = true,
  ...options
}: TelegramSendOptions): Promise<TelegramSendResult> {
  const token = getBotToken();
  const chatId = normalizeChatId(options.chatId);

  if (!token) {
    return {
      ok: false,
      chatId,
      description: "TELEGRAM_BOT_TOKEN is not configured",
    };
  }

  const parts = splitTelegramText(options.text);

  try {
    for (let index = 0; index < parts.length; index += 1) {
      const isLastPart = index === parts.length - 1;
      const partOptions: TelegramSendOptions = {
        ...options,
        chatId,
        text: parts[index],
        replyMarkup: isLastPart ? options.replyMarkup : undefined,
      };
      let { responseOk, result } = await sendRawTelegramMessage({
        ...partOptions,
        token,
      });

      if (
        fallbackToPlainText &&
        partOptions.parseMode &&
        (!responseOk || !result?.ok) &&
        isEntityParseError(result?.description)
      ) {
        console.warn(
          `[Telegram Sender] Parse failed for ${chatId}; retrying part ${index + 1}/${parts.length} without parse_mode`,
        );
        ({ responseOk, result } = await sendRawTelegramMessage({
          ...partOptions,
          token,
          parseMode: undefined,
        }));
      }

      if (!responseOk || !result?.ok) {
        return {
          ok: false,
          chatId,
          description: result?.description ?? "Telegram API request failed",
          partsSent: index,
          totalParts: parts.length,
        };
      }
    }

    return {
      ok: true,
      chatId,
      partsSent: parts.length,
      totalParts: parts.length,
    };
  } catch (error) {
    return {
      ok: false,
      chatId,
      description: error instanceof Error ? error.message : "Telegram send failed",
      totalParts: parts.length,
    };
  }
}

export async function sendTelegramAdminMessage(
  text: string,
  options: Omit<TelegramSendOptions, "chatId" | "text"> = {},
): Promise<TelegramSendResult[]> {
  const adminChatIds = parseTelegramAdminChatIds();

  if (adminChatIds.length === 0) {
    console.warn("[Telegram Sender] TELEGRAM_ADMIN_CHAT_ID is not configured");
    return [];
  }

  console.log(
    `[Telegram Sender] Sending admin message to ${adminChatIds.length} admin(s): ${adminChatIds.join(", ")}`,
  );

  const results = await Promise.all(
    adminChatIds.map((chatId) =>
      sendTelegramMessage({
        chatId,
        text,
        ...options,
      }),
    ),
  );

  for (const result of results) {
    if (!result.ok) {
      console.error(
        `[Telegram Sender] Failed for ${result.chatId}: ${result.description ?? "unknown error"}`,
      );
    }
  }

  return results;
}

export function assertTelegramAdminDelivery(results: TelegramSendResult[]): void {
  if (results.length === 0) {
    throw new Error("No Telegram admin chat IDs configured");
  }

  if (results.every((result) => !result.ok)) {
    throw new Error("Failed to send Telegram admin message to all configured chat IDs");
  }
}
