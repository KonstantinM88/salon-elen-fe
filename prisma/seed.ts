// prisma/seed.ts
import { PrismaClient, ArticleType, AppointmentStatus } from '@prisma/client';
import { ensureServices as ensureServiceHierarchy } from './seed-services';

const prisma = new PrismaClient();

/** ───── Хелперы дат/времени ───── */
function atUTC(date: Date, hour: number, minute: number): Date {
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hour,
    minute,
    0,
    0
  ));
  return d;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** next weekday: 0=Sun..6=Sat */
function nextWeekday(from: Date, weekday: number): Date {
  const result = new Date(from);
  const current = result.getUTCDay();
  let diff = (weekday + 7 - current) % 7;
  if (diff === 0) diff = 7; // strictly next (не сегодня)
  return addDays(result, diff);
}

/** previous weekday: 0=Sun..6=Sat */
function prevWeekday(from: Date, weekday: number): Date {
  const result = new Date(from);
  const current = result.getUTCDay();
  let diff = (current + 7 - weekday) % 7;
  if (diff === 0) diff = 7; // strictly previous (не сегодня)
  return addDays(result, -diff);
}

/** ───── Глобальные рабочие часы салона (0=Вс … 6=Сб) ───── */
async function ensureWorkingHours(): Promise<void> {
  console.log('→ [WorkingHours] upsert...');
  const plan: ReadonlyArray<{
    weekday: number;
    isClosed: boolean;
    startMinutes: number;
    endMinutes: number;
  }> = [
    { weekday: 0, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Вс — выходной
    { weekday: 1, isClosed: false, startMinutes: 600, endMinutes: 1140 }, // Пн 10:00–19:00
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

/** ───── Новости/контент (минимум) ───── */
async function demoArticles(): Promise<void> {
  console.log('→ [Articles] upsert demo...');
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

/** ───── Клиенты ───── */
async function ensureClients() {
  console.log('→ [Clients] upsert...');
  const clients = [
    {
      name: 'Мария Смирнова',
      phone: '+49 160 0000001',
      email: 'maria@example.com',
      birthDate: new Date(Date.UTC(1992, 4, 12)), // 12.05.1992
      referral: 'Instagram',
      notes: 'Предпочитает безнал.',
    },
    {
      name: 'Ольга Иванова',
      phone: '+49 160 0000002',
      email: 'olga@example.com',
      birthDate: new Date(Date.UTC(1988, 10, 3)), // 03.11.1988
      referral: 'Сарафан',
      notes: null as string | null,
    },
  ] as const;

  for (const c of clients) {
    await prisma.client.upsert({
      where: { email: c.email },
      update: {
        name: c.name,
        phone: c.phone,
        birthDate: c.birthDate,
        referral: c.referral ?? undefined,
        notes: c.notes ?? undefined,
      },
      create: {
        name: c.name,
        phone: c.phone,
        email: c.email,
        birthDate: c.birthDate,
        referral: c.referral ?? undefined,
        notes: c.notes ?? undefined,
      },
    });
  }

  const all = await prisma.client.findMany({ orderBy: { createdAt: 'asc' } });
  return all;
}

/** ───── Мастера + связь с услугами ───── */
type SeededMaster = {
  id: string;
  name: string;
  email: string;
};

async function ensureMasters(): Promise<SeededMaster[]> {
  console.log('→ [Masters] upsert...');
  const masters = [
    {
      name: 'Елена Петрова',
      email: 'master.elena@example.com',
      phone: '+49 160 1000001',
      birthDate: new Date(Date.UTC(1990, 1, 15)), // 15.02.1990
      bio: 'Парикмахер-стилист. Женские стрижки и укладки.',
    },
    {
      name: 'Анна Кузнецова',
      email: 'master.anna@example.com',
      phone: '+49 160 1000002',
      birthDate: new Date(Date.UTC(1994, 7, 22)), // 22.08.1994
      bio: 'Мастер маникюра/педикюра. Аппаратный маникюр, покрытие гель-лак.',
    },
  ] as const;

  // Подтянем несколько активных услуг (листья/или любые активные)
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, slug: true },
    orderBy: { createdAt: 'asc' },
    take: 6,
  });

  const pick = (offset: number, count: number) =>
    services.slice(offset, offset + count).map((s) => ({ id: s.id }));

  const results: SeededMaster[] = [];

  for (let i = 0; i < masters.length; i++) {
    const m = masters[i];
    const created = await prisma.master.upsert({
      where: { email: m.email },
      update: {
        name: m.name,
        phone: m.phone,
        birthDate: m.birthDate,
        bio: m.bio,
      },
      create: {
        name: m.name,
        email: m.email,
        phone: m.phone,
        birthDate: m.birthDate,
        bio: m.bio,
      },
    });

    // Привяжем 2–3 услуги каждому мастеру (idempotent: set = выбранные)
    const connectServices = pick(i * 2, 2).length > 0 ? pick(i * 2, 2) : services.slice(0, 2).map(s => ({ id: s.id }));
    await prisma.master.update({
      where: { id: created.id },
      data: {
        services: {
          set: connectServices,
        },
      },
    });

    results.push({ id: created.id, name: created.name, email: created.email });
  }

  return results;
}

/** ───── Персональные рабочие часы мастеров ───── */
async function ensureMasterWorkingHours(masterId: string): Promise<void> {
  const plan: ReadonlyArray<{
    weekday: number;
    isClosed: boolean;
    startMinutes: number;
    endMinutes: number;
  }> = [
    { weekday: 0, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Вс — выходной
    { weekday: 1, isClosed: false, startMinutes: 600, endMinutes: 1140 }, // Пн 10:00–19:00
    { weekday: 2, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 3, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 4, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 5, isClosed: false, startMinutes: 600, endMinutes: 1140 },
    { weekday: 6, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Сб — выходной
  ];

  for (const p of plan) {
    await prisma.masterWorkingHours.upsert({
      where: { masterId_weekday: { masterId, weekday: p.weekday } },
      update: {
        isClosed: p.isClosed,
        startMinutes: p.startMinutes,
        endMinutes: p.endMinutes,
      },
      create: {
        masterId,
        weekday: p.weekday,
        isClosed: p.isClosed,
        startMinutes: p.startMinutes,
        endMinutes: p.endMinutes,
      },
    });
  }
}

/** ───── Исключения/выходные мастера ───── */
async function ensureMasterTimeOff(masterId: string): Promise<void> {
  // Пример: ближайшее воскресенье — выходной 00:00–24:00 (минуты 0–1440)
  const now = new Date();
  const nextSunday = nextWeekday(now, 0);
  const dateOnly = new Date(Date.UTC(
    nextSunday.getUTCFullYear(),
    nextSunday.getUTCMonth(),
    nextSunday.getUTCDate(), 0, 0, 0, 0
  ));

  const existed = await prisma.masterTimeOff.findFirst({
    where: {
      masterId,
      date: dateOnly,
      startMinutes: 0,
      endMinutes: 1440,
    },
  });

  if (!existed) {
    await prisma.masterTimeOff.create({
      data: {
        masterId,
        date: dateOnly,
        startMinutes: 0,
        endMinutes: 1440,
        reason: 'Выходной (seed)',
      },
    });
  }
}

/** ───── Заявки (привязка к мастерам/клиентам/услугам) ───── */
async function ensureAppointments(seededMasters: SeededMaster[], clientsEmails: string[]) {
  console.log('→ [Appointments] upsert...');
  const clients = await prisma.client.findMany({
    where: { email: { in: clientsEmails } },
    select: { id: true, email: true, name: true, phone: true },
  });

  for (const m of seededMasters) {
    // Возьмём любую услугу, привязанную мастеру
    const masterWithServices = await prisma.master.findUnique({
      where: { id: m.id },
      include: { services: { take: 1 } },
    });
    if (!masterWithServices || masterWithServices.services.length === 0) continue;

    const service = await prisma.service.findUnique({
      where: { id: masterWithServices.services[0].id },
      select: { id: true, durationMin: true },
    });
    if (!service) continue;

    const duration = service.durationMin;

    // Клиенты для распределения
    const c1 = clients[0];
    const c2 = clients[1] ?? clients[0];

    const now = new Date();

    // Будущая CONFIRMED: следующий понедельник 10:00
    const nextMon = nextWeekday(now, 1);
    const startFuture = atUTC(nextMon, 10, 0);
    const endFuture = addDays(startFuture, 0);
    endFuture.setUTCMinutes(endFuture.getUTCMinutes() + duration);

    await prisma.appointment.upsert({
      where: {
        serviceId_startAt: {
          serviceId: service.id,
          startAt: startFuture,
        },
      },
      update: {
        masterId: m.id,
        clientId: c1?.id,
        endAt: endFuture,
        customerName: c1?.name ?? 'Гость',
        phone: c1?.phone ?? '+49 160 999999',
        email: c1?.email ?? null,
        notes: 'Будущая запись (seed)',
        status: AppointmentStatus.CONFIRMED,
      },
      create: {
        serviceId: service.id,
        masterId: m.id,
        clientId: c1?.id ?? null,
        startAt: startFuture,
        endAt: endFuture,
        customerName: c1?.name ?? 'Гость',
        phone: c1?.phone ?? '+49 160 999999',
        email: c1?.email ?? null,
        notes: 'Будущая запись (seed)',
        status: AppointmentStatus.CONFIRMED,
      },
    });

    // Прошлая DONE: прошлый понедельник 11:30
    const prevMon = prevWeekday(now, 1);
    const startPast = atUTC(prevMon, 11, 30);
    const endPast = addDays(startPast, 0);
    endPast.setUTCMinutes(endPast.getUTCMinutes() + duration);

    await prisma.appointment.upsert({
      where: {
        serviceId_startAt: {
          serviceId: service.id,
          startAt: startPast,
        },
      },
      update: {
        masterId: m.id,
        clientId: c2?.id,
        endAt: endPast,
        customerName: c2?.name ?? 'Гость',
        phone: c2?.phone ?? '+49 160 999998',
        email: c2?.email ?? null,
        notes: 'Прошлая запись (seed)',
        status: AppointmentStatus.DONE,
      },
      create: {
        serviceId: service.id,
        masterId: m.id,
        clientId: c2?.id ?? null,
        startAt: startPast,
        endAt: endPast,
        customerName: c2?.name ?? 'Гость',
        phone: c2?.phone ?? '+49 160 999998',
        email: c2?.email ?? null,
        notes: 'Прошлая запись (seed)',
        status: AppointmentStatus.DONE,
      },
    });

    // Пример отменённой: следующий вторник 12:00 (для разнообразия)
    const nextTue = nextWeekday(now, 2);
    const startCanceled = atUTC(nextTue, 12, 0);
    const endCanceled = addDays(startCanceled, 0);
    endCanceled.setUTCMinutes(endCanceled.getUTCMinutes() + duration);

    await prisma.appointment.upsert({
      where: {
        serviceId_startAt: {
          serviceId: service.id,
          startAt: startCanceled,
        },
      },
      update: {
        masterId: m.id,
        clientId: c1?.id,
        endAt: endCanceled,
        customerName: c1?.name ?? 'Гость',
        phone: c1?.phone ?? '+49 160 999997',
        email: c1?.email ?? null,
        notes: 'Отменено (seed)',
        status: AppointmentStatus.CANCELED,
      },
      create: {
        serviceId: service.id,
        masterId: m.id,
        clientId: c1?.id ?? null,
        startAt: startCanceled,
        endAt: endCanceled,
        customerName: c1?.name ?? 'Гость',
        phone: c1?.phone ?? '+49 160 999997',
        email: c1?.email ?? null,
        notes: 'Отменено (seed)',
        status: AppointmentStatus.CANCELED,
      },
    });
  }
}

/** ───── Точка входа ───── */
export default async function seed(): Promise<void> {
  try {
    console.log('⏳ Seeding start');

    // 1) Глобальный календарь салона
    await ensureWorkingHours();

    // 2) Иерархия услуг (категории/подуслуги)
    console.log('→ [Services] ensure hierarchy...');
    await ensureServiceHierarchy();

    // 3) Новости/контент (пример)
    await demoArticles();

    // 4) Клиенты
    const clients = await ensureClients();

    // 5) Мастера + их услуги
    const seededMasters = await ensureMasters();

    // 6) Персональные графики мастеров
    console.log('→ [MasterWorkingHours] upsert...');
    for (const m of seededMasters) {
      await ensureMasterWorkingHours(m.id);
    }

    // 7) Пример выходного у одного мастера
    console.log('→ [MasterTimeOff] ensure example day off for first master...');
    if (seededMasters[0]) {
      await ensureMasterTimeOff(seededMasters[0].id);
    }

    // 8) Заявки
    await ensureAppointments(seededMasters, clients.map((c) => c.email));

    console.log('✅ Seeding done');
  } catch (e) {
    console.error('❌ Seeding error:', e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}





// // prisma/seed.ts
// import { PrismaClient, ArticleType } from '@prisma/client';
// import { ensureServices as ensureServiceHierarchy } from './seed-services';

// const prisma = new PrismaClient();

// /** ───── Рабочие часы (0=Вс … 6=Сб) ───── */
// async function ensureWorkingHours(): Promise<void> {
//   const plan: ReadonlyArray<{
//     weekday: number;
//     isClosed: boolean;
//     startMinutes: number;
//     endMinutes: number;
//   }> = [
//     { weekday: 0, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Вс — выходной
//     { weekday: 1, isClosed: false, startMinutes: 600, endMinutes: 1140 }, // Пн 10:00-19:00
//     { weekday: 2, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 3, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 4, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 5, isClosed: false, startMinutes: 600, endMinutes: 1140 },
//     { weekday: 6, isClosed: true,  startMinutes: 0,   endMinutes: 0   }, // Сб — выходной (пример)
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

// /** ───── Пример статей ───── */
// async function demoArticles(): Promise<void> {
//   const items: ReadonlyArray<{
//     slug: string;
//     title: string;
//     excerpt: string;
//     cover: string;
//     type: ArticleType;
//     content: string;
//     publishedAt: Date;
//   }> = [
//     {
//       slug: 'welcome-to-salon-elen',
//       title: 'Добро пожаловать в Salon Elen',
//       excerpt: 'Мы открылись! Красота и уход в самом центре Halle.',
//       cover: '/images/hero.webp',
//       type: ArticleType.NEWS,
//       content: 'Первый пост о салоне.',
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
//   try {
//     await ensureWorkingHours();
//     // ⬇️ Иерархические категории + подуслуги из prisma/seed-services.ts
//     await ensureServiceHierarchy();
//     await demoArticles();
//   } finally {
//     await prisma.$disconnect();
//   }
// }
















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
