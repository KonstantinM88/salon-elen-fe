-- Преобразуем startAt/endAt: текущие значения трактуем как локальные Berlin
-- и пересчитываем в корректный UTC.
-- Пример: 2025-10-16 16:00:00+00  ->  2025-10-16 14:00:00+00 (лето)

BEGIN;

UPDATE "Appointment"
SET
  "startAt" = (("startAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Berlin'),
  "endAt"   = (("endAt"   AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Berlin');

COMMIT;
