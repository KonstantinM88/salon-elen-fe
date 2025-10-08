import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function normPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get('name') ?? '').trim();
  const phoneRaw = (searchParams.get('phone') ?? '').trim();
  const phoneNorm = normPhone(phoneRaw);

  if (!name && !phoneNorm) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Ищем по телефону (нормализованно) и/или по имени (insensitive)
  const last7 = phoneNorm.length >= 7 ? phoneNorm.slice(-7) : phoneNorm;

  const client = await prisma.client.findFirst({
    where: {
      OR: [
        // точное совпадение телефона (как хранится)
        { phone: { equals: phoneRaw } },
        // по последним 7 цифрам (на случай формата +49 ... / пробелы)
        ...(last7
          ? [{ phone: { contains: last7 } } as const]
          : []),
        // по имени (если дали)
        ...(name ? [{ name: { equals: name, mode: 'insensitive' } } as const] : []),
      ],
    },
    select: { birthDate: true },
  });

  if (!client?.birthDate) {
    return NextResponse.json({ ok: true, birthDateISO: null });
  }

  const iso = client.birthDate.toISOString().slice(0, 10);
  return NextResponse.json({ ok: true, birthDateISO: iso });
}
