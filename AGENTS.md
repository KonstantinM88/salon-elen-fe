# AGENTS.md

This file is the persistent working memory for coding agents in this repository.
Read it before making changes. When a task changes important architecture,
data models, booking behavior, integrations, deployment flow, or verification
commands, update the "Important Change Log" section.

## Project Summary

Salon Elen frontend is a Next.js App Router application for a beauty salon in
Halle (Saale). It includes public marketing/SEO pages, online booking, admin
management, authentication/RBAC, payments, customer verification, Telegram/SMS
integrations, analytics, and an AI booking assistant.

Primary stack:

- Next.js 16 App Router, React 19, TypeScript strict mode.
- Tailwind CSS 4 and local UI components.
- Prisma 7 with PostgreSQL through `@prisma/adapter-pg`.
- NextAuth v4 credentials auth with JWT sessions.
- Stripe, PayPal, Resend/Nodemailer, Telegram, SMS providers, OpenAI.
- Node `>=20.19.0`, npm 10.

Useful scripts:

- `npm run dev` - local Next.js dev server.
- `npm run build` - `prisma generate && next build`.
- `npm run typecheck` - TypeScript check.
- `npm run lint` - ESLint for `src`.
- `npm run prisma:generate` - regenerate Prisma client.
- `npm run prisma:migrate` - deploy Prisma migrations.
- `npm run prisma:seed` - seed database.
- `npm run optimize:uploads` - optimize uploaded assets.

## Repository Map

- `src/app` - Next.js routes, layouts, pages, route handlers, and server actions.
- `src/app/admin` - admin UI for bookings, clients, masters, services, news,
  stats, profile, AI tools, and dashboard.
- `src/app/booking` - customer booking flow: service, master, calendar/client
  steps, verification, payment, and success pages.
- `src/app/api` - API route handlers for booking, availability, admin, auth,
  payments, AI chat/voice, Telegram, email, webhooks, clients, articles.
- `src/app/(auth)` - login and registration pages.
- `src/app/(seo-commercial)` and selected public pages - SEO landing pages.
- `src/components` - shared React components grouped by domain: `admin`,
  `ai`, `analytics`, `booking`, `contacts`, `forms`, `layout`, `legal`,
  `payment`, `seo`, and `ui`.
- `src/lib` - business logic and server utilities: Prisma, auth, RBAC,
  booking, availability, AI tools, integrations, validation, time, email,
  payments, uploads, SEO helpers.
- `src/i18n` - local i18n layer. Supported locales are `de`, `en`, `ru`;
  default locale is `de`.
- `src/generated/prisma` - generated Prisma client output.
- `prisma` - `schema.prisma`, migrations, and seed scripts.
- `public` - static assets, icons, video, images, uploads, robots and manifest.
- `scripts`, `sql`, `ai-tests`, `ZADARMA_SMS`, `readme` - maintenance scripts,
  SQL utilities, AI test harness, SMS experiments, and operational docs.

## Important Architecture Notes

- Prisma client is generated from `prisma/schema.prisma` into
  `src/generated/prisma`. Runtime DB access should go through
  `@/lib/prisma` or `@/lib/db`; Prisma enum/types are imported from
  `@/lib/prisma-client`.
- Database timestamps are treated as UTC. Salon wall-clock calculations use
  `src/lib/orgTime.ts`, defaulting to `Europe/Berlin` through `SALON_TZ` or
  `NEXT_PUBLIC_ORG_TZ`. Do not add ad hoc timezone conversion logic.
- Booking availability is centralized in `src/lib/booking/availability-service.ts`
  and `src/lib/booking/getFreeSlots.ts`. It considers master working hours,
  appointments, time off, temporary reservations, duration, and service coverage.
- Booking finalization is centralized in
  `src/lib/booking/finalize-booking.ts`. It creates an `Appointment` from a
  `BookingDraft`, locks the master row with `FOR UPDATE`, checks slot conflicts,
  creates or links a `Client`, deletes the draft, and cleans temporary slot
  reservations.
- The customer booking flow uses draft records before verification. Email,
  SMS, Telegram, Google, and AI assistant flows should converge on shared
  booking/finalization logic where possible.
- Auth is configured in `src/lib/auth.ts`. RBAC and guard helpers live in
  `src/lib/rbac.ts`, `src/lib/rbac-guards.ts`, and `src/lib/route-guards.ts`.
  Current roles are `USER`, `MASTER`, and `ADMIN`.
