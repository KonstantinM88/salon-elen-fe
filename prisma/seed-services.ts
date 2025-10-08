import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type Leaf = {
  slug: string;
  name: string;
  description?: string | null;
  durationMin: number;
  priceCents: number | null;
  isActive: boolean;
};

type Category = Omit<Leaf, 'priceCents' | 'durationMin'> & {
  durationMin: 0;
  priceCents: null;
  children: Leaf[];
};

export async function ensureServices(): Promise<void> {
  const plan: ReadonlyArray<Category> = [
    {
      slug: 'haircut',
      name: 'Стрижка',
      description: 'Все виды стрижек и уход.',
      durationMin: 0,
      priceCents: null,
      isActive: true,
      children: [
        { slug: 'haircut-men', name: 'Мужская', description: 'Классика и современные стили.', durationMin: 45, priceCents: 3000, isActive: true },
        { slug: 'haircut-women', name: 'Женская', description: 'Подберём идеальную форму.', durationMin: 60, priceCents: 4500, isActive: true },
        { slug: 'hair-coloring', name: 'Покраска', description: 'Окрашивание и тонирование.', durationMin: 90, priceCents: 7500, isActive: true },
      ],
    },
    {
      slug: 'manicure',
      name: 'Маникюр',
      description: 'Уход и укрепление ногтей.',
      durationMin: 0,
      priceCents: null,
      isActive: true,
      children: [
        { slug: 'manicure-classic', name: 'Обычный', description: 'Классический уход.', durationMin: 60, priceCents: 3500, isActive: true },
        { slug: 'manicure-extensions', name: 'Наращивание', description: 'Длина и форма по желанию.', durationMin: 120, priceCents: 7000, isActive: true },
        { slug: 'manicure-japanese', name: 'Японский', description: 'Натуральное укрепление.', durationMin: 75, priceCents: 4200, isActive: true },
      ],
    },
  ];

  for (const cat of plan) {
    const parent = await prisma.service.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description ?? null,
        durationMin: 0,
        priceCents: null,
        isActive: cat.isActive,
        parentId: null,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description ?? null,
        durationMin: 0,
        priceCents: null,
        isActive: cat.isActive,
        parentId: null,
      },
      select: { id: true, slug: true },
    });

    for (const ch of cat.children) {
      await prisma.service.upsert({
        where: { slug: ch.slug },
        update: {
          name: ch.name,
          description: ch.description ?? null,
          durationMin: ch.durationMin,
          priceCents: ch.priceCents,
          isActive: ch.isActive,
          parentId: parent.id,
        },
        create: {
          slug: ch.slug,
          name: ch.name,
          description: ch.description ?? null,
          durationMin: ch.durationMin,
          priceCents: ch.priceCents,
          isActive: ch.isActive,
          parentId: parent.id,
        },
      });
    }
  }
}
