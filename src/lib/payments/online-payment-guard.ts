import { NextResponse } from 'next/server';
import { PAYMENT_OPTIONS } from './config';

/** Run before parsing a body, accessing the database or contacting a provider. */
export function onlinePaymentGuard(): NextResponse<{ code: string; error: string }> | null {
  if (PAYMENT_OPTIONS.onlineEnabled) return null;
  return NextResponse.json({
    code: 'ONLINE_PAYMENTS_DISABLED',
    error: 'Online payments are temporarily unavailable. Please pay at the salon.',
  }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
