//---------пробуем работу с SMS через Zadarma-------
// src/app/api/booking/client/sms-phone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generatePinCode,
  sendPinSms,
  formatPhoneForZadarma,
  validatePhoneNumber,
} from '@/lib/zadarma-sms';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const PIN_TTL_SECONDS = 10 * 60; // 10 минут
const REG_TTL_MINUTES = 30; // 30 минут
const RESEND_COOLDOWN_SECONDS = 60; // защита от частых отправок

function secondsLeft(now: Date, lastSentAt: Date, cooldownSeconds: number): number {
  const diffMs = now.getTime() - lastSentAt.getTime();
  const left = cooldownSeconds - Math.floor(diffMs / 1000);
  return left > 0 ? left : 0;
}

/**
 * POST /api/booking/client/sms-phone
 *
 * Инициализация регистрации через SMS:
 * - если есть активная запись по этому номеру и этим параметрам — переиспользуем
 * - если отправляли недавно — 429 + cooldownSeconds
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, masterId, startAt, endAt, phone } = body as {
      serviceId?: string;
      masterId?: string;
      startAt?: string;
      endAt?: string;
      phone?: string;
    };

    console.log('[SMS Phone Reg] Initiating registration:', {
      serviceId,
      masterId,
      phone: phone?.substring(0, 5) + '***',
    });

    if (!serviceId || !masterId || !startAt || !endAt || !phone) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
    }

    // формат + валидация номера
    const formattedPhone = formatPhoneForZadarma(phone);
    const phoneValidation = validatePhoneNumber(formattedPhone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { ok: false, error: phoneValidation.error || 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Проверка service и master
    const [service, master] = await Promise.all([
      prisma.service.findFirst({
        where: { id: serviceId, isActive: true, isArchived: false },
      }),
      prisma.master.findUnique({ where: { id: masterId } }),
    ]);

    if (!service) {
      return NextResponse.json({ ok: false, error: 'Service not found or inactive' }, { status: 404 });
    }
    if (!master) {
      return NextResponse.json({ ok: false, error: 'Master not found' }, { status: 404 });
    }

    const now = new Date();

    // Чистим только явно истёкшие записи (как было)
    await prisma.smsPhoneRegistration.deleteMany({
      where: {
        phone: formattedPhone,
        verified: false,
        expiresAt: { lt: now },
      },
    });

    // Ищем активную регистрацию под этот слот (важно: чтобы не пересекалось с другими бронированиями)
    const existing = await prisma.smsPhoneRegistration.findFirst({
      where: {
        phone: formattedPhone,
        verified: false,
        expiresAt: { gt: now },
        serviceId,
        masterId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Если есть — проверяем cooldown и переиспользуем
    if (existing) {
      // lastSentAt = pinExpiresAt - PIN_TTL (потому что pinExpiresAt выставляется при каждой отправке)
      const lastSentAt = new Date(existing.pinExpiresAt.getTime() - PIN_TTL_SECONDS * 1000);
      const left = secondsLeft(now, lastSentAt, RESEND_COOLDOWN_SECONDS);

      if (left > 0) {
        return NextResponse.json(
          {
            ok: false,
            error: `Пожалуйста, подождите ${left} сек. перед повторной отправкой.`,
            cooldownSeconds: left,
          },
          { status: 429 }
        );
      }

      // генерируем новый PIN и отправляем заново, но registrationId остаётся тот же
      const pin = generatePinCode();
      const hashedPin = await bcrypt.hash(pin, 10);
      const pinExpiresAt = new Date(now.getTime() + PIN_TTL_SECONDS * 1000);

      await prisma.smsPhoneRegistration.update({
        where: { id: existing.id },
        data: {
          pinCode: hashedPin,
          pinExpiresAt,
          attempts: 0,
        },
      });

      const sendResult = await sendPinSms(formattedPhone, pin);
      if (!sendResult.success) {
        return NextResponse.json(
          { ok: false, error: 'Не удалось отправить SMS. Попробуйте позже.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        registrationId: existing.id,
        phone: formattedPhone,
        expiresIn: PIN_TTL_SECONDS,
        cooldownSeconds: RESEND_COOLDOWN_SECONDS,
      });
    }

    // Иначе создаём новую регистрацию
    const pin = generatePinCode();
    const state = crypto.randomBytes(32).toString('hex');
    const hashedPin = await bcrypt.hash(pin, 10);

    const pinExpiresAt = new Date(now.getTime() + PIN_TTL_SECONDS * 1000);
    const expiresAt = new Date(now.getTime() + REG_TTL_MINUTES * 60 * 1000);

    // Получаем locale из cookies
    const localeCookie = req.cookies.get('locale')?.value;
    const locale = ['de', 'ru', 'en'].includes(localeCookie || '') ? localeCookie : 'de';

    const registration = await prisma.smsPhoneRegistration.create({
      data: {
        state,
        phone: formattedPhone,
        pinCode: hashedPin,
        pinExpiresAt,
        serviceId,
        masterId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        locale, // ✅ Сохраняем язык клиента
        expiresAt,
      },
    });

    console.log('[SMS Phone Reg] Registration created:', registration.id);

    const sendResult = await sendPinSms(formattedPhone, pin);

    if (!sendResult.success) {
      await prisma.smsPhoneRegistration.delete({ where: { id: registration.id } });

      return NextResponse.json(
        { ok: false, error: 'Не удалось отправить SMS. Попробуйте позже.' },
        { status: 500 }
      );
    }

    console.log('[SMS Phone Reg] ✅ SMS sent successfully via Zadarma');

    return NextResponse.json({
      ok: true,
      registrationId: registration.id,
      phone: formattedPhone,
      expiresIn: PIN_TTL_SECONDS,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error('[SMS Phone Reg] Error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}




//----------31.01.26
// //---------пробуем работу с SMS через Zadarma-------
// // src/app/api/booking/client/sms-phone/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import {
//   generatePinCode,
//   sendPinSms,
//   formatPhoneForZadarma,
//   validatePhoneNumber,
// } from '@/lib/zadarma-sms';
// import crypto from 'crypto';
// import bcrypt from 'bcrypt';

// const PIN_TTL_SECONDS = 10 * 60; // 10 минут
// const REG_TTL_MINUTES = 30; // 30 минут
// const RESEND_COOLDOWN_SECONDS = 60; // защита от частых отправок

// function secondsLeft(now: Date, lastSentAt: Date, cooldownSeconds: number): number {
//   const diffMs = now.getTime() - lastSentAt.getTime();
//   const left = cooldownSeconds - Math.floor(diffMs / 1000);
//   return left > 0 ? left : 0;
// }

// /**
//  * POST /api/booking/client/sms-phone
//  *
//  * Инициализация регистрации через SMS:
//  * - если есть активная запись по этому номеру и этим параметрам — переиспользуем
//  * - если отправляли недавно — 429 + cooldownSeconds
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { serviceId, masterId, startAt, endAt, phone } = body as {
//       serviceId?: string;
//       masterId?: string;
//       startAt?: string;
//       endAt?: string;
//       phone?: string;
//     };

//     console.log('[SMS Phone Reg] Initiating registration:', {
//       serviceId,
//       masterId,
//       phone: phone?.substring(0, 5) + '***',
//     });

//     if (!serviceId || !masterId || !startAt || !endAt || !phone) {
//       return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
//     }

//     // формат + валидация номера
//     const formattedPhone = formatPhoneForZadarma(phone);
//     const phoneValidation = validatePhoneNumber(formattedPhone);
//     if (!phoneValidation.valid) {
//       return NextResponse.json(
//         { ok: false, error: phoneValidation.error || 'Invalid phone number' },
//         { status: 400 }
//       );
//     }

//     // Проверка service и master
//     const [service, master] = await Promise.all([
//       prisma.service.findFirst({
//         where: { id: serviceId, isActive: true, isArchived: false },
//       }),
//       prisma.master.findUnique({ where: { id: masterId } }),
//     ]);

//     if (!service) {
//       return NextResponse.json({ ok: false, error: 'Service not found or inactive' }, { status: 404 });
//     }
//     if (!master) {
//       return NextResponse.json({ ok: false, error: 'Master not found' }, { status: 404 });
//     }

//     const now = new Date();

//     // Чистим только явно истёкшие записи (как было)
//     await prisma.smsPhoneRegistration.deleteMany({
//       where: {
//         phone: formattedPhone,
//         verified: false,
//         expiresAt: { lt: now },
//       },
//     });

//     // Ищем активную регистрацию под этот слот (важно: чтобы не пересекалось с другими бронированиями)
//     const existing = await prisma.smsPhoneRegistration.findFirst({
//       where: {
//         phone: formattedPhone,
//         verified: false,
//         expiresAt: { gt: now },
//         serviceId,
//         masterId,
//         startAt: new Date(startAt),
//         endAt: new Date(endAt),
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     // Если есть — проверяем cooldown и переиспользуем
//     if (existing) {
//       // lastSentAt = pinExpiresAt - PIN_TTL (потому что pinExpiresAt выставляется при каждой отправке)
//       const lastSentAt = new Date(existing.pinExpiresAt.getTime() - PIN_TTL_SECONDS * 1000);
//       const left = secondsLeft(now, lastSentAt, RESEND_COOLDOWN_SECONDS);

//       if (left > 0) {
//         return NextResponse.json(
//           {
//             ok: false,
//             error: `Пожалуйста, подождите ${left} сек. перед повторной отправкой.`,
//             cooldownSeconds: left,
//           },
//           { status: 429 }
//         );
//       }

//       // генерируем новый PIN и отправляем заново, но registrationId остаётся тот же
//       const pin = generatePinCode();
//       const hashedPin = await bcrypt.hash(pin, 10);
//       const pinExpiresAt = new Date(now.getTime() + PIN_TTL_SECONDS * 1000);

//       await prisma.smsPhoneRegistration.update({
//         where: { id: existing.id },
//         data: {
//           pinCode: hashedPin,
//           pinExpiresAt,
//           attempts: 0,
//         },
//       });

//       const sendResult = await sendPinSms(formattedPhone, pin);
//       if (!sendResult.success) {
//         return NextResponse.json(
//           { ok: false, error: 'Не удалось отправить SMS. Попробуйте позже.' },
//           { status: 500 }
//         );
//       }

//       return NextResponse.json({
//         ok: true,
//         registrationId: existing.id,
//         phone: formattedPhone,
//         expiresIn: PIN_TTL_SECONDS,
//         cooldownSeconds: RESEND_COOLDOWN_SECONDS,
//       });
//     }

//     // Иначе создаём новую регистрацию
//     const pin = generatePinCode();
//     const state = crypto.randomBytes(32).toString('hex');
//     const hashedPin = await bcrypt.hash(pin, 10);

//     const pinExpiresAt = new Date(now.getTime() + PIN_TTL_SECONDS * 1000);
//     const expiresAt = new Date(now.getTime() + REG_TTL_MINUTES * 60 * 1000);

//     const registration = await prisma.smsPhoneRegistration.create({
//       data: {
//         state,
//         phone: formattedPhone,
//         pinCode: hashedPin,
//         pinExpiresAt,
//         serviceId,
//         masterId,
//         startAt: new Date(startAt),
//         endAt: new Date(endAt),
//         expiresAt,
//       },
//     });

//     console.log('[SMS Phone Reg] Registration created:', registration.id);

//     const sendResult = await sendPinSms(formattedPhone, pin);

//     if (!sendResult.success) {
//       await prisma.smsPhoneRegistration.delete({ where: { id: registration.id } });

//       return NextResponse.json(
//         { ok: false, error: 'Не удалось отправить SMS. Попробуйте позже.' },
//         { status: 500 }
//       );
//     }

//     console.log('[SMS Phone Reg] ✅ SMS sent successfully via Zadarma');

//     return NextResponse.json({
//       ok: true,
//       registrationId: registration.id,
//       phone: formattedPhone,
//       expiresIn: PIN_TTL_SECONDS,
//       cooldownSeconds: RESEND_COOLDOWN_SECONDS,
//     });
//   } catch (error) {
//     console.error('[SMS Phone Reg] Error:', error);
//     return NextResponse.json(
//       { ok: false, error: error instanceof Error ? error.message : 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }









// // src/app/api/booking/client/sms-phone/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import {
//   generatePinCode,
//   sendPinSms,
//   formatPhoneForZadarma,
//   validatePhoneNumber,
// } from '@/lib/zadarma-sms'; // ← Изменено с infobip-sms на zadarma-sms
// import crypto from 'crypto';
// import bcrypt from 'bcrypt';

// /**
//  * POST /api/booking/client/sms-phone
//  * 
//  * Инициализация регистрации через SMS
//  * Генерирует PIN, хеширует, сохраняет в БД, отправляет SMS через Zadarma
//  */

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { serviceId, masterId, startAt, endAt, phone } = body;

