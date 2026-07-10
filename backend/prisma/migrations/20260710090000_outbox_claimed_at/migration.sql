ALTER TABLE "OutboxEvent" ADD COLUMN "claimedAt" TIMESTAMP(3);

CREATE INDEX "OutboxEvent_status_claimedAt_idx" ON "OutboxEvent"("status", "claimedAt");

UPDATE "OutboxEvent" SET "claimedAt" = "createdAt" WHERE "status" = 'PROCESSING';
