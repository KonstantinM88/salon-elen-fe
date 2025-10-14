// src/app/api/articles/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { articleInput } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ArticleType } from "@prisma/client";
import { Prisma } from "@prisma/client";

/* ───────── helpers ───────── */

function toDateOrNull(v: string | null | undefined): Date | null {
  return v ? new Date(v) : null;
}

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

type RouteParams = { params: { id: string } };

/* ───────── GET /api/articles/[id] ─────────
   Публично: отдаём запись как есть (для админки/превью).
*/
export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const item = await prisma.article.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

/* ───────── PATCH /api/articles/[id] ─────────
   Только ADMIN: валидируем payload, приводим даты и тип.
*/
export async function PATCH(req: Request, { params }: RouteParams) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const parsed = articleInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const p = parsed.data;

  const data = {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt ?? null,
    cover: p.cover ?? null,
    // Мэппинг: body (DTO) -> content (DB)
    content: p.body ?? null,
    type: p.type as ArticleType, // привести к enum Prisma
    publishedAt: toDateOrNull(p.publishedAt),
    expiresAt: toDateOrNull(p.expiresAt),
  };

  try {
    const updated = await prisma.article.update({
      where: { id },
      data,
      select: { id: true },
    });
    return NextResponse.json({ id: updated.id });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (err.code === "P2002") {
        // конфликт уникальности (например, slug)
        return NextResponse.json({ error: "Unique constraint failed" }, { status: 409 });
      }
    }
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(err) : "Update failed" },
      { status: 500 }
    );
  }
}

/* ───────── DELETE /api/articles/[id] ─────────
   Только ADMIN: удаляем по id.
*/
export async function DELETE(_req: Request, { params }: RouteParams) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? String(err) : "Delete failed" },
      { status: 500 }
    );
  }
}






// // src/app/api/articles/[id]/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { articleInput } from "@/lib/validators";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import type { Role, ArticleType } from "@prisma/client";

// /* ───────── helpers ───────── */

// function toDateOrNull(v: string | null | undefined): Date | null {
//   return v ? new Date(v) : null;
// }

// async function ensureAdmin(): Promise<void> {
//   const session = await getServerSession(authOptions);
//   const role = session?.user?.role as Role | undefined;
//   if (role !== "ADMIN") {
//     throw new Response("Forbidden", { status: 403 });
//   }
// }

// type RouteParams = { params: { id: string } };

// /* ───────── GET /api/articles/[id] ─────────
//    Публично: отдаём запись как есть (для админки/превью).
// */
// export async function GET(_req: Request, { params }: RouteParams) {
//   const { id } = params;
//   if (!id) {
//     return NextResponse.json({ error: "Missing id" }, { status: 400 });
//   }

//   const item = await prisma.article.findUnique({ where: { id } });
//   if (!item) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   return NextResponse.json(item);
// }

// /* ───────── PATCH /api/articles/[id] ─────────
//    Только ADMIN: валидируем payload, приводим даты и тип.
// */
// export async function PATCH(req: Request, { params }: RouteParams) {
//   try {
//     await ensureAdmin();
//   } catch (e) {
//     if (e instanceof Response) return e;
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { id } = params;
//   if (!id) {
//     return NextResponse.json({ error: "Missing id" }, { status: 400 });
//   }

//   let json: unknown;
//   try {
//     json = await req.json();
//   } catch {
//     return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
//   }

//   const parsed = articleInput.safeParse(json);
//   if (!parsed.success) {
//     return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
//   }

//   const p = parsed.data;

//   const data = {
//     title: p.title,
//     slug: p.slug,
//     excerpt: p.excerpt ?? null,
//     cover: p.cover ?? null,
//     content: p.body ?? null,
//     type: p.type as ArticleType, // привели к enum Prisma
//     publishedAt: toDateOrNull(p.publishedAt),
//     expiresAt: toDateOrNull(p.expiresAt),
//   };

//   try {
//     const updated = await prisma.article.update({
//       where: { id },
//       data,
//       select: { id: true },
//     });
//     return NextResponse.json({ id: updated.id });
//   } catch (err) {
//     // Может быть уникальный конфликт по slug и т.п.
//     return NextResponse.json(
//       { error: process.env.NODE_ENV === "development" ? String(err) : "Update failed" },
//       { status: 400 }
//     );
//   }
// }

// /* ───────── DELETE /api/articles/[id] ─────────
//    Только ADMIN: удаляем по id.
// */
// export async function DELETE(_req: Request, { params }: RouteParams) {
//   try {
//     await ensureAdmin();
//   } catch (e) {
//     if (e instanceof Response) return e;
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }

//   const { id } = params;
//   if (!id) {
//     return NextResponse.json({ error: "Missing id" }, { status: 400 });
//   }

//   try {
//     await prisma.article.delete({ where: { id } });
//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     return NextResponse.json(
//       { error: process.env.NODE_ENV === "development" ? String(err) : "Delete failed" },
//       { status: 400 }
//     );
//   }
// }





//-----------работа с удалением статей временно отключена, чтобы не сломать сайт-----------//
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { articleInput } from "@/lib/validators";
// import type { $Enums } from "@prisma/client";

// type Params = { params: Promise<{ id: string }> };

// // GET /api/articles/[id]
// export async function GET(_req: Request, { params }: Params) {
//   const { id } = await params;
//   const item = await prisma.article.findUnique({ where: { id } });
//   if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(item);
// }

// // PATCH /api/articles/[id]
// export async function PATCH(req: Request, { params }: Params) {
//   const { id } = await params;
//   const json = await req.json();
//   const parsed = articleInput.safeParse(json);
//   if (!parsed.success) {
//     return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
//   }

//   const data = {
//     ...parsed.data,
//     type: parsed.data.type as $Enums.ArticleType,
//     publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
//     expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
//   };

//   const updated = await prisma.article.update({
//     where: { id },
//     data,
//     select: { id: true },
//   });

//   return NextResponse.json({ id: updated.id });
// }

// // DELETE /api/articles/[id]
// export async function DELETE(_req: Request, { params }: Params) {
//   const { id } = await params;
//   await prisma.article.delete({ where: { id } });
//   return NextResponse.json({ ok: true });
// }
