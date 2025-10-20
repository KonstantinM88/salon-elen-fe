-- 1) на всякий случай
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2) гарантируем валидность интервала
ALTER TABLE "public"."Appointment" DROP CONSTRAINT IF EXISTS appt_valid_interval;
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT appt_valid_interval CHECK ("startAt" < "endAt");

-- 3) добавляем STORED-генерируемую колонку с полуоткрытым интервалом [start, end)
--    так мы уводим ВЫРАЖЕНИЕ из индекса внутрь таблицы (shadow-DB больше не спорит)
ALTER TABLE "public"."Appointment"
  ADD COLUMN IF NOT EXISTS appt_range tstzrange
  GENERATED ALWAYS AS (tstzrange("startAt","endAt",'[)')) STORED;

-- 4) пересоздаём exclusion-констрейнт на колонку (а не на выражение)
ALTER TABLE "public"."Appointment" DROP CONSTRAINT IF EXISTS appt_no_overlap;

ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT appt_no_overlap EXCLUDE USING gist
  (
    "masterId" WITH =,
    appt_range WITH &&
  )
  WHERE ("status" IN ('PENDING'::"AppointmentStatus",'CONFIRMED'::"AppointmentStatus"));
