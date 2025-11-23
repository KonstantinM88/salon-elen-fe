-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "referral" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_birthDate_idx" ON "Appointment"("birthDate");
