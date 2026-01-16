// src/lib/zadarma-sms.ts
/**
 * Zadarma SMS API integration (OTP/2FA) for Next.js server-side
 *
 * ENV:
 *  - ZADARMA_API_KEY
 *  - ZADARMA_API_SECRET
 *
 * Signature algorithm (per Zadarma PHP example):
 *  paramsStr = http_build_query(params, PHP_QUERY_RFC1738)  // spaces => "+"
 *  signSource = method + paramsStr + md5(paramsStr)
 *  hmacHex = hash_hmac('sha1', signSource, secret)          // default HEX output
 *  signature = base64_encode(hmacHex)                       // base64 of hex-string (!)
 *
 * Header:
 *  Authorization: <api_key>:<signature>
 */

import crypto from 'crypto';

const ZADARMA_API_KEY = process.env.ZADARMA_API_KEY;
const ZADARMA_API_SECRET = process.env.ZADARMA_API_SECRET;

const ZADARMA_API_BASE = 'https://api.zadarma.com';

const METHOD_BALANCE = '/v1/info/balance/';
const METHOD_SMS_SEND = '/v1/sms/send/';

type ZadarmaStatus = 'success' | 'error';

export type SendSmsResult =
  | {
      success: true;
      // Zadarma /v1/sms/send/ in many cases does NOT return sms_id.
      // We'll return first message details if available.
      callerId?: string;
      cost?: number;
      currency?: string;
      parts?: number;
      to?: string;
    }
  | {
      success: false;
      error: string;
      raw?: unknown;
      httpStatus?: number;
    };

interface ZadarmaBalanceResponse {
  status: ZadarmaStatus;
  message?: string;
  balance?: number | string;
  currency?: string;
}

interface ZadarmaSmsSendResponse {
  status: ZadarmaStatus;
  message?: string;

  // Success shape seen in your logs:
  messages?: number;
  cost?: number;
  currency?: string;
  denied_numbers?: string[];

  sms_detalization?: Array<{
    callerid: string;
    number: string;
    cost: number;
    cost_min?: number;
    cost_max?: number;
    message: string;
    parts: number;
  }>;
}

type ZadarmaOk<T> = { ok: true; data: T };
type ZadarmaFail = { ok: false; error: string; raw?: unknown; httpStatus?: number };
type ZadarmaResult<T> = ZadarmaOk<T> | ZadarmaFail;

function getConfig(): { apiKey: string; apiSecret: string } {
  if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
    throw new Error('Zadarma API is not configured: missing ZADARMA_API_KEY or ZADARMA_API_SECRET');
  }
  return { apiKey: ZADARMA_API_KEY, apiSecret: ZADARMA_API_SECRET };
}

/**
 * PHP-compatible urlencode (RFC1738-like):
 * - spaces => "+"
 * - also encode ! ' ( ) * like PHP does
 */
function phpUrlencode(input: string): string {
  return encodeURIComponent(input)
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

/**
 * Build params string exactly like http_build_query(..., PHP_QUERY_RFC1738)
 * - keys sorted
 * - values phpUrlencode
 */
function buildParams(params: Record<string, string>): string {
  const keys = Object.keys(params).sort();
  return keys.map((k) => `${k}=${phpUrlencode(params[k])}`).join('&');
}

function md5Hex(input: string): string {
  return crypto.createHash('md5').update(input, 'utf8').digest('hex');
}

/**
 * IMPORTANT: signature = base64( hex-string of HMAC-SHA1 ), to match PHP:
 * base64_encode(hash_hmac('sha1', ..., secret))
 */
function makeSignature(methodPath: string, paramsString: string, apiSecret: string): string {
  const paramsMd5 = md5Hex(paramsString);
  const signSource = `${methodPath}${paramsString}${paramsMd5}`;

  const hmacHex = crypto.createHmac('sha1', apiSecret).update(signSource, 'utf8').digest('hex');
  return Buffer.from(hmacHex, 'utf8').toString('base64');
}

async function zadarmaRequest<T>(
  methodPath: string,
  httpMethod: 'GET' | 'POST',
  params: Record<string, string> = {}
): Promise<ZadarmaResult<T>> {
  const { apiKey, apiSecret } = getConfig();

  const paramsString = buildParams(params);
  const signature = makeSignature(methodPath, paramsString, apiSecret);

  const url =
    httpMethod === 'GET'
      ? `${ZADARMA_API_BASE}${methodPath}${paramsString ? `?${paramsString}` : ''}`
      : `${ZADARMA_API_BASE}${methodPath}`;

  const headers: Record<string, string> = {
    Authorization: `${apiKey}:${signature}`,
  };

  let body: string | undefined;
  if (httpMethod === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = paramsString;
  }

  const resp = await fetch(url, { method: httpMethod, headers, body });
  const httpStatus = resp.status;

  const text = await resp.text();
  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Invalid JSON response from Zadarma', raw: text, httpStatus };
  }

  if (!resp.ok) {
    const msg =
      typeof json === 'object' &&
      json !== null &&
      'message' in json &&
      typeof (json as { message: unknown }).message === 'string'
        ? (json as { message: string }).message
        : `HTTP ${httpStatus}`;
    return { ok: false, error: msg, raw: json, httpStatus };
  }

  return { ok: true, data: json as T };
}

