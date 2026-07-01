"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/form-modal";
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
import { infoBannerClassName, infoBannerTextClassName } from "@/lib/theme/hub-banners";
import { hubCtaClassName, inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { kitchenDialogContentClassName } from "@/lib/theme/hub-kitchen";
import { formFieldInsetClassName, formLineDateFieldClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
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
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      className={kitchenDialogContentClassName()}
    >
        <FormDialog.Title>New order</FormDialog.Title>

        <FormDialog.Body className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="po-target" className={text.secondary}>
              Target product
            </Label>
            {ingredients.length === 0 ? (
              <p className={cn("text-sm", text.muted)}>
                No ingredients yet —{" "}
                <Link href="/products/ingredients" className={inlineLinkClassName()}>
                  add ingredients
                </Link>
              </p>
            ) : (
              <Select value={targetId} onValueChange={(value) => value != null && setTargetId(value)}>
                <SelectTrigger id="po-target" className={formFieldInsetClassName("w-full")}>
                  <SelectValue placeholder="Select product" />
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
            <div className={infoBannerClassName("py-3")}>
              <p className={infoBannerTextClassName()}>
                No BOM for this target —{" "}
                <Link href="/kitchen/boms" className={inlineLinkClassName()}>
                  define one
                </Link>{" "}
                before completing.
              </p>
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
        </FormDialog.Body>

        <FormDialog.Footer className="gap-2 sm:gap-0">
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
            Create
          </Button>
        </FormDialog.Footer>
    </FormDialog>
  );
}
