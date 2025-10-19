DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public."Appointment"'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON public."Appointment";';
  END LOOP;
END
$$ LANGUAGE plpgsql;
