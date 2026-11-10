import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { giftRequestSchema } from '@/lib/gutschein';
import { notifyGiftRequest, sendGiftReceipt } from '@/lib/gutschein-notifications';
import { getPublicBaseUrl } from '@/lib/public-url';

export const runtime = 'nodejs';
const MAX_BYTES = 12_000;
// Best-effort abuse protection for the current single-process PM2 deployment.
// Durable email limits below still apply across restarts.
const requests = new Map<string, { count: number; until: number }>();

async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) throw new Error('BODY_LIMIT');
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > MAX_BYTES) { await reader.cancel(); throw new Error('BODY_LIMIT'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { reader.releaseLock(); }
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || ![new URL(request.url).origin, new URL(getPublicBaseUrl()).origin].includes(origin)) {
    return NextResponse.json({ error: 'ORIGIN' }, { status: 403 });
  }
  const now = Date.now();
  for (const [key, item] of requests) if (item.until <= now) requests.delete(key);
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const key = createHash('sha256').update(ip).digest('hex');
  const attempt = requests.get(key) ?? { count: 0, until: now + 60_000 };
  attempt.count += 1;
  if (requests.size < 10_000 || requests.has(key)) requests.set(key, attempt);
  if (attempt.count > 6 || requests.size >= 10_000) {
    return NextResponse.json({ error: 'RATE_LIMIT' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  const parsed = giftRequestSchema.safeParse(await readBody(request).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'VALIDATION' }, { status: 400 });
  const data = parsed.data;

  try {
    const existing = await prisma.giftVoucherRequest.findUnique({ where: { id: data.requestId } });
    if (existing) {
      // A retry returns the same reference without creating or notifying twice.
      if (existing.email !== data.email || existing.amountCents !== data.amount * 100
        || existing.buyerName !== data.buyerName || existing.phone !== data.phone
        || existing.recipientName !== data.recipientName || existing.senderName !== data.senderName
        || existing.message !== data.message || existing.delivery !== data.delivery) {
        return NextResponse.json({ error: 'VALIDATION' }, { status: 409 });
      }
      return NextResponse.json({ ok: true, reference: existing.reference, receiptSent: !!existing.receiptSentAt });
    }
    const recent = await prisma.giftVoucherRequest.count({
      where: { email: data.email, createdAt: { gte: new Date(now - 3_600_000) } },
    });
    if (recent >= 3) return NextResponse.json({ error: 'RATE_LIMIT' }, { status: 429 });
    const order = await prisma.giftVoucherRequest.create({ data: {
      id: data.requestId, reference: `ELEN-${randomBytes(6).toString('hex').toUpperCase()}`,
      amountCents: data.amount * 100, locale: data.locale, buyerName: data.buyerName,
      email: data.email, phone: data.phone, recipientName: data.recipientName,
      senderName: data.senderName, message: data.message, delivery: data.delivery,
    } });
    const results = await Promise.allSettled([notifyGiftRequest(order), sendGiftReceipt(order)]);
    results.forEach((result, index) => {
      if (result.status === 'rejected' || !result.value) {
        console.warn('[Gutschein] Notification unconfirmed', { channel: index === 0 ? 'telegram' : 'email', reference: order.reference });
      }
    });
    const receipt = results[1];
    return NextResponse.json({ ok: true, reference: order.reference, receiptSent: receipt.status === 'fulfilled' && receipt.value }, { status: 201 });
  } catch (error) {
    // A concurrent retry may race on the UUID; the next retry resolves above.
    console.error('[Gutschein] Request failed', { code: typeof error === 'object' && error && 'code' in error ? error.code : 'UNKNOWN' });
    return NextResponse.json({ error: 'UNAVAILABLE' }, { status: 503 });
  }
}
