-- Backfill nullable titles before enforcing NOT NULL.
UPDATE "Service"
SET "title" = 'Untitled service'
WHERE "title" IS NULL;

ALTER TABLE "Service"
ALTER COLUMN "title" SET NOT NULL;
