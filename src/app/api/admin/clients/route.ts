// API endpoint для создания клиента с проверкой дубликатов
// src/app/api/admin/clients/route.ts (POST метод)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { checkClientDuplicates } from "@/lib/client-duplicate-check";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, birthDate, referral, notes } = body;

    // Валидация
    if (!name || !phone || !email || !birthDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ ПРОВЕРКА ДУБЛИКАТОВ
    const duplicateCheck = await checkClientDuplicates(phone, email);

    // ❌ Есть активный клиент с таким phone/email
    if (duplicateCheck.hasActiveDuplicate) {
      return NextResponse.json({
        error: "duplicate",
        message: "Клиент с таким телефоном или email уже существует",
        duplicateType: "active",
        conflictType: duplicateCheck.conflictType,
        existingClient: duplicateCheck.activeClient,
      }, { status: 409 });
    }

    // ⚠️ Есть удалённый клиент с таким phone/email
    if (duplicateCheck.hasDeletedDuplicate) {
      return NextResponse.json({
        error: "duplicate",
        message: "Найден удалённый клиент с таким телефоном или email",
        duplicateType: "deleted",
        conflictType: duplicateCheck.conflictType,
        deletedClient: duplicateCheck.deletedClient,
        suggestion: "Вы можете восстановить удалённого клиента вместо создания нового",
      }, { status: 409 });
    }

    // ✅ Нет дубликатов - создаём клиента
    const client = await prisma.client.create({
      data: {
        name,
        phone,
        email,
        birthDate: new Date(birthDate),
        referral: referral || null,
        notes: notes || null,
      },
    });

    console.log(`✅ Client created: ${client.id} | ${client.name} | ${client.phone}`);

    return NextResponse.json({
      success: true,
      message: "Client created successfully",
      client,
    });

  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}