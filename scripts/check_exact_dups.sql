-- Покажет группы записей у одного мастера с одинаковым интервалом (slot)
-- среди PENDING/CONFIRMED, где таких записей > 1
WITH g AS (
  SELECT
    "masterId",
    tstzrange("startAt","endAt",'[)') AS slot,
    COUNT(*)                         AS cnt,
    ARRAY_AGG(id ORDER BY "createdAt", id) AS ids
  FROM "Appointment"
  WHERE "status" IN ('PENDING','CONFIRMED')
  GROUP BY "masterId", tstzrange("startAt","endAt",'[)')
  HAVING COUNT(*) > 1
)
SELECT g."masterId", g.slot, g.cnt, a.*
FROM g
JOIN "Appointment" a ON a.id = ANY(g.ids)
ORDER BY g."masterId", lower(g.slot), a."createdAt";
