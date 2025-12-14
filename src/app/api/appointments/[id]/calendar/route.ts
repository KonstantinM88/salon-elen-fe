// src/app/api/appointments/[id]/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAppleCalendarICS } from '@/utils/googleCalendar';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    
    // Получаем locale из query параметров (например, ?locale=de)
    const locale = request.nextUrl.searchParams.get('locale') || 'ru';
    
    // Получаем данные записи из БД
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        master: true,
      },
    });
    
    if (!appointment) {
      return new NextResponse('Appointment not found', { status: 404 });
    }
    
    // ✅ Вычисляем duration из startAt и endAt (в минутах)
    const durationMinutes = Math.round(
      (appointment.endAt.getTime() - appointment.startAt.getTime()) / (1000 * 60)
    );
    
    // ✅ Обрабатываем случай когда master может быть null
    const masterName = appointment.master?.name || 'Мастер уточняется';
    
    // Создаём .ics файл
    const icsBlob = createAppleCalendarICS({
      serviceTitle: appointment.service.name, // ✅ В Prisma это 'name', не 'title'
      masterName: masterName, // ✅ Используем безопасное значение
      dateIso: appointment.startAt.toISOString(),
      timeIso: appointment.startAt.toISOString(),
      duration: durationMinutes, // ✅ Вычисленная длительность
      appointmentId: appointmentId,
      locale: locale,
    });
    
    // Конвертируем Blob в Buffer для Next.js Response
    const arrayBuffer = await icsBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // ✅ КРИТИЧЕСКИ ВАЖНЫЕ ЗАГОЛОВКИ для iOS
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        // MIME тип для календарных файлов
        'Content-Type': 'text/calendar; charset=utf-8',
        
        // Указываем iOS что это календарный файл для добавления
        'Content-Disposition': `inline; filename="SalonElen-${appointmentId}.ics"`,
        
        // Длина контента
        'Content-Length': buffer.length.toString(),
        
        // Кэширование (опционально)
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        
        // iOS специфичные заголовки
        'X-Content-Type-Options': 'nosniff',
      },
    });
    
  } catch (error) {
    console.error('Error generating calendar file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}