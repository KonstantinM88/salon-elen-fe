//src/app/api/admin/clients/[id]/restore/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

    // Получаем данные клиента для проверки
    const client = await prisma.client.findUnique({
      where: { id },
      select: { 
        id: true,
        name: true,
        phone: true, 
        email: true,
        deletedAt: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.deletedAt) {
      return NextResponse.json({ error: "Client is not deleted" }, { status: 400 });
    }

    // ✅ ПРОВЕРКА: Есть ли уже АКТИВНЫЙ клиент с таким phone?
    const existingByPhone = await prisma.client.findFirst({
      where: {
        phone: client.phone,
        deletedAt: null,  // Только активные
        id: { not: id },  // Не сам этот клиент
      },
      select: { id: true, name: true, phone: true },
    });

    if (existingByPhone) {
      return NextResponse.json({
        error: "conflict",
        message: `Активный клиент с телефоном ${client.phone} уже существует`,
        conflictType: "phone",
        existingClient: existingByPhone,
      }, { status: 409 });
    }

    // ✅ ПРОВЕРКА: Есть ли уже АКТИВНЫЙ клиент с таким email?
    const existingByEmail = await prisma.client.findFirst({
      where: {
        email: client.email,
        deletedAt: null,  // Только активные
        id: { not: id },  // Не сам этот клиент
      },
      select: { id: true, name: true, email: true },
    });

    if (existingByEmail) {
      return NextResponse.json({
        error: "conflict",
        message: `Активный клиент с email ${client.email} уже существует`,
        conflictType: "email",
        existingClient: existingByEmail,
      }, { status: 409 });
    }

    // ✅ Нет конфликтов - восстанавливаем!
    const restored = await prisma.client.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    console.log(`✅ Client restored: ${restored.id} | ${restored.name} | ${restored.phone}`);

    return NextResponse.json({ 
      success: true,
      message: "Client restored successfully",
      client: restored,
    });

  } catch (error) {
    console.error("Error restoring client:", error);
    return NextResponse.json(
      { error: "Failed to restore client" },
      { status: 500 }
    );
  }
}