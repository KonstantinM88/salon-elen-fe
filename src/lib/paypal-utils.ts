// src/lib/paypal-utils.ts
// ✅ Утилиты для работы с PayPal API

/**
 * Получает access token от PayPal для API запросов
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal credentials not configured. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env'
    );
  }

  // Кодируем credentials в Base64
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal auth error:', error);
      throw new Error(`Failed to get PayPal access token: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

/**
 * Возвращает базовый URL для PayPal API
 */
export function getPayPalApiUrl(): string {
  return process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
}

/**
 * Проверяет, настроены ли PayPal credentials
 */
export function isPayPalConfigured(): boolean {
  return !!(
    process.env.PAYPAL_CLIENT_ID &&
    process.env.PAYPAL_CLIENT_SECRET &&
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  );
}





// // src/lib/paypal-utils.ts
// // Утилиты для работы с PayPal API

// const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

// /**
//  * Получение access token для PayPal API
//  */
// export async function getPayPalAccessToken(): Promise<string> {
//   const auth = Buffer.from(
//     `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
//   ).toString('base64');

//   const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'Authorization': `Basic ${auth}`,
//     },
//     body: 'grant_type=client_credentials',
//   });

//   if (!response.ok) {
//     throw new Error('Failed to get PayPal access token');
//   }

//   const data = await response.json();
//   return data.access_token;
// }

// /**
//  * Получение URL для PayPal API
//  */
// export function getPayPalApiUrl(): string {
//   return PAYPAL_API;
// }