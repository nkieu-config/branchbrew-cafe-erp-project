"use client";

import { useState } from "react";
import { useRecordWaste } from "@/hooks/domains/useInventoryQueries";
import { useIngredients } from "@/hooks/domains/useProductQueries";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { filterActive, updateLineItem } from "@/lib/form";
import type { Ingredient, WasteLineItem } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

export default function WasteLogPage() {
  const { activeBranchId } = useAuth();
  const router = useRouter();
  
  const { data: ingredientsData } = useIngredients();
  const ingredients = filterActive((ingredientsData || []) as Ingredient[]);
  
  const recordWasteMutation = useRecordWaste();

  const [items, setItems] = useState<WasteLineItem[]>([
    { ingredientId: 0, quantity: 0, reason: "" }
  ]);

  const handleAddItem = () => {
    setItems([...items, { ingredientId: 0, quantity: 0, reason: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleChange = <K extends keyof WasteLineItem>(index: number, field: K, value: WasteLineItem[K]) => {
    setItems(updateLineItem(items, index, field, value));
  };

  const handleSubmit = async () => {
    if (!activeBranchId) {
      toast.error("No active branch selected.");
      return;
    }

    const validItems = items.filter(i => i.ingredientId > 0 && i.quantity > 0 && i.reason.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one valid ingredient with quantity > 0 and a reason.");
      return;
    }

    if (validItems.length !== items.length && items.length > 1) {
      const confirmProceed = confirm("Some rows have missing data and will be ignored. Proceed?");
      if (!confirmProceed) return;
    }

    try {
      await recordWasteMutation.mutateAsync({
        branchId: activeBranchId,
        items: validItems.map(i => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          reason: i.reason
        }))
      });
      toast.success("Waste recorded successfully!");
      router.push("/inventory");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to record waste. Not enough stock?"));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 max-w-4xl">
      <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          Record Waste & Adjustments
        </h2>
        <p className="text-sm text-slate-500">Record spoiled items, spillages, or staff consumption. This will deduct from current stock.</p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-end gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex-1 space-y-2">
              <Label>Ingredient</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={item.ingredientId}
                onChange={(e) => handleChange(idx, 'ingredientId', Number(e.target.value))}
              >
                <option value={0}>Select ingredient...</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                ))}
              </select>
            </div>
            
            <div className="w-32 space-y-2">
              <Label>Quantity</Label>
              <Input 
                type="number" 
                min="0.01" 
                step="0.01"
                placeholder="Qty"
                value={item.quantity || ""} 
                onChange={(e) => handleChange(idx, 'quantity', Number(e.target.value))} 
              />
            </div>

            <div className="w-64 space-y-2">
              <Label>Reason</Label>
              <Input 
                type="text" 
                placeholder="e.g. Expired, Spilled"
                value={item.reason} 
                onChange={(e) => handleChange(idx, 'reason', e.target.value)} 
              />
            </div>

            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-500" onClick={() => handleRemoveItem(idx)} disabled={items.length === 1}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddItem} className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" /> Add Another Row
        </Button>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/inventory")}>Cancel</Button>
        <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 text-white" disabled={recordWasteMutation.isPending}>
          {recordWasteMutation.isPending ? "Recording..." : "Confirm Waste Deduction"}
        </Button>
      </div>
    </div>
  );
}