//     console.log('[SMS Phone Reg] Initiating registration:', {
//       serviceId,
//       masterId,
//       phone: phone?.substring(0, 5) + '***',
//     });

//     // Валидация входных данных
//     if (!serviceId || !masterId || !startAt || !endAt || !phone) {
//       return NextResponse.json(
//         { ok: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Валидация номера телефона
//     const formattedPhone = formatPhoneForZadarma(phone);
//     const phoneValidation = validatePhoneNumber(formattedPhone);
    
//     if (!phoneValidation.valid) {
//       return NextResponse.json(
//         { ok: false, error: phoneValidation.error || 'Invalid phone number' },
//         { status: 400 }
//       );
//     }

//     // Проверка существования service и master
//     const [service, master] = await Promise.all([
//       prisma.service.findFirst({
//         where: { id: serviceId, isActive: true, isArchived: false },
//       }),
//       prisma.master.findUnique({
//         where: { id: masterId },
//       }),
//     ]);

//     if (!service) {
//       return NextResponse.json(
//         { ok: false, error: 'Service not found or inactive' },
//         { status: 404 }
//       );
//     }

//     if (!master) {
//       return NextResponse.json(
//         { ok: false, error: 'Master not found' },
//         { status: 404 }
//       );
//     }

//     // Удаляем старые неподтверждённые записи для этого телефона
//     await prisma.smsPhoneRegistration.deleteMany({
//       where: {
//         phone: formattedPhone,
//         verified: false,
//         expiresAt: {
//           lt: new Date(),
//         },
//       },
//     });

