// src/app/api/masters/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdminRoute } from "@/lib/route-guards";

// READ-ONLY (список мастеров можно отдавать публично)
export async function GET() {
  const list = await prisma.master.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, userId: true },
  });
  return NextResponse.json(list);
}

// MUTATIONS (ADMIN)
async function postHandler(req: Request) {
  const data = await req.json();
  const created = await prisma.master.create({ data });
  return NextResponse.json(created);
}
export const POST = withAdminRoute(postHandler);