- Global app layout is `src/app/layout.tsx`. It mounts providers, locale
  context, `SiteHeader`, `SiteFooter`, and the AI `ChatWidget`. Changes here
  affect most public pages. Microsoft Clarity and its cookie-consent UI are
  currently kept in the codebase but not mounted.
- AI assistant code is under `src/components/ai`, `src/lib/ai`, and
  `src/app/api/ai`. Tool definitions are in `src/lib/ai/tools-schema.ts`.
  The assistant must use real availability/tool results and must not invent
  appointment slots.
- Public text/i18n keys live mainly in `src/i18n/messages.ts`. When adding or
  changing user-facing text, keep `de`, `ru`, and `en` in sync unless the task
  explicitly allows a temporary fallback.
- Static uploads in `public/uploads` are user/content assets. Avoid modifying
  or deleting them unless the task explicitly asks for asset work.
- Deployment notes live in `readme/PM2_DEPLOY_RUNBOOK.md`. Safe migration notes
  are in `readme/NEON_SAFE_MIGRATION_FLOW.md`.

## Working Rules For Future Agents

- Keep changes scoped to the requested behavior and the local project patterns.
- Do not overwrite user changes. Check `git status --short` before larger edits.
- Do not edit `.env`, secrets, production credentials, or uploaded content
  unless the user explicitly asks.
- For Prisma schema changes, update `prisma/schema.prisma`, add/adjust
  migrations as appropriate, run `npm run prisma:generate`, and update affected
  TypeScript code.
- For booking, availability, payment, auth, RBAC, and AI-tool changes, prefer
  shared library code over duplicating route-specific logic.
- For date/time work, use `src/lib/orgTime.ts` and preserve the UTC-in-DB,
  Europe/Berlin-in-UI model.
- For admin/API access control, reuse the existing RBAC helpers instead of
  adding one-off session checks.
- For UI work, follow existing components and styling. Avoid unrelated visual
  redesigns while fixing behavior.
- Verify with the narrowest useful command first. Common checks are
  `npm run typecheck`, `npm run lint`, and `npm run build`.
- After any important structural or behavioral change, append a short note to
  the change log below. Do not log purely cosmetic edits or routine bug fixes
  unless they affect project conventions.
- When the user explicitly marks a change as important, or the change affects
  public SEO, booking, notifications, integrations, deployment, data models, or
  project-wide conventions, record it in the change log before handoff.

## Important Change Log

- 2026-05-20: Created this `AGENTS.md` as the initial project memory. Captured
  current structure, stack, booking/auth/i18n/AI conventions, and working rules.
- 2026-05-20: PM2 production config should bind Next.js to `127.0.0.1:3000`
  (`next start -H 127.0.0.1 -p 3000`) so public traffic must pass through nginx.
- 2026-05-21: AI Health DB checks retry once on transient PostgreSQL connection
  termination/timeouts. Prisma PostgreSQL adapter connection timeout defaults to
  15s and can be tuned with `PG_CONNECTION_TIMEOUT_MS`/`PG_IDLE_TIMEOUT_MS`.
- 2026-05-22: Security dependency baseline is Next.js/`eslint-config-next`
  16.2.6 with PostCSS 8.5.10. Keep the npm PostCSS override so Next.js uses the
  patched PostCSS copy instead of its older transitive pin.
- 2026-05-22: Microsoft Clarity analytics and its cookie-consent UI are paused
  at the global layout/footer level. Keep the existing components available for
  a later opt-in reactivation, but do not rely on the project ID alone to load
  Clarity while it is paused.
- 2026-05-26: News body content remains stored as plain `Article.content` /
  `ArticleTranslation.content` text, but public news pages and admin previews
  render it through `src/components/news/MarkdownContent.tsx`. Existing plain
  text articles must continue to render without migration.
- 2026-05-27: `Article` has a `views Int @default(0)` counter with migration
  `20260527090000_add_article_views`. Public news detail pages show estimated
  reading time, article views, and a share action; views are incremented by
  `/api/articles/[id]/view` once per browser session.
- 2026-05-27: `Article` has `galleryImages String[] @default([])` with
  migration `20260527094500_add_article_gallery_images`. The admin news form
  can attach and order up to four extra article photos, and public news detail
  pages render the cover plus gallery images through `NewsImageCarousel`.
- 2026-05-27: AI assistant service recommendations must be driven by the
  current active catalog from `list_services` (`Service.isActive=true` and
  `isArchived=false`). Consultation entry points should build service/category
  options from the live catalog and avoid static inactive services such as
  haircut/manicure. Proactive chat help must not appear before 10 seconds.
