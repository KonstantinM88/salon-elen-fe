# Change Report Log 
Created: 26.02.2026 23:48:17,65 
 
## 26.02.2026 23:48:17,65 
Project: SalonElen FE 
Changes: 
- Added chat history context in AI chat route to avoid flow reset. 
- Improved list_services matching with token/stem scoring and debug metrics log. 
- Updated prompt to continue booking after date/time response without restarting service selection. 
- Lowered AI temperature default to 0.15 for more stable tool flow. 
- Added missing-service reporting (DB + admin Telegram) and service/master normalization in previous step. 
- Added requirement to append this changelog after each completed set of edits. 

## 27.02.2026  0:00:01,72 
Project: SalonElen FE 
Changes: 
- Fixed list_masters_for_services: category/non-bookable selection now returns NO_BOOKABLE_SERVICE_SELECTED instead of all masters. 
- Updated AI prompt and tool schema to force concrete service selection before master assignment. 
- Added session state fields (selected service/master, last date/time preference, lastNoSlots) and state hint injection into system context. 
- Added deterministic fast-path: when user confirms after no slots (yes/да/ok/проверь), API directly checks month availability and returns date options. 
- Added robust final response fallback: if model ends without text, force a no-tool text completion and localized fallback message. 
- Kept list_services scoring improvements and debug counters for match diagnostics. 

## 27.02.2026  0:10:56,06 
Project: SalonElen FE 
Changes: 
- Added deterministic fast-path for catalog selection in AI chat route: category click now always returns concrete subservices. 
- Added deterministic fast-path for concrete service click: server directly resolves masters and asks for date/time when exactly one master is available. 
- Added deterministic fallback for service without assigned masters: proposes other concrete services from the same category. 
- Kept no-slots confirmation fast-path and localized forced-text fallback to prevent empty model response. 
- Preserved strict NO_BOOKABLE_SERVICE_SELECTED handling for category/non-bookable ids in list_masters_for_services. 

## 27.02.2026  0:22:17,42 
Project: SalonElen FE 
Changes: 
- Added reliability guard in AI chat route: if create_draft succeeds but model skips start_verification, server now auto-runs start_verification (email OTP). 
- Added localized deterministic message after auto verification start: asks user to enter 6-digit code and shows masked email. 
- Added localized error message if OTP sending fails, with retry instruction. 
- This removes dependency on model behavior for OTP sending after draft creation. 


## 27.02.2026  0:34:14,32 
Project: SalonElen FE 
Changes: 
- Fixed no-slots follow-up date suggestions to store structured options dateISO, label, count in session context. 
- Added deterministic fast-path for click on suggested day option, so server resolves date directly and fetches slots without LLM date reinterpretation. 
- Forced suggested-day slot lookup with preferredTime any to avoid stale time filter from previous step. 
- Added deterministic fallback: if suggested day has no slots, re-query month availability and return refreshed day options. 
- Cleared stale lastSuggestedDateOptions when switching category or service, and when exact day slots are found.
 
## 27.02.2026  0:58:05,94 
Project: SalonElen FE 
Changes: 
- Improved deterministic no-slots flow: on user follow-up after exact time miss, server now rechecks the same date with preferredTime any before jumping to month suggestions. 
- Added additional affirmative triggers for follow-up handling: show, pokaji, pokazat plus typo-tolerant matching. 
- Added clickable options in single-master step: morning, day, evening, nearest date, tomorrow. 
- Improved service click matching with scoring to avoid ambiguous picks when service names are similar. 
- Updated OTP email sending utility: sender config helper, optional reply-to, plain-text email body, and explicit sender warning in logs. 
- Extended start_verification result with warning and messageId, and improved send failure error propagation.
 
## 27.02.2026  0:59:31,06 
Project: SalonElen FE 
Changes: 
- Added explicit system prompt rule to provide clickable time preference options in the user's current language.

