ALTER TABLE "BranchInventory" ADD CONSTRAINT "BranchInventory_stock_non_negative" CHECK (stock >= 0);
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_quantity_non_negative" CHECK (quantity >= 0);
