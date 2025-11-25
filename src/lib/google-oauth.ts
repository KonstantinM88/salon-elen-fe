// src/lib/google-oauth.ts
/**
 * Google OAuth утилиты для верификации бронирований
 * 
 * Этот модуль предоставляет функции для:
 * - Генерации OAuth URL для авторизации
 * - Обмена authorization code на access token
 * - Получения информации о пользователе от Google
 */

import crypto from 'crypto';

// ───────── Типы ─────────

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
  id_token?: string;
};

export type GoogleUserInfo = {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
};

// ───────── Константы ─────────

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// OAuth scopes
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// ───────── Вспомогательные функции ─────────

/**
 * Генерирует случайный state токен для CSRF защиты
 */
export function generateStateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Получает базовый URL приложения
 */

// function getBaseUrl(): string {
//   // В продакшене используем NEXT_PUBLIC_BASE_URL
//   if (process.env.NEXT_PUBLIC_BASE_URL) {
//     return process.env.NEXT_PUBLIC_BASE_URL;
//   }
  
//   // В разработке используем localhost
//   if (process.env.NODE_ENV === 'development') {
//     return 'http://localhost:3000';
//   }
  
//   // Fallback
//   return 'http://localhost:3000';
// }
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  throw new Error("NEXT_PUBLIC_BASE_URL is not set in production");
}




/**
 * Получает redirect URI для OAuth callback
 */
export function getRedirectUri(): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/booking/verify/google/callback`;
}

// ───────── Основные функции ─────────

/**
 * Генерирует URL для авторизации через Google
 * 
 * @param state - CSRF токен для проверки в callback
 * @returns URL для редиректа на страницу авторизации Google
 * 
 * @example
 * const state = generateStateToken();
 * const authUrl = generateAuthUrl(state);
 * // Redirect пользователя на authUrl
 */
export function generateAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID не настроен в .env');
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: SCOPES.join(' '),
    state: state,
    access_type: 'online',
    prompt: 'select_account', // Всегда показывать выбор аккаунта
  });
  
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
}

/**
 * Обменивает authorization code на access token
 * 
 * @param code - Authorization code из callback URL
 * @returns Google token response с access_token
 * 
 * @throws Error если обмен не удался
 * 
 * @example
 * const tokenData = await exchangeCodeForToken(code);
 * const accessToken = tokenData.access_token;
 */
export async function exchangeCodeForToken(
  code: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials не настроены в .env');
  }
  
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getRedirectUri(),
    grant_type: 'authorization_code',
  });
  
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as GoogleTokenResponse;
    return data;
  } catch (error) {
    console.error('[Google OAuth] Token exchange error:', error);
    throw new Error('Не удалось обменять код на токен');
  }
}

/**
 * Получает информацию о пользователе от Google
 * 
 * @param accessToken - Access token из Google
 * @returns Информация о пользователе (email, имя, аватар)
 * 
 * @throws Error если запрос не удался
 * 
 * @example
 * const userInfo = await getUserInfo(accessToken);
 * console.log(userInfo.email, userInfo.name);
 */
export async function getUserInfo(
  accessToken: string
): Promise<GoogleUserInfo> {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`UserInfo fetch failed: ${response.status} ${errorText}`);
    }
    
    const data = await response.json() as GoogleUserInfo;
    
    // Проверяем, что email подтверждён
    if (!data.verified_email) {
      throw new Error('Email не подтверждён в Google аккаунте');
    }
    
    return data;
  } catch (error) {
    console.error('[Google OAuth] UserInfo fetch error:', error);
    throw new Error('Не удалось получить информацию о пользователе');
  }
}

/**
 * Полный OAuth flow: обмен кода на токен + получение user info
 * 
 * @param code - Authorization code из callback URL
 * @returns Информация о пользователе
 * 
 * @example
 * const userInfo = await completeOAuthFlow(code);
 * // Теперь можно сохранить userInfo в БД
 */
export async function completeOAuthFlow(
  code: string
): Promise<GoogleUserInfo> {
  // 1. Обмениваем код на токен
  const tokenData = await exchangeCodeForToken(code);
  
  // 2. Получаем информацию о пользователе
  const userInfo = await getUserInfo(tokenData.access_token);
  
  return userInfo;
}

// ───────── Валидация ─────────

/**
 * Проверяет, что все необходимые env переменные настроены
 * 
 * @throws Error если не все переменные настроены
 */
export function validateGoogleOAuthConfig(): void {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Google OAuth не настроен. Отсутствуют переменные: ${missing.join(', ')}`
    );
  }
}

// ───────── Экспорт всего ─────────

export const GoogleOAuth = {
  generateStateToken,
  generateAuthUrl,
  exchangeCodeForToken,
  getUserInfo,
  completeOAuthFlow,
  validateGoogleOAuthConfig,
  getRedirectUri,
};