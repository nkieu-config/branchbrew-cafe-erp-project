"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { productsDialogContentClassName } from "@/lib/theme/hub-products";
import { formFieldInsetClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { ModifierGroup } from "@/types/api";
import { ModifierIngredientSelect } from "./ModifierIngredientSelect";

export const MODIFIER_ALL_CATEGORIES = "__all__";

export function ModifierGroupFormDialog({
  open,
  onOpenChange,
  editingGroup,
  groupName,
  onGroupNameChange,
  groupCategory,
  onGroupCategoryChange,
  groupSortOrder,
  onGroupSortOrderChange,
  groupSwapIngredientId,
  onGroupSwapIngredientIdChange,
  formCategoryOptions,
  isSaving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: ModifierGroup | null;
  groupName: string;
  onGroupNameChange: (value: string) => void;
  groupCategory: string;
  onGroupCategoryChange: (value: string) => void;
  groupSortOrder: string;
  onGroupSortOrderChange: (value: string) => void;
  groupSwapIngredientId: number | "";
  onGroupSwapIngredientIdChange: (value: number | "") => void;
  formCategoryOptions: string[];
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={productsDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl")}>
            {editingGroup ? "Edit Modifier Group" : "New Modifier Group"}
          </DialogTitle>
          <DialogDescription>
            Groups appear on POS for matching product categories. Set swap ingredient for
            milk-type style replacements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="modifier-group-name" className={text.secondary}>
              Name
            </Label>
            <Input
              id="modifier-group-name"
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              className={formFieldInsetClassName()}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modifier-group-category" className={text.secondary}>
                Category filter
              </Label>
              <Select
                value={groupCategory || MODIFIER_ALL_CATEGORIES}
                onValueChange={(v) => v != null && onGroupCategoryChange(v)}
              >
                <SelectTrigger
                  id="modifier-group-category"
                  className={formFieldInsetClassName("w-full")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  <SelectItem value={MODIFIER_ALL_CATEGORIES}>All categories</SelectItem>
                  {formCategoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modifier-group-sort-order" className={text.secondary}>
                Sort order
              </Label>
              <Input
                id="modifier-group-sort-order"
                type="number"
                min={0}
                value={groupSortOrder}
                onChange={(e) => onGroupSortOrderChange(e.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modifier-group-swap-ingredient" className={text.secondary}>
              Menu recipe ingredient to swap (optional)
            </Label>
            <ModifierIngredientSelect
              id="modifier-group-swap-ingredient"
              value={groupSwapIngredientId}
              onChange={onGroupSwapIngredientIdChange}
              placeholder="No ingredient swap"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className={cn("w-full", hubCtaClassName("products"))}
          >
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            {editingGroup ? "Save changes" : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
