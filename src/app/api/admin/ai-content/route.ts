// src/app/api/admin/ai-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  listBlocks, createBlock, updateBlock, deleteBlock,
  publishBlock, toggleBlock, seedFromKnowledge,
  listSvcConfigs, upsertSvcConfig, invalidateContentCache,
} from '@/lib/ai/ai-content';

async function isAdmin() {
  const s = await getServerSession(authOptions);
  return s?.user && (s.user as { role?: string }).role === 'ADMIN';
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const type = new URL(req.url).searchParams.get('type');

  if (type === 'services') {
    const [configs, services] = await Promise.all([
      listSvcConfigs(),
      prisma.service.findMany({
        where: { isActive: true, isArchived: false },
        select: { id: true, name: true, slug: true, parentId: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    return NextResponse.json({ configs, services });
  }

  const blocks = await listBlocks();
  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const action = new URL(req.url).searchParams.get('action');
  const id = new URL(req.url).searchParams.get('id');

  if (action === 'seed') {
    const count = await seedFromKnowledge();
    return NextResponse.json({ ok: true, seeded: count });
  }
  if (action === 'publish' && id) {
    return NextResponse.json({ ok: true, block: await publishBlock(id) });
  }
  if (action === 'toggle' && id) {
    const enabled = new URL(req.url).searchParams.get('enabled') === 'true';
    return NextResponse.json({ ok: true, block: await toggleBlock(id, enabled) });
  }
  if (action === 'service-config') {
    const body = await req.json();
    const { serviceId, ...data } = body;
    return NextResponse.json({ ok: true, config: await upsertSvcConfig(serviceId, data) });
  }
  if (action === 'invalidate-cache') {
    invalidateContentCache();
    return NextResponse.json({ ok: true });
  }

  const body = await req.json();
  return NextResponse.json({ ok: true, block: await createBlock(body) });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const body = await req.json();
  return NextResponse.json({ ok: true, block: await updateBlock(id, body) });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteBlock(id);
  return NextResponse.json({ ok: true });
}
