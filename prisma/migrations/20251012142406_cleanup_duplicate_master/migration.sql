-- CreateTable
CREATE TABLE "OrphanedUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "sourceUserId" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrphanedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrphanedUser_email_key" ON "OrphanedUser"("email");

-- CreateIndex
CREATE INDEX "OrphanedUser_archivedAt_idx" ON "OrphanedUser"("archivedAt");
