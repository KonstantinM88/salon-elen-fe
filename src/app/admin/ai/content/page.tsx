// src/app/admin/ai/content/page.tsx
import { prisma } from '@/lib/db';
import { resolveContentLocale } from '@/lib/seo-locale-server';
import AiContentClient from '../_components/AiContentClient';

export const dynamic = 'force-dynamic';

export default async function AiContentPage() {
  const locale = await resolveContentLocale();

  const [blocks, services, configs] = await Promise.all([
    prisma.aiContentBlock.findMany({
      orderBy: [{ context: 'asc' }, { priority: 'desc' }, { key: 'asc' }],
    }),
    prisma.service.findMany({
      where: { isActive: true, isArchived: false },
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: { name: 'asc' },
    }),
    prisma.aiServiceConfig.findMany({ orderBy: { aiOrder: 'asc' } }),
  ]);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <AiContentClient
        locale={locale}
        initialBlocks={blocks.map((b) => ({
          ...b,
          publishedAt: b.publishedAt?.toISOString() || null,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        }))}
        services={services.map((s) => ({
          id: s.id, name: s.name, slug: s.slug, isParent: !s.parentId,
        }))}
        initialConfigs={configs.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
