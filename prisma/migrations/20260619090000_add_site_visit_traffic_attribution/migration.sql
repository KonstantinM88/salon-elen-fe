ALTER TABLE "site_visit"
ADD COLUMN "trafficSource" VARCHAR(32) NOT NULL DEFAULT 'direct',
ADD COLUMN "utmSource" VARCHAR(120),
ADD COLUMN "utmMedium" VARCHAR(120),
ADD COLUMN "utmCampaign" VARCHAR(160);

CREATE INDEX "site_visit_dateISO_trafficSource_idx"
ON "site_visit"("dateISO", "trafficSource");
