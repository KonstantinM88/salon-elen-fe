-- DropIndex
DROP INDEX "public"."Appointment_serviceId_startAt_key";

-- CreateIndex
CREATE INDEX "Appointment_masterId_startAt_idx" ON "Appointment"("masterId", "startAt");