- 2026-05-27: AI consultation mode now supports live-catalog category drilling
  and service-specific consultation cards before booking. `AiSession.context`
  can store `consultationServiceTitle` for non-PMU service cards, and booking
  from a card should re-resolve the service through `list_services` rather than
  trusting stale text. `list_services` hides children whose parent category is
  inactive/archived. For PMU and other knowledge-backed cards, live catalog
  title, price, and duration remain the source of truth; static knowledge text
  may add explanation only and must not override catalog values.
- 2026-05-27: AI booking sessions distinguish `pendingVerificationMethod`
  (method selected before OTP is sent) from `activeVerificationMethod` (OTP
  method already sent for the current draft). `complete_booking` must be bound
  to `activeVerificationMethod` so Telegram/SMS/email OTP completion checks the
  same channel that actually received the code.
- 2026-05-27: AI Health daily summary can be sent for an explicit salon-local
  date via `POST /api/admin/ai-health?action=daily&date=YYYY-MM-DD` or
  `date=today`/`date=yesterday`. The summary uses `orgDayRange` for
  Europe/Berlin day boundaries; the default remains yesterday for scheduled
  morning cron jobs.
- 2026-05-27: Site visits are tracked first-party through `SiteVisitTracker`
  and `/api/site-visit` into the `SiteVisit` model
  (`20260527113000_add_site_visit_analytics`). Admin/API/static routes are
  excluded. AI Health daily Telegram summaries include site visits and
  pageviews for the same salon-local date.
- 2026-05-29: Admin booking status changes through `setStatus` await a direct
  Telegram Bot API notification to configured admin chat IDs with previous/new
  status and appointment details.
- 2026-05-29: Admin Telegram booking/status notifications include inline
  status action buttons. `/api/telegram/webhook` handles `appt_status` callback
  actions only from configured admin chat IDs and changes status through
  `src/lib/booking/status-change.ts`, preserving status logs and client/admin
  notifications.
- 2026-05-29: Appointment rescheduling is centralized in
  `src/lib/booking/reschedule-appointment.ts`. Admin bookings can be moved from
  `/admin/bookings`, and Telegram admin notifications include an `appt_reschedule`
  action. Reschedule slot lists reuse `getAvailableSlots` with the current
  appointment excluded from busy windows, then apply the same validation, status
  log, and client/admin notification flow.
- 2026-05-29: Telegram appointment rescheduling now shows available date
  buttons first (`appt_rs_date`), then available time-slot buttons
  (`appt_rs_slot`). The date list is generated by scanning upcoming
  salon-local days through the shared reschedule availability helper.
- 2026-05-29: SMS phone booking completion must link to an existing `Client`
  by phone or email and handle `P2002` client uniqueness races. Missing client
  email uses a generated `noemail+...@client.local` fallback so `Client.email`
  uniqueness is not violated by empty strings.
- 2026-05-30: Admin quick booking now goes through
  `src/lib/booking/admin-quick-appointment.ts` for both the admin dashboard and
  `/admin/bookings`, plus the Telegram admin bot. It uses live active leaf
  services, service-specific masters, shared availability slots, creates
  confirmed appointments, links or creates clients with fallback email/birth
  date when only phone is provided, and sends client/admin notifications through
  the existing email, Telegram, and SMS paths. Telegram admins can start it from
  `/admin`, `/start`, or the `/add` command.
- 2026-05-30: `scripts/deploy-pm2.sh` now stops the single-directory PM2 app
  before mutating `node_modules`/`.next`, backs up the previous `.next`, builds,
  then starts from `ecosystem.config.cjs`. This avoids transient Next.js
  `ChunkLoadError`/missing server chunk errors caused by deleting `.next` while
  the old `next start` process is still serving traffic.
- 2026-05-30: The public AI `ChatWidget` is disabled on `/admin` routes through
  its client-side route gate, so client-facing booking hints do not appear in
  the admin interface while the widget remains mounted from the root layout for
  public pages.
- 2026-05-30: Telegram admin quick booking no longer sends the full service
  catalog as long inline buttons. It first asks for a service category, then
  shows full service names in the message body with short numbered buttons for
  mobile-friendly selection.
- 2026-05-30: Upcoming appointment reminders are centralized in
  `src/lib/booking/upcoming-appointments-report.ts`. AI daily Telegram reports
  append the next 7 days of non-deleted appointments across all statuses, and
  the Telegram admin menu exposes 7/14/30-day upcoming appointment views.
