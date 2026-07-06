-- CreateEnum
CREATE TYPE "StockCountStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockAdjustmentReason" AS ENUM ('COUNT_VARIANCE', 'DAMAGE', 'CORRECTION');

-- CreateTable
CREATE TABLE "StockCount" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "status" "StockCountStatus" NOT NULL DEFAULT 'DRAFT',
    "isBlind" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdByUserId" INTEGER NOT NULL,
    "approvedByUserId" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCountLine" (
    "id" SERIAL NOT NULL,
    "stockCountId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "expectedQty" DOUBLE PRECISION,
    "countedQty" DOUBLE PRECISION,

    CONSTRAINT "StockCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" SERIAL NOT NULL,
    "branchId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "quantityDelta" DOUBLE PRECISION NOT NULL,
    "reason" "StockAdjustmentReason" NOT NULL,
    "notes" TEXT,
    "stockCountId" INTEGER,
    "createdByUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockCount_branchId_status_idx" ON "StockCount"("branchId", "status");

-- CreateIndex
CREATE INDEX "StockCount_createdByUserId_idx" ON "StockCount"("createdByUserId");

-- CreateIndex
CREATE INDEX "StockCount_approvedByUserId_idx" ON "StockCount"("approvedByUserId");

-- CreateIndex
CREATE INDEX "StockCountLine_ingredientId_idx" ON "StockCountLine"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "StockCountLine_stockCountId_ingredientId_key" ON "StockCountLine"("stockCountId", "ingredientId");

-- CreateIndex
CREATE INDEX "StockAdjustment_branchId_ingredientId_idx" ON "StockAdjustment"("branchId", "ingredientId");

-- CreateIndex
CREATE INDEX "StockAdjustment_stockCountId_idx" ON "StockAdjustment"("stockCountId");

-- CreateIndex
CREATE INDEX "StockAdjustment_createdByUserId_idx" ON "StockAdjustment"("createdByUserId");

-- AddForeignKey
ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCountLine" ADD CONSTRAINT "StockCountLine_stockCountId_fkey" FOREIGN KEY ("stockCountId") REFERENCES "StockCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCountLine" ADD CONSTRAINT "StockCountLine_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_stockCountId_fkey" FOREIGN KEY ("stockCountId") REFERENCES "StockCount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- One open (non-terminal) stock count per branch at a time
CREATE UNIQUE INDEX "StockCount_branch_open_key" ON "StockCount"("branchId") WHERE "status" IN ('DRAFT', 'SUBMITTED');
