DO $$
DECLARE
  rec record;
BEGIN
  -- CHECK
  FOR rec IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public."Appointment"'::regclass
      AND contype = 'c'
      AND (
        position(lower('new') in lower(pg_get_constraintdef(oid))) > 0 OR
        position(lower('overlap') in lower(pg_get_constraintdef(oid))) > 0 OR
        position(lower('slot') in lower(pg_get_constraintdef(oid))) > 0
      )
  LOOP
    EXECUTE 'ALTER TABLE public."Appointment" DROP CONSTRAINT IF EXISTS '
      || quote_ident(rec.conname) || ' CASCADE;';
  END LOOP;

  -- INDICES
  FOR rec IN
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'Appointment'
      AND (
        position(lower('new') in lower(indexdef)) > 0 OR
        position(lower('overlap') in lower(indexdef)) > 0 OR
        position(lower('slot') in lower(indexdef)) > 0
      )
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS public.' || quote_ident(rec.indexname) || ' CASCADE;';
  END LOOP;
END
$$ LANGUAGE plpgsql;
