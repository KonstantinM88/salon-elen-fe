// src/app/api/booking/verify/telegram/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getOTP } from "@/lib/otp-store";

type TelegramStatusResponse =
  | {
      ok: true;
      method: "telegram";
      confirmed: true;
      appointmentId?: string;
      message: string;
    }
  | {
      ok: true;
      method: "telegram";
      confirmed: false;
      pending: true;
      message: string;
    }
  | {
      ok: false;
      method: "telegram";
      expired: true;
      message: string;
    }
  | {
      ok: false;
      method: "telegram";
      error: string;
    };

export async function GET(
  req: NextRequest,
): Promise<NextResponse<TelegramStatusResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const draftId = searchParams.get("draftId");

    if (!email || !draftId) {
      return NextResponse.json(
        {
          ok: false,
          method: "telegram",
          error: "Email и draftId обязательны",
        },
        { status: 400 },
      );
    }

    // Берём запись из OTP Store.
    // Внутри getOTP запись будет удалена, если она истекла.
    const otp = getOTP("telegram", email, draftId);

    if (!otp) {
      // Для фронта важно, что больше ждать смысла нет
      return NextResponse.json(
        {
          ok: false,
          method: "telegram",
          expired: true,
          message: "Код истёк или не найден",
        },
        { status: 200 },
      );
    }

    if (otp.confirmed) {
      // Код уже подтверждён ботом.
      // В callback мы привязываем сюда appointmentId через setAppointmentForOTP,
      // так что можно сразу перейти к оплате.
      const appointmentId =
        (otp as { appointmentId?: string | undefined }).appointmentId;

      return NextResponse.json(
        {
          ok: true,
          method: "telegram",
          confirmed: true,
          appointmentId,
          message: "Запись подтверждена",
        },
        { status: 200 },
      );
    }

    // Ещё не подтверждён — продолжаем polling
    return NextResponse.json(
      {
        ok: true,
        method: "telegram",
        confirmed: false,
        pending: true,
        message: "Ожидание подтверждения",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Telegram Status Error]:", error);

    return NextResponse.json(
      {
        ok: false,
        method: "telegram",
        error: "Ошибка проверки статуса",
      },
      { status: 500 },
    );
  }
}





// // src/app/api/booking/verify/telegram/status/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getOTP } from '@/lib/otp-store';

// type StatusResponse =
//   | {
//       verified: true;
//       method: 'telegram';
//       message: string;
//     }
//   | {
//       verified: false;
//       method: 'telegram';
//       pending: true;
//       message: string;
//     }
//   | {
//       verified: false;
//       method: 'telegram';
//       error: string;
//     };

// /**
//  * GET /api/booking/verify/telegram/status
//  * 
//  * Проверяет статус верификации Telegram
//  * Если draft не найден - проверяет appointment (значит уже подтверждён)
//  */
// export async function GET(req: NextRequest): Promise<NextResponse<StatusResponse>> {
//   try {
//     const { searchParams } = new URL(req.url);
//     const email = searchParams.get('email');
//     const draftId = searchParams.get('draftId');

//     if (!email || !draftId) {
//       return NextResponse.json(
//         {
//           verified: false,
//           method: 'telegram',
//           error: 'Email и draftId обязательны',
//         },
//         { status: 400 }
//       );
//     }

//     // 1. Проверяем существует ли draft
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//       select: { id: true, email: true },
//     });

//     // 2. Если draft не найден - проверяем appointment
//     if (!draft) {
//       console.log(`[Status] Draft не найден, проверяем appointment...`);
      
//       // Ищем appointment с таким email, созданный недавно (последние 5 минут)
//       const recentAppointment = await prisma.appointment.findFirst({
//         where: {
//           email,
//           createdAt: {
//             gte: new Date(Date.now() - 5 * 60 * 1000), // Последние 5 минут
//           },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       if (recentAppointment) {
//         console.log(`[Status] ✅ Appointment найден - запись подтверждена!`);
//         return NextResponse.json({
//           verified: true,
//           method: 'telegram',
//           message: 'Запись успешно подтверждена через Telegram',
//         });
//       }

//       // Если нет ни draft ни appointment - возвращаем ошибку
//       console.log(`[Status] ❌ Ни draft ни appointment не найдены`);
//       return NextResponse.json(
//         {
//           verified: false,
//           method: 'telegram',
//           error: 'Черновик не найден или истёк',
//         },
//         { status: 404 }
//       );
//     }

//     // 3. Draft существует - проверяем email
//     if (draft.email !== email) {
//       return NextResponse.json(
//         {
//           verified: false,
//           method: 'telegram',
//           error: 'Email не совпадает',
//         },
//         { status: 403 }
//       );
//     }

//     // 4. Проверяем OTP статус
//     const otpEntry = getOTP('telegram', email, draftId);

//     if (!otpEntry) {
//       return NextResponse.json({
//         verified: false,
//         method: 'telegram',
//         pending: true,
//         message: 'Ожидание кода подтверждения',
//       });
//     }

//     // 5. Проверяем подтверждён ли
//     if (otpEntry.confirmed) {
//       console.log(`[Status] ✅ OTP подтверждён`);
//       return NextResponse.json({
//         verified: true,
//         method: 'telegram',
//         message: 'Код подтверждён через Telegram',
//       });
//     }

//     // 6. Код создан но не подтверждён
//     return NextResponse.json({
//       verified: false,
//       method: 'telegram',
//       pending: true,
//       message: 'Ожидание подтверждения',
//     });
//   } catch (error) {
//     console.error('[Telegram Status Error]:', error);

//     return NextResponse.json(
//       {
//         verified: false,
//         method: 'telegram',
//         error: 'Ошибка проверки статуса',
//       },
//       { status: 500 }
//     );
//   }
// }