// src/app/api/appointments/[id]/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Форматирует дату для .ics файла (iCalendar format)
 * Format: YYYYMMDDTHHMMSSZ
 */
function formatDateForICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Экранирует текст для .ics файла
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Интерфейс для переводов календаря
 */
interface CalendarTranslations {
  title_appointment_in: string;
  description_title: string;
  service: string;
  master: string;
  date: string;
  time: string;
  duration: string;
  duration_minutes: string;
  appointment_id: string;
  address: string;
  contacts: string;
  phone: string;
  reschedule_notice: string;
  see_you: string;
  location: string;
}

/**
 * Получает переводы для календаря
 */
function getCalendarTranslations(locale: string): CalendarTranslations {
  const translations: Record<string, CalendarTranslations> = {
    ru: {
      title_appointment_in: "в SalonElen",
      description_title: "Запись в салон красоты SalonElen",
      service: "Услуга:",
      master: "Мастер:",
      date: "Дата:",
      time: "Время:",
      duration: "Продолжительность:",
      duration_minutes: "минут",
      appointment_id: "Номер записи:",
      address: "Адрес:",
      contacts: "Контакты:",
      phone: "Telefon:",
      reschedule_notice: "Если вам необходимо перенести или отменить запись, пожалуйста, свяжитесь с нами заранее.",
      see_you: "До встречи! ✨",
      location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",
    },
    de: {
      title_appointment_in: "bei SalonElen",
      description_title: "Termin im Schönheitssalon SalonElen",
      service: "Dienstleistung:",
      master: "Meister:",
      date: "Datum:",
      time: "Uhrzeit:",
      duration: "Dauer:",
      duration_minutes: "Minuten",
      appointment_id: "Terminnummer:",
      address: "Adresse:",
      contacts: "Kontakte:",
      phone: "Telefon:",
      reschedule_notice: "Wenn Sie Ihren Termin verschieben oder absagen müssen, kontaktieren Sie uns bitte im Voraus.",
      see_you: "Bis bald! ✨",
      location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",
    },
    en: {
      title_appointment_in: "at SalonElen",
      description_title: "Appointment at SalonElen Beauty Salon",
      service: "Service:",
      master: "Master:",
      date: "Date:",
      time: "Time:",
      duration: "Duration:",
      duration_minutes: "minutes",
      appointment_id: "Appointment ID:",
      address: "Address:",
      contacts: "Contacts:",
      phone: "Phone:",
      reschedule_notice: "If you need to reschedule or cancel your appointment, please contact us in advance.",
      see_you: "See you soon! ✨",
      location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",
    },
  };

  return translations[locale] || translations.ru;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    
    // Получаем locale из query параметров
    const locale = request.nextUrl.searchParams.get('locale') || 'ru';
    
    console.log('📅 Calendar endpoint called:', { appointmentId, locale });
    
    // Получаем данные записи из БД
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          select: {
            name: true,
            durationMin: true,
          },
        },
        master: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!appointment) {
      console.error('❌ Appointment not found:', appointmentId);
      return new NextResponse('Appointment not found', { status: 404 });
    }
    
    console.log('✅ Appointment loaded:', appointment.id);
    
    // Получаем переводы
    const t = getCalendarTranslations(locale);
    
    // Форматируем даты
    const startDate = appointment.startAt;
    const endDate = appointment.endAt;
    const duration = appointment.service.durationMin;
    
    // Форматируем для отображения
    const dateLocale = locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-US' : 'ru-RU';
    const dateFormatter = new Intl.DateTimeFormat(dateLocale, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat(dateLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const formattedDate = dateFormatter.format(startDate);
    const formattedTime = timeFormatter.format(startDate);
    
    // Формируем заголовок и описание
    const title = `${appointment.service.name} ${t.title_appointment_in}`;
    const description = `${t.description_title}

${t.service} ${appointment.service.name}
${t.master} ${appointment.master?.name || 'Не указан'}
${t.date} ${formattedDate}
${t.time} ${formattedTime}
${t.duration} ${duration} ${t.duration_minutes}

${t.appointment_id} ${appointmentId}

${t.address} ${t.location}
${t.contacts} https://salon-elen.de
${t.phone} 0177-899-5106

${t.reschedule_notice}

${t.see_you}`;
    
    // Форматируем даты для .ics
    const startFormatted = formatDateForICS(startDate);
    const endFormatted = formatDateForICS(endDate);
    const nowFormatted = formatDateForICS(new Date());
    
    // Создаём уникальный UID
    const uid = `salon-elen-${appointmentId}@salon-elen.de`;
    
    // Экранируем текст
    const escapedTitle = escapeICSText(title);
    const escapedDescription = escapeICSText(description);
    const escapedLocation = escapeICSText(t.location);
    
    // ✅ КРИТИЧЕСКИ ВАЖНО: METHOD:REQUEST для iOS!
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SalonElen//Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
X-WR-CALNAME:SalonElen
X-WR-TIMEZONE:Europe/Berlin
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowFormatted}
DTSTART:${startFormatted}
DTEND:${endFormatted}
SUMMARY:${escapedTitle}
DESCRIPTION:${escapedDescription}
LOCATION:${escapedLocation}
ORGANIZER;CN=SalonElen:MAILTO:info@salon-elen.de
STATUS:CONFIRMED
SEQUENCE:0
PRIORITY:5
CLASS:PUBLIC
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:${escapedTitle}
END:VALARM
END:VEVENT
END:VCALENDAR`;
    
    console.log('✅ ICS content created, length:', icsContent.length);
    
    // Возвращаем с правильными заголовками для iOS
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        // ✅ MIME тип для календарных файлов
        'Content-Type': 'text/calendar; charset=utf-8',
        
        // ✅ Предлагаем скачать файл (НЕ inline!)
        'Content-Disposition': `attachment; filename="SalonElen-${appointmentId}.ics"`,
        
        // Длина контента
        'Content-Length': Buffer.byteLength(icsContent, 'utf-8').toString(),
        
        // Кэширование
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('❌ Error generating calendar file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}



//--------скачивает файл ics для ios но толкько в режиме чтения--------
// // src/app/api/appointments/[id]/calendar/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// /**
//  * Форматирует дату для .ics файла (iCalendar format)
//  * Format: YYYYMMDDTHHMMSSZ
//  */
// function formatDateForICS(date: Date): string {
//   const year = date.getUTCFullYear();
//   const month = String(date.getUTCMonth() + 1).padStart(2, '0');
//   const day = String(date.getUTCDate()).padStart(2, '0');
//   const hours = String(date.getUTCHours()).padStart(2, '0');
//   const minutes = String(date.getUTCMinutes()).padStart(2, '0');
//   const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
//   return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
// }

// /**
//  * Экранирует текст для .ics файла
//  */
// function escapeICSText(text: string): string {
//   return text
//     .replace(/\\/g, '\\\\')
//     .replace(/;/g, '\\;')
//     .replace(/,/g, '\\,')
//     .replace(/\n/g, '\\n');
// }

// /**
//  * Интерфейс для переводов календаря
//  */
// interface CalendarTranslations {
//   title_appointment_in: string;
//   description_title: string;
//   service: string;
//   master: string;
//   date: string;
//   time: string;
//   duration: string;
//   duration_minutes: string;
//   appointment_id: string;
//   address: string;
//   contacts: string;
//   phone: string;
//   reschedule_notice: string;
//   see_you: string;
//   location: string;
// }

// /**
//  * Получает переводы для календаря
//  */
// function getCalendarTranslations(locale: string): CalendarTranslations {
//   const translations: Record<string, CalendarTranslations> = {
//     ru: {
//       title_appointment_in: "в SalonElen",
//       description_title: "Запись в салон красоты SalonElen",
//       service: "Услуга:",
//       master: "Мастер:",
//       date: "Дата:",
//       time: "Время:",
//       duration: "Продолжительность:",
//       duration_minutes: "минут",
//       appointment_id: "Номер записи:",
//       address: "Адрес:",
//       contacts: "Контакты:",
//       phone: "Telefon:",
//       reschedule_notice: "Если вам необходимо перенести или отменить запись, пожалуйста, свяжитесь с нами заранее.",
//       see_you: "До встречи! ✨",
//       location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",
//     },
//     de: {
//       title_appointment_in: "bei SalonElen",
//       description_title: "Termin im Schönheitssalon SalonElen",
//       service: "Dienstleistung:",
//       master: "Meister:",
//       date: "Datum:",
//       time: "Uhrzeit:",
//       duration: "Dauer:",
//       duration_minutes: "Minuten",
//       appointment_id: "Terminnummer:",
//       address: "Adresse:",
//       contacts: "Kontakte:",
//       phone: "Telefon:",
//       reschedule_notice: "Wenn Sie Ihren Termin verschieben oder absagen müssen, kontaktieren Sie uns bitte im Voraus.",
//       see_you: "Bis bald! ✨",
//       location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",
//     },
//     en: {
//       title_appointment_in: "at SalonElen",
//       description_title: "Appointment at SalonElen Beauty Salon",
//       service: "Service:",
//       master: "Master:",
//       date: "Date:",
//       time: "Time:",
//       duration: "Duration:",
//       duration_minutes: "minutes",
//       appointment_id: "Appointment ID:",
//       address: "Address:",
//       contacts: "Contacts:",
//       phone: "Phone:",
//       reschedule_notice: "If you need to reschedule or cancel your appointment, please contact us in advance.",
//       see_you: "See you soon! ✨",
//       location: "SalonElen, Lessingstrasse 37, 06114, Halle Saale",
//     },
//   };

//   return translations[locale] || translations.ru;
// }

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const appointmentId = params.id;
    
//     // Получаем locale из query параметров
//     const locale = request.nextUrl.searchParams.get('locale') || 'ru';
    
//     console.log('📅 Calendar endpoint called:', { appointmentId, locale });
    
//     // Получаем данные записи из БД
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: appointmentId },
//       include: {
//         service: {
//           select: {
//             name: true,
//             durationMin: true,
//           },
//         },
//         master: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });
    
//     if (!appointment) {
//       console.error('❌ Appointment not found:', appointmentId);
//       return new NextResponse('Appointment not found', { status: 404 });
//     }
    
//     console.log('✅ Appointment loaded:', appointment.id);
    
//     // Получаем переводы
//     const t = getCalendarTranslations(locale);
    
//     // Форматируем даты
//     const startDate = appointment.startAt;
//     const endDate = appointment.endAt;
//     const duration = appointment.service.durationMin;
    
//     // Форматируем для отображения
//     const dateLocale = locale === 'de' ? 'de-DE' : locale === 'en' ? 'en-US' : 'ru-RU';
//     const dateFormatter = new Intl.DateTimeFormat(dateLocale, {
//       weekday: 'long',
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//     });
//     const timeFormatter = new Intl.DateTimeFormat(dateLocale, {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
    
//     const formattedDate = dateFormatter.format(startDate);
//     const formattedTime = timeFormatter.format(startDate);
    
//     // Формируем заголовок и описание
//     const title = `${appointment.service.name} ${t.title_appointment_in}`;
//     const description = `${t.description_title}

// ${t.service} ${appointment.service.name}
// ${t.master} ${appointment.master?.name || 'Не указан'}
// ${t.date} ${formattedDate}
// ${t.time} ${formattedTime}
// ${t.duration} ${duration} ${t.duration_minutes}

// ${t.appointment_id} ${appointmentId}

// ${t.address} ${t.location}
// ${t.contacts} https://salon-elen.de
// ${t.phone} 0177-899-5106

// ${t.reschedule_notice}

// ${t.see_you}`;
    
//     // Форматируем даты для .ics
//     const startFormatted = formatDateForICS(startDate);
//     const endFormatted = formatDateForICS(endDate);
//     const nowFormatted = formatDateForICS(new Date());
    
//     // Создаём уникальный UID
//     const uid = `salon-elen-${appointmentId}@salon-elen.de`;
    
//     // Экранируем текст
//     const escapedTitle = escapeICSText(title);
//     const escapedDescription = escapeICSText(description);
//     const escapedLocation = escapeICSText(t.location);
    
//     // ✅ КРИТИЧЕСКИ ВАЖНО: METHOD:REQUEST для iOS!
//     const icsContent = `BEGIN:VCALENDAR
// VERSION:2.0
// PRODID:-//SalonElen//Booking System//EN
// CALSCALE:GREGORIAN
// METHOD:REQUEST
// X-WR-CALNAME:SalonElen
// X-WR-TIMEZONE:Europe/Berlin
// BEGIN:VEVENT
// UID:${uid}
// DTSTAMP:${nowFormatted}
// DTSTART:${startFormatted}
// DTEND:${endFormatted}
// SUMMARY:${escapedTitle}
// DESCRIPTION:${escapedDescription}
// LOCATION:${escapedLocation}
// STATUS:CONFIRMED
// SEQUENCE:0
// PRIORITY:5
// CLASS:PUBLIC
// TRANSP:OPAQUE
// BEGIN:VALARM
// TRIGGER:-PT24H
// ACTION:DISPLAY
// DESCRIPTION:${escapedTitle}
// END:VALARM
// END:VEVENT
// END:VCALENDAR`;
    
//     console.log('✅ ICS content created, length:', icsContent.length);
    
//     // Возвращаем с правильными заголовками для iOS
//     return new NextResponse(icsContent, {
//       status: 200,
//       headers: {
//         // ✅ MIME тип для календарных файлов
//         'Content-Type': 'text/calendar; charset=utf-8',
        
//         // ✅ Предлагаем скачать файл (НЕ inline!)
//         'Content-Disposition': `attachment; filename="SalonElen-${appointmentId}.ics"`,
        
//         // Длина контента
//         'Content-Length': Buffer.byteLength(icsContent, 'utf-8').toString(),
        
//         // Кэширование
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0',
//       },
//     });
    
//   } catch (error) {
//     console.error('❌ Error generating calendar file:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }






//--------новая попытка исправить ics для ios--------
// // src/app/api/appointments/[id]/calendar/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { createAppleCalendarICS } from '@/utils/googleCalendar';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const appointmentId = params.id;
    
//     // Получаем locale из query параметров (например, ?locale=de)
//     const locale = request.nextUrl.searchParams.get('locale') || 'ru';
    
//     // Получаем данные записи из БД
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: appointmentId },
//       include: {
//         service: true,
//         master: true,
//       },
//     });
    
