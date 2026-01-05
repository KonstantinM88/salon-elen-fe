// src/app/api/booking/verify/google/callback/route.ts

/**
 * GET /api/booking/verify/google/callback
 *
 * Обрабатывает callback от Google OAuth
 * - Проверяет state токен (CSRF защита)
 * - Обменивает code на access token
 * - Получает user info от Google
 * - Сохраняет GoogleUser в БД
 * - Создаёт Appointment
 * - Помечает верификацию как завершённую
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleOAuth } from "@/lib/google-oauth";

/**
 * GET handler
 *
 * Query params:
 * - code: authorization code от Google
 * - state: CSRF токен
 * - error: (опционально) если пользователь отклонил доступ
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    console.log("[Google Callback] Received callback");
    console.log("[Google Callback] Code:", code ? "present" : "missing");
    console.log("[Google Callback] State:", state);
    console.log("[Google Callback] Error:", error);

    // Если пользователь отклонил доступ
    if (error) {
      console.error("[Google Callback] User denied access:", error);
      return redirectToVerifyPage(null, null, "Доступ отклонён");
    }

    // Валидация параметров
    if (!code || !state) {
      console.error("[Google Callback] Missing code or state");
      return redirectToVerifyPage(null, null, "Некорректные параметры");
    }

    // Проверяем state токен в БД
    const verificationRequest = await prisma.googleVerificationRequest.findUnique(
      {
        where: { state },
        select: {
          id: true,
          email: true,
          draftId: true,
          expiresAt: true,
          verified: true,
        },
      }
    );

    if (!verificationRequest) {
      console.error("[Google Callback] State not found in DB");
      return redirectToVerifyPage(null, null, "Неверный токен верификации");
    }

    // Проверяем, что запрос не истёк
    if (verificationRequest.expiresAt < new Date()) {
      console.error("[Google Callback] Request expired");
      await prisma.googleVerificationRequest.delete({
        where: { state },
      });
      return redirectToVerifyPage(
        null,
        null,
        "Запрос истёк, попробуйте снова"
      );
    }

    // Проверяем, что не был уже использован
    if (verificationRequest.verified) {
      console.error("[Google Callback] Already verified");
      return redirectToVerifyPage(
        verificationRequest.email,
        verificationRequest.draftId,
        "Уже подтверждено"
      );
    }

    console.log("[Google Callback] Exchanging code for token...");

    // Обмениваем code на токен и получаем user info
    const userInfo = await GoogleOAuth.completeOAuthFlow(code);

    console.log("[Google Callback] Received user info:", {
      email: userInfo.email,
      name: userInfo.name,
      verified: (userInfo as unknown as { verified_email?: boolean })
        .verified_email,
    });

    // Базовая проверка email
    if (!userInfo.email) {
      console.error("[Google Callback] Email not provided by Google");
      return redirectToVerifyPage(
        verificationRequest.email,
        verificationRequest.draftId,
        "Google не вернул e-mail"
      );
    }

    const normalizedEmail = userInfo.email.toLowerCase();

    // Проверяем, что email совпадает
    if (normalizedEmail !== verificationRequest.email.toLowerCase()) {
      console.error("[Google Callback] Email mismatch");
      console.error("[Google Callback] Expected:", verificationRequest.email);
      console.error("[Google Callback] Got:", normalizedEmail);
      return redirectToVerifyPage(
        verificationRequest.email,
        verificationRequest.draftId,
        "Email не совпадает с email бронирования"
      );
    }

    // Надёжно вычисляем Google ID с fallback (sub || id || email-бэкап)
    const googleId =
      (userInfo.sub as string | undefined) ||
      (userInfo.id as string | undefined) ||
      `email-${normalizedEmail}`;

    const firstName =
      (userInfo.given_name as string | undefined) ?? null;
    const lastName =
      (userInfo.family_name as string | undefined) ?? null;
    const picture =
      (userInfo.picture as string | undefined) ?? null;

    // Сохраняем или обновляем GoogleUser в БД
    await prisma.googleUser.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        googleId, // ✅ обязательно, без undefined
        firstName,
        lastName,
        picture,
      },
      update: {
        googleId,
        firstName,
        lastName,
        picture,
      },
    });

    console.log("[Google Callback] GoogleUser saved/updated");

    // Получаем draft
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: verificationRequest.draftId },
      select: {
        id: true,
        serviceId: true,
        masterId: true,
        startAt: true,
        endAt: true,
        customerName: true,
        phone: true,
        email: true,
        birthDate: true,
        referral: true,
        notes: true,
      },
    });

    if (!draft) {
      console.error("[Google Callback] Draft not found");
      return redirectToVerifyPage(
        verificationRequest.email,
        verificationRequest.draftId,
        "Черновик бронирования не найден"
      );
    }

    const conflictError = "SLOT_TAKEN";

    try {
      const appointment = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${draft.masterId} FOR UPDATE`;

        const conflicting = await tx.appointment.findFirst({
          where: {
            masterId: draft.masterId,
            status: { not: "CANCELED" },
            startAt: { lt: draft.endAt },
            endAt: { gt: draft.startAt },
          },
          select: { id: true },
        });

        if (conflicting) {
          throw new Error(conflictError);
        }

        const created = await tx.appointment.create({
          data: {
            serviceId: draft.serviceId,
            masterId: draft.masterId,
            startAt: draft.startAt,
            endAt: draft.endAt,
            customerName: draft.customerName,
            phone: draft.phone,
            email: draft.email,
            birthDate: draft.birthDate,
            referral: draft.referral,
            notes: draft.notes,
            status: "PENDING",
          },
        });

        await tx.bookingDraft.delete({
          where: { id: draft.id },
        });

        await tx.googleVerificationRequest.update({
          where: { state },
          data: {
            verified: true,
            appointmentId: created.id,
          },
        });

        return created;
      });

      console.log("[Google Callback] Appointment created:", appointment.id);
      console.log("[Google Callback] Draft deleted");

      console.log("[Google Callback] Verification marked as complete");
      console.log("[Google Callback] ✅ SUCCESS! Appointment:", appointment.id);

      // Редиректим обратно на страницу верификации с успехом
      return redirectToVerifyPage(draft.email, draft.id, null, appointment.id);
    } catch (error) {
      if (error instanceof Error && error.message === conflictError) {
        return redirectToVerifyPage(
          verificationRequest.email,
          verificationRequest.draftId,
          "Выбранное время уже занято"
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[Google Callback] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Ошибка обработки callback";

    // Пытаемся получить параметры для редиректа
    const searchParams = req.nextUrl.searchParams;
    const state = searchParams.get("state");

    let email: string | null = null;
    let draftId: string | null = null;

    if (state) {
      try {
        const verificationRequest =
          await prisma.googleVerificationRequest.findUnique({
            where: { state },
            select: { email: true, draftId: true },
          });

        if (verificationRequest) {
          email = verificationRequest.email;
          draftId = verificationRequest.draftId;
        }
      } catch (e) {
        console.error(
          "[Google Callback] Error fetching verification request:",
          e
        );
      }
    }

    return redirectToVerifyPage(email, draftId, errorMessage);
  }
}

/**
 * Вспомогательная функция для редиректа обратно на страницу верификации
 */
