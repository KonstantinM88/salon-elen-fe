-- Добавляем поля описания и родителя
ALTER TABLE "public"."Service"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "parentId" TEXT;

-- Индекс по родителю
CREATE INDEX IF NOT EXISTS "Service_parentId_idx"
  ON "public"."Service" ("parentId");

-- FK на самого себя
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'Service_parentId_fkey'
  ) THEN
    ALTER TABLE "public"."Service"
      ADD CONSTRAINT "Service_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "public"."Service"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;
