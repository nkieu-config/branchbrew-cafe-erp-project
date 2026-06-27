"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProduct, useUpdateProduct, useIngredients } from "@/hooks/domains/useProductQueries";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import type { Product, Ingredient } from "@/types/api";
import { updateLineItem } from "@/lib/form";
import { getErrorMessage } from "@/lib/errors";
import {
  formRemoveButtonClassName,
  formSectionClassName,
  hubCtaClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ProductFormModal({ isOpen, onClose, product }: { isOpen: boolean, onClose: () => void, product?: Product }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [recipeItems, setRecipeItems] = useState<{ ingredientId: number, quantity: number }[]>([]);

  const { data: ingredientsData } = useIngredients();
  const ingredients = ingredientsData || [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price);
      setIsActive(product.isActive ?? true);
      setRecipeItems(product.recipeItems?.map((ri) => ({
        ingredientId: ri.ingredientId,
        quantity: ri.quantity
      })) || []);
    } else {
      setName("");
      setCategory("");
      setPrice("");
      setIsActive(true);
      setRecipeItems([]);
    }
  }, [product, isOpen]);

  const handleAddRecipeItem = () => {
    setRecipeItems([...recipeItems, { ingredientId: 0, quantity: 1 }]);
  };

  const handleRemoveRecipeItem = (index: number) => {
    const newItems = [...recipeItems];
    newItems.splice(index, 1);
    setRecipeItems(newItems);
  };

  const handleRecipeItemChange = (index: number, field: 'ingredientId' | 'quantity', value: number) => {
    setRecipeItems(updateLineItem(recipeItems, index, field, value));
  };

  const handleSubmit = async () => {
    if (!name || !category || price === "") {
      toast.error("Name, category, and price are required");
      return;
    }

    // validate recipe items
    const validRecipeItems = recipeItems.filter(r => r.ingredientId > 0 && r.quantity > 0);

    try {
        const payload = { 
        name, 
        category, 
        price: Number(price),
        isActive,
        recipeItems: validRecipeItems.length > 0 ? validRecipeItems : undefined
      };

      if (product) {
        await updateMutation.mutateAsync({ id: product.id, ...payload } as Parameters<typeof updateMutation.mutateAsync>[0]);
        toast.success("Product updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Product created successfully!");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Operation failed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Menu Item" : "New Menu Item"}</DialogTitle>
          <DialogDescription>Create a sellable menu item and define its menu recipe for POS inventory deduction.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className={formSectionClassName("mb-0 space-y-4")}>
            <h3 className={cn("font-bold", text.primary)}>1. Basic Info</h3>
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input placeholder="e.g. Iced Latte" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input placeholder="e.g. Coffee" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Selling Price (฿)</Label>
                <Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--table-row-border)]">
              <input 
                type="checkbox" 
                id="isActiveProduct" 
                checked={isActive} 
                onChange={e => setIsActive(e.target.checked)} 
                className="w-4 h-4 rounded border-input"
              />
              <Label htmlFor="isActiveProduct" className="cursor-pointer">Active (Available for sale on POS)</Label>
            </div>
          </div>

          <div className={formSectionClassName("mb-0 space-y-4")}>
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold", text.primary)}>2. Menu Recipe</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRecipeItem} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add Ingredient
              </Button>
            </div>
            
            {recipeItems.length === 0 ? (
              <p className={cn("text-sm italic", text.muted)}>No menu recipe defined. This item will not deduct inventory when sold.</p>
            ) : (
              <div className="space-y-3">
                {recipeItems.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Ingredient</Label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={item.ingredientId}
                        onChange={(e) => handleRecipeItemChange(idx, 'ingredientId', Number(e.target.value))}
                      >
                        <option value={0}>Select…</option>
                        {ingredients.map((ing: Ingredient) => (
                          <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={item.quantity} 
                        onChange={(e) => handleRecipeItemChange(idx, 'quantity', Number(e.target.value))} 
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className={cn(formRemoveButtonClassName(), "h-10 w-10")} onClick={() => handleRemoveRecipeItem(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className={hubCtaClassName("products")}>Save Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
