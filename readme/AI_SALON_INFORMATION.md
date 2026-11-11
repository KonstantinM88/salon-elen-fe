# Gutschein and foot-care assistant knowledge

Updated: 2026-11-11. Languages: DE / EN / RU.

## Sources of truth

- `src/lib/ai/salon-information.ts` composes 13 Gutschein answers from the
  existing public `giftFaq`, `giftCopy`, `giftDetailsCopy`, `GIFT_AMOUNTS` and
  `giftDesigns`, plus explicitly bounded consultation answers.
- The six public Gutschein FAQ entries are reused, not copied into a second
  independently maintained answer set. Design names, suggested values and
  processing-status meanings come from the existing UI modules.
- `src/lib/ai/foot-care-faq.ts` adds 16 general consultation entries. A 17th
  payment answer uses the shared payment flag and existing localized copy.
- `buildSystemPrompt` includes both sets for model-assisted follow-ups;
  `resolveSalonInformation` handles common questions without a model request.
- General salon FAQ now exposes both topic menus. Each menu has eight initial
  questions and a second page; concrete price/duration questions intentionally
  continue through the established live-catalog path.

## Business and safety boundaries

Gutschein is a **non-binding request**, not an instant paid or redeemable
voucher. The form accepts 25–500 EUR and four designs; name, email, contact
phone and consent are required. Recipient, sender and greeting are optional.
The preview and request receipt are not an issued voucher. Receipt/status
email is for the buyer, not automatic delivery to the gift recipient.
Payment, issue, delivery/collection and redemption terms are agreed personally.
Chat cannot retrieve personal status, mutate requests, refund, issue, redeem
or reserve a voucher. Never invent validity periods or legal refund promises.
Processing statuses are not payment records; internal admin notes stay private.

Foot-care answers cover selection, classic/e-file care, polish/removal, men,
home visits, preparation, frequency, sensitivity, callus/cracks, ingrown nails,
diabetes, nail changes and hygiene questions. They do not diagnose, approve
health suitability, guarantee cures/painlessness or invent credentials,
equipment, sterilisation procedures or inclusive extras.

Every concrete service offer, price, duration and promotion still comes from
the active `list_services` catalogue; dates/slots come from availability tools.
No fixed price list or repeat interval is added to assistant knowledge.
An acute foot-health warning takes priority over generic cosmetic booking copy,
including a combined question about a gift voucher for pedicure.
The new deterministic handler does not consume any active booking, contact,
registration or OTP state; it may answer questions during consultation only.

Medical boundary references reviewed for general warning signs (not claims
about services or salon qualifications):

- [NHS: nail problems](https://www.nhs.uk/symptoms/nail-problems/)
- [NHS: ingrown toenail](https://www.nhs.uk/conditions/ingrown-toenail/)
- [NIDDK: diabetes and foot problems](https://www.niddk.nih.gov/health-information/diabetes/overview/preventing-problems/foot-problems)

## Chat links

Use the existing `[option url="..."]...[/option]` syntax: plain Markdown links
are not parsed by `ChatMessage`. The new `safeAssistantOptionUrl` allows only
`/booking/*`, `/gutschein` and `/fusspflege-halle` on the current origin or
canonical salon origin, returning a local path. It rejects foreign origins,
credentials, scripts, backslashes, control characters and other routes.
The gift button preserves `?lang=de|en|ru#gestalten`; the foot-care page button
preserves locale. Existing Google booking handoff remains supported, including
an absolute localhost URL when the current origin is localhost.

## Verification

Run `npm run test:ai-information`, `npm run typecheck`, targeted ESLint and
`npm run build`. Regression suites: `npm run test:payments` and
`npm run test:validation`.

The information tests use an explicit placeholder API key, a loopback dummy
database URL, a stubbed Prisma singleton and a fetch mock that rejects network
calls. Eighteen real-handler FAQ requests cover the three locales, follow-ups,
menus, gift amounts and health warnings without calling OpenAI, querying
services or writing business records.
Existing analytics writes are stubbed too. No real voucher request, booking,
customer notification or production migration is part of verification.

No migration is needed. Git publication and production deployment remain
separate, explicitly authorized actions.
