"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/form-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formContextBannerClassName } from "@/lib/theme/color-helpers";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { productsDialogContentClassName } from "@/lib/theme/hub-products";
import { formFieldInsetClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { ModifierOption } from "@/types/api";
import { ModifierIngredientSelect } from "./ModifierIngredientSelect";

export function ModifierOptionFormDialog({
  open,
  onOpenChange,
  editingOption,
  optionName,
  onOptionNameChange,
  optionPriceDelta,
  onOptionPriceDeltaChange,
  optionSortOrder,
  onOptionSortOrderChange,
  optionIsDefault,
  onOptionIsDefaultChange,
  optionSwapToId,
  onOptionSwapToIdChange,
  isSaving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOption: ModifierOption | null;
  optionName: string;
  onOptionNameChange: (value: string) => void;
  optionPriceDelta: string;
  onOptionPriceDeltaChange: (value: string) => void;
  optionSortOrder: string;
  onOptionSortOrderChange: (value: string) => void;
  optionIsDefault: boolean;
  onOptionIsDefaultChange: (value: boolean) => void;
  optionSwapToId: number | "";
  onOptionSwapToIdChange: (value: number | "") => void;
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} className={productsDialogContentClassName()}>
        <FormDialog.Title>{editingOption ? "Edit option" : "New option"}</FormDialog.Title>
        <FormDialog.Body className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="modifier-option-name" className={text.secondary}>
              Name
            </Label>
            <Input
              id="modifier-option-name"
              value={optionName}
              onChange={(e) => onOptionNameChange(e.target.value)}
              className={formFieldInsetClassName()}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modifier-option-price-delta" className={text.secondary}>
                Price delta
              </Label>
              <Input
                id="modifier-option-price-delta"
                type="number"
                min={0}
                value={optionPriceDelta}
                onChange={(e) => onOptionPriceDeltaChange(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modifier-option-sort-order" className={text.secondary}>
                Sort order
              </Label>
              <Input
                id="modifier-option-sort-order"
                type="number"
                min={0}
                value={optionSortOrder}
                onChange={(e) => onOptionSortOrderChange(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
          <div className={formContextBannerClassName("flex items-center justify-between gap-4 px-4 py-3")}>
            <div className="space-y-0.5">
              <Label htmlFor="modifier-option-is-default" className={text.secondary}>
                Default selection
              </Label>
              <p className={cn("text-xs", text.muted)}>
                Pre-selected when the group opens on POS
              </p>
            </div>
            <Switch
              id="modifier-option-is-default"
              checked={optionIsDefault}
              onCheckedChange={onOptionIsDefaultChange}
              aria-label="Default selection"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modifier-option-swap-ingredient" className={text.secondary}>
              Swap to ingredient (optional)
            </Label>
            <ModifierIngredientSelect
              id="modifier-option-swap-ingredient"
              value={optionSwapToId}
              onChange={onOptionSwapToIdChange}
              placeholder="Keep recipe ingredient"
            />
          </div>
        </FormDialog.Body>
        <FormDialog.Footer>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className={cn("w-full", hubCtaClassName("products"))}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {editingOption ? "Save option" : "Add option"}
          </Button>
        </FormDialog.Footer>
    </FormDialog>
  );
}
