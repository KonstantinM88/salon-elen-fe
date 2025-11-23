// src/lib/otp-store.ts

export type OTPMethod = "email" | "telegram";

export interface OTPEntry {
  code: string;
  expiresAt: number;
  telegramUserId?: number;
  confirmed?: boolean;
  /** ID созданной записи Appointment (для Telegram-автоподтверждения) */
  appointmentId?: string;
}

// Расширяем global, чтобы store жил между hot-reload'ами
declare global {
  // eslint-disable-next-line no-var
  var __otpStore: Map<string, OTPEntry> | undefined;
}

function getStore(): Map<string, OTPEntry> {
  if (!global.__otpStore) {
    global.__otpStore = new Map<string, OTPEntry>();
  }
  return global.__otpStore;
}

const store = getStore();

function createKey(method: OTPMethod, email: string, draftId: string): string {
  return `${method}:${email}:${draftId}`;
}

/**
 * Генерирует 6-значный OTP-код
 */
export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Сохраняет OTP
 */
export function saveOTP(
  method: OTPMethod,
  email: string,
  draftId: string,
  code: string,
  options?: {
    ttlMinutes?: number;
    telegramUserId?: number;
  },
): void {
  const key = createKey(method, email, draftId);
  const ttlMs = (options?.ttlMinutes ?? 10) * 60 * 1000;
  const expiresAt = Date.now() + ttlMs;

  const entry: OTPEntry = {
    code,
    expiresAt,
    confirmed: false,
  };

  if (options?.telegramUserId) {
    entry.telegramUserId = options.telegramUserId;
  }

  store.set(key, entry);
  console.log(`[OTP Store] Сохранён ${method} код для ${email}:${draftId}`);
}

/**
 * Получает OTP (автоматически удаляет, если истёк)
 */
export function getOTP(
  method: OTPMethod,
  email: string,
  draftId: string,
): OTPEntry | null {
  const key = createKey(method, email, draftId);
  const entry = store.get(key);

  if (!entry) {
    console.log(`[OTP Store] Код не найден для ${email}:${draftId}`);
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    console.log(`[OTP Store] Код истёк для ${email}:${draftId}`);
    return null;
  }

  return entry;
}

/**
 * Проверяет корректность кода (без отметки confirmed)
 */
export function verifyOTP(
  method: OTPMethod,
  email: string,
  draftId: string,
  code: string,
): boolean {
  const entry = getOTP(method, email, draftId);

  if (!entry) {
    return false;
  }

  if (entry.code !== code) {
    console.log(
      `[OTP Store] Неверный код для ${email}:${draftId}. Ожидалось ${entry.code}, получено ${code}`,
    );
    return false;
  }

  return true;
}

/**
 * Отмечает OTP как подтверждённый (используется в Telegram callback)
 */
export function confirmOTP(
  method: OTPMethod,
  email: string,
  draftId: string,
  telegramUserId?: number,
): boolean {
  const key = createKey(method, email, draftId);
  const entry = store.get(key);

  if (!entry) {
    console.log(
      `[OTP Store] Код не найден для подтверждения: ${email}:${draftId}`,
    );
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    console.log(
      `[OTP Store] Код истёк при подтверждении для ${email}:${draftId}`,
    );
    return false;
  }

  entry.confirmed = true;
  if (telegramUserId) {
    entry.telegramUserId = telegramUserId;
  }

  store.set(key, entry);

  console.log(
    `[OTP Store] ✅ Установлен статус confirmed для ${email}:${draftId}`,
  );
  return true;
}

/**
 * Привязывает Appointment к OTP (нужно, чтобы фронт получил appointmentId по polling)
 */
export function setAppointmentForOTP(
  method: OTPMethod,
  email: string,
  draftId: string,
  appointmentId: string,
): void {
  const key = createKey(method, email, draftId);
  const entry = store.get(key);

  if (!entry) {
    console.log(
      `[OTP Store] Невозможно сохранить appointmentId, запись OTP не найдена: ${email}:${draftId}`,
    );
    return;
  }

  entry.appointmentId = appointmentId;
  store.set(key, entry);

  console.log(
    `[OTP Store] 🔗 Привязан appointment ${appointmentId} к OTP ${email}:${draftId}`,
  );
}

