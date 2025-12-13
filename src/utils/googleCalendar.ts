// src/utils/googleCalendar.ts

/**
 * Форматирует дату для Google Calendar (YYYYMMDDTHHMMSS)
 */
function formatDateForGoogleCalendar(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Генерирует ссылку для добавления события в Google Calendar
 */
export function createGoogleCalendarLink(params: {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
}): string {
  const { title, startDate, endDate, description, location } = params;
  
  const startFormatted = formatDateForGoogleCalendar(startDate);
  const endFormatted = formatDateForGoogleCalendar(endDate);
  
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const searchParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
    details: description,
    location: location,
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
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
 * Получает локализованные тексты для календаря
 */
function getCalendarTranslations(locale: string = 'ru'): CalendarTranslations {
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

/**
 * Получает локаль для форматирования дат
 */
function getDateLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    ru: 'ru-RU',
    de: 'de-DE',
    en: 'en-US',
  };
  return localeMap[locale] || 'ru-RU';
}

/**
 * Создаёт ссылку для записи в салон с поддержкой i18n
 */
export function createSalonAppointmentCalendarLink(params: {
  serviceTitle: string;
  masterName: string;
  dateIso: string;
  timeIso: string;
  duration: number; // в минутах
  appointmentId: string;
  locale?: string; // Язык для переводов (ru/de/en)
}): string {
  const { serviceTitle, masterName, dateIso, timeIso, duration, appointmentId, locale = 'ru' } = params;
  
  // Получаем переводы
  const t = getCalendarTranslations(locale);
  const dateLocale = getDateLocale(locale);
  
  // Создаём объект Date из ISO строк
  const appointmentDate = new Date(dateIso);
  const appointmentTime = new Date(timeIso);
  
  // Комбинируем дату и время
  const startDate = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate(),
    appointmentTime.getHours(),
    appointmentTime.getMinutes()
  );
  
  // Вычисляем дату окончания (добавляем длительность)
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  
  // Форматируем дату и время для отображения
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
  
  // Формируем заголовок события (с переводом)
  const title = `${serviceTitle} ${t.title_appointment_in}`;
  
  // Формируем описание события (с переводами)
  const description = `
${t.description_title}

${t.service} ${serviceTitle}
${t.master} ${masterName}
${t.date} ${formattedDate}
${t.time} ${formattedTime}
${t.duration} ${duration} ${t.duration_minutes}

${t.appointment_id} ${appointmentId}

${t.address} ${t.location}
${t.contacts} https://salon-elen.de
${t.phone} 0177-899-5106

${t.reschedule_notice}

${t.see_you}
  `.trim();
  
  return createGoogleCalendarLink({
    title,
    startDate,
    endDate,
    description,
    location: t.location,
  });
}




//--------добовляем языки---------
// // src/utils/googleCalendar.ts

// /**
//  * Форматирует дату для Google Calendar (YYYYMMDDTHHMMSS)
//  */
// function formatDateForGoogleCalendar(date: Date): string {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');
  
//   return `${year}${month}${day}T${hours}${minutes}${seconds}`;
// }

// /**
//  * Генерирует ссылку для добавления события в Google Calendar
//  */
// export function createGoogleCalendarLink(params: {
//   title: string;
//   startDate: Date;
//   endDate: Date;
//   description: string;
//   location: string;
// }): string {
//   const { title, startDate, endDate, description, location } = params;
  
//   const startFormatted = formatDateForGoogleCalendar(startDate);
//   const endFormatted = formatDateForGoogleCalendar(endDate);
  
//   const baseUrl = 'https://calendar.google.com/calendar/render';
//   const searchParams = new URLSearchParams({
//     action: 'TEMPLATE',
//     text: title,
//     dates: `${startFormatted}/${endFormatted}`,
//     details: description,
//     location: location,
//   });
  
//   return `${baseUrl}?${searchParams.toString()}`;
// }

// /**
//  * Создаёт ссылку для записи в салон
//  */
// export function createSalonAppointmentCalendarLink(params: {
//   serviceTitle: string;
//   masterName: string;
//   dateIso: string;
//   timeIso: string;
//   duration: number; // в минутах
//   appointmentId: string;
// }): string {
//   const { serviceTitle, masterName, dateIso, timeIso, duration, appointmentId } = params;
  
//   // Создаём объект Date из ISO строк
//   const appointmentDate = new Date(dateIso);
//   const appointmentTime = new Date(timeIso);
  
//   // Комбинируем дату и время
//   const startDate = new Date(
//     appointmentDate.getFullYear(),
//     appointmentDate.getMonth(),
//     appointmentDate.getDate(),
//     appointmentTime.getHours(),
//     appointmentTime.getMinutes()
//   );
  
//   // Вычисляем дату окончания (добавляем длительность)
//   const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  
//   // Форматируем дату и время для отображения
//   const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
//     weekday: 'long',
//     day: '2-digit',
//     month: 'long',
//     year: 'numeric',
//   });
  
//   const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
//     hour: '2-digit',
//     minute: '2-digit',
//   });
  
//   const formattedDate = dateFormatter.format(startDate);
//   const formattedTime = timeFormatter.format(startDate);
  
//   // Формируем заголовок события
//   const title = `${serviceTitle} в SalonElen`;
  
//   // Формируем описание события
//   const description = `
// Запись в салон красоты SalonElen

// Услуга: ${serviceTitle}
// Мастер: ${masterName}
// Дата: ${formattedDate}
// Время: ${formattedTime}
// Продолжительность: ${duration} минут

// Номер записи: ${appointmentId}

// Адрес: SalonElen
// Контакты: https://salon-elen.de
// Telefon: 0177-899-5106

// Если вам необходимо перенести или отменить запись, пожалуйста, свяжитесь с нами заранее.

// До встречи! ✨
//   `.trim();
  
//   // Адрес салона
//   const location = 'SalonElen, Lessingstrasse 37, 06114, Halle Saale'; // Замените на реальный адрес
  
//   return createGoogleCalendarLink({
//     title,
//     startDate,
//     endDate,
//     description,
//     location,
//   });
// }