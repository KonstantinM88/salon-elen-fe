-- фикс: без функций в индексах, апгрейд без падения на "плохих" строках

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 0) Сносим старое ограничение, если было
ALTER TABLE "public"."Appointment"
  DROP CONSTRAINT IF EXISTS "appt_no_overlap";

-- 1) Добавляем генерируемую колонку для диапазона (если её ещё нет)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'Appointment'
      AND column_name  = 'appt_range'
  ) THEN
    ALTER TABLE "public"."Appointment"
      ADD COLUMN "appt_range" tstzrange
      GENERATED ALWAYS AS (tstzrange("startAt","endAt",'[)')) STORED;
  END IF;
END
$$ LANGUAGE plpgsql;

-- 2) CHECK делаем NOT VALID, чтобы не падать на старых кривых строках
ALTER TABLE "public"."Appointment"
  DROP CONSTRAINT IF EXISTS "appt_valid_interval";
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "appt_valid_interval" CHECK ("endAt" > "startAt") NOT VALID;

-- 3) EXCLUDE (не допускаем пересечений для активных статусов; касания разрешены)
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "appt_no_overlap"
  EXCLUDE USING gist (
    "masterId"   WITH =,
    "appt_range" WITH &&
  )
  WHERE ("status" IN ('CONFIRMED','PENDING'));
