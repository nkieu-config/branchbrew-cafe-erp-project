"use client";

import { useEffect, useState } from "react";
import { ListTree, Loader2, MinusCircle, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useCreateProductionBOM } from "@/hooks/domains/useAccountingQueries";
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

export function BOMModalForm({ isOpen, onClose, ingredients }: BOMModalFormProps) {
  const [targetId, setTargetId] = useState<string>("");
  const [lines, setLines] = useState<RawLineDraft[]>([emptyLine()]);
  const createMutation = useCreateProductionBOM();

  useEffect(() => {
    if (!isOpen) return;
    setTargetId("");
    setLines([emptyLine()]);
  }, [isOpen]);

  const updateLine = (rowId: string, patch: Partial<RawLineDraft>) => {
    setLines((current) =>
      current.map((line) => (line.rowId === rowId ? { ...line, ...patch } : line)),
    );
  };

  const handleCreate = async () => {
    const targetIngredientId = targetId ? Number(targetId) : 0;
    if (!targetIngredientId) {
      toast.error("Target product is required");
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={kitchenDialogContentClassName("sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
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
            <h3 className={cn("text-sm font-semibold mb-4", text.secondary)}>Raw ingredients</h3>
            <div className="space-y-3">
              {lines.map((line) => (
                <div key={line.rowId} className={formLineRowClassName()}>
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] gap-3 items-end flex-1">
                    <div className="space-y-2">
                      <Label className={cn("text-xs", text.secondary)}>Ingredient</Label>
                      <Select
                        value={line.rawIngredientId > 0 ? String(line.rawIngredientId) : undefined}
                        onValueChange={(value) =>
                          value != null &&
                          updateLine(line.rowId, { rawIngredientId: Number(value) })
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
                    </div>
                    <div className="space-y-2">
                      <Label className={cn("text-xs", text.secondary)}>Qty</Label>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={line.quantityNeeded}
                        onChange={(event) =>
                          updateLine(line.rowId, { quantityNeeded: event.target.value })
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
                      onClick={() =>
                        setLines((current) =>
                          current.length === 1
                            ? [emptyLine()]
                            : current.filter((row) => row.rowId !== line.rowId),
                        )
                      }
                    >
                      <MinusCircle className="w-4 h-4" aria-hidden />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full min-h-[44px] border-dashed font-medium"
              onClick={() => setLines((current) => [...current, emptyLine()])}
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden />
              Add raw ingredient
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={createMutation.isPending}
            className={cn("min-h-[44px]", hubCtaClassName("kitchen", "font-bold"))}
            onClick={() => void handleCreate()}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />
            ) : (
              <Save className="w-4 h-4 mr-2" aria-hidden />
            )}
            Save production BOM
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
