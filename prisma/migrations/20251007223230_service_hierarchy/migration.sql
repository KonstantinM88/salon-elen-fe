-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "description" TEXT,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Service_parentId_idx" ON "Service"("parentId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
