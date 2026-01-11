// src/app/api/admin/appointments/[id]/permanent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    // Сначала получаем данные для логирования
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

    // Проверяем что заявка уже в архиве (soft deleted)
    if (!appointment.deletedAt) {
      return NextResponse.json(
        { error: "Cannot permanently delete active appointment. Soft delete first." },
        { status: 400 }
      );
    }

    // ⚠️ ОКОНЧАТЕЛЬНОЕ УДАЛЕНИЕ из базы данных
    await prisma.appointment.delete({
      where: { id },
    });

    console.log(`🗑️ Appointment permanently deleted: ${id} | ${appointment.customerName} | by ${session.user.email}`);

    return NextResponse.json({ message: "Appointment permanently deleted" });

  } catch (error) {
    console.error("Error permanently deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete appointment" },
      { status: 500 }
    );
  }
}