# Temporary onsite-only treatment payments

As of 11 November 2026, `PAYMENT_OPTIONS.onlineEnabled` in
`src/lib/payments/config.ts` is `false`. This is a shared application switch,
not a removal of Stripe/PayPal or a change to credentials.

## While paused

- `/booking/payment` defaults to payment at the salon. Stripe/card and PayPal
  remain visible, disabled and labeled temporarily unavailable in DE/EN/RU.
- The page explains that the customer confirms a booking without online
  prepayment. The Stripe pure loader is not invoked and provider forms do not
  mount, so no new Stripe/PayPal SDK session is started by this page.
- Stripe intent creation, PayPal order creation and PayPal capture return
  `503`, code `ONLINE_PAYMENTS_DISABLED`, before body parsing, DB access or a
  provider request. The legacy `/api/booking/payment` route also rejects card
  and PayPal choices before updating appointment notes; cash remains available.
- `/api/booking/confirm-onsite-payment` keeps its existing idempotent behavior
  and notifications. Confirming onsite payment does **not** mark a booking PAID;
  payment is collected at the salon. No schema/migration is required.
- Stripe webhooks remain active for genuine payments already initiated before
  the pause. Existing payment history and credentials are unchanged.

The application switch cannot revoke Stripe client secrets already issued to
an older open browser tab or cancel existing provider-side sessions. Provider-side
cancellation/reconciliation is a separate operational action; do not silently
cancel payments or disable signed webhooks.

## Resume

1. Change the shared flag to `true` after the salon approves online payments.
2. Run typecheck and build, and verify provider configuration in test mode.
3. Deploy the same build for both client and APIs; refresh previously open tabs.

The existing Stripe/PayPal implementation is retained. No commit, push or
production deployment is implied by this local change.

## Verification

`npm run test:payments` checks the disabled server paths without live DB/provider
calls, onsite unpaid/idempotent confirmation, the legacy cash path, all three
locales, and the shared switch's enabled branch. All records and notifications
in these tests are stubbed; this is not a real transaction test.

Verified locally: all 6 payment tests and 19 validation/auth/Gutschein tests
passed; targeted ESLint has no errors (the payment page retains its pre-existing
calendar-navigation warning); production build and its TypeScript check passed
with 95/95 generated entries. A temporary production server returned HTTP 200
for the payment page in DE/EN/RU, with card/PayPal disabled and onsite confirmation
available. All three provider endpoints and both legacy online choices returned
503. Only a nonexistent preview appointment ID was used, with no valid request,
real payment or customer notification. The verification server was stopped.
