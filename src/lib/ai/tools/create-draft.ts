// src/lib/ai/tools/create-draft.ts

import { prisma } from '@/lib/prisma';

interface Args {
  serviceId: string;
  masterId: string;
  startAt: string;
  endAt: string;
  customerName: string;
  phone?: string;
  email: string;
  birthDate?: string;
  notes?: string;
  locale: string;
}

const RU_TO_LATIN_MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

function transliterateRu(text: string): string {
  return text.replace(/[а-яё]/giu, (ch) => {
    const lower = ch.toLowerCase();
    return RU_TO_LATIN_MAP[lower] ?? lower;
  });
}

function sanitizeEmailCandidate(candidate: string): string {
  if (!candidate.includes('@')) return candidate;

  const parts = candidate.split('@');
  if (parts.length !== 2) return candidate;

  let [local, domain] = parts;

  local = transliterateRu(local)
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/[^a-z0-9._%+-]/gi, '');
  domain = transliterateRu(domain)
    .replace(/\bjmail\b/giu, 'gmail')
    .replace(/^\.+/, '')
    .replace(/\.+/g, '.')
    .replace(/\.+$/g, '')
    .replace(/[^a-z0-9.-]/gi, '');

  if (!local || !domain) return candidate;
  return `${local}@${domain}`.toLowerCase();
}

function normalizeEmailInput(raw: string): string {
  const value = String(raw || '').trim();
  if (!value) return '';

  let candidate = value.toLowerCase();
  candidate = candidate.replace(/ё/g, 'е');

  candidate = candidate
    .replace(/(собака|sobaka)\s*[.,]/giu, '@')
    .replace(/(собака|sobaka)/giu, '@')
    .replace(/\b(точка|dot)\b/giu, '.');

  candidate = candidate
    .replace(/\s*@\s*/g, '@')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\s+/g, '');

  // Handle glued "userSobaka.gmail.com"
  candidate = candidate.replace(
    /^([\p{L}0-9._%+-]+)(?:sobaka|собака)[\s._-]*([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/iu,
    '$1@$2',
  );

  candidate = candidate.replace(/\bjmail\./giu, 'gmail.');
  candidate = candidate.replace(/@\.{1,}/g, '@');
  candidate = sanitizeEmailCandidate(candidate);

  return candidate;
}

export async function createDraft(args: Args) {
  try {
    const normalizedEmail = normalizeEmailInput(args.email);

    const draft = await prisma.bookingDraft.create({
      data: {
        serviceId: args.serviceId,
        masterId: args.masterId,
        startAt: new Date(args.startAt),
        endAt: new Date(args.endAt),
        customerName: args.customerName,
        phone: args.phone || '',
        email: normalizedEmail,
        birthDate: args.birthDate ? new Date(args.birthDate) : null,
        notes: args.notes || null,
        locale: args.locale || 'de',
      },
    });

    return { draftId: draft.id };
  } catch (error) {
    console.error('[AI create_draft] Error:', error);
    return { error: 'DRAFT_CREATION_FAILED' };
  }
}
