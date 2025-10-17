-- prisma/migrations/20251015_appointment_no_overlap/migration.sql

-- 0) Расширение для EXCLUDE (равенство по masterId)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1) Снять старое ограничение, если пытались вешать ранее
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointment_no_overlap_per_master'
      AND conrelid = 'public."Appointment"'::regclass
  ) THEN
    ALTER TABLE "Appointment" DROP CONSTRAINT appointment_no_overlap_per_master;
  END IF;
END$$;

-- 2) Удалить GENERATED-колонку slot, если успели добавить (и вообще любую slot)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'Appointment'
      AND column_name  = 'slot'
  ) THEN
    ALTER TABLE "Appointment" DROP COLUMN "slot";
  END IF;
END$$;

-- 3) Добавить Обычную колонку slot (без generated)
ALTER TABLE "Appointment"
  ADD COLUMN "slot" tstzrange;

-- 4) Триггер: поддерживаем slot = tstzrange(startAt, endAt, '[)') на INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.appt_set_slot()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."slot" := tstzrange(NEW."startAt", NEW."endAt", '[)');
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS appt_set_slot_trg ON "Appointment";
CREATE TRIGGER appt_set_slot_trg
BEFORE INSERT OR UPDATE OF "startAt","endAt" ON "Appointment"
FOR EACH ROW EXECUTE FUNCTION public.appt_set_slot();

-- 5) Проставить slot для уже существующих строк
UPDATE "Appointment"
SET "slot" = tstzrange("startAt","endAt",'[)')
WHERE "slot" IS NULL;

-- 6) Наложить исключающее ограничение: нет пересечений у одного мастера
ALTER TABLE "Appointment"
ADD CONSTRAINT appointment_no_overlap_per_master
EXCLUDE USING gist (
  "masterId" WITH =,
  "slot"     WITH &&
)
WHERE ("status" IN ('PENDING','CONFIRMED'));

-- 7) Индекс для ускорения типичных запросов
CREATE INDEX IF NOT EXISTS appointment_master_time_idx
  ON "Appointment" ("masterId", "startAt");
