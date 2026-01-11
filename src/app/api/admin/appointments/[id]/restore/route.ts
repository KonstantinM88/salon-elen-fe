// src/app/api/admin/appointments/[id]/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Получаем данные заявки для логирования
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        customerName: true,
        deletedAt: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (!appointment.deletedAt) {
      return NextResponse.json({ error: "Appointment is not deleted" }, { status: 400 });
    }

    // ✅ ВОССТАНОВЛЕНИЕ - убираем deletedAt и deletedBy
    const restored = await prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    console.log(`✅ Appointment restored: ${id} | ${appointment.customerName} | by ${session.user.email}`);

    return NextResponse.json({ 
      message: "Appointment restored successfully",
      appointment: restored 
    });

  } catch (error) {
    console.error("Error restoring appointment:", error);
    return NextResponse.json(
      { error: "Failed to restore appointment" },
      { status: 500 }
    );
  }
}