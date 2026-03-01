# Readme01.03_01

Date: 2026-03-01

## Changes Since Last Commit (HEAD)

Working tree changes:
- Deleted: `1100` (empty file removed)
- Modified: `src/app/api/ai/chat/route.ts`
- Modified: `src/components/ai/ChatWidget.tsx`
- Modified: `src/lib/ai/tools/complete-booking.ts`
- Added: `src/components/ai/OtpInput.tsx`

Diff stats (tracked files):
- 4 files changed
- +665 insertions
- -135 deletions

## File-by-File Details

### `src/app/api/ai/chat/route.ts`
- Added RU booking keywords in `BOOKING_DOMAIN_KEYWORDS`: `ногтев`, `дизайн`.
- Extended restart intent detection in `isBookingStartIntent`:
  - added phrases: `новую запись`, `хочу новую запись`, `хочу новый термин`, etc.
  - added regex fallback: `/нов(ый|ую)\s+(термин|запис)/u`.
- Updated `tryHandleCatalogSelectionFastPath`:
  - short input is no longer rejected if the session is waiting for master choice;
  - added branch for selecting a master when service is already selected and `selectedMasterId` is missing;
  - uses `listMastersForServices` + `chooseBestMatch`;
  - on successful master match, updates context (`selectedMasterId`, effective `selectedServiceIds`) and resets date/time related context values;
  - logs `fastpath=master-picked`.
- Added response-level `inputMode` handling (`text`/`otp`) in multiple return paths.
- Added session-scoped flags:
  - `otpSentDuringSession`
  - `bookingCompletedDuringSession`
  - final response computes and returns `finalInputMode`.

### `src/lib/ai/tools/complete-booking.ts`
- Added duplicate-completion protection:
  - `COMPLETE_BOOKING_IN_FLIGHT` map for in-flight promises by `draftId`;
  - `COMPLETE_BOOKING_RECENT` map for recent successful results by `draftId`;
  - cache TTL: 10 minutes.
- Extracted main logic into `completeBookingInternal(args)`.
- `completeBooking(args)` now:
  - returns cached success when still valid;
  - returns existing in-flight promise for parallel duplicate requests;
  - caches successful completion result;
  - clears in-flight record and removes expired cache entries.
- Removed obsolete commented legacy code block.

### `src/components/ai/ChatWidget.tsx`
- Added `OtpInput` integration.
- Added `InputMode = 'text' | 'otp'` and `inputMode` state.
- Focus behavior updated: textarea autofocus only in `text` mode.
- `handleNewChat` now resets `inputMode` to `text`.
- After API responses, UI mode switches based on backend `data.inputMode`.
- Added OTP handlers:
  - `handleOtpSubmit(code)`
  - `handleOtpResend()`
- Reworked input rendering:
  - uses `AnimatePresence` to switch between `OtpInput` and standard textarea input.
- File currently contains a large historical commented block at the bottom (`//------01.03.26 ...`).

### `src/components/ai/OtpInput.tsx` (new file)
- Added dedicated OTP component for 6-digit verification.
- Locale support: `de`, `ru`, `en`.
- Implemented behavior:
  - first-field autofocus;
  - keyboard navigation (arrows/backspace/enter);
  - paste parsing for full code;
  - auto-submit when 6 digits are entered;
  - duplicate submit guard via `submitLockRef`;
  - resend flow resets input/focus and calls `onResend`.

## Behavioral Summary
- Backend now controls input mode explicitly (`text`/`otp`), frontend follows it.
- Booking completion became more idempotent for duplicate/parallel `complete_booking` calls.
- Added master-selection fastpath support for multi-master service scenarios.
