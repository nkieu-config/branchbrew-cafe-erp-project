-- DropIndex
DROP INDEX "BranchInventory_branchId_idx";

-- DropIndex
DROP INDEX "Order_branchId_idx";

-- DropIndex
DROP INDEX "Order_branchId_queueDate_idx";

-- CreateIndex
CREATE INDEX "AttendanceRecord_userId_idx" ON "AttendanceRecord"("userId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_branchId_idx" ON "AttendanceRecord"("branchId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Equipment_branchId_idx" ON "Equipment"("branchId");

-- CreateIndex
CREATE INDEX "Expense_recordedById_idx" ON "Expense"("recordedById");

-- CreateIndex
CREATE INDEX "Ingredient_primarySupplierId_idx" ON "Ingredient"("primarySupplierId");

-- CreateIndex
CREATE INDEX "InventoryBatch_poId_idx" ON "InventoryBatch"("poId");

-- CreateIndex
CREATE INDEX "MaintenanceLog_equipmentId_idx" ON "MaintenanceLog"("equipmentId");

-- CreateIndex
CREATE INDEX "ModifierGroup_swapIngredientId_idx" ON "ModifierGroup"("swapIngredientId");

-- CreateIndex
CREATE INDEX "ModifierOption_groupId_idx" ON "ModifierOption"("groupId");

-- CreateIndex
CREATE INDEX "ModifierOption_swapToIngredientId_idx" ON "ModifierOption"("swapToIngredientId");

-- CreateIndex
CREATE INDEX "PayrollRun_branchId_idx" ON "PayrollRun"("branchId");

-- CreateIndex
CREATE INDEX "Payslip_payrollRunId_idx" ON "Payslip"("payrollRunId");

-- CreateIndex
CREATE INDEX "Payslip_userId_idx" ON "Payslip"("userId");

-- CreateIndex
CREATE INDEX "ProductionBOM_rawIngredientId_idx" ON "ProductionBOM"("rawIngredientId");

-- CreateIndex
CREATE INDEX "ProductionOrder_targetIngredientId_idx" ON "ProductionOrder"("targetIngredientId");

-- CreateIndex
CREATE INDEX "ProductionOrder_createdByUserId_idx" ON "ProductionOrder"("createdByUserId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_poId_idx" ON "PurchaseOrderItem"("poId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_ingredientId_idx" ON "PurchaseOrderItem"("ingredientId");

-- CreateIndex
CREATE INDEX "RecipeItem_productId_idx" ON "RecipeItem"("productId");

-- CreateIndex
CREATE INDEX "RecipeItem_ingredientId_idx" ON "RecipeItem"("ingredientId");

-- CreateIndex
CREATE INDEX "ShiftSettlement_branchId_idx" ON "ShiftSettlement"("branchId");

-- CreateIndex
CREATE INDEX "ShiftSettlement_submittedById_idx" ON "ShiftSettlement"("submittedById");

-- CreateIndex
CREATE INDEX "StockTransfer_ingredientId_idx" ON "StockTransfer"("ingredientId");

-- CreateIndex
CREATE INDEX "StockTransfer_requestedById_idx" ON "StockTransfer"("requestedById");

-- CreateIndex
CREATE INDEX "StockTransfer_approvedById_idx" ON "StockTransfer"("approvedById");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "User"("branchId");

-- CreateIndex
CREATE INDEX "WasteLog_ingredientId_idx" ON "WasteLog"("ingredientId");

-- CreateIndex
CREATE INDEX "WasteLog_recordedById_idx" ON "WasteLog"("recordedById");
