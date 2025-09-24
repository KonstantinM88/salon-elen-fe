-- CreateEnum
CREATE TYPE "public"."ArticleType" AS ENUM ('ARTICLE', 'PROMO');

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" TEXT NOT NULL,
    "type" "public"."ArticleType" NOT NULL DEFAULT 'ARTICLE',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "cover" TEXT,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDesc" TEXT,
    "ogTitle" TEXT,
    "ogDesc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "album" TEXT,
    "title" TEXT,
    "alt" TEXT,
    "desc" TEXT,
    "src" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "public"."Article"("slug");
