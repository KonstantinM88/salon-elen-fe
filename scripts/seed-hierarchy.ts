// scripts/seed-hierarchy.ts
import { PrismaClient } from '@prisma/client';
import { ensureServices as ensureServiceHierarchy } from '../prisma/seed-services';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await ensureServiceHierarchy();

  // мини-проверка: вывести категории и детей
  const cats = await prisma.service.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: {
      name: true,
      children: { select: { slug: true, name: true, durationMin: true, priceCents: true } },
    },
  });

  for (const c of cats) {
    console.log(`\n[${c.name}]`);
    if (!c.children.length) console.log('  (нет подуслуг)');
    for (const s of c.children) {
      console.log(`  - ${s.name} [${s.slug}] ${s.durationMin} мин, €${(s.priceCents ?? 0) / 100}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
