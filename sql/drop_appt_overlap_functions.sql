DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT n.nspname AS nsp,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('appt_no_overlap','appointment_no_overlap','no_overlap')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS '
      || quote_ident(rec.nsp) || '.' || quote_ident(rec.proname)
      || '(' || rec.args || ') CASCADE;';
  END LOOP;
END
$$ LANGUAGE plpgsql;
