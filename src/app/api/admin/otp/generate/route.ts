// src/app/api/admin/otp/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Отправка сообщения в Telegram
 */
async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    console.log(`[Admin OTP] Sending message to chat: ${chatId}`);
    
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('[Admin OTP] Telegram send error:', data);
      return { success: false, error: data.description };
    }
    
    console.log('[Admin OTP] Message sent successfully to Telegram');
    return { success: true, data };
  } catch (error) {
    console.error('[Admin OTP] Telegram send failed:', error);
    return { success: false, error };
  }
}

/**
 * POST - Генерация OTP и отправка в Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, resourceId, resourceType, resourceName } = body;

    if (!action || !resourceId || !resourceType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Генерация 6-значного кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Срок действия - 5 минут
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const adminEmail = session.user.email || session.user.id;

    console.log(`[Admin OTP] Generating code for admin: ${adminEmail}`);

    // Удалить старые неиспользованные коды
    await prisma.adminOTP.deleteMany({
      where: {
        adminEmail,
        verified: false,
        expiresAt: { lt: new Date() },
      },
    });

    // Создать новый OTP
    const otp = await prisma.adminOTP.create({
      data: {
        code,
        action,
        resourceId,
        resourceType,
        adminEmail,
        expiresAt,
        verified: false,
      },
    });

    console.log(`[Admin OTP] Generated code for ${action}: ${code}`);

    // Формируем сообщение для Telegram
    const message = `
🔐 <b>Код подтверждения удаления</b>

⚠️ <b>Действие:</b> ${action === 'permanent_delete' ? 'Окончательное удаление' : action}
📋 <b>Объект:</b> ${resourceType === 'appointment' ? 'Заявка' : 'Клиент'}
${resourceName ? `👤 <b>Имя:</b> ${resourceName}\n` : ''}
🔑 <b>Код:</b> <code>${code}</code>

⏰ <b>Действителен 5 минут</b>

⚠️ После ввода кода объект будет удалён НАВСЕГДА!
    `.trim();

    // Попытка 1: Найти по email в TelegramUser
    let chatId: string | number | null = null;
    let foundMethod = '';

    if (session.user.email) {
      console.log(`[Admin OTP] Searching TelegramUser by email: ${session.user.email}`);
      
      const telegramUser = await prisma.telegramUser.findFirst({
        where: { email: session.user.email },
        select: { telegramChatId: true },
      });

      if (telegramUser) {
        chatId = Number(telegramUser.telegramChatId);
        foundMethod = 'email';
        console.log(`[Admin OTP] Found chat_id by email: ${chatId}`);
      }
    }

    // Попытка 2: Использовать ENV переменную
    if (!chatId && process.env.TELEGRAM_ADMIN_CHAT_ID) {
      chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      foundMethod = 'env';
      console.log(`[Admin OTP] Using TELEGRAM_ADMIN_CHAT_ID from ENV: ${chatId}`);
    }

    // Если chat_id найден - отправить код
    if (chatId) {
      const result = await sendTelegramMessage(chatId, message);
      
      if (result.success) {
        console.log(`[Admin OTP] ✅ Code sent successfully via ${foundMethod}`);
        
        return NextResponse.json({
          success: true,
          otpId: otp.id,
          expiresAt: otp.expiresAt,
          message: 'OTP generated and sent to Telegram',
          sentVia: foundMethod,
        });
      } else {
        console.error(`[Admin OTP] ❌ Failed to send via ${foundMethod}:`, result.error);
        
        // Даже если отправка не удалась, возвращаем успех
        // Код можно посмотреть в логах
        return NextResponse.json({
          success: true,
          otpId: otp.id,
          expiresAt: otp.expiresAt,
          message: 'OTP generated (Telegram send failed)',
          warning: 'Check server logs for code',
          // code: code, // ⚠️ ВРЕМЕННО для отладки - удали в продакшене!
        });
      }
    }

    // Если chat_id не найден
    console.warn(`[Admin OTP] ⚠️ Telegram chat not found for admin: ${adminEmail}`);
    console.warn(`[Admin OTP] ⚠️ Code: ${code} (check logs)`);
    
    return NextResponse.json({
      success: true,
      otpId: otp.id,
      expiresAt: otp.expiresAt,
      message: 'OTP generated (Telegram not configured)',
      warning: 'Admin Telegram account not linked. Check server logs for code.',
      // ⚠️ ВРЕМЕННО для отладки - удали в продакшене!
      code: code,
      hint: 'Link your Telegram account or set TELEGRAM_ADMIN_CHAT_ID in .env.local',
    });

  } catch (error) {
    console.error("[Admin OTP] Error generating OTP:", error);
    return NextResponse.json(
      { error: "Failed to generate OTP" },
      { status: 500 }
    );
  }
}







// // src/app/api/admin/otp/generate/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/auth";

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
// const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// /**
//  * Отправка сообщения в Telegram
//  */
// async function sendTelegramMessage(chatId: string | number, text: string) {
//   try {
//     const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text,
//         parse_mode: 'HTML',
//       }),
//     });
    
