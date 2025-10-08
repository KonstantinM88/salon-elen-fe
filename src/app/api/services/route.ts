import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const categories = await prisma.service.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      children: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { slug: true, name: true, description: true, durationMin: true, priceCents: true },
      },
    },
  });
  return NextResponse.json({ categories });
}





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
