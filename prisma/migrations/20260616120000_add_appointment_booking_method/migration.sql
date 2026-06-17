ALTER TABLE "Appointment"
ADD COLUMN "bookingMethod" TEXT NOT NULL DEFAULT 'website';

ALTER TABLE "BookingDraft"
ADD COLUMN "bookingMethod" TEXT NOT NULL DEFAULT 'website';

CREATE INDEX "Appointment_bookingMethod_idx" ON "Appointment"("bookingMethod");
CREATE INDEX "BookingDraft_bookingMethod_idx" ON "BookingDraft"("bookingMethod");
