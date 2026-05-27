CREATE TABLE "site_visit" (
    "id" TEXT NOT NULL,
    "visitId" VARCHAR(128) NOT NULL,
    "dateISO" VARCHAR(10) NOT NULL,
    "entryPath" VARCHAR(512) NOT NULL,
    "lastPath" VARCHAR(512) NOT NULL,
    "referrer" VARCHAR(512),
    "locale" VARCHAR(5),
    "userAgent" VARCHAR(512),
    "deviceType" VARCHAR(16) NOT NULL DEFAULT 'unknown',
    "ipAnon" VARCHAR(45),
    "pageviews" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_visit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_visit_visitId_dateISO_key" ON "site_visit"("visitId", "dateISO");
CREATE INDEX "site_visit_dateISO_idx" ON "site_visit"("dateISO");
CREATE INDEX "site_visit_createdAt_idx" ON "site_visit"("createdAt");
CREATE INDEX "site_visit_deviceType_idx" ON "site_visit"("deviceType");
