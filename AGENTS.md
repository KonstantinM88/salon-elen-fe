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
