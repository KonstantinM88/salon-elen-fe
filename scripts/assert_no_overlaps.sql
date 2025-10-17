DO $$
BEGIN
  IF EXISTS (
    WITH a AS (
      SELECT id, "masterId", "startAt", "endAt"
      FROM "Appointment"
      WHERE "status" IN ('PENDING','CONFIRMED')
    )
    SELECT 1
    FROM a a1
    JOIN a a2
      ON a1."masterId" = a2."masterId"
     AND a1.id < a2.id
     AND tstzrange(a1."startAt", a1."endAt",'[)') && tstzrange(a2."startAt", a2."endAt",'[)')
    LIMIT 1
  ) THEN
    RAISE EXCEPTION 'Found overlapping appointments — fix before migration';
  END IF;
END
$$;

