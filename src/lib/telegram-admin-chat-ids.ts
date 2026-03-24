export function parseTelegramAdminChatIds(
  value: string | undefined | null = process.env.TELEGRAM_ADMIN_CHAT_ID,
): string[] {
  if (!value) {
    return [];
  }

  const uniqueIds = new Set(
    value
      .split(/[,\s;]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

  return Array.from(uniqueIds);
}

export function getSingleTelegramAdminChatId(
  value: string | undefined | null = process.env.TELEGRAM_ADMIN_CHAT_ID,
): string | null {
  const adminChatIds = parseTelegramAdminChatIds(value);
  return adminChatIds.length === 1 ? adminChatIds[0] : null;
}
