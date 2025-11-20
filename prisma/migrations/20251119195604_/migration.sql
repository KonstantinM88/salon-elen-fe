-- CreateTable
CREATE TABLE "BookingDraft" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "referral" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingDraft_serviceId_idx" ON "BookingDraft"("serviceId");

-- CreateIndex
CREATE INDEX "BookingDraft_masterId_idx" ON "BookingDraft"("masterId");

-- CreateIndex
CREATE INDEX "BookingDraft_startAt_endAt_idx" ON "BookingDraft"("startAt", "endAt");
