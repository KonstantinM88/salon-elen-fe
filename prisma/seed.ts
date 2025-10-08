// prisma/seed.ts
import { PrismaClient, ArticleType } from '@prisma/client';
import { ensureServices as ensureServiceHierarchy } from './seed-services';

const prisma = new PrismaClient();

/** ───── Рабочие часы (0=Вс … 6=Сб) ───── */
async function ensureWorkingHours(): Promise<void> {
  const plan: ReadonlyArray<{
    weekday: number;
    isClosed: boolean;
    startMinutes: number;
    endMinutes: number;
  }> = [
    { weekday: 0, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Вс — выходной
    { weekday: 1, isClosed: false, startMinutes: 600, endMinutes: 1140 }, // Пн 10:00-19:00
    { weekday: 2, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 3, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 4, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 5, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 6, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Сб — выходной (пример)
  ];

  for (const p of plan) {
    await prisma.workingHours.upsert({
      where: { weekday: p.weekday },
      update: {
        isClosed: p.isClosed,
        startMinutes: p.startMinutes,
        endMinutes: p.endMinutes,
      },
      create: {
        weekday: p.weekday,
        isClosed: p.isClosed,
        startMinutes: p.startMinutes,
        endMinutes: p.endMinutes,
      },
    });
  }
}

/** ───── Пример статей ───── */
async function demoArticles(): Promise<void> {
  const items: ReadonlyArray<{
    slug: string;
    title: string;
    excerpt: string;
    cover: string;
    type: ArticleType;
    content: string;
    publishedAt: Date;
  }> = [
    {
      slug: 'welcome-to-salon-elen',
      title: 'Добро пожаловать в Salon Elen',
      excerpt: 'Мы открылись! Красота и уход в самом центре Halle.',
      cover: '/images/hero.webp',
      type: ArticleType.NEWS,
      content: 'Первый пост о салоне.',
      publishedAt: new Date(),
    },
  ];

  for (const a of items) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        cover: a.cover,
        type: a.type,
        content: a.content,
        publishedAt: a.publishedAt,
      },
      create: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        cover: a.cover,
        type: a.type,
        content: a.content,
        publishedAt: a.publishedAt,
      },
    });
  }
}

export default async function seed(): Promise<void> {
  try {
    await ensureWorkingHours();
    // ⬇️ Иерархические категории + подуслуги из prisma/seed-services.ts
    await ensureServiceHierarchy();
    await demoArticles();
  } finally {
    await prisma.$disconnect();
  }
}
















// // prisma/seed.ts
// import { PrismaClient } from "@prisma/client";
// import { ensureServices } from "./seed-services";

// const prisma = new PrismaClient();

// /** ───── Рабочие часы (0=Вс … 6=Сб) ───── */
// async function ensureWorkingHours(): Promise<void> {
//   const plan: ReadonlyArray<{
//     weekday: number;
//     isClosed: boolean;
//     startMinutes: number;
//     endMinutes: number;
//   }> = [
//     { weekday: 0, isClosed: true, startMinutes: 0, endMinutes: 0 }, // Вс — выходной
//     { weekday: 1, isClosed: false, startMinutes: 600, endMinutes: 1140 }, // Пн 10:00-19:00
//     { weekday: 2, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 3, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 4, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 5, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 6, isClosed: true, startMinutes: 0, endMinutes: 0 }, // Сб — выходной (пример)
//   ];

//   for (const p of plan) {
//     await prisma.workingHours.upsert({
//       where: { weekday: p.weekday },
//       update: {
//         isClosed: p.isClosed,
//         startMinutes: p.startMinutes,
//         endMinutes: p.endMinutes,
//       },
//       create: {
//         weekday: p.weekday,
//         isClosed: p.isClosed,
//         startMinutes: p.startMinutes,
//         endMinutes: p.endMinutes,
//       },
//     });
//   }
// }

// await ensureServices();
// /** ───── Услуги ───── */
// async function ensureServices(): Promise<void> {
//   const services: ReadonlyArray<{
//     slug: string;
//     name: string;
//     durationMin: number;
//     priceCents: number;
//     isActive: boolean;
//   }> = [
//     {
//       slug: "haircut",
//       name: "Стрижка",
//       durationMin: 60,
//       priceCents: 4500,
//       isActive: true,
//     },
//     {
//       slug: "manicure",
//       name: "Маникюр",
//       durationMin: 60,
//       priceCents: 3500,
//       isActive: true,
//     },
//     {
//       slug: "makeup",
//       name: "Макияж",
//       durationMin: 90,
//       priceCents: 6500,
//       isActive: true,
//     },
//   ];

//   for (const s of services) {
//     await prisma.service.upsert({
//       where: { slug: s.slug },
//       update: {
//         name: s.name,
//         durationMin: s.durationMin,
//         priceCents: s.priceCents,
//         isActive: s.isActive,
//       },
//       create: {
//         slug: s.slug,
//         name: s.name,
//         durationMin: s.durationMin,
//         priceCents: s.priceCents,
//         isActive: s.isActive,
//       },
//     });
//   }
// }

// /** ───── Пример статей ───── */
// async function demoArticles(): Promise<void> {
//   // Использую твой enum ArticleType с вариантами ARTICLE/NEWS
//   const items: ReadonlyArray<{
//     slug: string;
//     title: string;
//     excerpt: string;
//     cover: string;
//     type: "ARTICLE" | "NEWS";
//     content: string;
//     publishedAt: Date;
//   }> = [
//     {
//       slug: "welcome-to-salon-elen",
//       title: "Добро пожаловать в Salon Elen",
//       excerpt: "Мы открылись! Красота и уход в самом центре Halle.",
//       cover: "/images/hero.webp",
//       type: "NEWS",
//       content: "Первый пост о салоне.",
//       publishedAt: new Date(),
//     },
//   ];

//   for (const a of items) {
//     await prisma.article.upsert({
//       where: { slug: a.slug },
//       update: {
//         title: a.title,
//         excerpt: a.excerpt,
//         cover: a.cover,
//         type: a.type,
//         content: a.content,
//         publishedAt: a.publishedAt,
//       },
//       create: {
//         slug: a.slug,
//         title: a.title,
//         excerpt: a.excerpt,
//         cover: a.cover,
//         type: a.type,
//         content: a.content,
//         publishedAt: a.publishedAt,
//       },
//     });
//   }
// }

// export default async function seed(): Promise<void> {
//   await ensureWorkingHours();
//   await ensureServices();
//   await demoArticles();
//   await prisma.$disconnect();
// }
