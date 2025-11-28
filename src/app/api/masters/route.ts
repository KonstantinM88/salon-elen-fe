// src/app/api/masters/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type MasterDto = { 
  id: string; 
  name: string;
  avatarUrl?: string | null;  // ✅ Добавили avatarUrl
};

type Payload = { masters: MasterDto[]; defaultMasterId: string | null };

/**
 * Возвращает мастеров, которые способны выполнить весь набор услуг.
 * Поддерживает параметры:
 *  - serviceIds: CSV или повторяющиеся query (?serviceIds=ID&serviceIds=ID2)
 *  - serviceSlug: альтернативно, один slug услуги (совместимость)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Сбор serviceIds из разных вариантов запроса
    const fromCsv = (url.searchParams.get('serviceIds') || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const repeated = url.searchParams.getAll('serviceIds')
      .flatMap(s => s.split(',').map(x => x.trim()))
      .filter(s => s.length > 0);

    const serviceSlug = url.searchParams.get('serviceSlug')?.trim() || '';

    let serviceIds: string[] = Array.from(new Set([...fromCsv, ...repeated]));

    // Совместимость: один slug услуги
    if (serviceIds.length === 0 && serviceSlug) {
      const bySlug = await prisma.service.findUnique({
        where: { slug: serviceSlug },
        select: { id: true },
      });
      if (bySlug?.id) serviceIds = [bySlug.id];
    }

    // Если услуги не переданы — вернуть всех мастеров
    if (serviceIds.length === 0) {
      const all = await prisma.master.findMany({
        select: { 
          id: true, 
          name: true,
          avatarUrl: true,  // ✅ Добавили avatarUrl
        },
        orderBy: { name: 'asc' },
      });
      const payload: Payload = {
        masters: all,
        defaultMasterId: all[0]?.id ?? null,
      };
      return NextResponse.json(payload);
    }

    // Валидация услуг: берем только активные, неархивные
    const activeServices = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true, isArchived: false },
      select: { id: true },
    });
    const activeIdsSet = new Set(activeServices.map(s => s.id));
    const normalizedServiceIds = serviceIds.filter(id => activeIdsSet.has(id));

    if (normalizedServiceIds.length === 0) {
      const payload: Payload = { masters: [], defaultMasterId: null };
      return NextResponse.json(payload);
    }

    // Требование "мастер покрывает все услуги"
    const andClauses = normalizedServiceIds.map(id => ({
      services: { some: { id } },
    }));

    const masters = await prisma.master.findMany({
      where: {
        AND: andClauses,
      },
      select: { 
        id: true, 
        name: true,
        avatarUrl: true,  // ✅ Добавили avatarUrl
      },
      orderBy: { name: 'asc' },
    });

    const payload: Payload = {
      masters,
      defaultMasterId: masters[0]?.id ?? null,
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}



//--------для аватара мастера с фильтром по услугам до этого работало
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type MasterDto = { id: string; name: string };
// type Payload = { masters: MasterDto[]; defaultMasterId: string | null };

// /**
//  * Возвращает мастеров, которые способны выполнить весь набор услуг.
//  * Поддерживает параметры:
//  *  - serviceIds: CSV или повторяющиеся query (?serviceIds=ID&serviceIds=ID2)
//  *  - serviceSlug: альтернативно, один slug услуги (совместимость)
//  */
// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);

//     // Сбор serviceIds из разных вариантов запроса
//     const fromCsv = (url.searchParams.get('serviceIds') || '')
//       .split(',')
//       .map(s => s.trim())
//       .filter(s => s.length > 0);

//     const repeated = url.searchParams.getAll('serviceIds')
//       .flatMap(s => s.split(',').map(x => x.trim()))
//       .filter(s => s.length > 0);

//     const serviceSlug = url.searchParams.get('serviceSlug')?.trim() || '';

//     let serviceIds: string[] = Array.from(new Set([...fromCsv, ...repeated]));

//     // Совместимость: один slug услуги
//     if (serviceIds.length === 0 && serviceSlug) {
//       const bySlug = await prisma.service.findUnique({
//         where: { slug: serviceSlug },
//         select: { id: true },
//       });
//       if (bySlug?.id) serviceIds = [bySlug.id];
//     }

//     // Если услуги не переданы — вернуть всех мастеров
//     if (serviceIds.length === 0) {
//       const all = await prisma.master.findMany({
//         // В схеме нет isActive, поэтому фильтр не ставим
//         select: { id: true, name: true },
//         orderBy: { name: 'asc' },
//       });
//       const payload: Payload = {
//         masters: all,
//         defaultMasterId: all[0]?.id ?? null,
//       };
//       return NextResponse.json(payload);
//     }

