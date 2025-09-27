import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { articleInput } from "@/lib/validators";
import type { $Enums } from "@prisma/client";

// GET /api/articles — список опубликованных (как у тебя было)
export async function GET() {
  const now = new Date();
  const items = await prisma.article.findMany({
    where: {
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      cover: true,
      type: true,
    },
  });

  return NextResponse.json(items);
}

// POST /api/articles — создание
export async function POST(req: Request) {
  const json = await req.json();
  const parsed = articleInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const data = {
    ...parsed.data,
    type: parsed.data.type as $Enums.ArticleType, // ВАЖНО: enum Prisma
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  };

  const created = await prisma.article.create({ data });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