//     const data = await response.json();
    
//     if (!data.ok) {
//       console.error('[Admin OTP] Telegram send error:', data);
//       return { success: false, error: data.description };
//     }
    
//     return { success: true, data };
//   } catch (error) {
//     console.error('[Admin OTP] Telegram send failed:', error);
//     return { success: false, error };
//   }
// }

// /**
//  * POST - Генерация OTP и отправка в Telegram
//  */
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user || session.user.role !== "ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();
//     const { action, resourceId, resourceType, resourceName } = body;

//     if (!action || !resourceId || !resourceType) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Генерация 6-значного кода
//     const code = Math.floor(100000 + Math.random() * 900000).toString();

//     // Срок действия - 5 минут
//     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

//     // Удалить старые неиспользованные коды
//     await prisma.adminOTP.deleteMany({
//       where: {
//         adminEmail: session.user.email!,
//         verified: false,
//         expiresAt: { lt: new Date() },
//       },
//     });

//     // Создать новый OTP
//     const otp = await prisma.adminOTP.create({
//       data: {
//         code,
//         action,
//         resourceId,
//         resourceType,
//         adminEmail: session.user.email!,
//         expiresAt,
//         verified: false,
//       },
//     });

//     console.log(`[Admin OTP] Generated code for ${action}: ${code}`);

//     // Найти Telegram chat ID администратора
//     let telegramUser = null;
    
//     // Попробовать найти по email
//     if (session.user.email) {
//       telegramUser = await prisma.telegramUser.findFirst({
//         where: {
//           OR: [
//             { email: session.user.email },
//             // Можно добавить поиск по phone если нужно
//           ],
//         },
//         select: { telegramChatId: true },
//       });
//     }

//     // Если не нашли - попробовать найти админского пользователя
//     if (!telegramUser && process.env.ADMIN_TELEGRAM_CHAT_ID) {
//       // Использовать предустановленный chat ID из .env
//       const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
      
//       const message = `
// 🔐 <b>Код подтверждения удаления</b>

// ⚠️ <b>Действие:</b> ${action === 'permanent_delete' ? 'Окончательное удаление' : action}
// 📋 <b>Объект:</b> ${resourceType === 'appointment' ? 'Заявка' : 'Клиент'}
// ${resourceName ? `👤 <b>Имя:</b> ${resourceName}\n` : ''}
// 🔑 <b>Код:</b> <code>${code}</code>

// ⏰ <b>Действителен 5 минут</b>

// ⚠️ После ввода кода объект будет удалён НАВСЕГДА!
//       `.trim();

//       const result = await sendTelegramMessage(chatId, message);
      
//       if (!result.success) {
//         console.error('[Admin OTP] Failed to send to Telegram:', result.error);
//       }

//       return NextResponse.json({
//         success: true,
//         otpId: otp.id,
//         expiresAt: otp.expiresAt,
//         message: 'OTP generated and sent to Telegram',
//       });
//     }

//     if (!telegramUser) {
//       console.warn('[Admin OTP] Telegram chat not found for admin:', session.user.email);
      
//       // Всё равно возвращаем успех, но без отправки в Telegram
//       return NextResponse.json({
//         success: true,
//         otpId: otp.id,
//         expiresAt: otp.expiresAt,
//         message: 'OTP generated (Telegram not configured)',
//         warning: 'Admin Telegram account not linked',
//       });
//     }

//     // Отправить код в Telegram
//     const chatId = Number(telegramUser.telegramChatId);
    
//     const message = `
// 🔐 <b>Код подтверждения удаления</b>

// ⚠️ <b>Действие:</b> ${action === 'permanent_delete' ? 'Окончательное удаление' : action}
// 📋 <b>Объект:</b> ${resourceType === 'appointment' ? 'Заявка' : 'Клиент'}
// ${resourceName ? `👤 <b>Имя:</b> ${resourceName}\n` : ''}
// 🔑 <b>Код:</b> <code>${code}</code>

// ⏰ <b>Действителен 5 минут</b>

// ⚠️ После ввода кода объект будет удалён НАВСЕГДА!
//     `.trim();

//     const result = await sendTelegramMessage(chatId, message);
    
//     if (!result.success) {
//       console.error('[Admin OTP] Failed to send to Telegram:', result.error);
//     }

//     return NextResponse.json({
//       success: true,
//       otpId: otp.id,
//       expiresAt: otp.expiresAt,
//       message: 'OTP generated and sent to Telegram',
//     });

//   } catch (error) {
//     console.error("[Admin OTP] Error generating OTP:", error);
//     return NextResponse.json(
//       { error: "Failed to generate OTP" },
//       { status: 500 }
//     );
//   }
// }