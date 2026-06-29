"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import type { Ingredient, Supplier } from "@/types/api";
import { toNumber } from "@/lib/money";
import { FormEmptyIngredientsBanner } from "@/components/shared/form-panel";
import { FormModalFooter } from "@/components/shared/form-modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLineItemRows } from "@/hooks/useLineItemRows";
import { hubModalIconClassName } from "@/lib/theme/color-helpers";
import { formSectionClassName, hubCtaClassName, inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { procurementDialogContentClassName } from "@/lib/theme/hub-procurement";
import { formFieldInsetClassName, formLineQtyFieldClassName, formLineRowClassName, formRemoveButtonClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type PoLineDraft = {
  rowId: string;
  ingredientId: number;
  quantity: string;
  unitPrice: string;
};

type CreatePOModalProps = {
  open: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  ingredients: Ingredient[];
  onSubmit: (payload: {
    supplierId: number;
    items: { ingredientId: number; quantity: number; unitPrice: number }[];
  }) => Promise<void>;
  isSubmitting?: boolean;
};

function emptyLine(): PoLineDraft {
  return {
    rowId: crypto.randomUUID(),
    ingredientId: 0,
    quantity: "",
    unitPrice: "",
  };
}

function isLineDirty(line: PoLineDraft) {
  return (
    line.ingredientId > 0 ||
    line.quantity.trim().length > 0 ||
    line.unitPrice.trim().length > 0
  );
}

export function CreatePOModal({
  open,
  onClose,
  suppliers,
  ingredients,
  onSubmit,
  isSubmitting = false,
}: CreatePOModalProps) {
  const [supplierId, setSupplierId] = useState<string>("");

  const {
    items: lines,
    addRow,
    removeRow,
    updateRow,
    resetRows,
    duplicateKeys,
  } = useLineItemRows({
    createEmpty: emptyLine,
    isDirty: isLineDirty,
    duplicateKey: (line) => line.ingredientId,
  });

  useEffect(() => {
    if (!open) return;
    setSupplierId("");
    resetRows();
  }, [open, resetRows]);

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const handleIngredientChange = (index: number, value: string) => {
    const ingredientId = Number(value);
    const ingredient = ingredientMap.get(ingredientId);
    updateRow(index, "ingredientId", ingredientId);
    updateRow(
      index,
      "unitPrice",
      ingredient?.costPerUnit != null ? String(toNumber(ingredient.costPerUnit)) : "",
    );
  };

  const handleSubmit = async () => {
    if (!supplierId) {
      toast.error("Supplier is required");
      return;
    }

    if (duplicateKeys.size > 0) {
      toast.error("Each ingredient can only appear once. Remove duplicate rows.");
      return;
    }

    const items = lines
      .filter((line) => line.ingredientId > 0)
      .map((line) => ({
        ingredientId: line.ingredientId,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice) || 0,
      }))
      .filter((line) => line.quantity > 0);

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    await onSubmit({ supplierId: Number(supplierId), items });
  };

  const formDisabled = ingredients.length === 0;
  const submitDisabled =
    isSubmitting || suppliers.length === 0 || formDisabled || duplicateKeys.size > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={procurementDialogContentClassName("sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <Truck className={hubModalIconClassName("procurement")} aria-hidden />
            Create Purchase Order
          </DialogTitle>
          <DialogDescription>
            Add ingredients and quantities for this branch. Approved POs can be received into
            inventory batches.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="po-supplier" className={text.secondary}>
              Supplier
            </Label>
            {suppliers.length === 0 ? (
              <p className={cn("text-sm", text.muted)}>
                No suppliers yet —{" "}
                <Link href="/procurement/suppliers" className={inlineLinkClassName()}>
                  add a supplier
                </Link>{" "}
                first.
              </p>
            ) : (
              <Select value={supplierId} onValueChange={(value) => value != null && setSupplierId(value)}>
                <SelectTrigger id="po-supplier" className={formFieldInsetClassName("w-full")}>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className={formSectionClassName()}>
            <h3 className={typeUiLabelClassName(cn("text-sm mb-4", text.secondary))}>Order items</h3>

            {ingredients.length === 0 ? (
              <FormEmptyIngredientsBanner />
            ) : (
              <>
                <div className="space-y-3">
                  {lines.map((line, idx) => {
                    const isDuplicate =
                      line.ingredientId > 0 && duplicateKeys.has(line.ingredientId);
                    return (
                      <div key={line.rowId} className={formLineRowClassName()}>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_7rem_auto] gap-3 items-end flex-1">
                          <div className="space-y-2">
                            <Label className={cn("text-xs", text.secondary)}>Ingredient</Label>
                            <Select
                              value={line.ingredientId > 0 ? String(line.ingredientId) : undefined}
                              onValueChange={(value) =>
                                value != null && handleIngredientChange(idx, value)
                              }
                            >
                              <SelectTrigger className={formFieldInsetClassName("w-full")}>
                                <SelectValue placeholder="Select ingredient" />
                              </SelectTrigger>
                              <SelectContent className={formSelectContentClassName()}>
                                {ingredients.map((ingredient) => (
                                  <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                                    {ingredient.name} ({ingredient.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {isDuplicate ? (
                              <StatusBadge tone="warning" className="mt-1 w-fit">
                                Duplicate ingredient — combine into one row
                              </StatusBadge>
                            ) : null}
                          </div>
                          <div className="space-y-2">
                            <Label className={cn("text-xs", text.secondary)}>Qty</Label>
                            <Input
                              type="number"
                              min={0.1}
                              step={0.1}
                              value={line.quantity}
                              onChange={(event) =>
                                updateRow(idx, "quantity", event.target.value)
                              }
                              className={formLineQtyFieldClassName()}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className={cn("text-xs", text.secondary)}>Unit price</Label>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={line.unitPrice}
                              onChange={(event) =>
                                updateRow(idx, "unitPrice", event.target.value)
                              }
                              className={formFieldInsetClassName()}
                              placeholder="0.00"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(formRemoveButtonClassName(), "min-h-[44px] min-w-[44px]")}
                            aria-label="Remove line item"
                            onClick={() => removeRow(idx)}
                            disabled={lines.length === 1}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full min-h-[44px] border-dashed font-medium"
                  onClick={addRow}
                >
                  <Plus className="w-4 h-4 mr-2" aria-hidden />
                  Add item
                </Button>
              </>
            )}
          </div>
        </div>

        <FormModalFooter>
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitDisabled}
            className={cn("min-h-[44px]", hubCtaClassName("procurement"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            Create PO
          </Button>
        </FormModalFooter>
      </DialogContent>
    </Dialog>
  );
}
