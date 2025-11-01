import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  id: string;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> } // в новых версиях Next.js params — Promise
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
    }

    const appt = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        serviceId: true,
        clientId: true,
        masterId: true,
        startAt: true,
        endAt: true,
        customerName: true,
        phone: true,
        email: true,
        notes: true,
        status: true,
        createdAt: true,
      },
    });

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appt);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}




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
