-- CreateTable
CREATE TABLE "GoogleUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "picture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleVerificationRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_email_key" ON "GoogleUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleUser_googleId_key" ON "GoogleUser"("googleId");

-- CreateIndex
CREATE INDEX "GoogleUser_googleId_idx" ON "GoogleUser"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "GoogleVerificationRequest_state_key" ON "GoogleVerificationRequest"("state");

-- CreateIndex
CREATE INDEX "GoogleVerificationRequest_email_draftId_idx" ON "GoogleVerificationRequest"("email", "draftId");

-- CreateIndex
CREATE INDEX "GoogleVerificationRequest_state_idx" ON "GoogleVerificationRequest"("state");

-- CreateIndex
CREATE INDEX "GoogleVerificationRequest_expiresAt_idx" ON "GoogleVerificationRequest"("expiresAt");
