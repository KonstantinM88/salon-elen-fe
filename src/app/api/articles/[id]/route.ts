import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;            // ← распаковываем params
  const item = await prisma.article.findUnique({ where: { id } });
  return item ? NextResponse.json(item) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;            // ← распаковываем params
  const json = await req.json();
  const updated = await prisma.article.update({ where: { id }, data: json });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;            // ← распаковываем params
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
