-- Enable extensions (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 🧹 Сносим всё, что могло остаться от старых попыток
DO $$
BEGIN
  -- старый partial/exclude
  ALTER TABLE "public"."Appointment" DROP CONSTRAINT IF EXISTS "appointment_no_overlap";
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

DROP INDEX IF EXISTS "public"."Appointment_no_overlap_idx";
DROP INDEX IF EXISTS "public"."Appointment_slot_gist";

-- триггер/функция от прежних решений (если были)
DROP TRIGGER IF EXISTS "appt_no_overlap_trg" ON "public"."Appointment";
DROP FUNCTION IF EXISTS "public"."appt_no_overlap"();

-- 🧱 Добавляем «генерируемый» столбец-диапазон (не требует функций в индексе)
ALTER TABLE "public"."Appointment"
  ADD COLUMN IF NOT EXISTS "slot"
    tstzrange GENERATED ALWAYS AS (tstzrange("startAt","endAt",'[)')) STORED;

-- Индекс по диапазону (ускоряет проверку)
CREATE INDEX IF NOT EXISTS "Appointment_slot_gist"
  ON "public"."Appointment" USING GIST ("slot");

-- 🚫 Основное правило: у одного мастера не могут пересекаться активные записи
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "appointment_no_overlap"
  EXCLUDE USING GIST (
    "masterId" WITH =,
    "slot"     WITH &&
  )
  WHERE ("status" IN ('PENDING','CONFIRMED'));