//     // Валидация услуг: берем только активные, неархивные
//     const activeServices = await prisma.service.findMany({
//       where: { id: { in: serviceIds }, isActive: true, isArchived: false },
//       select: { id: true },
//     });
//     const activeIdsSet = new Set(activeServices.map(s => s.id));
//     const normalizedServiceIds = serviceIds.filter(id => activeIdsSet.has(id));

//     if (normalizedServiceIds.length === 0) {
//       const payload: Payload = { masters: [], defaultMasterId: null };
//       return NextResponse.json(payload);
//     }

//     // Требование "мастер покрывает все услуги"
//     const andClauses = normalizedServiceIds.map(id => ({
//       services: { some: { id } },
//     }));

//     const masters = await prisma.master.findMany({
//       where: {
//         // isActive отсутствует в вашей модели -> не используем
//         AND: andClauses,
//       },
//       select: { id: true, name: true },
//       orderBy: { name: 'asc' },
//     });

//     const payload: Payload = {
//       masters,
//       defaultMasterId: masters[0]?.id ?? null,
//     };
//     return NextResponse.json(payload);
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: 'internal_error' }, { status: 500 });
//   }
// }






//-------------до 27.10
// // src/app/api/masters/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { withAdminRoute } from "@/lib/route-guards";

// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// /**
//  * GET /api/masters
//  * Параметры:
//  *   - serviceSlug: string | undefined  // slug или id услуги
//  *   - limit: number | undefined        // необязательно
//  *   - offset: number | undefined       // необязательно
//  *
//  * Логика:
//  *   1) Если задан serviceSlug, пытаемся отдать мастеров,
//  *      у которых среди активных услуг есть совпадение по slug или id.
//  *   2) Если ничего не найдено по привязке, отдаем общий список мастеров.
//  *   3) Если serviceSlug не задан, отдаем общий список мастеров.
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const serviceSlug = (searchParams.get("serviceSlug") || "").trim();

//     const limitRaw = searchParams.get("limit");
//     const offsetRaw = searchParams.get("offset");
//     const limit = limitRaw ? Math.max(0, Number(limitRaw)) : undefined;
//     const offset = offsetRaw ? Math.max(0, Number(offsetRaw)) : undefined;

//     const baseSelect = { id: true, name: true } as const;
//     const baseOrder = { name: "asc" as const };

//     async function getAllMasters() {
//       return prisma.master.findMany({
//         select: baseSelect,
//         orderBy: baseOrder,
//         take: limit,
//         skip: offset,
//       });
//     }

//     // Если передан ключ услуги, сначала пробуем выборку по связке
//     if (serviceSlug) {
//       const byService = await prisma.master.findMany({
//         where: {
//           services: {
//             some: {
//               isActive: true,
//               OR: [{ slug: serviceSlug }, { id: serviceSlug }],
//             },
//           },
//         },
//         select: baseSelect,
//         orderBy: baseOrder,
//         take: limit,
//         skip: offset,
//       });

//       const result = byService.length > 0 ? byService : await getAllMasters();

//       return NextResponse.json(result, {
//         status: 200,
//         headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//       });
//     }

//     // Иначе просто отдаем общий список
//     const list = await getAllMasters();
//     return NextResponse.json(list, {
//       status: 200,
//       headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//     });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     return NextResponse.json({ ok: false, error: message }, { status: 500 });
//   }
// }

// /* ───────────── MUTATIONS (ADMIN) ───────────── */
// /** ВАЖНО: тип Request, чтобы совпасть с сигнатурой withAdminRoute */
// async function postHandler(req: Request) {
//   try {
//     const data = await req.json();
//     const created = await prisma.master.create({ data });
//     return NextResponse.json(created, {
//       status: 201,
//       headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//     });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     return NextResponse.json({ ok: false, error: message }, { status: 400 });
//   }
// }

// export const POST = withAdminRoute(postHandler);




// // src/app/api/masters/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { withAdminRoute } from "@/lib/route-guards";

// // не кэшировать и гарантированно исполнять на Node
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// /**
//  * READ-ONLY:
//  * Если передан ?serviceSlug=xxx — вернуть только тех мастеров,
//  * у кого среди активных услуг есть подуслуга со слугом xxx.
//  * Иначе — вернуть общий список (лайтовые поля).
//  */
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const serviceSlug = searchParams.get("serviceSlug");

