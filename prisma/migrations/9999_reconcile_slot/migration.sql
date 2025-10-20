-- reconcile: приводим историю миграций к фактической БД
DROP INDEX IF EXISTS "Appointment_slot_idx";
ALTER TABLE "public"."Appointment" DROP COLUMN IF EXISTS "slot";