/**
 * Проверяет, подтверждён ли OTP
 */
export function isConfirmed(
  method: OTPMethod,
  email: string,
  draftId: string,
): boolean {
  const entry = getOTP(method, email, draftId);
  return !!entry?.confirmed;
}

/**
 * Удаляет OTP
 */
export function deleteOTP(
  method: OTPMethod,
  email: string,
  draftId: string,
): void {
  const key = createKey(method, email, draftId);
  store.delete(key);
  console.log(`[OTP Store] Удалён код для ${email}:${draftId}`);
}

/**
 * Отладочная печать
 */
export function debugOTPStore(): void {
  console.log("=== OTP Store Debug ===");
  console.log("Всего кодов:", store.size);

  store.forEach((entry, key) => {
    const [method, email, draftId] = key.split(":");
    const expired = Date.now() > entry.expiresAt;
    console.log(
      `${method} | ${email} | ${draftId} | код=${entry.code} | confirmed=${entry.confirmed} | appointmentId=${entry.appointmentId} | expired=${expired}`,
    );
  });
}



// // src/lib/otp-store.ts - Обновлённая версия с getOTP

// export type OTPMethod = 'email' | 'telegram';

// export interface OTPEntry {
//   code: string;
//   expiresAt: number;
//   telegramUserId?: number;
//   confirmed?: boolean;
// }

// // Расширяем global
// declare global {
//   var __otpStore: Map<string, OTPEntry> | undefined;
// }

// // Используем __otpStore чтобы избежать конфликтов
// const __otpStore: Map<string, OTPEntry> =
//   global.__otpStore || new Map<string, OTPEntry>();

// if (process.env.NODE_ENV !== 'production') {
//   global.__otpStore = __otpStore;
// }

// /**
//  * Генерирует 6-значный OTP код
//  */
// export function generateOTP(): string {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// /**
//  * Создаёт уникальный ключ для хранения
//  */
// function createKey(method: OTPMethod, email: string, draftId: string): string {
//   return `${method}:${email}:${draftId}`;
// }

// /**
//  * Сохраняет OTP код
//  */
// export function saveOTP(
//   method: OTPMethod,
//   email: string,
//   draftId: string,
//   code: string,
//   options?: {
//     ttlMinutes?: number;
//     telegramUserId?: number;
//   }
// ): void {
//   const key = createKey(method, email, draftId);
//   const ttl = (options?.ttlMinutes || 10) * 60 * 1000;

//   __otpStore.set(key, {
//     code,
//     expiresAt: Date.now() + ttl,
//     telegramUserId: options?.telegramUserId,
//     confirmed: false,
//   });

//   console.log(
//     `[OTP Store] Сохранён ${method} код для ${email}:${draftId}`
//   );

//   // Очищаем истёкшие коды
//   cleanupExpired();

//   console.log(`[OTP Store] Всего кодов в хранилище: ${__otpStore.size}`);
// }

// /**
//  * Получает OTP entry (БЕЗ проверки кода)
//  */
// export function getOTP(
//   method: OTPMethod,
//   email: string,
//   draftId: string
// ): OTPEntry | null {
//   const key = createKey(method, email, draftId);
//   const entry = __otpStore.get(key);

//   if (!entry) {
//     console.log(`[OTP Store] Код не найден для ${email}:${draftId}`);
//     return null;
//   }

//   if (Date.now() > entry.expiresAt) {
//     __otpStore.delete(key);
//     console.log(`[OTP Store] Код истёк для ${email}:${draftId}`);
//     return null;
//   }

//   return entry;
// }

// /**
//  * Проверяет OTP код
//  */
// export function verifyOTP(
//   method: OTPMethod,
//   email: string,
//   draftId: string,
//   code: string
// ): boolean {
//   const entry = getOTP(method, email, draftId);

//   if (!entry) {
//     return false;
//   }

//   if (entry.code !== code) {
//     console.log(`[OTP Store] Неверный код для ${email}:${draftId}`);
//     return false;
//   }

//   console.log(`[OTP Store] ✅ Код подтверждён для ${email}:${draftId}`);
//   return true;
// }