//     // Генерация PIN и state
//     const pin = generatePinCode(); // 4 цифры
//     const state = crypto.randomBytes(32).toString('hex');
    
//     // Хешируем PIN для безопасного хранения
//     const hashedPin = await bcrypt.hash(pin, 10);
    
//     const now = new Date();
//     const pinExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 минут
//     const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут
    
//     // Создаём запись в БД
//     const registration = await prisma.smsPhoneRegistration.create({
//       data: {
//         state,
//         phone: formattedPhone,
//         pinCode: hashedPin,
//         pinExpiresAt,
//         serviceId,
//         masterId,
//         startAt: new Date(startAt),
//         endAt: new Date(endAt),
//         expiresAt,
//       },
//     });

//     console.log('[SMS Phone Reg] Registration created:', registration.id);

//     // Отправка SMS с PIN через Zadarma
//     const sendResult = await sendPinSms(formattedPhone, pin);

//     if (!sendResult.success) {
//       // Если не удалось отправить SMS, удаляем запись
//       await prisma.smsPhoneRegistration.delete({
//         where: { id: registration.id },
//       });

//       return NextResponse.json(
//         {
//           ok: false,
//           error: sendResult.error || 'Failed to send SMS',
//         },
//         { status: 500 }
//       );
//     }

