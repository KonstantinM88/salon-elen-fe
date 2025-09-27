-- 1) Снимаем default, чтобы смена типа не споткнулась
ALTER TABLE "Article" ALTER COLUMN "type" DROP DEFAULT;

-- 2) Промежуточный тип: содержит ВСЕ значения (и старые, и новые)
--    Так безопасно переливаем данные из старого enum в новый.
CREATE TYPE "ArticleType_tmp" AS ENUM ('ARTICLE', 'PROMO', 'NEWS');

-- 3) Переводим колонку на промежуточный тип (через текстовое приведение)
ALTER TABLE "Article"
  ALTER COLUMN "type" TYPE "ArticleType_tmp"
  USING ("type"::text::"ArticleType_tmp");

-- 4) Конвертируем данные: PROMO -> NEWS (уже допускается tmp-типом)
UPDATE "Article" SET "type" = 'NEWS' WHERE "type" = 'PROMO';

-- 5) Финальный тип: только нужные значения
CREATE TYPE "ArticleType_new" AS ENUM ('ARTICLE', 'NEWS');

-- 6) Переводим колонку на финальный тип
ALTER TABLE "Article"
  ALTER COLUMN "type" TYPE "ArticleType_new"
  USING ("type"::text::"ArticleType_new");

-- 7) Подчищаем старые типы и переименовываем финальный в рабочее имя
DROP TYPE "ArticleType";
DROP TYPE "ArticleType_tmp";
ALTER TYPE "ArticleType_new" RENAME TO "ArticleType";

-- 8) Возвращаем default (если он задан в Prisma как @default(ARTICLE))
ALTER TABLE "Article" ALTER COLUMN "type" SET DEFAULT 'ARTICLE';
