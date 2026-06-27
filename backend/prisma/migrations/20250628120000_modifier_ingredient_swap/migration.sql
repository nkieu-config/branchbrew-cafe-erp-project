-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN "swapIngredientId" INTEGER;

-- AlterTable
ALTER TABLE "ModifierOption" ADD COLUMN "swapToIngredientId" INTEGER;

-- AddForeignKey
ALTER TABLE "ModifierGroup" ADD CONSTRAINT "ModifierGroup_swapIngredientId_fkey" FOREIGN KEY ("swapIngredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModifierOption" ADD CONSTRAINT "ModifierOption_swapToIngredientId_fkey" FOREIGN KEY ("swapToIngredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
