-- AlterTable
ALTER TABLE "Order" ADD COLUMN "queueNumber" INTEGER;
ALTER TABLE "Order" ADD COLUMN "queueDate" DATE;

-- CreateIndex
CREATE UNIQUE INDEX "Order_branchId_queueDate_queueNumber_key" ON "Order"("branchId", "queueDate", "queueNumber");

-- CreateIndex
CREATE INDEX "Order_branchId_queueDate_idx" ON "Order"("branchId", "queueDate");