- 2026-06-03: AI Health DB retry now uses multiple exponential-backoff attempts
  (`AI_HEALTH_DB_MAX_ATTEMPTS`, default 4) instead of a single 750ms retry, so
  daily Telegram summaries and error alerts survive short PostgreSQL/pooler
  pauses. `TurnTracker` now upserts the parent `AiChatSession` before writing
  `AiChatTurn` rows to avoid analytics FK errors when initial session analytics
  were delayed by transient DB failures.
- 2026-06-19: The public homepage was redesigned around a dusty rose, milk, and
  deep plum visual system with a new desktop hero, services, trust, gallery,
  reviews, news, booking CTA, and contact sections. The existing mobile hero
  poster/video experience (`hero-mobile.webp` + `hero-video.webm`) remains
  unchanged in structure and is rendered separately below the `md` breakpoint.
  Homepage motion uses progressive section/card reveals, restrained image and
  light effects, and respects `prefers-reduced-motion`; key sections remain
  visible without waiting for a section-level intersection animation.
- 2026-06-19: `src/proxy.ts` excludes `/api/*` from its matcher. API route
  handlers remain responsible for their own authentication, while the proxy is
  limited to page protection, locale cookies, and SEO request headers. This
  avoids routing NextAuth session requests through the page proxy during cold
  Turbopack development compilation.
- 2026-06-19: AI/search discovery signals are centralized around the current
  permanent make-up catalog. `BeautySalon` JSON-LD includes a linked service
  offer catalog, commercial landing pages expose linked `Service`/`WebPage`
  entities, and `robots.txt` explicitly permits `OAI-SearchBot` on public
  content. Site visits store traffic attribution and classify ChatGPT,
  Perplexity, Claude, Gemini, and Copilot referrals via migration
  `20260619090000_add_site_visit_traffic_attribution`; daily Telegram reports
  include AI referral counts and source breakdowns.
- 2026-06-19: Public news detail pages expose linked `NewsArticle`/`Article`,
  `WebPage`, `WebSite`, and salon JSON-LD entities. Static sitemap entries omit
  `lastModified` unless a real content timestamp is available; article entries
  continue to use `Article.updatedAt`.
- 2026-06-20: `public/llms.txt` uses Markdown links (`[label](url)`) for all
  key public pages so Lighthouse/PageSpeed agentic browsing checks can recognize
  site links instead of treating the file as linkless plain text.
- 2026-06-09: AI daily Telegram summaries build the core AI/site summary first,
  then build the upcoming-appointments block with its own retry and graceful
  fallback. A transient DB failure in the upcoming appointment query no longer
  prevents the daily summary from being sent.
- 2026-06-16: `Appointment` and `BookingDraft` now store `bookingMethod`
  (`20260616120000_add_appointment_booking_method`) so Telegram appointment
  reports can show how a client booked. AI bookings require a valid phone before
  `create_draft`, and client email/Telegram/SMS notifications can include signed
  self-service links for cancellation and rescheduling through
  `/appointments/[id]/manage`.
- 2026-06-16: Prisma packages were updated to 7.8.0. Keep `prisma`,
  `@prisma/client`, and `@prisma/adapter-pg` aligned when upgrading.
- 2026-06-16: External appointment/admin links for Telegram/email now use
  `src/lib/public-url.ts`, which ignores localhost/private hosts and falls
  back to `https://permanent-halle.de`. This prevents Telegram inline keyboard
  `Wrong HTTP URL` failures when local env vars are present during testing.
- 2026-06-16: `Ballpit` no longer enables `MeshPhysicalMaterial` transmission
  because it caused Three/WebGL shader compile errors with the current runtime.
- 2026-06-17: Admin booking Telegram notifications include
  `Appointment.bookingMethod` labels, and AI daily summaries include a
  day-level breakdown of created appointments by booking method. Production
  Google/PayPal external return URLs now use `src/lib/public-url.ts` so local
  env values cannot leak into customer-facing redirects.
- 2026-06-17: Client self-service cancel/reschedule API routes must await
  App Router `params` in Next 16 and redirect through `src/lib/public-url.ts`;
  otherwise production proxy URLs can produce `localhost` redirects and
  `appointmentId=undefined` invalid-link errors.
- 2026-06-20: Booking pages use the global `next-themes` system default for
  client theme selection and expose a booking-specific footer/theme control from
  `src/components/booking/BookingFooter.tsx`. Dark booking step components stay
  as the compatibility baseline; light variants are selected by small
  route-level theme clients, as now used by `/booking/services`,
  `/booking/master`, and `/booking/calendar`.
