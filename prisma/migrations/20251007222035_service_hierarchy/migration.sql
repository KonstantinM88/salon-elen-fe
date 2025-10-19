/* 
  Безопасная правка миграции:
  - Удаляем FK и индекс ТОЛЬКО если они реально существуют (idlempotent).
  - НЕ удаляем колонки "description" и "parentId", т.к. они есть в актуальной схеме.
    Если когда-то понадобится, см. закомментированные IF EXISTS внизу.
*/

-- DropForeignKey (safe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'Service_parentId_fkey'
      AND tc.table_name = 'Service'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_parentId_fkey";
  END IF;
END
$$;

-- DropIndex (safe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'Service_parentId_idx'
      AND n.nspname = 'public'
  ) THEN
    DROP INDEX "public"."Service_parentId_idx";
  END IF;
END
$$;

-- AlterTable: текущую схему сохраняем, колонки НЕ удаляем.
-- Если в другой среде их действительно нужно убрать, раскомментируйте безопасные строки ниже.

-- ALTER TABLE "public"."Service" DROP COLUMN IF EXISTS "description";
-- ALTER TABLE "public"."Service" DROP COLUMN IF EXISTS "parentId";