function redirectToVerifyPage(
  email: string | null,
  draftId: string | null,
  error: string | null,
  appointmentId?: string
): NextResponse {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const params = new URLSearchParams();

  if (email) params.append("email", email);
  if (draftId) params.append("draft", draftId);
  if (error) params.append("error", error);
  if (appointmentId) params.append("success", appointmentId);

  const redirectUrl = `${baseUrl}/booking/verify?${params.toString()}`;

  console.log("[Google Callback] Redirecting to:", redirectUrl);

  return NextResponse.redirect(redirectUrl);
}




//-----------работает но только с формой где только гугл и редактирование-------
// // src/app/api/booking/verify/google/callback/route.ts
// /**
//  * GET /api/booking/verify/google/callback
//  * 
//  * Обрабатывает callback от Google OAuth
//  * - Проверяет state токен (CSRF защита)
//  * - Обменивает code на access token
//  * - Получает user info от Google
//  * - Сохраняет GoogleUser в БД
//  * - Создаёт Appointment
//  * - Помечает верификацию как завершённую
//  */

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { GoogleOAuth } from '@/lib/google-oauth';

// /**
//  * GET handler
//  * 
//  * Query params:
//  * - code: authorization code от Google
//  * - state: CSRF токен
//  * - error: (опционально) если пользователь отклонил доступ
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const searchParams = req.nextUrl.searchParams;
//     const code = searchParams.get('code');
//     const state = searchParams.get('state');
//     const error = searchParams.get('error');

//     console.log('[Google Callback] Received callback');
//     console.log('[Google Callback] Code:', code ? 'present' : 'missing');
//     console.log('[Google Callback] State:', state);
//     console.log('[Google Callback] Error:', error);

//     // Если пользователь отклонил доступ
//     if (error) {
//       console.error('[Google Callback] User denied access:', error);
//       return redirectToVerifyPage(null, null, 'Доступ отклонён');
//     }

//     // Валидация параметров
//     if (!code || !state) {
//       console.error('[Google Callback] Missing code or state');
//       return redirectToVerifyPage(null, null, 'Некорректные параметры');
//     }

//     // Проверяем state токен в БД
//     const verificationRequest = await prisma.googleVerificationRequest.findUnique({
//       where: { state },
//       select: {
//         id: true,
//         email: true,
//         draftId: true,
//         expiresAt: true,
//         verified: true,
//       },
//     });

//     if (!verificationRequest) {
//       console.error('[Google Callback] State not found in DB');
//       return redirectToVerifyPage(null, null, 'Неверный токен верификации');
//     }

//     // Проверяем, что запрос не истёк
//     if (verificationRequest.expiresAt < new Date()) {
//       console.error('[Google Callback] Request expired');
//       await prisma.googleVerificationRequest.delete({
//         where: { state },
//       });
//       return redirectToVerifyPage(null, null, 'Запрос истёк, попробуйте снова');
//     }

