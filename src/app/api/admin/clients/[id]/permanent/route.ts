//src/app/api/admin/clients/[id]/permanent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

    // ⚠️ ОКОНЧАТЕЛЬНОЕ УДАЛЕНИЕ из базы данных
    // Сначала получаем данные для лога
    const client = await prisma.client.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Удаляем навсегда
    await prisma.client.delete({
      where: { id },
    });

    console.log(`🗑️ Client permanently deleted: ${id} | ${client.name} | ${client.email}`);

    return NextResponse.json({ 
      success: true,
      message: "Client permanently deleted",
    });

  } catch (error) {
    console.error("Error deleting client permanently:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
