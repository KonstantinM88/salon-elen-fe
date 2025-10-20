-- Разрешаем сравнение masterId в GiST
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Сносим старое ограничение (если было)
ALTER TABLE "public"."Appointment"
  DROP CONSTRAINT IF EXISTS "appt_no_overlap";

-- Добавляем сгенерированную колонку с полуоткрытым диапазоном [start, end)
-- Если колонка уже есть (после предыдущих экспериментов), просто пропустим.
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

-- На всякий случай валидируем интервал
ALTER TABLE "public"."Appointment"
  DROP CONSTRAINT IF EXISTS "appt_valid_interval",
  ADD  CONSTRAINT "appt_valid_interval" CHECK ("endAt" > "startAt");

-- Новое ограничение перекрытий по сгенерированному диапазону
-- Допускает касания по границе (11:00–12:00 и 12:00–13:00).
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "appt_no_overlap"
  EXCLUDE USING gist (
    "masterId"   WITH =,
    "appt_range" WITH &&
  )
  WHERE ("status" IN ('CONFIRMED','PENDING'));