- 2026-06-23: Telegram admin notification text sent through
  `src/lib/send-admin-notification.ts` must escape dynamic Markdown fields
  such as email, service, customer, and master names. The shared sender retries
  without `parse_mode` on Telegram `can't parse entities` errors so admin
  notifications are delivered even when formatting is invalid.
- 2026-07-05: Telegram delivery is centralized in
  `src/lib/telegram/sender.ts` with admin fan-out and parse-mode fallback. AI
  daily reports and admin notifications send directly through this helper
  instead of `/api/telegram/webhook?action=notify`. Telegram OTP routes send
  codes directly to saved `telegramChatId` values instead of passing `phone` and
  `code` through webhook query parameters. The webhook supports
  `TELEGRAM_WEBHOOK_SECRET_TOKEN`/`TELEGRAM_WEBHOOK_SECRET` for Telegram
  `X-Telegram-Bot-Api-Secret-Token` validation; the legacy `action=notify` and
  GET code endpoint require `TELEGRAM_INTERNAL_NOTIFY_SECRET` and should not be
  used for normal flows.
- 2026-07-05: Telegram admin conversation state for quick booking and
  appointment rescheduling is persisted in `TelegramConversationState`
  (`20260705114500_add_telegram_conversation_state`) through
  `src/lib/telegram/conversation-state.ts`. Do not use process-local `Map`
  state for multi-step bot flows that must survive PM2 restarts or multiple
  app instances.
- 2026-07-05: SEO/GEO/AIO signals were expanded from the temporary update
  package: `buildSalonJsonLd()` includes exact salon geo coordinates and the
  Google Business profile; `/services` emits dynamic `BeautySalon` +
  `OfferCatalog` JSON-LD from active DB services; `robots.txt` and
  `llms.txt` include AI crawler and answer-target guidance. The direct Google
  review URL is centralized as `SALON_GOOGLE_REVIEW_URL` and is shown in
  `DONE` status emails.
- 2026-07-05: News Markdown rendering in
  `src/components/news/MarkdownContent.tsx` supports Markdown tables and uses
  richer public/admin article presentation: styled tables, icon-led check
  lists, numbered step lists, and quote callouts. GEO/news articles can use
  normal Markdown tables instead of custom HTML.
- 2026-07-05: `/sitemap.xml` is generated only from explicit public indexable
  pages plus currently published, non-expired news articles. Paths disallowed
  in `public/robots.txt` (`/admin`, `/api`, `/appointments`, `/booking`,
  `/coming-soon`, `/login`, `/register`, `/users`) and redirect-only aliases
  (`/for-masters`, `/privacy`, `/terms`) must stay out of the sitemap.
- 2026-07-05: Homepage FAQ content is centralized in
  `src/lib/home-faq.ts` and drives both the visible `<section id="faq">` in
  `src/components/home-page.tsx` and the homepage `FAQPage` JSON-LD in
  `src/app/page.tsx`. Keep visible FAQ answers and schema answers synchronized
  by editing only this shared source.
- 2026-07-10: Global `SiteFooter` includes the public sponsored attribution
  link `Werbung · Webentwicklung: SaaleWeb` to `https://saaleweb.de/` with
  `rel="sponsored noopener noreferrer"`.
- 2026-07-11: Elen-AI consultation and discovery responses use every active
  service category plus live `list_services` titles, descriptions, prices, and
  durations. Informational service questions show a consultation card before
  booking; only explicit booking intent advances to master/date selection.
  General salon FAQ answers share `src/lib/home-faq.ts` with the homepage, and
  unhandled consultation follow-ups reach GPT with recent history, the shared
  FAQ, and a fresh catalog instead of repeating the consultation menu.
- 2026-07-11: The two active Hairstroke/волосковая техника catalog offers at
  different price and duration points are intentional commercial offerings.
  Do not merge, rename, archive, or deduplicate them without an explicit user
  request. Elen-AI must preserve the exact consulted service title when moving
  from information to booking. Catalog/FAQ navigation now takes priority over
  legacy main-menu aliases, service-information wording takes priority over a
  priced option payload, and selected PMU safety/booking follow-ups use
  deterministic handlers instead of unnecessary GPT turns.
- 2026-07-11: Every accepted Elen-AI client message resets a 120-second
  inactivity window. After the client remains silent, all configured Telegram
  admins receive the accumulated user/assistant transcript, split into ordered
  plain-text messages below Telegram limits. The timer/state in
  `src/lib/ai/chat-inactivity-notifier.ts` is process-local, matching the
  existing in-memory AI session store; PM2 restarts clear pending windows.
  `AI_CHAT_INACTIVITY_NOTIFY_MS` may override the delay for controlled testing.
