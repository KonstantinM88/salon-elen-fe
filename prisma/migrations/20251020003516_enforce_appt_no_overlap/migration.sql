-- 1) на всякий случай: нужен btree_gist для EXCLUDE по masterId
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2) ЧИСТИМ следы предыдущих попыток
-- старое ограничение (если было)
ALTER TABLE "public"."Appointment"
  DROP CONSTRAINT IF EXISTS "appt_no_overlap";

-- триггер и функция заполнения appt_range (если вдруг были)
DROP TRIGGER IF EXISTS "appt_set_range_biur" ON "public"."Appointment";
DROP FUNCTION IF EXISTS public.appt_set_range();

-- если ранее пробовали GENERATED-колонку — удалим её
ALTER TABLE "public"."Appointment"
  DROP COLUMN IF EXISTS "appt_range";

-- 3) Делаем обычную колонку под диапазон
ALTER TABLE "public"."Appointment"
  ADD COLUMN "appt_range" tstzrange;

-- 4) Функция-триггер: заполняет диапазон из startAt/endAt
CREATE FUNCTION public.appt_set_range()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."appt_range" := tstzrange(NEW."startAt", NEW."endAt", '[]');
  RETURN NEW;
END;
$$;

-- 5) Ставим BEFORE INSERT OR UPDATE триггер
CREATE TRIGGER "appt_set_range_biur"
BEFORE INSERT OR UPDATE ON "public"."Appointment"
FOR EACH ROW
EXECUTE FUNCTION public.appt_set_range();

-- 6) Бекфилл на существующие строки (если есть)
UPDATE "public"."Appointment"
SET "appt_range" = tstzrange("startAt","endAt",'[]')
WHERE "appt_range" IS NULL;

-- 7) EXCLUDE-предикат по masterId && appt_range, только для активных статусов
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "appt_no_overlap"
  EXCLUDE USING gist (
    "masterId"   WITH =,
    "appt_range" WITH &&
  )
  WHERE (status IN ('PENDING'::"AppointmentStatus", 'CONFIRMED'::"AppointmentStatus"));