//     if (!appointment) {
//       return new NextResponse('Appointment not found', { status: 404 });
//     }
    
//     // ✅ Вычисляем duration из startAt и endAt (в минутах)
//     const durationMinutes = Math.round(
//       (appointment.endAt.getTime() - appointment.startAt.getTime()) / (1000 * 60)
//     );
    
//     // ✅ Обрабатываем случай когда master может быть null
//     const masterName = appointment.master?.name || 'Мастер уточняется';
    
//     // Создаём .ics файл
//     const icsBlob = createAppleCalendarICS({
//       serviceTitle: appointment.service.name, // ✅ В Prisma это 'name', не 'title'
//       masterName: masterName, // ✅ Используем безопасное значение
//       dateIso: appointment.startAt.toISOString(),
//       timeIso: appointment.startAt.toISOString(),
//       duration: durationMinutes, // ✅ Вычисленная длительность
//       appointmentId: appointmentId,
//       locale: locale,
//     });
    
//     // Конвертируем Blob в Buffer для Next.js Response
//     const arrayBuffer = await icsBlob.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
    
//     // ✅ КРИТИЧЕСКИ ВАЖНЫЕ ЗАГОЛОВКИ для iOS
//     return new NextResponse(buffer, {
//       status: 200,
//       headers: {
//         // MIME тип для календарных файлов
//         'Content-Type': 'text/calendar; charset=utf-8',
        
//         // Указываем iOS что это календарный файл для добавления
//         'Content-Disposition': `inline; filename="SalonElen-${appointmentId}.ics"`,
        
//         // Длина контента
//         'Content-Length': buffer.length.toString(),
        
//         // Кэширование (опционально)
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
        
//         // iOS специфичные заголовки
//         'X-Content-Type-Options': 'nosniff',
//       },
//     });
    
//   } catch (error) {
//     console.error('Error generating calendar file:', error);
//     return new NextResponse('Internal Server Error', { status: 500 });
//   }
// }