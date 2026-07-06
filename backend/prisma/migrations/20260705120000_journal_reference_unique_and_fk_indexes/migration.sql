DROP INDEX "JournalEntry_reference_idx";
CREATE UNIQUE INDEX "JournalEntry_reference_key" ON "JournalEntry"("reference");

CREATE INDEX "JournalEntry_branchId_idx" ON "JournalEntry"("branchId");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_promotionId_idx" ON "Order"("promotionId");
