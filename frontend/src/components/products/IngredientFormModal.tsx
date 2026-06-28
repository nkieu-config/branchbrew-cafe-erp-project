"use client";

import { useState, useEffect, useCallback } from "react";
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
  useCreateIngredient,
  useUpdateIngredient,
} from "@/hooks/domains/useProductQueries";
import { useSuppliers } from "@/hooks/domains/useProcurementQueries";
import { toast } from "sonner";
import type { Ingredient, Supplier } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";
import {
  formFieldInsetClassName,
  formSelectContentClassName,
  hubCtaClassName,
  productsDialogContentClassName,
  text,
  typeHeadingClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function IngredientFormModal({
  isOpen,
  onClose,
  ingredient,
}: {
  isOpen: boolean;
  onClose: () => void;
  ingredient?: Ingredient;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [costPerUnit, setCostPerUnit] = useState<number | "">("");
  const [primarySupplierId, setPrimarySupplierId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const { data: suppliers = [] } = useSuppliers();
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const resetForm = useCallback(() => {
    setName("");
    setUnit("");
    setCostPerUnit("");
    setPrimarySupplierId("");
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (ingredient) {
      setName(ingredient.name);
      setUnit(ingredient.unit);
      setCostPerUnit(ingredient.costPerUnit ?? "");
      setPrimarySupplierId(
        ingredient.primarySupplierId ? String(ingredient.primarySupplierId) : "",
      );
      setIsActive(ingredient.isActive ?? true);
    } else {
      resetForm();
    }
  }, [ingredient, isOpen, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !unit.trim()) {
      toast.error("Name and unit are required");
      return;
    }

    const payload = {
      name: name.trim(),
      unit: unit.trim(),
      costPerUnit: costPerUnit === "" ? 0 : Number(costPerUnit),
      isActive,
      ...(primarySupplierId
        ? { primarySupplierId: Number(primarySupplierId) }
        : {}),
    };

    try {
      if (ingredient) {
        await updateMutation.mutateAsync({ id: ingredient.id, ...payload });
        toast.success("Ingredient updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Ingredient created");
      }
      handleClose();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save ingredient"));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className={productsDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl")}>
            {ingredient ? "Edit Ingredient" : "New Raw Ingredient"}
          </DialogTitle>
          <DialogDescription className={text.muted}>
            Add raw materials that will be used to build menu recipes and production BOMs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="ingredient-name" className={text.secondary}>
              Ingredient Name
            </Label>
            <Input
              id="ingredient-name"
              placeholder="e.g. Arabica Beans"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={formFieldInsetClassName()}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient-unit" className={text.secondary}>
                Unit of Measurement
              </Label>
              <Input
                id="ingredient-unit"
                placeholder="e.g. g, ml, pcs"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredient-cost" className={text.secondary}>
                Estimated Cost per Unit (฿)
              </Label>
              <Input
                id="ingredient-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 0.50"
                value={costPerUnit}
                onChange={(e) =>
                  setCostPerUnit(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ingredient-supplier" className={text.secondary}>
              Primary Supplier (Optional)
            </Label>
            <Select
              value={primarySupplierId || "none"}
              onValueChange={(value) => {
                if (value == null) return;
                setPrimarySupplierId(value === "none" ? "" : value);
              }}
            >
              <SelectTrigger
                id="ingredient-supplier"
                className={formFieldInsetClassName("w-full")}
              >
                <SelectValue placeholder="Select supplier…" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                <SelectItem value="none">None</SelectItem>
                {(suppliers as Supplier[]).map((supplier) => (
                  <SelectItem key={supplier.id} value={String(supplier.id)}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--table-row-border)]">
            <Label htmlFor="isActiveIngredient" className={cn("cursor-pointer", text.secondary)}>
              Active (available for recipes and POs)
            </Label>
            <Switch
              id="isActiveIngredient"
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Toggle ingredient active status"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            className={hubCtaClassName("products")}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save Ingredient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
