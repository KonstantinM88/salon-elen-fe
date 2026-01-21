// src/app/api/booking/client/google-quick/callback/route.ts
// ✅ ИСПРАВЛЕНО: Правильное формирование redirect URL
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, getUserInfo } from "@/lib/google-oauth";

/**
 * GET /api/booking/client/google-quick/callback
 * 
 * Обрабатывает OAuth callback от Google для быстрой регистрации.
 * ✅ ИСПРАВЛЕНО: После авторизации редиректим на страницу запроса телефона
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("[Google Quick Reg Callback] Received callback");
    console.log("[Google Quick Reg Callback] Code:", code ? "present" : "missing");
    console.log("[Google Quick Reg Callback] State:", state);
    console.log("[Google Quick Reg Callback] Error:", error);

    // Проверка на ошибку OAuth
    if (error) {
      console.error("[Google Quick Reg Callback] OAuth error:", error);
      
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>body { display: none; }</style>
</head>
<body>
  <script>
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/booking/client?error=${encodeURIComponent("Authorization cancelled")}';
    }
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: { 
            "Content-Type": "text/html; charset=UTF-8"
          },
        }
      );
    }

    // Проверка наличия code и state
    if (!code || !state) {
      console.error("[Google Quick Reg Callback] Missing code or state");
      
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>body { display: none; }</style>
</head>
<body>
  <script>
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/booking/client?error=${encodeURIComponent("Invalid OAuth parameters")}';
    }
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: { 
            "Content-Type": "text/html; charset=UTF-8"
          },
        }
      );
    }

    // Поиск запроса по state
    const quickReg = await prisma.googleQuickRegistration.findFirst({
      where: {
        state,
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!quickReg) {
      console.error("[Google Quick Reg Callback] Request not found or expired");
      
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>body { display: none; }</style>
</head>
<body>
  <script>
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/booking/client?error=${encodeURIComponent("Request not found or expired")}';
    }
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: { 
            "Content-Type": "text/html; charset=UTF-8"
          },
        }
      );
    }

    console.log("[Google Quick Reg Callback] Found registration request:", quickReg.id);

    // Обмен code на токен
    console.log("[Google Quick Reg Callback] Exchanging code for token...");
    const tokenData = await exchangeCodeForToken(code, "quick");

    // Получение информации о пользователе
    const userInfo = await getUserInfo(tokenData.access_token);

    console.log("[Google Quick Reg Callback] Received user info:", {
      email: userInfo.email,
      name: userInfo.name,
      verified: userInfo.email_verified,
    });

    // Проверка email
    if (!userInfo.email) {
      throw new Error("Email not provided by Google");
    }

    // Логируем статус верификации
    console.log('[Google Quick Reg Callback] Email verification status:', userInfo.email_verified);

    // Получаем Google ID с fallback
    const googleId = userInfo.sub || userInfo.id || `email-${userInfo.email}`;
    console.log('[Google Quick Reg Callback] Google ID:', googleId);

    // Сохранение/обновление GoogleUser
    const googleUser = await prisma.googleUser.upsert({
      where: { email: userInfo.email },
      create: {
        email: userInfo.email,
        googleId: googleId,
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        picture: userInfo.picture || null,
      },
      update: {
        googleId: googleId,
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        picture: userInfo.picture || null,
        updatedAt: new Date(),
      },
    });

    console.log("[Google Quick Reg Callback] GoogleUser saved/updated");

    // ✅ НОВОЕ: Обновляем GoogleQuickRegistration с данными пользователя
    // НО НЕ создаём appointment - это сделаем после получения телефона
    await prisma.googleQuickRegistration.update({
      where: { id: quickReg.id },
      data: {
        email: userInfo.email,
        customerName: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
        // verified остаётся false до завершения регистрации
      },
    });

    console.log("[Google Quick Reg Callback] Updated registration with user data");
    console.log("[Google Quick Reg Callback] ✅ Redirecting to phone input page");

    // ✅ ИСПРАВЛЕНО: Правильное формирование базового URL
    const getBaseUrl = () => {
      // 1. Приоритет: переменная окружения
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
      }
      
      // 2. Получаем из headers (для production за proxy/CDN)
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
      
      if (host) {
        return `${protocol}://${host}`;
      }
      
      // 3. Fallback на домен production
      return 'https://permanent-halle.de';
    };

    const baseUrl = getBaseUrl();
    console.log('[Google Quick Reg Callback] Using base URL:', baseUrl);
    
    const redirectUrl = new URL('/booking/phone', baseUrl);
    redirectUrl.searchParams.set('registrationId', quickReg.id);
    
    console.log('[Google Quick Reg Callback] Final redirect URL:', redirectUrl.toString());
    
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Success</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #0A0A0A 0%, #1A1A2E 50%, #0F0F1E 100%);
      color: #D4AF37;
      overflow: hidden;
    }
    .container {
      text-align: center;
      opacity: 1;
      transition: opacity 0.3s ease-out;
    }
    .container.hidden {
      opacity: 0;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      box-shadow: 0 10px 40px rgba(212, 175, 55, 0.3);
      animation: scaleIn 0.5s ease-out;
    }
    @keyframes scaleIn {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    h2 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    p {
      font-size: 16px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✓</div>
    <h2>Success!</h2>
    <p>Loading...</p>
  </div>
  <script>
    console.log('[Google OAuth] Redirecting to:', '${redirectUrl.toString()}');
    
    // Автоматический редирект через 1 секунду
    setTimeout(() => {
      const redirectUrl = '${redirectUrl.toString()}';

      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = redirectUrl;
          window.opener.focus();
          window.close();
          return;
        } catch (e) {
          console.warn('[Google OAuth] opener redirect failed, fallback to self:', e);
        }
      }

      window.location.href = redirectUrl;
    }, 1000);
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=UTF-8"
        },
      }
    );
  } catch (error) {
    console.error("[Google Quick Reg Callback] Error:", error);
    
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>body { display: none; }</style>
</head>
<body>
  <script>
    if (window.opener) {
      window.close();
    } else {
      window.location.href = '/booking/client?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Authorization error"
      )}';
    }
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=UTF-8"
        },
      }
    );
  }
}