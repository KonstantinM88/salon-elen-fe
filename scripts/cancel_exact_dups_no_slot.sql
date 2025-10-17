-- Удаляем точные дубликаты по (masterId, startAt, endAt), оставляя самую раннюю запись
WITH d AS (
  SELECT
    "masterId",
    "startAt",
    "endAt",
    ARRAY_AGG(id ORDER BY "createdAt", id) AS ids,
    COUNT(*) AS cnt
  FROM "Appointment"
  WHERE "status" IN ('PENDING','CONFIRMED')
  GROUP BY "masterId","startAt","endAt"
  HAVING COUNT(*) > 1
),
to_delete AS (
  SELECT unnest(ids[2:]) AS id_to_delete
  FROM d
)
DELETE FROM "Appointment" a
USING to_delete t
WHERE a.id = t.id_to_delete;