//     console.log('[SMS Phone Reg] ✅ SMS sent successfully via Zadarma');

//     return NextResponse.json({
//       ok: true,
//       registrationId: registration.id,
//       phone: formattedPhone,
//       expiresIn: 600, // 10 минут в секундах
//     });
//   } catch (error) {
//     console.error('[SMS Phone Reg] Error:', error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }



//--------работа с SMS через Mobizon временно отключена в связи с переходом на Zadarma-------
// // src/app/api/booking/client/sms-phone/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import {
//   generatePinCode,
//   sendPinSms,
//   formatPhoneForMobizon,
//   validatePhoneNumber,
// } from '@/lib/mobizon-sms';
// import crypto from 'crypto';
// import bcrypt from 'bcrypt';

// /**
//  * POST /api/booking/client/sms-phone
//  *
//  * Инициализация регистрации через SMS
//  * Генерирует PIN, хеширует, сохраняет в БД, отправляет SMS
//  */

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { serviceId, masterId, startAt, endAt, phone } = body;

//     console.log('[SMS Phone Reg] Initiating registration:', {
//       serviceId,
//       masterId,
//       phone: phone?.substring(0, 5) + '***',
//     });

//     // Валидация входных данных
//     if (!serviceId || !masterId || !startAt || !endAt || !phone) {
//       return NextResponse.json(
//         { ok: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Валидация номера телефона
//     const formattedPhone = formatPhoneForMobizon(phone);
//     const phoneValidation = validatePhoneNumber(formattedPhone);

