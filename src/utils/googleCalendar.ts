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
 * Создаёт ссылку для записи в салон
 */
export function createSalonAppointmentCalendarLink(params: {
  serviceTitle: string;
  masterName: string;
  dateIso: string;
  timeIso: string;
  duration: number; // в минутах
  appointmentId: string;
}): string {
  const { serviceTitle, masterName, dateIso, timeIso, duration, appointmentId } = params;
  
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
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const formattedDate = dateFormatter.format(startDate);
  const formattedTime = timeFormatter.format(startDate);
  
  // Формируем заголовок события
  const title = `${serviceTitle} в SalonElen`;
  
  // Формируем описание события
  const description = `
Запись в салон красоты SalonElen

Услуга: ${serviceTitle}
Мастер: ${masterName}
Дата: ${formattedDate}
Время: ${formattedTime}
Продолжительность: ${duration} минут

Номер записи: ${appointmentId}

Адрес: SalonElen
Контакты: https://salon-elen.de
Telefon: 0177-899-5106

Если вам необходимо перенести или отменить запись, пожалуйста, свяжитесь с нами заранее.

До встречи! ✨
  `.trim();
  
  // Адрес салона
  const location = 'SalonElen, Lessingstrasse 37, 06114, Halle Saale'; // Замените на реальный адрес
  
  return createGoogleCalendarLink({
    title,
    startDate,
    endDate,
    description,
    location,
  });
}