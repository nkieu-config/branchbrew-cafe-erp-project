"use client";

import { useEffect, useState } from "react";
import { ListTree, Loader2, MinusCircle, Plus, Save } from "lucide-react";
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
import { FormEmptyIngredientsBanner } from "@/components/shared/form-panel";
import { FormModalFooter } from "@/components/shared/form-modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCreateProductionBOM } from "@/hooks/domains/useAccountingQueries";
import { useLineItemRows } from "@/hooks/use-line-item-rows";
import { getErrorMessage } from "@/lib/errors";
import type { Ingredient } from "@/types/api";
import {
  formFieldInsetClassName,
  formLineQtyFieldClassName,
  formLineRowClassName,
  formRemoveButtonClassName,
  formSectionClassName,
  formSelectContentClassName,
  hubCtaClassName,
  kitchenDialogContentClassName,
  text,
  typeHeadingClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type RawLineDraft = {
  rowId: string;
  rawIngredientId: number;
  quantityNeeded: string;
};

type BOMModalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
};

function emptyLine(): RawLineDraft {
  return {
    rowId: crypto.randomUUID(),
    rawIngredientId: 0,
    quantityNeeded: "",
  };
}

function isLineDirty(line: RawLineDraft) {
  return line.rawIngredientId > 0 || line.quantityNeeded.trim().length > 0;
}

export function BOMModalForm({ isOpen, onClose, ingredients }: BOMModalFormProps) {
  const [targetId, setTargetId] = useState<string>("");
  const createMutation = useCreateProductionBOM();

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
    duplicateKey: (line) => line.rawIngredientId,
  });

  useEffect(() => {
    if (!isOpen) return;
    setTargetId("");
    resetRows();
  }, [isOpen, resetRows]);

  const handleCreate = async () => {
    const targetIngredientId = targetId ? Number(targetId) : 0;
    if (!targetIngredientId) {
      toast.error("Target product is required");
      return;
    }

    if (duplicateKeys.size > 0) {
      toast.error("Each raw ingredient can only appear once. Remove duplicate rows.");
      return;
    }

    const rawIngredients = lines
      .filter((line) => line.rawIngredientId > 0)
      .map((line) => ({
        rawIngredientId: line.rawIngredientId,
        quantityNeeded: Number(line.quantityNeeded),
      }))
      .filter((line) => line.quantityNeeded > 0);

    if (rawIngredients.length === 0) {
      toast.error("Add at least one raw ingredient line");
      return;
    }

    try {
      await Promise.all(
        rawIngredients.map((item) =>
          createMutation.mutateAsync({
            targetIngredientId,
            rawIngredientId: item.rawIngredientId,
            quantityNeeded: item.quantityNeeded,
          }),
        ),
      );
      toast.success("Production BOM saved");
      onClose();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save BOM"));
    }
  };

  const formDisabled = ingredients.length === 0;
  const submitDisabled = createMutation.isPending || formDisabled || duplicateKeys.size > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={kitchenDialogContentClassName("sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <ListTree className="w-5 h-5 text-[var(--hub-kitchen)]" aria-hidden />
            Create / Update Production BOM
          </DialogTitle>
          <DialogDescription>
            Define raw ingredients and quantities per unit of finished product. Saving adds lines for
            the selected target.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="bom-target" className={text.secondary}>
              Target product
            </Label>
            <Select value={targetId} onValueChange={(value) => value != null && setTargetId(value)}>
              <SelectTrigger id="bom-target" className={formFieldInsetClassName("w-full")}>
                <SelectValue placeholder="What are we making?" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                {ingredients.map((ingredient) => (
                  <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                    {ingredient.name} ({ingredient.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={formSectionClassName()}>
            <h3 className={typeHeadingClassName(cn("text-sm mb-4", text.secondary))}>Raw ingredients</h3>
            {ingredients.length === 0 ? (
              <FormEmptyIngredientsBanner />
            ) : (
              <>
                <div className="space-y-3">
                  {lines.map((line, idx) => {
                    const isDuplicate =
                      line.rawIngredientId > 0 && duplicateKeys.has(line.rawIngredientId);
                    return (
                      <div key={line.rowId} className={formLineRowClassName()}>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-3 items-end flex-1">
                          <div className="space-y-2">
                            <Label className={cn("text-xs", text.secondary)}>Ingredient</Label>
                            <Select
                              value={line.rawIngredientId > 0 ? String(line.rawIngredientId) : undefined}
                              onValueChange={(value) =>
                                value != null && updateRow(idx, "rawIngredientId", Number(value))
                              }
                            >
                              <SelectTrigger className={formFieldInsetClassName("w-full")}>
                                <SelectValue placeholder="Select raw ingredient" />
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
                              min={0.01}
                              step={0.01}
                              value={line.quantityNeeded}
                              onChange={(event) =>
                                updateRow(idx, "quantityNeeded", event.target.value)
                              }
                              className={formLineQtyFieldClassName()}
                              placeholder="0"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(formRemoveButtonClassName(), "min-h-[44px] min-w-[44px]")}
                            aria-label="Remove raw ingredient line"
                            onClick={() => removeRow(idx)}
                            disabled={lines.length === 1}
                          >
                            <MinusCircle className="w-4 h-4" aria-hidden />
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
                  Add raw ingredient
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
            className={cn("min-h-[44px]", hubCtaClassName("kitchen"))}
            onClick={() => void handleCreate()}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <Save className="w-4 h-4 mr-2" aria-hidden />
            )}
            Save production BOM
          </Button>
        </FormModalFooter>
      </DialogContent>
    </Dialog>
  );
}
