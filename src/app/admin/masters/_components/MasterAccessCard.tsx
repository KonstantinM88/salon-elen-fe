// src/app/admin/masters/_components/MasterAccessCard.tsx
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { changeMasterPassword } from '../[id]/actions';
import { ShieldCheck, Mail, User2, KeyRound, Link2 } from 'lucide-react';
import { requireRole } from '@/lib/rbac-guards';
import { MasterAccessCardClient } from './MasterAccessCardClient';

export default async function MasterAccessCard({
  masterId,
}: {
  masterId: string;
}) {
  await requireRole(['ADMIN'] as const);

  const master = await prisma.master.findUnique({
    where: { id: masterId },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { id: true, email: true } },
    },
  });

  const hasLogin = Boolean(master?.userId);
  const email = master?.user?.email ?? null;

  return (
    <MasterAccessCardClient
      masterId={masterId}
      hasLogin={hasLogin}
      email={email}
      action={changeMasterPassword}
    />
  );
}