//     if (!phoneValidation.valid) {
//       return NextResponse.json(
//         { ok: false, error: phoneValidation.error || 'Invalid phone number' },
//         { status: 400 }
//       );
//     }

//     // Проверка существования service и master
//     const [service, master] = await Promise.all([
//       prisma.service.findFirst({
//         where: { id: serviceId, isActive: true, isArchived: false },
//       }),
//       prisma.master.findUnique({
//         where: { id: masterId },
//       }),
//     ]);

//     if (!service) {
//       return NextResponse.json(
//         { ok: false, error: 'Service not found or inactive' },
//         { status: 404 }
//       );
//     }

//     if (!master) {
//       return NextResponse.json(
//         { ok: false, error: 'Master not found' },
//         { status: 404 }
//       );
//     }

//     // Удаляем старые неподтверждённые записи для этого телефона
//     await prisma.smsPhoneRegistration.deleteMany({
//       where: {
//         phone: formattedPhone,
//         verified: false,
//         expiresAt: {
//           lt: new Date(),
//         },
//       },
//     });

//     // Генерация PIN и state
//     const pin = generatePinCode(); // 4 цифры
//     const state = crypto.randomBytes(32).toString('hex');

//     // Хешируем PIN для безопасного хранения
//     const hashedPin = await bcrypt.hash(pin, 10);

//     const now = new Date();
//     const pinExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 минут
//     const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут

//     // Создаём запись в БД
//     const registration = await prisma.smsPhoneRegistration.create({
//       data: {
//         state,
//         phone: formattedPhone,
//         pinCode: hashedPin,
//         pinExpiresAt,
//         serviceId,
//         masterId,
//         startAt: new Date(startAt),
//         endAt: new Date(endAt),
//         expiresAt,
//       },
//     });

//     console.log('[SMS Phone Reg] Registration created:', registration.id);

//     // Отправка SMS с PIN
//     const sendResult = await sendPinSms(formattedPhone, pin);

//     if (!sendResult.success) {
//       // Если не удалось отправить SMS, удаляем запись
//       await prisma.smsPhoneRegistration.delete({
//         where: { id: registration.id },
//       });

//       return NextResponse.json(
//         {
//           ok: false,
//           error: sendResult.error || 'Failed to send SMS',
//         },
//         { status: 500 }
//       );
//     }

//     console.log('[SMS Phone Reg] ✅ SMS sent successfully');

