/*
  Warnings:

  - You are about to drop the column `slot` on the `Appointment` table. All the data in the column will be lost.
  - The primary key for the `_MasterServices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_MasterServices` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Appointment_slot_gist";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "slot";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_MasterServices" DROP CONSTRAINT "_MasterServices_AB_pkey";

-- CreateIndex
CREATE INDEX "Service_isArchived_idx" ON "Service"("isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "_MasterServices_AB_unique" ON "_MasterServices"("A", "B");
