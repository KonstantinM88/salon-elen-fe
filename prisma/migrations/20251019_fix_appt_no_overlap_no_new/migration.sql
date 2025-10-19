-- enable what we need
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- аккуратно снимаем всё старое, если когда-то уже создавалось
DO $$
BEGIN
  -- старое ограничение на перекрытие (если было)
  BEGIN
    ALTER TABLE "public"."Appointment" DROP CONSTRAINT IF EXISTS "appointment_no_overlap";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;

  -- старые индексы
  BEGIN
    DROP INDEX IF EXISTS "public"."Appointment_no_overlap_idx";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;

  BEGIN
    DROP INDEX IF EXISTS "public"."Appointment_slot_gist";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;

  -- возможные «исторические» триггеры/функции
  BEGIN
    DROP TRIGGER IF EXISTS "appt_no_overlap_trg" ON "public"."Appointment";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;

  BEGIN
    DROP FUNCTION IF EXISTS "public"."appt_no_overlap"();
  EXCEPTION
    WHEN undefined_function THEN NULL;
  END;
END $$;

-- генерируемая колонка-диапазон: НЕ трогает данные и не требует IMMUTABLE-функций
ALTER TABLE "public"."Appointment"
  ADD COLUMN IF NOT EXISTS "slot" tsrange
  GENERATED ALWAYS AS (tsrange("startAt","endAt",'[]')) STORED;

-- GIST индекс на slot (ускоряет проверку перекрытий)
CREATE INDEX IF NOT EXISTS "Appointment_slot_gist"
  ON "public"."Appointment"
  USING gist ("slot");

-- главное ограничение: мастер не может иметь пересекающиеся интервалы в активных статусах
ALTER TABLE "public"."Appointment"
  ADD CONSTRAINT "appointment_no_overlap"
  EXCLUDE USING gist (
    "masterId" WITH =,
    "slot"     WITH &&
  )
  WHERE ("status" IN ('PENDING','CONFIRMED'));

