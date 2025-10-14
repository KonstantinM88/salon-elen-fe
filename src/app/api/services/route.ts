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





//------------работало до 13.10----------------
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';

// export async function GET() {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isActive: true },
//     orderBy: { name: 'asc' },
//     select: {
//       id: true,
//       name: true,
//       children: {
//         where: { isActive: true },
//         orderBy: { name: 'asc' },
//         select: { slug: true, name: true, description: true, durationMin: true, priceCents: true },
//       },
//     },
//   });
//   return NextResponse.json({ categories });
// }





// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';

// export async function GET() {
//   if (!process.env.DATABASE_URL) {
//     // Подстраховка: вернём пустой список, чтобы страница не падала
//     return NextResponse.json({ services: [] }, { status: 200 });
//   }
//   const services = await prisma.service.findMany();
//   return NextResponse.json({ services });
// }



// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";


// const prisma = new PrismaClient();

// export async function GET() {
//   const services = await prisma.service.findMany({ orderBy: { title: "asc" } });
//   return NextResponse.json(services);
// }