// /**
//  * Устанавливает статус подтверждения
//  */
// export function confirmOTP(
//   method: OTPMethod,
//   email: string,
//   draftId: string,
//   telegramUserId?: number
// ): boolean {
//   const key = createKey(method, email, draftId);
//   const entry = __otpStore.get(key);

//   if (!entry) {
//     console.log(`[OTP Store] Код не найден для подтверждения: ${email}:${draftId}`);
//     return false;
//   }

//   if (Date.now() > entry.expiresAt) {
//     __otpStore.delete(key);
//     console.log(`[OTP Store] Код истёк: ${email}:${draftId}`);
//     return false;
//   }

//   entry.confirmed = true;
//   if (telegramUserId) {
//     entry.telegramUserId = telegramUserId;
//   }

//   __otpStore.set(key, entry);

//   console.log(`[OTP Store] ✅ Установлен статус confirmed для ${email}:${draftId}`);
//   return true;
// }

// /**
//  * Проверяет статус подтверждения (для polling)
//  */
// export function isConfirmed(
//   method: OTPMethod,
//   email: string,
//   draftId: string
// ): boolean {
//   const entry = getOTP(method, email, draftId);

//   if (!entry) {
//     return false;
//   }

//   return entry.confirmed === true;
// }

// /**
//  * Удаляет OTP код
//  */
// export function deleteOTP(
//   method: OTPMethod,
//   email: string,
//   draftId: string
// ): void {
//   const key = createKey(method, email, draftId);
//   __otpStore.delete(key);

//   console.log(`[OTP Store] Удалён код для ${email}:${draftId}`);
// }

// /**
//  * Очищает истёкшие коды
//  */
// function cleanupExpired(): void {
//   const now = Date.now();
//   let deleted = 0;

//   for (const [key, entry] of __otpStore.entries()) {
//     if (now > entry.expiresAt) {
//       __otpStore.delete(key);
//       deleted++;
//     }
//   }

//   if (deleted > 0) {
//     console.log(`[OTP Store] Очищено ${deleted} истёкших кодов`);
//   }
// }

// /**
//  * Debug функция для просмотра состояния
//  */
// export function debugOTPStore(): void {
//   console.log('=== OTP Store Debug ===');
//   console.log('Всего кодов:', __otpStore.size);

//   __otpStore.forEach((entry, key) => {
//     const [method, email, draftId] = key.split(':');
//     const expired = Date.now() > entry.expiresAt;
//     console.log(
//       `${method} | ${email} | ${draftId} | Код: ${entry.code} | ` +
//       `Confirmed: ${entry.confirmed} | Expired: ${expired}`
//     );
//   });
// }


// // src/lib/otp-store.ts

// /**
//  * Расширенное хранилище OTP для email и Telegram верификации
//  * Поддерживает два способа подтверждения для Telegram:
//  * 1. Ввод кода на сайте (как email)
//  * 2. Автоподтверждение через кнопку в боте
//  */

// export type VerificationMethod = 'email' | 'telegram';

// export interface OTPEntry {
//   code: string;
//   expiresAt: number;
//   method: VerificationMethod;
  
//   // Для Telegram: автоподтверждение
//   telegramUserId?: number;
//   telegramChatId?: number;
  
//   // Статус подтверждения (для автоподтверждения)
//   confirmed: boolean;
//   confirmedAt?: number;
// }

// // ✅ Глобальное хранилище OTP (расширенное)
// declare global {
//   // eslint-disable-next-line no-var
//   var __otpStore: Map<string, OTPEntry> | undefined;
// }

// if (!global.__otpStore) {
//   global.__otpStore = new Map<string, OTPEntry>();
// }

// export const otpStore = global.__otpStore;

// /**
//  * Генерирует 6-значный OTP код
//  */
// export function generateOTP(): string {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

// /**
//  * Создаёт ключ для хранилища
//  * 
//  * @example
//  * createOTPKey('email', 'user@example.com', 'draft123') // => 'email:user@example.com:draft123'
//  * createOTPKey('telegram', 'user@example.com', 'draft123') // => 'telegram:user@example.com:draft123'
//  */
// export function createOTPKey(
//   method: VerificationMethod,
//   email: string,
//   draftId: string
// ): string {
//   return `${method}:${email}:${draftId}`;
// }