//     // Проверяем, что не был уже использован
//     if (verificationRequest.verified) {
//       console.error('[Google Callback] Already verified');
//       return redirectToVerifyPage(
//         verificationRequest.email,
//         verificationRequest.draftId,
//         'Уже подтверждено'
//       );
//     }

//     console.log('[Google Callback] Exchanging code for token...');

//     // Обмениваем code на токен и получаем user info
//     const userInfo = await GoogleOAuth.completeOAuthFlow(code);

//     console.log('[Google Callback] Received user info:', {
//       email: userInfo.email,
//       name: userInfo.name,
//       verified: userInfo.verified_email,
//     });

//     // Проверяем, что email совпадает
//     if (userInfo.email.toLowerCase() !== verificationRequest.email.toLowerCase()) {
//       console.error('[Google Callback] Email mismatch');
//       console.error('[Google Callback] Expected:', verificationRequest.email);
//       console.error('[Google Callback] Got:', userInfo.email);
//       return redirectToVerifyPage(
//         verificationRequest.email,
//         verificationRequest.draftId,
//         'Email не совпадает с email бронирования'
//       );
//     }

//     // Сохраняем или обновляем GoogleUser в БД
//     await prisma.googleUser.upsert({
//       where: { email: userInfo.email.toLowerCase() },
//       create: {
//         email: userInfo.email.toLowerCase(),
//         googleId: userInfo.sub,
//         firstName: userInfo.given_name || null,
//         lastName: userInfo.family_name || null,
//         picture: userInfo.picture || null,
//       },
//       update: {
//         googleId: userInfo.id,
//         firstName: userInfo.given_name || null,
//         lastName: userInfo.family_name || null,
//         picture: userInfo.picture || null,
//       },
//     });

//     console.log('[Google Callback] GoogleUser saved/updated');

//     // Получаем draft
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: verificationRequest.draftId },
//       select: {
//         id: true,
//         serviceId: true,
//         masterId: true,
//         startAt: true,
//         endAt: true,
//         customerName: true,
//         phone: true,
//         email: true,
//         birthDate: true,
//         referral: true,
//         notes: true,
//       },
//     });

//     if (!draft) {
//       console.error('[Google Callback] Draft not found');
//       return redirectToVerifyPage(
//         verificationRequest.email,
//         verificationRequest.draftId,
//         'Черновик бронирования не найден'
//       );
//     }

//     // Создаём Appointment
//     const appointment = await prisma.appointment.create({
//       data: {
//         serviceId: draft.serviceId,
//         masterId: draft.masterId,
//         startAt: draft.startAt,
//         endAt: draft.endAt,
//         customerName: draft.customerName,
//         phone: draft.phone,
//         email: draft.email,
//         birthDate: draft.birthDate,
//         referral: draft.referral,
//         notes: draft.notes,
//         status: 'PENDING',
//       },
//     });

//     console.log('[Google Callback] Appointment created:', appointment.id);

//     // Удаляем draft
//     await prisma.bookingDraft.delete({
//       where: { id: draft.id },
//     });

//     console.log('[Google Callback] Draft deleted');

//     // Помечаем верификацию как завершённую
//     await prisma.googleVerificationRequest.update({
//       where: { state },
//       data: {
//         verified: true,
//         appointmentId: appointment.id,
//       },
//     });

//     console.log('[Google Callback] Verification marked as complete');
//     console.log('[Google Callback] ✅ SUCCESS! Appointment:', appointment.id);

//     // Редиректим обратно на страницу верификации с успехом
//     return redirectToVerifyPage(
//       draft.email,
//       draft.id,
//       null,
//       appointment.id
//     );
//   } catch (error) {
//     console.error('[Google Callback] Error:', error);

//     const errorMessage =
//       error instanceof Error ? error.message : 'Ошибка обработки callback';

//     // Пытаемся получить параметры для редиректа
//     const searchParams = req.nextUrl.searchParams;
//     const state = searchParams.get('state');

//     let email: string | null = null;
//     let draftId: string | null = null;

//     if (state) {
//       try {
//         const verificationRequest = await prisma.googleVerificationRequest.findUnique({
//           where: { state },
//           select: { email: true, draftId: true },
//         });

//         if (verificationRequest) {
//           email = verificationRequest.email;
//           draftId = verificationRequest.draftId;
//         }
//       } catch (e) {
//         console.error('[Google Callback] Error fetching verification request:', e);
//       }
//     }

//     return redirectToVerifyPage(email, draftId, errorMessage);
//   }
// }

// /**
//  * Вспомогательная функция для редиректа обратно на страницу верификации
//  */
// function redirectToVerifyPage(
//   email: string | null,
//   draftId: string | null,
//   error: string | null,
//   appointmentId?: string
// ): NextResponse {
//   const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
//   const params = new URLSearchParams();

//   if (email) params.append('email', email);
//   if (draftId) params.append('draft', draftId);
//   if (error) params.append('error', error);
//   if (appointmentId) params.append('success', appointmentId);

//   const redirectUrl = `${baseUrl}/booking/verify?${params.toString()}`;

//   console.log('[Google Callback] Redirecting to:', redirectUrl);

//   return NextResponse.redirect(redirectUrl);
// }