/**
 * Generate 4-digit PIN
 */
export function generatePinCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Zadarma требует номер: только цифры, без "+"
 */
export function formatPhoneForZadarma(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validation for DE (+49...) and UA (+38/380...)
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const cleaned = formatPhoneForZadarma(phone);

  if (cleaned.length < 10 || cleaned.length > 15) {
    return { valid: false, error: 'Неверная длина номера телефона' };
  }

  const isGerman = cleaned.startsWith('49');
  const isUkrainian = cleaned.startsWith('38');

  if (!isGerman && !isUkrainian) {
    return { valid: false, error: 'Поддерживаются только немецкие (+49) и украинские (+38) номера' };
  }

  if (isGerman && cleaned.length < 11) {
    return { valid: false, error: 'Неверный формат немецкого номера' };
  }

  if (isUkrainian && cleaned.length !== 12) {
    return { valid: false, error: 'Неверный формат украинского номера' };
  }

  return { valid: true };
}

/**
 * Balance check (handy for diagnostics)
 */
export async function getZadarmaBalance(): Promise<
  | { success: true; balance?: number | string; currency?: string }
  | { success: false; error: string; raw?: unknown; httpStatus?: number }
> {
  try {
    const res = await zadarmaRequest<ZadarmaBalanceResponse>(METHOD_BALANCE, 'GET', {});
    if (!res.ok) return { success: false, error: res.error, raw: res.raw, httpStatus: res.httpStatus };

    if (res.data.status === 'success') {
      return { success: true, balance: res.data.balance, currency: res.data.currency };
    }

    return { success: false, error: res.data.message || 'Unknown error from Zadarma', raw: res.data };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to fetch balance' };
  }
}

/**
 * Send OTP PIN via Zadarma
 */
