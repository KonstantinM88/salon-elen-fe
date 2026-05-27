import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/prisma-client";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  _req: Request,
  { params }: RouteParams,
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const article = await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ views: article.views });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.error("Article view increment failed:", error);
    return NextResponse.json({ error: "View update failed" }, { status: 500 });
  }
}