// /**
//  * Сохраняет OTP код в хранилище
//  */
// export function saveOTP(
//   method: VerificationMethod,
//   email: string,
//   draftId: string,
//   code: string,
//   options?: {
//     telegramUserId?: number;
//     telegramChatId?: number;
//     ttlMinutes?: number;
//   }
// ): void {
//   const key = createOTPKey(method, email, draftId);
//   const ttl = (options?.ttlMinutes || 10) * 60 * 1000; // по умолчанию 10 минут
  
//   const entry: OTPEntry = {
//     code,
//     expiresAt: Date.now() + ttl,
//     method,
//     telegramUserId: options?.telegramUserId,
//     telegramChatId: options?.telegramChatId,
//     confirmed: false,
//   };

//   otpStore.set(key, entry);

//   console.log(`[OTP Store] Сохранён ${method} код для ${email}:${draftId}`);
//   console.log(`[OTP Store] Всего кодов в хранилище: ${otpStore.size}`);
// }

// /**
//  * Получает OTP запись из хранилища
//  */
// export function getOTP(
//   method: VerificationMethod,
//   email: string,
//   draftId: string
// ): OTPEntry | undefined {
//   const key = createOTPKey(method, email, draftId);
//   return otpStore.get(key);
// }

// /**
//  * Проверяет OTP код
//  * 
//  * @returns true если код верный и не истёк, иначе false
//  */
// export function verifyOTP(
//   method: VerificationMethod,
//   email: string,
//   draftId: string,
//   code: string
// ): { valid: boolean; error?: string } {
//   const key = createOTPKey(method, email, draftId);
//   const stored = otpStore.get(key);

//   if (!stored) {
//     return { valid: false, error: 'Код не найден. Запросите новый код' };
//   }

//   if (Date.now() > stored.expiresAt) {
//     otpStore.delete(key);
//     return { valid: false, error: 'Срок действия кода истёк. Запросите новый код' };
//   }

//   if (stored.code !== code) {
//     return { valid: false, error: 'Неверный код' };
//   }

//   return { valid: true };
// }

// /**
//  * Помечает OTP как подтверждённый (для автоподтверждения через Telegram)
//  */
// export function confirmOTP(
//   method: VerificationMethod,
//   email: string,
//   draftId: string
// ): boolean {
//   const key = createOTPKey(method, email, draftId);
//   const stored = otpStore.get(key);

//   if (!stored) {
//     return false;
//   }

//   if (Date.now() > stored.expiresAt) {
//     otpStore.delete(key);
//     return false;
//   }

//   stored.confirmed = true;
//   stored.confirmedAt = Date.now();
//   otpStore.set(key, stored);

//   console.log(`[OTP Store] Код подтверждён для ${key}`);
//   return true;
// }

// /**
//  * Проверяет статус подтверждения (для polling с фронта)
//  */
// export function checkOTPConfirmed(
//   method: VerificationMethod,
//   email: string,
//   draftId: string
// ): { confirmed: boolean; expired: boolean } {
//   const key = createOTPKey(method, email, draftId);
//   const stored = otpStore.get(key);

//   if (!stored) {
//     return { confirmed: false, expired: true };
//   }

//   if (Date.now() > stored.expiresAt) {
//     otpStore.delete(key);
//     return { confirmed: false, expired: true };
//   }

//   return { confirmed: stored.confirmed || false, expired: false };
// }

// /**
//  * Удаляет OTP из хранилища
//  */
// export function deleteOTP(
//   method: VerificationMethod,
//   email: string,
//   draftId: string
// ): void {
//   const key = createOTPKey(method, email, draftId);
//   otpStore.delete(key);
//   console.log(`[OTP Store] Удалён код для ${key}`);
// }

// /**
//  * Очищает истёкшие коды (можно вызывать периодически)
//  */
// export function cleanupExpiredOTPs(): number {
//   const now = Date.now();
//   let deleted = 0;

//   for (const [key, entry] of otpStore.entries()) {
//     if (now > entry.expiresAt) {
//       otpStore.delete(key);
//       deleted++;
//     }
//   }

//   if (deleted > 0) {
//     console.log(`[OTP Store] Очищено ${deleted} истёкших кодов`);
//   }

//   return deleted;
// }

// // Автоматическая очистка каждые 5 минут
// if (typeof setInterval !== 'undefined') {
//   setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
// }