export async function sendPinSms(phoneNumber: string, pin: string): Promise<SendSmsResult> {
  try {
    // Validate config early
    getConfig();

    const to = formatPhoneForZadarma(phoneNumber);

    // Short OTP-friendly text.
    // Keep it short for best deliverability.
    const message = `Ihr Bestaetigungscode: ${pin}. Gueltig 10 Min.`;

    // Optional: add RU fallback (comment out if not needed)
    // const message = `Ihr Bestaetigungscode: ${pin}. Gueltig 10 Min.\nKod: ${pin} (10 min).`;

    // Log without leaking secrets
    console.log(`[Zadarma SMS] Sending PIN to ${to.substring(0, 5)}***`);

    const res = await zadarmaRequest<ZadarmaSmsSendResponse>(METHOD_SMS_SEND, 'POST', {
      number: to,
      message,
    });

    if (!res.ok) {
      console.error('[Zadarma SMS] HTTP/API error:', res.error);
      return { success: false, error: res.error, raw: res.raw, httpStatus: res.httpStatus };
    }

    if (res.data.status !== 'success') {
      console.error('[Zadarma SMS] Error:', res.data.message);
      return { success: false, error: res.data.message || 'Unknown error from Zadarma', raw: res.data };
    }

    const first = res.data.sms_detalization?.[0];

    console.log('[Zadarma SMS] ✅ SMS accepted', {
      callerid: first?.callerid,
      cost: first?.cost ?? res.data.cost,
      currency: res.data.currency,
      parts: first?.parts,
    });

    return {
      success: true,
      callerId: first?.callerid,
      cost: first?.cost ?? res.data.cost,
      currency: res.data.currency,
      parts: first?.parts,
      to: first?.number ?? to,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send SMS';
    console.error('[Zadarma SMS] Error sending SMS:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Send arbitrary SMS (utility)
 */
export async function sendCustomSms(phoneNumber: string, message: string): Promise<SendSmsResult> {
  try {
    getConfig();

    const to = formatPhoneForZadarma(phoneNumber);

    console.log(`[Zadarma SMS] Sending custom SMS to ${to.substring(0, 5)}***`);

    const res = await zadarmaRequest<ZadarmaSmsSendResponse>(METHOD_SMS_SEND, 'POST', {
      number: to,
      message,
    });

    if (!res.ok) {
      return { success: false, error: res.error, raw: res.raw, httpStatus: res.httpStatus };
    }

    if (res.data.status !== 'success') {
      return { success: false, error: res.data.message || 'Unknown error from Zadarma', raw: res.data };
    }

    const first = res.data.sms_detalization?.[0];

    return {
      success: true,
      callerId: first?.callerid,
      cost: first?.cost ?? res.data.cost,
      currency: res.data.currency,
      parts: first?.parts,
      to: first?.number ?? to,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to send SMS';
    return { success: false, error: msg };
  }
}

// Backward compatibility (если где-то осталось старое имя)
export const formatPhoneForInfobip = formatPhoneForZadarma;






// /**
//  * Zadarma SMS API integration (TypeScript, Next.js server-side)
//  *
//  * ENV:
//  *  - ZADARMA_API_KEY
//  *  - ZADARMA_API_SECRET
//  *
//  * Signature (per Zadarma docs):
//  * 1) ksort params
//  * 2) paramsStr = http_build_query(params, ..., PHP_QUERY_RFC1738)  // spaces -> "+"
//  * 3) signSource = method + paramsStr + md5(paramsStr)
//  * 4) hmacHex = HMAC-SHA1(signSource, secret) as HEX string
//  * 5) signature = base64(hmacHex)   <-- IMPORTANT (base64 of hex string), matches PHP example
//  */

// import crypto from 'crypto';

// const ZADARMA_API_KEY = process.env.ZADARMA_API_KEY;
// const ZADARMA_API_SECRET = process.env.ZADARMA_API_SECRET;

// const ZADARMA_API_BASE = 'https://api.zadarma.com';

// type ZadarmaOk<T> = { ok: true; data: T };
// type ZadarmaFail = { ok: false; error: string; raw?: unknown; httpStatus?: number };
// type ZadarmaResult<T> = ZadarmaOk<T> | ZadarmaFail;

// interface ZadarmaBalanceResponse {
//   status: 'success' | 'error';
//   message?: string;
//   balance?: number | string;
//   currency?: string;
// }

// interface ZadarmaSmsSendResponse {
//   status: 'success' | 'error';
//   message?: string;
//   info?: {
//     sms_id: string;
//     cost: number;
//     currency: string;
//   };
// }

// export type SendSmsResult =
//   | { success: true; messageId?: string; cost?: number; currency?: string }
//   | { success: false; error: string; raw?: unknown };

// /**
//  * PHP-compatible urlencode (RFC1738-like): spaces become "+"
//  * + extra encoding like PHP for ! ' ( ) *
//  */
// function phpUrlencode(input: string): string {
//   return encodeURIComponent(input)
//     .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
//     .replace(/%20/g, '+');
// }

// /**
//  * Build query/body string exactly like PHP http_build_query(..., PHP_QUERY_RFC1738)
//  * - keys sorted
//  * - spaces = "+"
//  */
// function buildParams(params: Record<string, string>): string {
//   const keys = Object.keys(params).sort();
//   return keys.map((k) => `${k}=${phpUrlencode(params[k])}`).join('&');
// }

// function getConfig(): { apiKey: string; apiSecret: string } {
//   if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
//     throw new Error('Zadarma API is not configured: missing ZADARMA_API_KEY or ZADARMA_API_SECRET');
//   }
//   return { apiKey: ZADARMA_API_KEY, apiSecret: ZADARMA_API_SECRET };
// }

// function md5Hex(input: string): string {
//   return crypto.createHash('md5').update(input, 'utf8').digest('hex');
// }

// /**
//  * IMPORTANT: Zadarma doc uses:
//  * base64_encode(hash_hmac('sha1', ..., secret))
//  * In PHP hash_hmac() returns HEX string by default => base64(hex-string).
//  * So we must replicate: signature = base64( hmacHexString )
//  */
// function makeSignature(methodPath: string, paramsString: string, apiSecret: string): string {
//   const paramsMd5 = md5Hex(paramsString);
//   const signSource = `${methodPath}${paramsString}${paramsMd5}`;

//   const hmacHex = crypto.createHmac('sha1', apiSecret).update(signSource, 'utf8').digest('hex');
//   return Buffer.from(hmacHex, 'utf8').toString('base64');
// }

// async function zadarmaRequest<T>(
//   methodPath: string,
//   httpMethod: 'GET' | 'POST',
//   params: Record<string, string> = {}
// ): Promise<ZadarmaResult<T>> {
//   const { apiKey, apiSecret } = getConfig();

//   const paramsString = buildParams(params);
//   const signature = makeSignature(methodPath, paramsString, apiSecret);

//   const url =
//     httpMethod === 'GET'
//       ? `${ZADARMA_API_BASE}${methodPath}${paramsString ? `?${paramsString}` : ''}`
//       : `${ZADARMA_API_BASE}${methodPath}`;

//   const headers: Record<string, string> = {
//     Authorization: `${apiKey}:${signature}`,
//   };

//   let body: string | undefined;
//   if (httpMethod === 'POST') {
//     headers['Content-Type'] = 'application/x-www-form-urlencoded';
//     body = paramsString;
//   }

//   const resp = await fetch(url, { method: httpMethod, headers, body });
//   const httpStatus = resp.status;

//   let json: unknown;
//   try {
//     json = await resp.json();
//   } catch {
//     const text = await resp.text().catch(() => '');
//     return { ok: false, error: 'Invalid JSON response from Zadarma', raw: text, httpStatus };
//   }

//   if (!resp.ok) {
//     const msg =
//       typeof json === 'object' &&
//       json !== null &&
//       'message' in json &&
//       typeof (json as { message: unknown }).message === 'string'
//         ? (json as { message: string }).message
//         : `HTTP ${httpStatus}`;
//     return { ok: false, error: msg, raw: json, httpStatus };
//   }

//   return { ok: true, data: json as T };
// }

// /**
//  * Генерирует 4-значный PIN код
//  */
// export function generatePinCode(): string {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// }

// /**
//  * Zadarma требует номер БЕЗ "+", только цифры
//  */
// export function formatPhoneForZadarma(phone: string): string {
//   return phone.replace(/\D/g, '');
// }

// /**
//  * Валидация номера телефона для немецких (+49) и украинских (+38) номеров
//  */
// export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
//   const cleaned = formatPhoneForZadarma(phone);

//   if (cleaned.length < 10 || cleaned.length > 15) {
//     return { valid: false, error: 'Неверная длина номера телефона' };
//   }

//   const isGerman = cleaned.startsWith('49');
//   const isUkrainian = cleaned.startsWith('38');

//   if (!isGerman && !isUkrainian) {
//     return { valid: false, error: 'Поддерживаются только немецкие (+49) и украинские (+38) номера' };
//   }

//   if (isGerman && cleaned.length < 11) {
//     return { valid: false, error: 'Неверный формат немецкого номера' };
//   }

//   if (isUkrainian && cleaned.length !== 12) {
//     return { valid: false, error: 'Неверный формат украинского номера' };
//   }

//   return { valid: true };
// }

// /**
//  * Проверка авторизации: баланс
//  */
// export async function getZadarmaBalance(): Promise<ZadarmaResult<ZadarmaBalanceResponse>> {
//   return zadarmaRequest<ZadarmaBalanceResponse>('/v1/info/balance/', 'GET', {});
// }

// /**
//  * Отправляет SMS с PIN кодом через Zadarma API
//  */
// export async function sendPinSms(phoneNumber: string, pin: string): Promise<SendSmsResult> {
//   try {
//     getConfig();

//     const formattedPhone = formatPhoneForZadarma(phoneNumber);

//     const message =
//       `Ваш PIN код для Salon Elen: ${pin}\n\n` +
//       `Код действителен 10 минут.\n\n` +
//       `Если вы не запрашивали этот код, проигнорируйте сообщение.`;

//     const res = await zadarmaRequest<ZadarmaSmsSendResponse>('/v1/sms/send/', 'POST', {
//       number: formattedPhone,
//       message,
//     });

//     if (!res.ok) return { success: false, error: res.error, raw: res.raw };

//     if (res.data.status === 'success') {
//       return {
//         success: true,
//         messageId: res.data.info?.sms_id,
//         cost: res.data.info?.cost,
//         currency: res.data.info?.currency,
//       };
//     }

//     return { success: false, error: res.data.message || 'Unknown error from Zadarma', raw: res.data };
//   } catch (e: unknown) {
//     return { success: false, error: e instanceof Error ? e.message : 'Failed to send SMS' };
//   }
// }

// export async function sendCustomSms(phoneNumber: string, message: string): Promise<SendSmsResult> {
//   try {
//     getConfig();

//     const formattedPhone = formatPhoneForZadarma(phoneNumber);

//     const res = await zadarmaRequest<ZadarmaSmsSendResponse>('/v1/sms/send/', 'POST', {
//       number: formattedPhone,
//       message,
//     });

//     if (!res.ok) return { success: false, error: res.error, raw: res.raw };

//     if (res.data.status === 'success') {
//       return {
//         success: true,
//         messageId: res.data.info?.sms_id,
//         cost: res.data.info?.cost,
//         currency: res.data.info?.currency,
//       };
//     }

//     return { success: false, error: res.data.message || 'Unknown error from Zadarma', raw: res.data };
//   } catch (e: unknown) {
//     return { success: false, error: e instanceof Error ? e.message : 'Failed to send SMS' };
//   }
// }

// // Back-compat export name
// export const formatPhoneForInfobip = formatPhoneForZadarma;








//--------пробую другой метод
// // src/lib/zadarma-sms.ts
// /**
//  * Zadarma SMS API integration
//  * 
//  * Setup:
//  * 1. Add to .env:
//  *    ZADARMA_API_KEY=your_api_key
//  *    ZADARMA_API_SECRET=your_api_secret
//  * 
//  * Documentation: https://zadarma.com/ru/support/api/#api_sms
//  */

// import crypto from 'crypto';

// const ZADARMA_API_KEY = process.env.ZADARMA_API_KEY;
// const ZADARMA_API_SECRET = process.env.ZADARMA_API_SECRET;
// const ZADARMA_BASE_URL = 'https://api.zadarma.com/v1';

// if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
//   console.warn('[Zadarma SMS] Missing API credentials. SMS will not work.');
// }

// interface ZadarmaSMSResponse {
//   status: string;
//   message?: string;
//   info?: {
//     sms_id: string;
//     cost: number;
//     currency: string;
//   };
// }

// /**
//  * Генерирует подпись для авторизации запроса к Zadarma API
//  * Использует MD5 хеш от конкатенации метода, параметров и секретного ключа
//  */
// function generateSignature(method: string, params: string): string {
//   if (!ZADARMA_API_SECRET) {
//     throw new Error('ZADARMA_API_SECRET is not configured');
//   }

//   // Создаём строку для подписи: метод + параметры + секрет
//   const signString = method + params + ZADARMA_API_SECRET;

//   // Генерируем MD5 хеш
//   return crypto.createHash('md5').update(signString).digest('hex');
// }

// /**
//  * Форматирует параметры для Zadarma API
//  * Сортирует по ключу и применяет URL encoding (совместимый с PHP urlencode)
//  */
// function formatParams(params: Record<string, string>): string {
//   const sortedKeys = Object.keys(params).sort();
//   return sortedKeys
//     .map(key => {
//       // Кодируем значение и заменяем %20 на + (как в PHP urlencode)
//       const encoded = encodeURIComponent(params[key]).replace(/%20/g, '+');
//       return `${key}=${encoded}`;
//     })
//     .join('&');
// }

// /**
//  * Генерирует 4-значный PIN код
//  */
// export function generatePinCode(): string {
//   return Math.floor(1000 + Math.random() * 9000).toString();
// }

// /**
//  * Форматирует номер телефона для Zadarma API
//  * Zadarma требует номер БЕЗ знака "+", только цифры
//  */
// export function formatPhoneForZadarma(phone: string): string {
//   // Удаляем все символы кроме цифр
//   const cleaned = phone.replace(/\D/g, '');
//   return cleaned;
// }

// /**
//  * Валидация номера телефона для немецких и украинских номеров
//  */
// export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
//   const cleaned = phone.replace(/\D/g, '');
  
//   if (cleaned.length < 10 || cleaned.length > 15) {
//     return {
//       valid: false,
//       error: 'Неверная длина номера телефона',
//     };
//   }
  
//   const isGerman = cleaned.startsWith('49');
//   const isUkrainian = cleaned.startsWith('38');
  
//   if (!isGerman && !isUkrainian) {
//     return {
//       valid: false,
//       error: 'Поддерживаются только немецкие (+49) и украинские (+38) номера',
//     };
//   }
  
//   if (isGerman && cleaned.length < 11) {
//     return {
//       valid: false,
//       error: 'Неверный формат немецкого номера',
//     };
//   }
  
//   if (isUkrainian && cleaned.length !== 12) {
//     return {
//       valid: false,
//       error: 'Неверный формат украинского номера',
//     };
//   }
  
//   return { valid: true };
// }

// /**
//  * Отправляет SMS с PIN кодом через Zadarma API
//  */
// export async function sendPinSms(
//   phoneNumber: string,
//   pin: string
// ): Promise<{ success: boolean; error?: string; messageId?: string }> {
//   if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
//     console.error('[Zadarma SMS] API credentials not configured');
//     return { success: false, error: 'Zadarma SMS not configured' };
//   }

//   try {
//     const formattedPhone = formatPhoneForZadarma(phoneNumber);
    
//     console.log(`[Zadarma SMS] Sending PIN to ${formattedPhone.substring(0, 5)}***`);

//     const message = `Ваш PIN код для Salon Elen: ${pin}

// Код действителен 10 минут.

// Если вы не запрашивали этот код, проигнорируйте сообщение.`;

//     // Параметры для API запроса
//     const paramsObj: Record<string, string> = {
//       message: message,
//       number: formattedPhone,
//     };

//     // Форматируем параметры
//     const paramsString = formatParams(paramsObj);

//     console.log('[Zadarma DEBUG] Params (first 50 chars):', paramsString.substring(0, 50) + '...');

//     // Генерируем подпись
//     const method = '/v1/sms/send/';
//     const signature = generateSignature(method, paramsString);

//     console.log('[Zadarma DEBUG] API Key:', ZADARMA_API_KEY?.substring(0, 10) + '***');
//     console.log('[Zadarma DEBUG] Signature:', signature);

//     // Отправляем POST запрос
//     const url = `${ZADARMA_BASE_URL}/sms/send/`;

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Authorization': `${ZADARMA_API_KEY}:${signature}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: paramsString,
//     });

//     const data: ZadarmaSMSResponse = await response.json();

//     console.log('[Zadarma DEBUG] Response:', JSON.stringify(data));

//     if (data.status === 'success') {
//       console.log('[Zadarma SMS] ✅ SMS sent successfully');
//       if (data.info) {
//         console.log('[Zadarma SMS] SMS ID:', data.info.sms_id);
//         console.log('[Zadarma SMS] Cost:', data.info.cost, data.info.currency);
//       }

//       return {
//         success: true,
//         messageId: data.info?.sms_id,
//       };
//     } else {
//       console.error('[Zadarma SMS] Error:', data.message);
//       return {
//         success: false,
//         error: data.message || 'Unknown error from Zadarma',
//       };
//     }
//   } catch (error) {
//     console.error('[Zadarma SMS] Error sending SMS:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to send SMS',
//     };
//   }
// }

// /**
//  * Отправляет произвольное SMS сообщение через Zadarma API
//  */
// export async function sendCustomSms(
//   phoneNumber: string,
//   message: string
// ): Promise<{ success: boolean; error?: string; messageId?: string }> {
//   if (!ZADARMA_API_KEY || !ZADARMA_API_SECRET) {
//     console.error('[Zadarma SMS] API credentials not configured');
//     return { success: false, error: 'Zadarma SMS not configured' };
//   }

//   try {
//     const formattedPhone = formatPhoneForZadarma(phoneNumber);

//     const paramsObj: Record<string, string> = {
//       message: message,
//       number: formattedPhone,
//     };

//     const paramsString = formatParams(paramsObj);

//     const method = '/v1/sms/send/';
//     const signature = generateSignature(method, paramsString);

//     const url = `${ZADARMA_BASE_URL}/sms/send/`;

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Authorization': `${ZADARMA_API_KEY}:${signature}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: paramsString,
//     });

//     const data: ZadarmaSMSResponse = await response.json();

//     if (data.status === 'success') {
//       return {
//         success: true,
//         messageId: data.info?.sms_id,
//       };
//     } else {
//       return {
//         success: false,
//         error: data.message || 'Unknown error from Zadarma',
//       };
//     }
//   } catch (error) {
//     console.error('[Zadarma SMS] Error sending custom SMS:', error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to send SMS',
//     };
//   }
// }

// // Экспорт для обратной совместимости
// export const formatPhoneForInfobip = formatPhoneForZadarma;