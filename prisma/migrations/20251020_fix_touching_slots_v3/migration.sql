-- FIX: убираем функции из выражения индекса
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- валидность интервала
ALTER TABLE "public"."Appointment" DROP CONSTRAINT IF EXISTS appt_valid_interval;
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT appt_valid_interval CHECK ("startAt" < "endAt");

-- STORED-колонка с полуоткрытым интервалом [start,end)
-- (переносим выражение из индекса внутрь таблицы)
ALTER TABLE "public"."Appointment"
  ADD COLUMN IF NOT EXISTS appt_range tstzrange
  GENERATED ALWAYS AS (tstzrange("startAt","endAt",'[)')) STORED;

-- пересоздаём exclusion-констрейнт БЕЗ функций в объявлении
ALTER TABLE "public"."Appointment" DROP CONSTRAINT IF EXISTS appt_no_overlap;

ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT appt_no_overlap EXCLUDE USING gist
  (
    "masterId" WITH =,
    appt_range WITH &&
  )
  WHERE ("status" IN ('PENDING'::"AppointmentStatus",'CONFIRMED'::"AppointmentStatus"));