## 27.02.2026  1:21:36,83
Project: SalonElen FE
Changes:
- Refactored src/app/api/booking/verify/email/confirm/route.ts to use shared finalizeBookingFromDraft instead of duplicated finalization logic.
- Preserved endpoint response contract (ok/message/appointmentId) and OTP flow (verify before finalize, delete after success).
- Added explicit mapping of finalize errors: DRAFT_NOT_FOUND -> 404, SLOT_TAKEN -> 409, internal -> 500 with localized message.
- Removed large legacy commented duplicate block from confirm route to reduce maintenance risk.

## 27.02.2026  1:48:56,88
Project: SalonElen FE
Changes:
- Fixed AI catalog matching score in src/app/api/ai/chat/route.ts: no positive score without token overlap, so time/date/slot messages no longer get misclassified as service clicks.
- Added scheduling guard in tryHandleCatalogSelectionFastPath: when booking context exists, date/time-like messages bypass catalog fast-path.
- Updated single-master prompt to date-first flow (tomorrow/nearest date) instead of morning/day/evening first.
- Added deterministic tomorrow fast-path in chat route: fetch slots for tomorrow directly, with month fallback if no slots.

## 27.02.2026  2:06:35,48
Project: SalonElen FE
Changes:
- Fixed AI booking verification flow in src/app/api/ai/chat/route.ts for corrected-email scenarios.
- Added tool-argument normalization: complete_booking now uses current session draftId to prevent stale draft mismatch during OTP confirmation.
- Added explicit start_verification result tracking (draftId/contact/ok) and reliability guard now auto-starts verification when explicit call is missing or targets another draft/email.
- Prevented successful start_verification from overwriting a newer draftId in context when create_draft is present in the same tool round.

## 27.02.2026  2:28:57 
Project: SalonElen FE 
Changes: 
- Investigated first-slot fallback issue in AI booking flow using provided runtime logs (repeated reserve_slot call before contact confirmation). 
- Stabilized create_draft args in src/app/api/ai/chat/route.ts: when user sends contact data, create_draft is now aligned with the current reserved slot (or current batch reserve_slot args) to prevent slot drift. 
- Added reserve_slot result handling to session context: persist reservedSlot on success, keep selectedMasterId in sync, and clear stale reservation context on non-matching SLOT_TAKEN. 
- Added complete_booking success cleanup in session context (draftId/reservedSlot/date suggestions), so next booking flow starts from a clean state.
 
## 27.02.2026  2:50:12 
Project: SalonElen FE 
Changes: 
- Fixed booking date flow in src/app/api/ai/chat/route.ts: explicit user date input (TT.MM / TT-MM / TT/MM) is now handled deterministically before LLM fallback. 
- Added manual-date fastpath: when client enters a specific date, backend checks that exact day and returns slots; if fully booked, it returns nearest following available dates. 
- Added cross-month nearest date search (current + next month) via buildNearestDateOptions, so \"Nachstes Datum\" and no-slot follow-up no longer get stuck on one day (e.g. only 27.02). 
- Updated tomorrow/no-slot and suggested-date/no-slot branches to suggest later days (startDate+1) instead of repeating the same day. 
- Stored start date anchor in session on nearest-date action (lastDateISO) for consistent follow-up behavior.
 
## 27.02.2026  3:06:39 
Project: SalonElen FE 
Changes: 
- Added deterministic scope guard in src/app/api/ai/chat/route.ts to restrict assistant replies to salon domain only (booking/services/address-hours). 
- Off-topic questions (math, weather, translation, generic trivia, \"как тебя зовут\" etc.) are now intercepted before LLM/tool execution and redirected to salon actions. 
- Added multilingual guard response (ru/de/en) with clickable options; when booking is active, includes \"continue booking\" option instead of answering unrelated requests. 
- Added lightweight domain-intent detection (keywords/date-time/contact/OTP/booking confirmations) to avoid blocking valid booking steps.
