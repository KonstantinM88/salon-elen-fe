// src/app/api/articles/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminRoute } from "@/lib/route-guards";

// ===== READ-ONLY (публично) =====
export async function GET() {
  const items = await prisma.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    where: {
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } },
      ],
    },
    select: {
      id: true, slug: true, title: true, excerpt: true, cover: true, type: true,
    },
  });
  return NextResponse.json(items);
}

// ===== MUTATIONS (только ADMIN) =====
// Было: export async function POST(req: Request) { ... }
// Стало:
async function postHandler(req: Request) {
  const data = await req.json();
  const created = await prisma.article.create({ data });
  return NextResponse.json(created);
}
export const POST = withAdminRoute(postHandler);