//     if (serviceSlug) {
//       const masters = await prisma.master.findMany({
//         where: {
//           services: {
//             some: {
//               slug: serviceSlug,
//               isActive: true,
//             },
//           },
//         },
//         select: { id: true, name: true },
//         orderBy: { name: "asc" },
//       });

//       return NextResponse.json(masters, {
//         headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//       });
//     }

//     const list = await prisma.master.findMany({
//       select: { id: true, name: true },
//       orderBy: { name: "asc" },
//     });

//     return NextResponse.json(list, {
//       headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//     });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     return NextResponse.json({ ok: false, error: message }, { status: 400 });
//   }
// }

// /* ───────────────────────── MUTATIONS (ADMIN) ───────────────────────── */
// /** ВАЖНО: тип Request, чтобы совпасть с сигнатурой withAdminRoute */
// async function postHandler(req: Request) {
//   try {
//     const data = await req.json();
//     const created = await prisma.master.create({ data });
//     return NextResponse.json(created);
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     return NextResponse.json({ ok: false, error: message }, { status: 400 });
//   }
// }

// export const POST = withAdminRoute(postHandler);




// // src/app/api/masters/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { withAdminRoute } from "@/lib/route-guards";

// /**
//  * READ-ONLY:
//  * Если передан ?serviceSlug=xxx — вернуть только тех мастеров,
//  * у кого среди активных услуг есть подуслуга со слугом xxx.
//  * Иначе — вернуть общий список (лайтовые поля).
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const serviceSlug = searchParams.get("serviceSlug");

//   if (serviceSlug) {
//     // Мастера, у которых в списке услуг есть указанная активная подуслуга
//     const masters = await prisma.master.findMany({
//       where: {
//         services: {
//           some: {
//             slug: serviceSlug,
//             isActive: true,
//           },
//         },
//       },
//       select: { id: true, name: true },
//       orderBy: { name: "asc" },
//     });
//     return NextResponse.json(masters);
//   }

//   // Без фильтра — минимальный публичный список
//   const list = await prisma.master.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: "asc" },
//   });

//   return NextResponse.json(list);
// }

// /* ───────────────────────── MUTATIONS (ADMIN) ───────────────────────── */

// async function postHandler(req: Request) {
//   const data = await req.json();
//   const created = await prisma.master.create({ data });
//   return NextResponse.json(created);
// }

// export const POST = withAdminRoute(postHandler);





//--------------работал до 25.10
// // src/app/api/masters/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { withAdminRoute } from "@/lib/route-guards";

// /**
//  * READ-ONLY:
//  * Если передан ?serviceSlug=xxx — вернуть только тех мастеров,
//  * у кого среди активных услуг есть подуслуга со слугом xxx.
//  * Иначе — вернуть общий список (лайтовые поля).
//  */
// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const serviceSlug: string | null = searchParams.get("serviceSlug");

//   if (serviceSlug) {
//     // Мастера, у которых в списке услуг есть указанная активная подуслуга
//     const masters = await prisma.master.findMany({
//       where: {
//         services: {
//           some: {
//             slug: serviceSlug,
//             isActive: true,
//           },
//         },
//       },
//       select: { id: true, name: true },
//       orderBy: { name: "asc" },
//     });
//     return NextResponse.json(masters);
//   }

//   // Без фильтра — минимальный публичный список
//   const list = await prisma.master.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: "asc" },
//   });
//   return NextResponse.json(list);
// }

// /* ───────────────────────── MUTATIONS (ADMIN) ───────────────────────── */

// async function postHandler(req: Request) {
//   const data = await req.json();
//   const created = await prisma.master.create({ data });
//   return NextResponse.json(created);
// }
// export const POST = withAdminRoute(postHandler);





// // src/app/api/masters/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { withAdminRoute } from "@/lib/route-guards";

// // READ-ONLY (список мастеров можно отдавать публично)
// export async function GET() {
//   const list = await prisma.master.findMany({
//     orderBy: { createdAt: "desc" },
//     select: { id: true, name: true, email: true, phone: true, userId: true },
//   });
//   return NextResponse.json(list);
// }

// // MUTATIONS (ADMIN)
// async function postHandler(req: Request) {
//   const data = await req.json();
//   const created = await prisma.master.create({ data });
//   return NextResponse.json(created);
// }
// export const POST = withAdminRoute(postHandler);






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
