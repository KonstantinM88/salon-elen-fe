// src/app/api/appointments/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  id: string;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
    }

    // Получаем appointment с данными service и master
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,         // ← ИСПРАВЛЕНО! Было title, стало name
            durationMin: true,
          },
        },
        master: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Форматируем ответ для удобства использования
    const response = {
      id: appt.id,
      serviceTitle: appt.service.name,  // ← name из Prisma, но возвращаем как serviceTitle
      masterName: appt.master?.name || 'Не указан',  // ← Опциональный мастер
      startAt: appt.startAt.toISOString(),
      endAt: appt.endAt.toISOString(),
      duration: appt.service.durationMin,
      customerName: appt.customerName,
      email: appt.email,
      phone: appt.phone,
      notes: appt.notes,
      birthDate: appt.birthDate?.toISOString() || null,
      referral: appt.referral,
      status: appt.status,
      createdAt: appt.createdAt.toISOString(),
      // ID для других целей
      serviceId: appt.serviceId,
      masterId: appt.masterId,
      clientId: appt.clientId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}




//---------работал обновляю под гугл календарь----------------
// // src/app/api/appointments/[id]/route.ts
// import { NextResponse, NextRequest } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type Params = {
//   id: string;
// };

// export async function GET(
//   _req: NextRequest,
//   context: { params: Promise<Params> } // в новых версиях Next.js params — Promise
// ): Promise<NextResponse> {
//   try {
//     const { id } = await context.params;

//     if (!id) {
//       return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
//     }

//     const appt = await prisma.appointment.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         serviceId: true,
//         clientId: true,
//         masterId: true,
//         startAt: true,
//         endAt: true,
//         customerName: true,
//         phone: true,
//         email: true,
//         notes: true,
//         status: true,
//         createdAt: true,
//       },
//     });

//     if (!appt) {
//       return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
//     }

//     return NextResponse.json(appt);
//   } catch {
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
// }




// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;

//     if (!id) {
//       return NextResponse.json(
//         { error: 'Appointment ID is required' },
//         { status: 400 }
//       );
//     }

//     const appointment = await prisma.appointment.findUnique({
//       where: { id },
//       include: {
//         service: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//         master: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });

//     if (!appointment) {
//       return NextResponse.json(
//         { error: 'Appointment not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(appointment);
//   } catch (error) {
//     console.error('Error fetching appointment:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch appointment' },
//       { status: 500 }
//     );
//   }
// }
