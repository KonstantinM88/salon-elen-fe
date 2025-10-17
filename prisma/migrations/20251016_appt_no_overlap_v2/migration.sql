-- 0) btree_gist нужен для оператора "=" по uuid в EXCLUDE
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1) Удаляем старое ограничение, если (вдруг) есть
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_no_overlap_per_master') THEN
    ALTER TABLE "Appointment" DROP CONSTRAINT appointment_no_overlap_per_master;
  END IF;
END $$;

-- 2) Простая колонка-диапазон БЕЗ generated/expressions
ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "slot" tstzrange;

-- 3) Заполняем slot для существующих строк
UPDATE "Appointment"
SET "slot" = tstzrange("startAt", "endAt", '[)')
WHERE "slot" IS NULL;

-- 4) Делаем NOT NULL
ALTER TABLE "Appointment"
  ALTER COLUMN "slot" SET NOT NULL;

-- 5) Триггер, чтобы колонка поддерживалась при INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.set_appt_slot()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  NEW."slot" := tstzrange(NEW."startAt", NEW."endAt", '[)');
  RETURN NEW;
END
$fn$;

DROP TRIGGER IF EXISTS appt_set_slot ON "Appointment";
CREATE TRIGGER appt_set_slot
BEFORE INSERT OR UPDATE OF "startAt","endAt" ON "Appointment"
FOR EACH ROW EXECUTE FUNCTION public.set_appt_slot();

-- 6) Предохранитель: если уже есть пересечения у активных статусов — прерываем миграцию
DO $$
BEGIN
  IF EXISTS (
    WITH a AS (
      SELECT id, "masterId", "slot"
      FROM "Appointment"
      WHERE "status" IN ('PENDING','CONFIRMED')
    )
    SELECT 1
    FROM a x
    JOIN a y
      ON x."masterId" = y."masterId"
     AND x.id < y.id
     AND x."slot" && y."slot"
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Found overlapping appointments — clean before adding constraint';
  END IF;
END
$$;

-- 7) Само исключающее ограничение — БЕЗ выражений, только колонка
ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_no_overlap_per_master
  EXCLUDE USING gist (
    "masterId" WITH =,
    "slot"     WITH &&
  )
  WHERE ("status" IN ('PENDING','CONFIRMED'));
