import Link from 'next/link';
import Image from 'next/image';
import { Gift } from 'lucide-react';
import { prisma } from '@/lib/db';
import { assertAdmin } from '@/lib/rbac-guards';
import { resolveContentLocale } from '@/lib/seo-locale-server';
import { type SearchParamsPromise } from '@/lib/seo-locale';
import { giftCopy } from '@/lib/gutschein-copy';
import { GIFT_STATUSES, giftAmount, type GiftStatus } from '@/lib/gutschein';
import { ORG_TZ } from '@/lib/orgTime';
import { giftDetailsCopy } from '@/lib/gutschein-details-copy';
import { getGiftDesign } from '@/lib/gutschein-designs';
import { retryGiftNotification, retryGiftStatusNotification, updateGiftRequest } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminGiftRequests({ searchParams }: { searchParams?: SearchParamsPromise }) {
  await assertAdmin();
  const locale = await resolveContentLocale(searchParams);
  const t = giftCopy[locale];
  const detail = giftDetailsCopy[locale];
  const params = await searchParams;
  const orders = await prisma.giftVoucherRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 100,
    include: { statusEvents: { orderBy: { createdAt: 'desc' } } },
  });
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: ORG_TZ });
  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="flex items-center gap-3 text-2xl font-semibold"><Gift className="text-rose-400" />{t.adminTitle}</h1><p className="mt-3 max-w-2xl text-sm text-slate-400">{t.adminIntro}</p></div><Link className="rounded-lg border border-white/20 px-4 py-2 text-sm" href={`/gutschein?lang=${locale}`}>{t.voucher} ↗</Link></header>
    {params?.saved && <p role="status" className="rounded-lg border border-emerald-500/30 p-3 text-sm">{t.saved}</p>}
    {params?.statusNotification && <p role="status" className="rounded-lg border border-amber-500/30 p-3 text-sm">{detail.notificationsPending}</p>}
    {params?.conflict && <p role="alert" className="rounded-lg border border-amber-500/30 p-3 text-sm">{detail.conflict}</p>}
    {params?.notification && <p role="status" className="rounded-lg border border-amber-500/30 p-3 text-sm">{t.notification}: {params.notification === 'sent' ? t.sent : t.pending}</p>}
    <p className="text-xs text-slate-400">{t.total} · {orders.length}</p>
    {!orders.length && <div className="rounded-xl border border-dashed border-white/20 p-10 text-center">{t.empty}</div>}
    <div className="grid gap-5 xl:grid-cols-2">{orders.map(order => <article id={order.id} key={order.id} className="min-w-0 scroll-mt-24 space-y-4 rounded-2xl border border-white/15 bg-white/5 p-5">
      <div className="flex flex-wrap justify-between gap-3"><div><strong className="break-all text-sm">{order.reference}</strong><p className="mt-1 text-xs text-slate-400">{dateFormat.format(order.createdAt)} · {order.locale.toUpperCase()}</p></div><span className="text-xl font-semibold text-rose-300">{giftAmount(order.amountCents, locale)}</span></div>
      <div className="space-y-1 text-sm [overflow-wrap:anywhere]"><strong>{order.buyerName}</strong><p><a className="underline" href={`mailto:${order.email}`}>{order.email}</a></p>{order.phone && <p>{order.phone}</p>}</div>
      <dl className="space-y-2 border-y border-white/10 py-4 text-sm [overflow-wrap:anywhere]">
        <div className="flex items-center gap-3"><Image src={getGiftDesign(order.designKey).image} alt="" width={72} height={72} className="rounded-lg object-cover" /><div><dt className="text-xs text-slate-400">{detail.design}</dt><dd>{getGiftDesign(order.designKey).names[locale]}</dd></div></div>
        <div><dt className="text-xs text-slate-400">{t.to}</dt><dd>{order.recipientName || '—'}</dd></div>
        <div><dt className="text-xs text-slate-400">{t.from}</dt><dd>{order.senderName || '—'}</dd></div>
        <div><dt className="text-xs text-slate-400">{t.greeting}</dt><dd className="whitespace-pre-wrap">{order.message || '—'}</dd></div>
        <div><dt className="text-xs text-slate-400">{t.delivery}</dt><dd>{order.delivery === 'EMAIL' ? t.emailDelivery : t.pickup}</dd></div>
      </dl>
      <p className="text-xs text-slate-400">{t.notification}: {order.notifiedAt ? t.sent : t.pending} · {t.receipt}: {order.receiptSentAt ? t.sent : t.pending}</p>
      {!order.notifiedAt && <form action={retryGiftNotification}><input type="hidden" name="id" value={order.id} /><input type="hidden" name="locale" value={locale} /><button className="rounded-lg border border-amber-500/30 px-3 py-2 text-xs" type="submit">{t.retry}</button></form>}
      <form action={updateGiftRequest} className="space-y-3"><input type="hidden" name="id" value={order.id} /><input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="updatedAt" value={order.updatedAt.toISOString()} />
        <select aria-label={t.save} name="status" defaultValue={order.status} className="w-full rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-sm">{GIFT_STATUSES.map(status => <option key={status} value={status}>{t.statuses[status as GiftStatus]}</option>)}</select>
        <label className="block text-xs text-slate-400">{t.adminNote}<textarea name="note" defaultValue={order.adminNote} maxLength={1000} rows={2} className="mt-2 block w-full resize-y rounded-lg border border-white/20 bg-slate-900 p-3 text-sm text-white" /></label>
        <button type="submit" className="rounded-lg bg-rose-700 px-4 py-2 text-sm text-white">{t.save}</button>
      </form>
      {!!order.statusEvents.length && <details className="border-t border-white/10 pt-4" open={order.statusEvents.some(event => !event.clientNotifiedAt || !event.adminNotifiedAt)}><summary className="cursor-pointer text-sm">{detail.history}</summary><ol className="mt-3 space-y-4">{order.statusEvents.map(event => <li key={event.id} className="space-y-2 rounded-lg bg-black/10 p-3 text-xs">
        <p>{t.statuses[event.previousStatus as GiftStatus]} → {t.statuses[event.status as GiftStatus]}</p><p className="text-slate-400">{dateFormat.format(event.createdAt)}</p>
        <p>{t.receipt}: {event.clientNotifiedAt ? t.sent : t.pending} · {t.notification}: {event.adminNotifiedAt ? t.sent : t.pending} ({event.adminDeliveredChatIds.length}/{event.adminChatIds.length})</p>
        {(!event.clientNotifiedAt || !event.adminNotifiedAt) && <form action={retryGiftStatusNotification}><input type="hidden" name="eventId" value={event.id} /><input type="hidden" name="locale" value={locale} /><button type="submit" className="rounded-lg border border-amber-500/40 px-3 py-2">{detail.retry}</button></form>}
      </li>)}</ol></details>}
    </article>)}</div>
  </div>;
}
