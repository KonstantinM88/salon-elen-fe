// src/app/api/admin/appointments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * DELETE - SOFT DELETE заявки (установка deletedAt)
 */
export async function DELETE(
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

    if (appointment.deletedAt) {
      return NextResponse.json({ error: "Appointment already deleted" }, { status: 400 });
    }

    // ✅ SOFT DELETE - устанавливаем deletedAt и deletedBy
    const deleted = await prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.email || session.user.id,
      },
    });

    console.log(`🗑️ Appointment soft deleted: ${id} | ${appointment.customerName} | by ${session.user.email}`);

    return NextResponse.json({ 
      message: "Appointment soft deleted successfully",
      appointment: deleted 
    });

  } catch (error) {
    console.error("Error soft deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to soft delete appointment" },
      { status: 500 }
    );
  }
}