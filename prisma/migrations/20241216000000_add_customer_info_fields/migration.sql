-- CreateTable
CREATE TABLE "GoogleQuickRegistration" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "customerName" TEXT,
    "birthday" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleQuickRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleQuickRegistration_state_key" ON "GoogleQuickRegistration"("state");

-- CreateIndex
CREATE INDEX "GoogleQuickRegistration_state_idx" ON "GoogleQuickRegistration"("state");

-- CreateIndex
CREATE INDEX "GoogleQuickRegistration_verified_idx" ON "GoogleQuickRegistration"("verified");

-- CreateIndex
CREATE INDEX "GoogleQuickRegistration_expiresAt_idx" ON "GoogleQuickRegistration"("expiresAt");