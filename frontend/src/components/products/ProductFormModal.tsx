"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateProduct,
  useUpdateProduct,
  useIngredients,
} from "@/hooks/domains/useProductQueries";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Product, Ingredient } from "@/types/api";
import { updateLineItem } from "@/lib/form";
import { getErrorMessage } from "@/lib/errors";
import {
  formFieldInsetClassName,
  formRemoveButtonClassName,
  formSectionClassName,
  formSelectContentClassName,
  hubCtaClassName,
  productsDialogContentClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type RecipeRow = {
  rowId: string;
  ingredientId: number;
  quantity: number;
};

function newRecipeRow(): RecipeRow {
  return { rowId: crypto.randomUUID(), ingredientId: 0, quantity: 1 };
}

export function ProductFormModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);
  const [recipeItems, setRecipeItems] = useState<RecipeRow[]>([]);

  const { data: ingredientsData } = useIngredients();
  const ingredients = ingredientsData || [];

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const resetForm = useCallback(() => {
    setName("");
    setCategory("");
    setPrice("");
    setIsActive(true);
    setRecipeItems([]);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price);
      setIsActive(product.isActive ?? true);
      setRecipeItems(
        product.recipeItems?.map((ri) => ({
          rowId: crypto.randomUUID(),
          ingredientId: ri.ingredientId,
          quantity: ri.quantity,
        })) ?? [],
      );
    } else {
      resetForm();
    }
  }, [product, isOpen, resetForm]);

  const duplicateIngredientIds = useMemo(() => {
    const seen = new Set<number>();
    const duplicates = new Set<number>();
    for (const item of recipeItems) {
      if (item.ingredientId <= 0) continue;
      if (seen.has(item.ingredientId)) duplicates.add(item.ingredientId);
      seen.add(item.ingredientId);
    }
    return duplicates;
  }, [recipeItems]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddRecipeItem = () => {
    setRecipeItems([...recipeItems, newRecipeRow()]);
  };

  const handleRemoveRecipeItem = (rowId: string) => {
    setRecipeItems(recipeItems.filter((item) => item.rowId !== rowId));
  };

  const handleRecipeItemChange = (
    rowId: string,
    field: "ingredientId" | "quantity",
    value: number,
  ) => {
    const index = recipeItems.findIndex((item) => item.rowId === rowId);
    if (index === -1) return;
    setRecipeItems(updateLineItem(recipeItems, index, field, value));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !category.trim() || price === "") {
      toast.error("Name, category, and price are required");
      return;
    }

    if (duplicateIngredientIds.size > 0) {
      toast.error("Each ingredient can only appear once in the menu recipe");
      return;
    }

    const validRecipeItems = recipeItems
      .filter((r) => r.ingredientId > 0 && r.quantity > 0)
      .map(({ ingredientId, quantity }) => ({ ingredientId, quantity }));

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      isActive,
      recipeItems: validRecipeItems.length > 0 ? validRecipeItems : undefined,
    };

    try {
      if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          ...payload,
        } as Parameters<typeof updateMutation.mutateAsync>[0]);
        toast.success("Menu item updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Menu item created");
      }
      handleClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save menu item"));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className={productsDialogContentClassName("max-w-[600px]")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product ? "Edit Menu Item" : "New Menu Item"}
          </DialogTitle>
          <DialogDescription className={text.muted}>
            Create a sellable menu item and define its menu recipe for POS inventory deduction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className={formSectionClassName("mb-0 space-y-4")}>
            <h3 className={cn("font-bold", text.primary)}>1. Basic Info</h3>
            <div className="space-y-2">
              <Label htmlFor="product-name" className={text.secondary}>
                Product Name
              </Label>
              <Input
                id="product-name"
                placeholder="e.g. Iced Latte"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category" className={text.secondary}>
                  Category
                </Label>
                <Input
                  id="product-category"
                  placeholder="e.g. Coffee"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={formFieldInsetClassName()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price" className={text.secondary}>
                  Selling Price (฿)
                </Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 85"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={formFieldInsetClassName()}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--table-row-border)]">
              <Label htmlFor="isActiveProduct" className={cn("cursor-pointer", text.secondary)}>
                Active (available for sale on POS)
              </Label>
              <Switch
                id="isActiveProduct"
                checked={isActive}
                onCheckedChange={setIsActive}
                aria-label="Toggle menu item active status"
              />
            </div>
          </div>

          <div className={formSectionClassName("mb-0 space-y-4")}>
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold", text.primary)}>2. Menu Recipe</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRecipeItem}
                className="h-9 font-medium"
              >
                <Plus className="w-4 h-4 mr-1" aria-hidden />
                Add Ingredient
              </Button>
            </div>

            {recipeItems.length === 0 ? (
              <p className={cn("text-sm italic", text.muted)}>
                No menu recipe defined. This item will not deduct inventory when sold.
              </p>
            ) : (
              <div className="space-y-3">
                {recipeItems.map((item) => {
                  const isDuplicate =
                    item.ingredientId > 0 && duplicateIngredientIds.has(item.ingredientId);
                  return (
                    <div key={item.rowId} className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`recipe-ingredient-${item.rowId}`}
                          className={cn("text-xs", text.secondary)}
                        >
                          Ingredient
                        </Label>
                        <Select
                          value={item.ingredientId === 0 ? "" : String(item.ingredientId)}
                          onValueChange={(value) => {
                            if (value != null) {
                              handleRecipeItemChange(item.rowId, "ingredientId", Number(value));
                            }
                          }}
                        >
                          <SelectTrigger
                            id={`recipe-ingredient-${item.rowId}`}
                            className={formFieldInsetClassName(
                              cn("w-full", isDuplicate && "border-destructive"),
                            )}
                            aria-invalid={isDuplicate}
                          >
                            <SelectValue placeholder="Select ingredient…" />
                          </SelectTrigger>
                          <SelectContent className={formSelectContentClassName()}>
                            {ingredients.map((ing: Ingredient) => (
                              <SelectItem key={ing.id} value={String(ing.id)}>
                                {ing.name} ({ing.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isDuplicate && (
                          <p className="text-xs text-destructive">Duplicate ingredient</p>
                        )}
                      </div>
                      <div className="w-28 space-y-1">
                        <Label
                          htmlFor={`recipe-qty-${item.rowId}`}
                          className={cn("text-xs", text.secondary)}
                        >
                          Quantity
                        </Label>
                        <Input
                          id={`recipe-qty-${item.rowId}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            handleRecipeItemChange(
                              item.rowId,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                          className={formFieldInsetClassName()}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(formRemoveButtonClassName(), "h-11 w-11 shrink-0")}
                        onClick={() => handleRemoveRecipeItem(item.rowId)}
                        aria-label="Remove recipe line"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            className={hubCtaClassName("products", "font-bold")}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save Menu Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