//     return NextResponse.json({
//       ok: true,
//       registrationId: registration.id,
//       phone: formattedPhone,
//       expiresIn: 600, // 10 минут в секундах
//     });
//   } catch (error) {
//     console.error('[SMS Phone Reg] Error:', error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }



//--------работа с SMS через Infobip временно отключена в связи с переходом на Zadarma-------
// // src/app/api/booking/client/sms-phone/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import {
//   generatePinCode,
//   sendPinSms,
//   formatPhoneForInfobip,
//   validatePhoneNumber,
// } from '@/lib/infobip-sms';
// import crypto from 'crypto';
// import bcrypt from 'bcrypt';

// /**
//  * POST /api/booking/client/sms-phone
//  * 
//  * Инициализация регистрации через SMS
//  * Генерирует PIN, хеширует, сохраняет в БД, отправляет SMS
//  */

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { serviceId, masterId, startAt, endAt, phone } = body;

//     console.log('[SMS Phone Reg] Initiating registration:', {
//       serviceId,
//       masterId,
//       phone: phone?.substring(0, 5) + '***',
//     });

//     // Валидация входных данных
//     if (!serviceId || !masterId || !startAt || !endAt || !phone) {
//       return NextResponse.json(
//         { ok: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Валидация номера телефона
//     const formattedPhone = formatPhoneForInfobip(phone);
//     const phoneValidation = validatePhoneNumber(formattedPhone);
    
//     if (!phoneValidation.valid) {
//       return NextResponse.json(
//         { ok: false, error: phoneValidation.error || 'Invalid phone number' },
//         { status: 400 }
//       );
//     }

//     // Проверка существования service и master
//     const [service, master] = await Promise.all([
//       prisma.service.findFirst({
//         where: { id: serviceId, isActive: true, isArchived: false },
//       }),
//       prisma.master.findUnique({
//         where: { id: masterId },
//       }),
//     ]);

//     if (!service) {
//       return NextResponse.json(
//         { ok: false, error: 'Service not found or inactive' },
//         { status: 404 }
//       );
//     }

//     if (!master) {
//       return NextResponse.json(
//         { ok: false, error: 'Master not found' },
//         { status: 404 }
//       );
//     }

//     // Удаляем старые неподтверждённые записи для этого телефона
//     await prisma.smsPhoneRegistration.deleteMany({
//       where: {
//         phone: formattedPhone,
//         verified: false,
//         expiresAt: {
//           lt: new Date(),
//         },
//       },
//     });

//     // Генерация PIN и state
//     const pin = generatePinCode(); // 4 цифры
//     const state = crypto.randomBytes(32).toString('hex');
    
//     // Хешируем PIN для безопасного хранения
//     const hashedPin = await bcrypt.hash(pin, 10);
    
//     const now = new Date();
//     const pinExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 минут
//     const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут
    
//     // Создаём запись в БД
//     const registration = await prisma.smsPhoneRegistration.create({
//       data: {
//         state,
//         phone: formattedPhone,
//         pinCode: hashedPin,
//         pinExpiresAt,
//         serviceId,
//         masterId,
//         startAt: new Date(startAt),
//         endAt: new Date(endAt),
//         expiresAt,
//       },
//     });

//     console.log('[SMS Phone Reg] Registration created:', registration.id);

//     // Отправка SMS с PIN
//     const sendResult = await sendPinSms(formattedPhone, pin);

//     if (!sendResult.success) {
//       // Если не удалось отправить SMS, удаляем запись
//       await prisma.smsPhoneRegistration.delete({
//         where: { id: registration.id },
//       });

//       return NextResponse.json(
//         {
//           ok: false,
//           error: sendResult.error || 'Failed to send SMS',
//         },
//         { status: 500 }
//       );
//     }

//     console.log('[SMS Phone Reg] ✅ SMS sent successfully');

//     return NextResponse.json({
//       ok: true,
//       registrationId: registration.id,
//       phone: formattedPhone,
//       expiresIn: 600, // 10 минут в секундах
//     });
//   } catch (error) {
//     console.error('[SMS Phone Reg] Error:', error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }