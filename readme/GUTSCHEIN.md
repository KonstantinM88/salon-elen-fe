# Gutschein requests

`/gutschein` supports DE/EN/RU, custom whole-euro amounts between 25 and 500,
personalisation, contact details and a preferred handover. It collects a
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

## Delivery

The request is saved before notification. The existing Telegram sender notifies
all configured admins with a plain-text message and an admin link. `notifiedAt`
is set only after every configured recipient succeeds; incomplete delivery can
be retried in admin (successful recipients may receive a duplicate on retry).
Resend sends a localized receipt to the buyer, not the recipient. The UI shows
whether this receipt was confirmed. Notification failure does not lose the
request. A receipt is not an issued voucher.

No secrets need to be added if existing `RESEND_API_KEY`, `RESEND_FROM` and
Telegram configuration already work. Do not print those values when diagnosing.

## Validation and checks

`POST /api/gutschein` validates same-origin requests, limits body size, validates
all fields with Zod, applies a honeypot, best-effort per-IP process limits and
persisted per-email limits. Browser UUIDs deduplicate normal retries. For multiple
instances or hostile high-volume traffic, also configure reverse-proxy limits.
The endpoint never returns buyer details. The amount is converted to integer
cents on the server. No financial or redemption ledger is implemented.

Run `tsx --test src/lib/gutschein.test.ts src/app/api/gutschein/route.test.ts`,
`npm run typecheck`, targeted ESLint and `npm run build`.
Smoke-test request submission and admin processing against
a migrated test database with notification providers mocked. Do not send test
requests to real customer addresses.
