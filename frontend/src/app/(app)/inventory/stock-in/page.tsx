"use client";

import { useState } from "react";
import { useStockIn } from "@/hooks/domains/useInventoryQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowDownToLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { filterActive, updateLineItem } from "@/lib/form";
import type { Ingredient, StockLineItem } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import { BranchEmptyState } from "@/components/shared/branch-empty-state";
import { HubCard } from "@/components/shared/hub-card";
import { formLineRowClassName, formRemoveButtonClassName, hubInfoActionClassName } from "@/lib/theme";

export default function StockInPage() {
  const { activeBranchId } = useAuth();
  const router = useRouter();
  
  const { data: ingredientsData } = useIngredients();
  const ingredients = filterActive((ingredientsData || []) as Ingredient[]);
  
  const stockInMutation = useStockIn();

  const [items, setItems] = useState<StockLineItem[]>([
    { ingredientId: 0, quantity: 0, expiryDate: "" }
  ]);

  const handleAddItem = () => {
    setItems([...items, { ingredientId: 0, quantity: 0, expiryDate: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChange = <K extends keyof StockLineItem>(index: number, field: K, value: StockLineItem[K]) => {
    setItems(updateLineItem(items, index, field, value));
  };

  const handleSubmit = async () => {
    if (!activeBranchId) {
      toast.error("No active branch selected.");
      return;
    }

    const validItems = items.filter(i => i.ingredientId > 0 && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid ingredient with quantity > 0.");
      return;
    }

    try {
      await stockInMutation.mutateAsync({
        branchId: activeBranchId,
        items: validItems.map(i => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : undefined
        }))
      });
      toast.success("Stock received successfully!");
      router.push("/inventory");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to receive stock"));
    }
  };

  if (!activeBranchId) {
    return (
      <BranchEmptyState description="Select a branch in the top bar to receive stock." />
    );
  }

  return (
    <HubCard
      title="Receive Stock (GRN)"
      icon={ArrowDownToLine}
      description="Record ad-hoc receipts not tied to a purchase order — e.g. direct delivery, central kitchen drop-off, or stock corrections. To receive against an approved PO, use Procurement → Purchase Orders → Receive."
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className={formLineRowClassName()}>
            <div className="flex-1 space-y-2">
              <Label htmlFor={`grn-ingredient-${idx}`}>Ingredient</Label>
              <Select
                value={item.ingredientId === 0 ? "" : String(item.ingredientId)}
                onValueChange={(value) => {
                  if (value == null) return;
                  handleChange(idx, "ingredientId", Number(value));
                }}
              >
                <SelectTrigger id={`grn-ingredient-${idx}`} className="w-full">
                  <SelectValue placeholder="Select ingredient…" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={String(ing.id)}>
                      {ing.name} ({ing.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-32 space-y-2">
              <Label htmlFor={`grn-quantity-${idx}`}>Quantity</Label>
              <Input 
                id={`grn-quantity-${idx}`}
                name={`grn-quantity-${idx}`}
                type="number" 
                min="0.01" 
                step="0.01"
                placeholder="Qty"
                value={item.quantity || ""} 
                onChange={(e) => handleChange(idx, 'quantity', Number(e.target.value))} 
              />
            </div>

            <div className="w-48 space-y-2">
              <Label htmlFor={`grn-expiry-${idx}`}>Expiry Date (Optional)</Label>
              <Input 
                id={`grn-expiry-${idx}`}
                name={`grn-expiry-${idx}`}
                type="date" 
                value={item.expiryDate} 
                onChange={(e) => handleChange(idx, 'expiryDate', e.target.value)} 
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={formRemoveButtonClassName("h-10 w-10")}
              aria-label="Remove line"
              onClick={() => handleRemoveItem(idx)}
              disabled={items.length === 1}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddItem} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" /> Add Another Row
        </Button>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <ButtonLink variant="outline" href="/inventory">Cancel</ButtonLink>
        <Button onClick={handleSubmit} className={hubInfoActionClassName()} disabled={stockInMutation.isPending}>
          {stockInMutation.isPending ? "Saving…" : "Confirm & Receive Stock"}
        </Button>
      </div>
    </HubCard>
  );
}
