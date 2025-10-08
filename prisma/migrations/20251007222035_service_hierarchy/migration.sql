/*
  Warnings:

  - You are about to drop the column `description` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_parentId_fkey";

-- DropIndex
DROP INDEX "public"."Service_parentId_idx";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "description",
DROP COLUMN "parentId";
