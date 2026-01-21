// src/app/api/admin/translations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

type Locale = 'de' | 'ru' | 'en';

type TranslationPayload = {
  locale: Locale;
  name: string;
  description: string | null;
};

function isLocale(v: unknown): v is Locale {
  return v === 'de' || v === 'ru' || v === 'en';
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Проверяем JWT (как в других admin API), роль должна быть ADMIN
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: unknown = await req.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('serviceId' in body) ||
      !('translations' in body)
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const serviceId = (body as { serviceId: unknown }).serviceId;
    const translations = (body as { translations: unknown }).translations;

    if (typeof serviceId !== 'string' || !serviceId.trim()) {
      return NextResponse.json({ error: 'Invalid serviceId' }, { status: 400 });
    }

    if (!Array.isArray(translations)) {
      return NextResponse.json({ error: 'Invalid translations' }, { status: 400 });
    }

    const normalized: TranslationPayload[] = [];

    for (const t of translations) {
      if (typeof t !== 'object' || t === null) continue;

      const locale = (t as { locale?: unknown }).locale;
      const name = (t as { name?: unknown }).name;
      const description = (t as { description?: unknown }).description;

      if (!isLocale(locale)) continue;
      if (typeof name !== 'string' || !name.trim()) continue;

      const desc =
        typeof description === 'string'
          ? description.trim()
          : description === null
            ? null
            : null;

      normalized.push({
        locale,
        name: name.trim(),
        description: desc && desc.length ? desc : null,
      });
    }

    // Ничего не прислали — ок, просто не сохраняем
    if (normalized.length === 0) {
      return NextResponse.json({ success: true, saved: 0 });
    }

    await Promise.all(
      normalized.map((t) =>
        prisma.serviceTranslation.upsert({
          where: {
            serviceId_locale: {
              serviceId,
              locale: t.locale,
            },
          },
          update: {
            name: t.name,
            description: t.description,
          },
          create: {
            serviceId,
            locale: t.locale,
            name: t.name,
            description: t.description,
          },
        }),
      ),
    );

    return NextResponse.json({ success: true, saved: normalized.length });
  } catch (error) {
    console.error('Translation update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}