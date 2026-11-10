# Gutschein requests

`/gutschein` supports DE/EN/RU, custom whole-euro amounts between 25 and 500,
personalisation, four selectable botanical designs, required buyer phone/email
and a preferred handover. It collects a
non-binding request. Payment, voucher issue, validity and redemption are agreed
personally with the salon. No voucher code, credit balance or payment is created.

## Deployment

Apply `20261110120000_add_gift_voucher_requests` using the repository's approved
Neon migration flow before exposing the form, then regenerate Prisma and build.
The migration is additive; do not run a database reset. No migration is applied
automatically by the build or this feature.

On 2026-11-10 this migration was applied to the configured production Neon
database and registered with Prisma. Columns, indexes and the migration checksum
were verified; all 54 local migrations were up to date. Other databases still
need this migration before accepting requests. The code must be deployed
separately for the public form and admin list to become available on production.

The admin list lives at `/admin/gutscheine` and uses the shared admin guard.
Statuses describe request processing only. Internal notes are never returned by
the public endpoint. The latest 100 requests are displayed.

The extension requires additive migration
`20261110150000_gift_designs_status_notifications` **before deployment**. It
adds the selected `designKey` (existing requests default to Orchid) and durable
status delivery history. On 2026-11-10 it was applied to the configured production
Neon database with explicit user approval, inside a transaction with bounded lock
and statement timeouts, then registered with Prisma. All 55 migrations are up to
date and the recorded checksum matches the SQL file. The existing request's
previous fields were unchanged (before/after digest verified); it received the
default Orchid design. No constraint is added to invalidate old requests without phones;
all new submissions require 7–15 phone digits on the client and server.

## Delivery

The request is saved before notification. The existing Telegram sender notifies
all configured admins with a plain-text message and an admin link. `notifiedAt`
is set only after every configured recipient succeeds; incomplete delivery can
be retried in admin (successful recipients may receive a duplicate on retry).
Resend sends a localized receipt to the buyer, not the recipient. The UI shows
whether this receipt was confirmed. Notification failure does not lose the
request. A receipt is not an issued voucher.

Admin status transitions save the new status and `GiftVoucherStatusEvent` in a
single transaction. Localized status emails go to the buyer, and Telegram updates
go to each configured admin. Editing only a note or re-saving the current status
does not create a notification. A stale admin form is rejected rather than
overwriting a newer change. Internal notes are not part of either message.

The status history exposes email and Telegram delivery separately. Its retry
button sends only pending channels/recipients. An event-level five-minute lease
avoids concurrent retry sends; Resend also gets a stable event idempotency key.
No background worker was added: unresolved failures must be retried from admin.
Successful provider responses mean accepted delivery, not that a person read it.
Exactly-once Telegram delivery cannot be guaranteed if the process dies after
Telegram accepts a message but before its database acknowledgement is saved.
Resend idempotency retention is provider-limited. Status timestamps identify
individual transitions; retrying an old event reports that historical change.

The admin screen displays all status events for the latest 100 requests and
opens the history automatically when a delivery is pending. Status labels
describe processing only; `COMPLETED` must not
be treated as a payment, issued voucher or refund record.

The public page includes localized local context, service-intent internal links,
canonical/hreflang, social imagery, Service/BeautySalon/Breadcrumb/FAQ JSON-LD and
matching visible FAQ. No rankings or inclusion in AI answers are guaranteed.
See [Google's generative AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
FAQ markup describes the content; it is not a promise of a Google FAQ rich result.
Artwork and exact generation prompts: [GUTSCHEIN_ARTWORK.md](GUTSCHEIN_ARTWORK.md).

No secrets need to be added if existing `RESEND_API_KEY`, `RESEND_FROM` and
Telegram configuration already work. Do not print those values when diagnosing.

## Validation and checks

`POST /api/gutschein` validates same-origin requests, limits body size, validates
all fields with Zod, applies a honeypot, best-effort per-IP process limits and
persisted per-email limits. Browser UUIDs deduplicate normal retries. For multiple
instances or hostile high-volume traffic, also configure reverse-proxy limits.
The endpoint never returns buyer details. The amount is converted to integer
cents on the server. No financial or redemption ledger is implemented.

Run `tsx --test src/lib/gutschein.test.ts src/lib/gutschein-status.test.ts src/app/api/gutschein/route.test.ts`,
`npm run typecheck`, targeted ESLint and `npm run build`.
Smoke-test request submission and admin processing against
a migrated test database with notification providers mocked. Do not send test
requests to real customer addresses.

Local verification on 2026-11-10: 11 mocked tests passed, TypeScript and targeted
ESLint passed, and production build completed (95 static pages generated).
Browser checks covered DE/EN/RU, all four design selections, required phone,
six FAQ entries, localized canonical URLs and JSON-LD. Widths 320, 390, 768 and
1440 px showed no horizontal document overflow. No voucher request or real
customer notification was created. The extension migration was subsequently
applied and verified with user approval as described above. Production deployment
and a live admin notification smoke test remain separate, unperformed steps.
