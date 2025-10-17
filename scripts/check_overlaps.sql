WITH a AS (
  SELECT id, "masterId", "startAt", "endAt", "status"
  FROM "Appointment"
  WHERE "status" IN ('PENDING','CONFIRMED')
)
SELECT a1.id AS id1, a2.id AS id2, a1."masterId",
       a1."startAt" AS start1, a1."endAt" AS end1,
       a2."startAt" AS start2, a2."endAt" AS end2
FROM a a1
JOIN a a2
  ON a1."masterId" = a2."masterId"
 AND a1.id < a2.id
 AND tstzrange(a1."startAt", a1."endAt",'[)') && tstzrange(a2."startAt", a2."endAt",'[)')
ORDER BY a1."masterId", a1."startAt";
