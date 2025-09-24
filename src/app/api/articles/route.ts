
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { articleInput } from "@/lib/validators";

export async function GET() {
  const list = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = articleInput.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  const created = await prisma.article.create({ data: {
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  }});
  return NextResponse.json(created, { status: 201 });
}
