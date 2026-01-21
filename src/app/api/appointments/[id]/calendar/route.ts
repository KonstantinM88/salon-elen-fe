// src/app/api/appointments/[id]/calendar/route.ts
// ФИНАЛЬНАЯ ВЕРСИЯ для iOS 18+

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatDateForICS(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

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
      phone: "Телефон:",
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
    const locale = request.nextUrl.searchParams.get('locale') || 'ru';
    
    console.log('📅 Calendar endpoint:', { appointmentId, locale });
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: { select: { name: true, durationMin: true } },
        master: { select: { name: true } },
      },
    });
    
    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }
    
    const t = getCalendarTranslations(locale);
    const startDate = appointment.startAt;
    const endDate = appointment.endAt;
    
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
    
    const title = `${appointment.service.name} ${t.title_appointment_in}`;
    
    // ✅ Расширенное описание с полной информацией
    const description = [
      t.description_title,
      '',
      `${t.service} ${appointment.service.name}`,
      `${t.master} ${appointment.master?.name || t.master + ' уточняется'}`,
      `${t.date} ${formattedDate}`,
      `${t.time} ${formattedTime}`,
      `${t.duration} ${appointment.service.durationMin} ${t.duration_minutes}`,
      '',
      `${t.appointment_id} ${appointmentId}`,
      '',
      `${t.address}`,
      t.location,
      '',
      `${t.contacts} https://permanent-halle.de`,
      `${t.phone} +49 177 899 5106`,
      '',
      t.reschedule_notice,
      '',
      t.see_you,
    ].join('\\n');
    
    const startFormatted = formatDateForICS(startDate);
    const endFormatted = formatDateForICS(endDate);
    const nowFormatted = formatDateForICS(new Date());
    const uid = `salon-elen-${appointmentId}@salon-elen.de`;
    
    const escapedTitle = escapeICSText(title);
    const escapedLocation = escapeICSText(t.location);
    
    // ✅ КРИТИЧНО: CRLF line endings для RFC 5545
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SalonElen//Booking System//EN',
      'METHOD:PUBLISH',  // ✅ PUBLISH для iOS 18+ (не требует ATTENDEE)
      'CALSCALE:GREGORIAN',
      'X-WR-CALNAME:SalonElen Appointments',
      'X-WR-TIMEZONE:Europe/Berlin',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowFormatted}`,
      `DTSTART:${startFormatted}`,
      `DTEND:${endFormatted}`,
      `SUMMARY:${escapedTitle}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${escapedLocation}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',  // Напоминание за 1 час
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapedTitle}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    
    const icsContent = lines.join('\r\n');
    
    console.log('✅ ICS created:', icsContent.length, 'bytes');
    
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="SalonElen-${appointmentId}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('❌ Calendar error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}