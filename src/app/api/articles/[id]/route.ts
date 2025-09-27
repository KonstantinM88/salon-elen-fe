import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { articleInput } from "@/lib/validators";
import type { $Enums } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/articles/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.article.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

// PATCH /api/articles/[id]
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const json = await req.json();
  const parsed = articleInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const data = {
    ...parsed.data,
    type: parsed.data.type as $Enums.ArticleType,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  };

  const updated = await prisma.article.update({
    where: { id },
    data,
    select: { id: true },
  });

  return NextResponse.json({ id: updated.id });
}

// DELETE /api/articles/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
