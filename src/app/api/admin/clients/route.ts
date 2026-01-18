// API endpoint для создания клиента с проверкой дубликатов
// src/app/api/admin/clients/route.ts (POST метод)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { checkClientDuplicates } from "@/lib/client-duplicate-check";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import { translate, type MessageKey } from "@/i18n/messages";

export async function POST(request: NextRequest) {
  const locale = resolveLocale(request);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: t("api_admin_clients_unauthorized") },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, email, birthDate, referral, notes } = body;

    // Валидация
    if (!name || !phone || !email || !birthDate) {
      return NextResponse.json(
        { error: t("api_admin_clients_missing_fields") },
        { status: 400 }
      );
    }

    // ✅ ПРОВЕРКА ДУБЛИКАТОВ
    const duplicateCheck = await checkClientDuplicates(phone, email);

    // ❌ Есть активный клиент с таким phone/email
    if (duplicateCheck.hasActiveDuplicate) {
      return NextResponse.json({
        error: "duplicate",
        message: t("api_admin_clients_duplicate_active"),
        duplicateType: "active",
        conflictType: duplicateCheck.conflictType,
        existingClient: duplicateCheck.activeClient,
      }, { status: 409 });
    }

    // ⚠️ Есть удалённый клиент с таким phone/email
    if (duplicateCheck.hasDeletedDuplicate) {
      return NextResponse.json({
        error: "duplicate",
        message: t("api_admin_clients_duplicate_deleted"),
        duplicateType: "deleted",
        conflictType: duplicateCheck.conflictType,
        deletedClient: duplicateCheck.deletedClient,
        suggestion: t("api_admin_clients_duplicate_suggestion"),
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
      message: t("api_admin_clients_created"),
      client,
    });

  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: t("api_admin_clients_error") },
      { status: 500 }
    );
  }
}

function resolveLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get("locale")?.value as Locale | undefined;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  const header = req.headers.get("accept-language") ?? "";
  const match = header.match(/\b(de|en|ru)\b/i);
  if (match) {
    const value = match[1].toLowerCase() as Locale;
    if (LOCALES.includes(value)) {
      return value;
    }
  }

  return DEFAULT_LOCALE;
}
