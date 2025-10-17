-- 1) На всякий случай дёрнем триггерную логику: заполнить slot, где NULL
UPDATE "Appointment"
SET "slot" = tstzrange("startAt","endAt",'[)')
WHERE "slot" IS NULL;

-- 2) Берём группы одинаковых слотов у одного мастера,
-- оставляем первую по времени создания, остальные делаем CANCELLED
WITH d AS (
  SELECT
    ARRAY_AGG(id ORDER BY "createdAt", id) AS ids
  FROM "Appointment"
  WHERE "status" IN ('PENDING','CONFIRMED')
  GROUP BY "masterId", tstzrange("startAt","endAt",'[)')
  HAVING COUNT(*) > 1
),
to_cancel AS (
  SELECT unnest(ids[2:]) AS id_to_cancel
  FROM d
)
UPDATE "Appointment" a
SET "status" = 'CANCELLED',
    "notes"  = COALESCE(a."notes",'') || ' [auto-cancel dup ' || now() || ']'
FROM to_cancel t
WHERE a.id = t.id_to_cancel;
