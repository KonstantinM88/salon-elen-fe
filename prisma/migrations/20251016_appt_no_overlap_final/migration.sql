-- 0) Поддержка GiST по uuid через btree_gist (для оператора "=")
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1) Снести старое EXCLUDE, если уже было
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointment_no_overlap_per_master') THEN
    ALTER TABLE "Appointment" DROP CONSTRAINT appointment_no_overlap_per_master;
  END IF;
END $$;

-- 2) Добавить простую колонку-диапазон без generated/expressions
ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "slot" tstzrange;

-- 3) Заполнить slot для существующих записей (это обычный UPDATE — допустимо)
UPDATE "Appointment"
SET "slot" = tstzrange("startAt", "endAt", '[)')
WHERE "slot" IS NULL;

-- 4) Сделать NOT NULL, чтобы EXCLUDE был корректным
ALTER TABLE "Appointment"
  ALTER COLUMN "slot" SET NOT NULL;

-- 5) Триггер, чтобы slot всегда соответствовал startAt/endAt
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

-- 6) Предохранитель: если сейчас есть пересечения у активных статусов — прервать миграцию
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

-- 7) Само исключающее ограничение — ТОЛЬКО по колонкам (никаких функций/выражений)
ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_no_overlap_per_master
  EXCLUDE USING gist (
    "masterId" WITH =,
    "slot"     WITH &&
  )
  WHERE ("status" IN ('PENDING','CONFIRMED'));
