// Middleware для проверки дубликатов при создании клиента
// src/lib/client-duplicate-check.ts

import { prisma } from "@/lib/db";

// ✅ Строгие типы без any
type ClientBasicInfo = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

type DeletedClientInfo = ClientBasicInfo & {
  deletedAt: Date;
};

type ConflictType = 'phone' | 'email' | 'both';

type DuplicateCheckResult = {
  hasActiveDuplicate: boolean;
  hasDeletedDuplicate: boolean;
  activeClient?: ClientBasicInfo;
  deletedClient?: DeletedClientInfo;
  conflictType?: ConflictType;
};

export async function checkClientDuplicates(
  phone: string,
  email: string
): Promise<DuplicateCheckResult> {
  
  // Проверяем активных клиентов по телефону
  const activeByPhone = await prisma.client.findFirst({
    where: {
      phone,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  });

  // Проверяем активных клиентов по email
  const activeByEmail = await prisma.client.findFirst({
    where: {
      email,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  });

  // Если есть активный дубликат
  if (activeByPhone || activeByEmail) {
    const client = activeByPhone || activeByEmail!;
    
    let conflictType: ConflictType;
    if (activeByPhone && activeByEmail) {
      conflictType = 'both';
    } else if (activeByPhone) {
      conflictType = 'phone';
    } else {
      conflictType = 'email';
    }

    return {
      hasActiveDuplicate: true,
      hasDeletedDuplicate: false,
      activeClient: client,
      conflictType,
    };
  }

  // Проверяем удалённых клиентов по телефону
  const deletedByPhone = await prisma.client.findFirst({
    where: {
      phone,
      deletedAt: { not: null },
    },
    orderBy: { deletedAt: 'desc' },  // Самый недавно удалённый
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      deletedAt: true,
    },
  });

  // Проверяем удалённых клиентов по email
  const deletedByEmail = await prisma.client.findFirst({
    where: {
      email,
      deletedAt: { not: null },
    },
    orderBy: { deletedAt: 'desc' },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      deletedAt: true,
    },
  });

  // Если есть удалённый дубликат
  if (deletedByPhone || deletedByEmail) {
    const client = deletedByPhone || deletedByEmail!;
    
    let conflictType: ConflictType;
    if (deletedByPhone && deletedByEmail) {
      conflictType = 'both';
    } else if (deletedByPhone) {
      conflictType = 'phone';
    } else {
      conflictType = 'email';
    }

    // Приводим к правильному типу
    const deletedClient: DeletedClientInfo = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      deletedAt: client.deletedAt!,  // Мы знаем что он не null
    };

    return {
      hasActiveDuplicate: false,
      hasDeletedDuplicate: true,
      deletedClient,
      conflictType,
    };
  }

  // Нет дубликатов
  return {
    hasActiveDuplicate: false,
    hasDeletedDuplicate: false,
  };
}