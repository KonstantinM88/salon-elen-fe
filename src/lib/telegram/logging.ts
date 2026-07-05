export function maskPhoneForLog(value: string | null | undefined): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  if (digits.length < 5) return "***";

  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

export function maskEmailForLog(value: string | null | undefined): string | null {
  if (!value) return null;

  const [localPart, domain] = value.split("@");
  if (!localPart || !domain) return "***";

  return `${localPart.slice(0, 2)}***@${domain}`;
}

export function redactTextForLog(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const redacted = value
    .replace(/[^\s,;<>]+@[^\s,;<>]+\.[^\s,;<>]+/gi, (match) => maskEmailForLog(match) ?? "***")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, (match) => maskPhoneForLog(match) ?? "***")
    .replace(/\b\d{6}\b/g, "***code***")
    .trim();

  return redacted.length > 180 ? `${redacted.slice(0, 180)}...` : redacted;
}

export function summarizeTelegramUpdateForLog(update: unknown): Record<string, unknown> {
  const data = update as {
    update_id?: unknown;
    message?: {
      message_id?: unknown;
      text?: unknown;
      chat?: { id?: unknown; type?: unknown };
      from?: { id?: unknown; username?: unknown; first_name?: unknown };
      contact?: { phone_number?: unknown };
    };
    callback_query?: {
      id?: unknown;
      data?: unknown;
      from?: { id?: unknown; username?: unknown; first_name?: unknown };
      message?: { message_id?: unknown; chat?: { id?: unknown } };
    };
  };

  if (data.callback_query) {
    return {
      updateId: data.update_id,
      type: "callback_query",
      callbackId: data.callback_query.id,
      fromId: data.callback_query.from?.id,
      chatId: data.callback_query.message?.chat?.id,
      messageId: data.callback_query.message?.message_id,
      data: redactTextForLog(data.callback_query.data),
    };
  }

  if (data.message) {
    return {
      updateId: data.update_id,
      type: "message",
      messageId: data.message.message_id,
      chatId: data.message.chat?.id,
      chatType: data.message.chat?.type,
      fromId: data.message.from?.id,
      username: data.message.from?.username,
      text: redactTextForLog(data.message.text),
      contactPhone: maskPhoneForLog(
        typeof data.message.contact?.phone_number === "string"
          ? data.message.contact.phone_number
          : null,
      ),
    };
  }

  return {
    updateId: data.update_id,
    type: "unknown",
  };
}
