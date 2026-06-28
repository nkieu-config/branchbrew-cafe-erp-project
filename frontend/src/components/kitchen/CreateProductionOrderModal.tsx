"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChefHat, Loader2 } from "lucide-react";
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
import type { Ingredient } from "@/types/api";
import {
  formFieldInsetClassName,
  formLineDateFieldClassName,
  formSelectContentClassName,
  hubCtaClassName,
  infoBannerClassName,
  infoBannerIconClassName,
  infoBannerTextClassName,
  infoBannerTitleClassName,
  inlineLinkClassName,
  kitchenDialogContentClassName,
  text,
  typeHeadingClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type CreateProductionOrderModalProps = {
  open: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  bomTargetIds: Set<number>;
  onSubmit: (payload: {
    targetIngredientId: number;
    quantityToProduce: number;
    plannedStartDate: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function CreateProductionOrderModal({
  open,
  onClose,
  ingredients,
  bomTargetIds,
  onSubmit,
  isSubmitting = false,
}: CreateProductionOrderModalProps) {
  const [targetId, setTargetId] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [plannedDate, setPlannedDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setTargetId("");
    setQuantity("1");
    setPlannedDate("");
  }, [open]);

  const targetIngredientId = targetId ? Number(targetId) : 0;
  const missingBom = targetIngredientId > 0 && !bomTargetIds.has(targetIngredientId);

  const handleSubmit = async () => {
    if (!targetIngredientId) {
      toast.error("Target product is required");
      return;
    }
    const quantityToProduce = Number(quantity);
    if (!Number.isFinite(quantityToProduce) || quantityToProduce <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    if (!plannedDate) {
      toast.error("Planned date is required");
      return;
    }

    await onSubmit({
      targetIngredientId,
      quantityToProduce,
      plannedStartDate: new Date(plannedDate).toISOString(),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={kitchenDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <ChefHat className="w-5 h-5 text-[var(--hub-kitchen)]" aria-hidden />
            Create Production Order
          </DialogTitle>
          <DialogDescription>
            Schedule a batch at the central kitchen. Drag orders on the board to update status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="po-target" className={text.secondary}>
              Target product
            </Label>
            {ingredients.length === 0 ? (
              <p className={cn("text-sm", text.muted)}>
                No ingredients yet —{" "}
                <Link href="/products/ingredients" className={inlineLinkClassName()}>
                  add raw ingredients
                </Link>{" "}
                first.
              </p>
            ) : (
              <Select value={targetId} onValueChange={(value) => value != null && setTargetId(value)}>
                <SelectTrigger id="po-target" className={formFieldInsetClassName("w-full")}>
                  <SelectValue placeholder="Select target product" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  {ingredients.map((ingredient) => (
                    <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                      {ingredient.name} ({ingredient.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {missingBom && (
            <div className={infoBannerClassName()}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={infoBannerIconClassName()} aria-hidden />
                <div>
                  <p className={infoBannerTitleClassName()}>No production BOM for this target</p>
                  <p className={infoBannerTextClassName()}>
                    You can still create the order, but completion may fail without raw lines.{" "}
                    <Link href="/kitchen/boms" className={inlineLinkClassName()}>
                      Define a BOM
                    </Link>{" "}
                    first.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="po-quantity" className={text.secondary}>
                Quantity
              </Label>
              <Input
                id="po-quantity"
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="po-date" className={text.secondary}>
                Planned date
              </Label>
              <Input
                id="po-date"
                type="date"
                value={plannedDate}
                onChange={(event) => setPlannedDate(event.target.value)}
                className={formLineDateFieldClassName()}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || ingredients.length === 0}
            className={cn("min-h-[44px]", hubCtaClassName("kitchen"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            Create order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
