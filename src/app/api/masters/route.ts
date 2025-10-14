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






//--------------работало
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// type MasterLite = { id: string; name: string };

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const serviceSlug = (searchParams.get("serviceSlug") ?? "").trim();

//   if (!serviceSlug) {
//     return NextResponse.json(
//       { ok: false, error: "Missing serviceSlug" },
//       { status: 400 }
//     );
//   }

//   // Мастера, у которых в списке услуг есть эта подуслуга
//   const masters = await prisma.master.findMany({
//     where: {
//       services: { some: { slug: serviceSlug, isActive: true } }, // NEW фильтр по услуге
//     },
//     select: { id: true, name: true },
//     orderBy: { name: "asc" },
//   });

//   const out: MasterLite[] = masters.map((m) => ({ id: m.id, name: m.name }));
//   return NextResponse.json(out);
// }
