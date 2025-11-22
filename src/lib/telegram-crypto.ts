// src/lib/telegram-crypto.ts

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.TELEGRAM_ENCRYPTION_KEY || generateDefaultKey();
const IV_LENGTH = 16;

/**
 * Генерирует ключ по умолчанию для dev (в production использовать переменную окружения!)
 */
function generateDefaultKey(): string {
  console.warn(
    '⚠️ TELEGRAM_ENCRYPTION_KEY не установлен! Используется дефолтный ключ (только для разработки!)'
  );
  return '0123456789abcdef0123456789abcdef'; // 32 символа = 256 бит
}

/**
 * Шифрует payload для deep link
 * 
 * @example
 * const encrypted = encryptPayload({ draftId: 'abc123', email: 'user@example.com' });
 * // Результат: base64url строка, безопасная для URL
 */
export function encryptPayload(payload: Record<string, unknown>): string {
  try {
    const jsonString = JSON.stringify(payload);
    const iv = randomBytes(IV_LENGTH);

    // Убедимся что ключ правильной длины (32 байта для AES-256)
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Комбинируем IV и зашифрованные данные
    const combined = iv.toString('hex') + ':' + encrypted;

    // Конвертируем в base64url (безопасно для URL)
    return Buffer.from(combined)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } catch (error) {
    console.error('[Telegram Crypto] Ошибка шифрования:', error);
    throw new Error('Не удалось зашифровать payload');
  }
}

/**
 * Дешифрует payload из deep link
 * 
 * @example
 * const payload = decryptPayload(encryptedString);
 * // payload: { draftId: 'abc123', email: 'user@example.com' }
 */
export function decryptPayload(encryptedData: string): Record<string, unknown> {
  try {
    // Восстанавливаем base64 из base64url
    const base64 = encryptedData.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const combined = Buffer.from(base64 + padding, 'base64').toString();

    const [ivHex, encryptedHex] = combined.split(':');
    if (!ivHex || !encryptedHex) {
      throw new Error('Неверный формат зашифрованных данных');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted) as Record<string, unknown>;
  } catch (error) {
    console.error('[Telegram Crypto] Ошибка дешифрования:', error);
    throw new Error('Не удалось дешифровать payload');
  }
}

/**
 * Генерирует безопасный deep link для Telegram бота
 * 
 * @param draftId - ID черновика записи
 * @param email - Email пользователя
 * @returns Полный URL для открытия бота: https://t.me/SalonElenBot?start=...
 */
export function generateTelegramDeepLink(
  draftId: string,
  email: string
): string {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'SalonElenBot';
  
  const payload = {
    draftId,
    email,
    timestamp: Date.now(),
  };

  const encryptedPayload = encryptPayload(payload);

  return `https://t.me/${botUsername}?start=${encryptedPayload}`;
}

/**
 * Парсит параметр start из deep link и возвращает payload
 */
export function parseTelegramStart(startParam: string): {
  draftId: string;
  email: string;
  timestamp: number;
} {
  const decrypted = decryptPayload(startParam);
  
  if (!decrypted.draftId || !decrypted.email || !decrypted.timestamp) {
    throw new Error('Неверная структура payload');
  }

  return {
    draftId: decrypted.draftId as string,
    email: decrypted.email as string,
    timestamp: decrypted.timestamp as number,
  };
}
