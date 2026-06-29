"use client";

import { Plus, Trash2, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormEmptyIngredientsBanner,
  FormPanel,
  FormPanelFooter,
} from "@/components/shared/form-panel";
import { HubListPage } from "@/components/shared/hub-list-page";
import { StatusBadge } from "@/components/shared/status-badge";
import { getErrorMessage } from "@/lib/errors";
import { formValidationHintClassName } from "@/lib/theme/color-helpers";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import {
  formFieldInsetClassName,
  formSelectContentClassName,
  formLineDateFieldClassName,
  formLineFieldClassName,
  formLineQtyFieldClassName,
  formLineRowClassName,
  formRemoveButtonClassName,
} from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { Ingredient, StockLineItem } from "@/types/api";

export type StockLineRow = StockLineItem & { rowId: string };

type StockInFormProps = {
  ingredients: Ingredient[];
  ingredientsLoading: boolean;
  ingredientsError: boolean;
  ingredientsErr: unknown;
  ingredientsFetching: boolean;
  onRefetchIngredients: () => void;
  items: StockLineRow[];
  duplicateIds: Set<string | number>;
  formDisabled: boolean;
  validLineCount: number;
  submitDisabled: boolean;
  isSubmitting: boolean;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChange: <K extends keyof StockLineRow>(
    index: number,
    field: K,
    value: StockLineRow[K],
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function StockInForm({
  ingredients,
  ingredientsLoading,
  ingredientsError,
  ingredientsErr,
  ingredientsFetching,
  onRefetchIngredients,
  items,
  duplicateIds,
  formDisabled,
  validLineCount,
  submitDisabled,
  isSubmitting,
  onAddRow,
  onRemoveRow,
  onChange,
  onCancel,
  onSubmit,
}: StockInFormProps) {
  return (
    <FormPanel>
      <p className={cn("text-sm mb-4", text.muted)}>
        Add one row per ingredient. Optional expiry dates create batches in{" "}
        <ButtonLink href="/inventory/batches" variant="link" className="h-auto p-0">
          Batches &amp; Expiry
        </ButtonLink>
        . Receiving against a PO?{" "}
        <ButtonLink href="/procurement/orders" variant="link" className="h-auto p-0">
          Purchase Orders
        </ButtonLink>
        .
      </p>
      {ingredientsFetching && !ingredientsLoading && (
        <span className={cn("inline-flex items-center gap-1.5 text-xs mb-4", text.muted)}>
          <Loader2
            className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          Updating ingredients…
        </span>
      )}

      <HubListPage.Error
        message={
          ingredientsError
            ? getErrorMessage(ingredientsErr, "Failed to load ingredients")
            : undefined
        }
        onRetry={onRefetchIngredients}
        loading={ingredientsFetching}
        className="mb-4"
      />

      {!ingredientsLoading && !ingredientsError && ingredients.length === 0 && (
        <FormEmptyIngredientsBanner className="mb-4" />
      )}

      <div className="space-y-4">
        {items.map((item, idx) => {
          const isDuplicate =
            item.ingredientId > 0 && duplicateIds.has(item.ingredientId);
          return (
            <div key={item.rowId} className={formLineRowClassName()}>
              <div className={formLineFieldClassName()}>
                <Label htmlFor={`grn-ingredient-${item.rowId}`} className={text.secondary}>
                  Ingredient
                </Label>
                <Select
                  value={item.ingredientId === 0 ? "" : String(item.ingredientId)}
                  onValueChange={(value) => {
                    if (value == null) return;
                    onChange(idx, "ingredientId", Number(value));
                  }}
                  disabled={formDisabled}
                >
                  <SelectTrigger
                    id={`grn-ingredient-${item.rowId}`}
                    className={formFieldInsetClassName("h-11 w-full")}
                  >
                    <SelectValue
                      placeholder={
                        ingredientsLoading ? "Loading ingredients…" : "Select ingredient…"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className={formSelectContentClassName()}>
                    {ingredients.map((ing) => (
                      <SelectItem key={ing.id} value={String(ing.id)}>
                        {ing.name} ({ing.unit})
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

              <div className={formLineQtyFieldClassName()}>
                <Label htmlFor={`grn-quantity-${item.rowId}`} className={text.secondary}>
                  Quantity
                </Label>
                <Input
                  id={`grn-quantity-${item.rowId}`}
                  name={`grn-quantity-${item.rowId}`}
                  className={formFieldInsetClassName("h-11")}
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Qty"
                  value={item.quantity || ""}
                  disabled={formDisabled}
                  onChange={(e) => onChange(idx, "quantity", Number(e.target.value))}
                />
              </div>

              <div className={formLineDateFieldClassName()}>
                <Label htmlFor={`grn-expiry-${item.rowId}`} className={text.secondary}>
                  Expiry date
                </Label>
                <Input
                  id={`grn-expiry-${item.rowId}`}
                  name={`grn-expiry-${item.rowId}`}
                  className={formFieldInsetClassName("h-11")}
                  type="date"
                  value={item.expiryDate}
                  disabled={formDisabled}
                  onChange={(e) => onChange(idx, "expiryDate", e.target.value)}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={formRemoveButtonClassName(
                  "min-h-[44px] min-w-[44px] h-11 w-11 self-end",
                )}
                aria-label="Remove line"
                onClick={() => onRemoveRow(idx)}
                disabled={items.length === 1 || formDisabled}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          onClick={onAddRow}
          className="w-full min-h-[44px] border-dashed"
          disabled={formDisabled}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden /> Add Another Row
        </Button>
      </div>

      <FormPanelFooter
        status={
          <>
            <p aria-live="polite">
              {validLineCount} line{validLineCount === 1 ? "" : "s"} ready to receive
            </p>
            {ingredientsError ? (
              <p className={formValidationHintClassName()}>
                Fix the ingredient load error above before confirming.
              </p>
            ) : null}
            {duplicateIds.size > 0 ? (
              <p className={formValidationHintClassName()}>
                Remove duplicate ingredients before confirming.
              </p>
            ) : null}
          </>
        }
      >
        <Button type="button" variant="outline" className="min-h-[44px]" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          className={hubCtaClassName("inventory", "min-h-[44px]")}
          disabled={submitDisabled}
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
              Saving…
            </>
          ) : (
            <>
              <PackageOpen className="w-4 h-4 mr-2" aria-hidden />
              Confirm &amp; Receive Stock
            </>
          )}
        </Button>
      </FormPanelFooter>
    </FormPanel>
  );
}
