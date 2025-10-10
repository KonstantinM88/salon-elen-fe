import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type MasterLite = { id: string; name: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serviceSlug = (searchParams.get("serviceSlug") ?? "").trim();

  if (!serviceSlug) {
    return NextResponse.json(
      { ok: false, error: "Missing serviceSlug" },
      { status: 400 }
    );
  }

  // Мастера, у которых в списке услуг есть эта подуслуга
  const masters = await prisma.master.findMany({
    where: {
      services: { some: { slug: serviceSlug, isActive: true } }, // NEW фильтр по услуге
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const out: MasterLite[] = masters.map((m) => ({ id: m.id, name: m.name }));
  return NextResponse.json(out);
}
