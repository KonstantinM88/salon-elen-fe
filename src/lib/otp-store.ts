// src/lib/otp-store.ts

/**
 * Расширенное хранилище OTP для email и Telegram верификации
 * Поддерживает два способа подтверждения для Telegram:
 * 1. Ввод кода на сайте (как email)
 * 2. Автоподтверждение через кнопку в боте
 */

export type VerificationMethod = 'email' | 'telegram';

export interface OTPEntry {
  code: string;
  expiresAt: number;
  method: VerificationMethod;
  
  // Для Telegram: автоподтверждение
  telegramUserId?: number;
  telegramChatId?: number;
  
  // Статус подтверждения (для автоподтверждения)
  confirmed: boolean;
  confirmedAt?: number;
}

// ✅ Глобальное хранилище OTP (расширенное)
declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, OTPEntry> | undefined;
}

if (!global.__otpStore) {
  global.__otpStore = new Map<string, OTPEntry>();
}

export const otpStore = global.__otpStore;

/**
 * Генерирует 6-значный OTP код
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Создаёт ключ для хранилища
 * 
 * @example
 * createOTPKey('email', 'user@example.com', 'draft123') // => 'email:user@example.com:draft123'
 * createOTPKey('telegram', 'user@example.com', 'draft123') // => 'telegram:user@example.com:draft123'
 */
export function createOTPKey(
  method: VerificationMethod,
  email: string,
  draftId: string
): string {
  return `${method}:${email}:${draftId}`;
}

/**
 * Сохраняет OTP код в хранилище
 */
export function saveOTP(
  method: VerificationMethod,
  email: string,
  draftId: string,
  code: string,
  options?: {
    telegramUserId?: number;
    telegramChatId?: number;
    ttlMinutes?: number;
  }
): void {
  const key = createOTPKey(method, email, draftId);
  const ttl = (options?.ttlMinutes || 10) * 60 * 1000; // по умолчанию 10 минут
  
  const entry: OTPEntry = {
    code,
    expiresAt: Date.now() + ttl,
    method,
    telegramUserId: options?.telegramUserId,
    telegramChatId: options?.telegramChatId,
    confirmed: false,
  };

  otpStore.set(key, entry);

  console.log(`[OTP Store] Сохранён ${method} код для ${email}:${draftId}`);
  console.log(`[OTP Store] Всего кодов в хранилище: ${otpStore.size}`);
}

/**
 * Получает OTP запись из хранилища
 */
export function getOTP(
  method: VerificationMethod,
  email: string,
  draftId: string
): OTPEntry | undefined {
  const key = createOTPKey(method, email, draftId);
  return otpStore.get(key);
}

/**
 * Проверяет OTP код
 * 
 * @returns true если код верный и не истёк, иначе false
 */
export function verifyOTP(
  method: VerificationMethod,
  email: string,
  draftId: string,
  code: string
): { valid: boolean; error?: string } {
  const key = createOTPKey(method, email, draftId);
  const stored = otpStore.get(key);

  if (!stored) {
    return { valid: false, error: 'Код не найден. Запросите новый код' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: 'Срок действия кода истёк. Запросите новый код' };
  }

  if (stored.code !== code) {
    return { valid: false, error: 'Неверный код' };
  }

  return { valid: true };
}

/**
 * Помечает OTP как подтверждённый (для автоподтверждения через Telegram)
 */
export function confirmOTP(
  method: VerificationMethod,
  email: string,
  draftId: string
): boolean {
  const key = createOTPKey(method, email, draftId);
  const stored = otpStore.get(key);

  if (!stored) {
    return false;
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return false;
  }

  stored.confirmed = true;
  stored.confirmedAt = Date.now();
  otpStore.set(key, stored);

  console.log(`[OTP Store] Код подтверждён для ${key}`);
  return true;
}

/**
 * Проверяет статус подтверждения (для polling с фронта)
 */
export function checkOTPConfirmed(
  method: VerificationMethod,
  email: string,
  draftId: string
): { confirmed: boolean; expired: boolean } {
  const key = createOTPKey(method, email, draftId);
  const stored = otpStore.get(key);

  if (!stored) {
    return { confirmed: false, expired: true };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { confirmed: false, expired: true };
  }

  return { confirmed: stored.confirmed || false, expired: false };
}

/**
 * Удаляет OTP из хранилища
 */
export function deleteOTP(
  method: VerificationMethod,
  email: string,
  draftId: string
): void {
  const key = createOTPKey(method, email, draftId);
  otpStore.delete(key);
  console.log(`[OTP Store] Удалён код для ${key}`);
}

/**
 * Очищает истёкшие коды (можно вызывать периодически)
 */
export function cleanupExpiredOTPs(): number {
  const now = Date.now();
  let deleted = 0;

  for (const [key, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(key);
      deleted++;
    }
  }

  if (deleted > 0) {
    console.log(`[OTP Store] Очищено ${deleted} истёкших кодов`);
  }

  return deleted;
}

// Автоматическая очистка каждые 5 минут
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
}
