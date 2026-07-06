"use client";

import { Plus, Loader2, Trash2 } from "lucide-react";
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
import {
  FormEmptyIngredientsBanner,
  FormPanel,
  FormPanelFooter,
} from "@/components/shared/form-panel";
import { HubListPage } from "@/components/shared/hub-list-page";
import { getErrorMessage } from "@/lib/errors";
import { formValidationHintClassName } from "@/lib/theme/color-helpers";
import {
  formFieldInsetClassName,
  formSelectContentClassName,
  formLineFieldClassName,
  formLineQtyFieldClassName,
  formLineReasonFieldClassName,
  formLineRowClassName,
  formRemoveButtonClassName,
  hubDangerActionClassName,
} from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { formatQuantity } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Ingredient, WasteLineItem } from "@/types/api";

export type WasteLineRow = WasteLineItem & { rowId: string };

type WasteRecordFormProps = {
  ingredients: Ingredient[];
  ingredientsLoading: boolean;
  ingredientsError: boolean;
  ingredientsErr: unknown;
  ingredientsFetching: boolean;
  onRefetchIngredients: () => void;
  stockByIngredientId: Map<number, number>;
  items: WasteLineRow[];
  duplicateIds: Set<string | number>;
  formDisabled: boolean;
  validLineCount: number;
  submitDisabled: boolean;
  isSubmitting: boolean;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChange: <K extends keyof WasteLineRow>(
    index: number,
    field: K,
    value: WasteLineRow[K],
  ) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function WasteRecordForm({
  ingredients,
  ingredientsLoading,
  ingredientsError,
  ingredientsErr,
  ingredientsFetching,
  onRefetchIngredients,
  stockByIngredientId,
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
}: WasteRecordFormProps) {
  return (
    <FormPanel>
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
          const stockOnHand =
            item.ingredientId > 0
              ? stockByIngredientId.get(item.ingredientId)
              : undefined;
          const selectedIngredient = ingredients.find((ing) => ing.id === item.ingredientId);

          return (
            <div key={item.rowId} className={formLineRowClassName()}>
              <div className={formLineFieldClassName()}>
                <Label htmlFor={`waste-ingredient-${item.rowId}`} className={text.secondary}>
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
                    id={`waste-ingredient-${item.rowId}`}
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
                  <p className={cn("text-xs mt-1", formValidationHintClassName())}>
                    Duplicate — combine into one row
                  </p>
                ) : null}
                {item.ingredientId > 0 && stockOnHand !== undefined ? (
                  <p className={cn("text-xs mt-1", text.muted)}>
                    On hand:{" "}
                    <span className={cn("tabular-nums", text.secondary)}>
                      {formatQuantity(stockOnHand, { unit: selectedIngredient?.unit })}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className={formLineQtyFieldClassName()}>
                <Label htmlFor={`waste-quantity-${item.rowId}`} className={text.secondary}>
                  Quantity
                </Label>
                <Input
                  id={`waste-quantity-${item.rowId}`}
                  name={`waste-quantity-${item.rowId}`}
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

              <div className={formLineReasonFieldClassName()}>
                <Label htmlFor={`waste-reason-${item.rowId}`} className={text.secondary}>
                  Reason
                </Label>
                <Input
                  id={`waste-reason-${item.rowId}`}
                  name={`waste-reason-${item.rowId}`}
                  className={formFieldInsetClassName("h-11")}
                  type="text"
                  placeholder="e.g. Expired, Spilled"
                  value={item.reason}
                  disabled={formDisabled}
                  onChange={(e) => onChange(idx, "reason", e.target.value)}
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
          className="w-full min-h-[44px]"
          disabled={formDisabled}
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden /> Add row
        </Button>
      </div>

      <FormPanelFooter
        status={
          <>
            <p aria-live="polite">
              {validLineCount} line{validLineCount === 1 ? "" : "s"} ready to record
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
          className={hubDangerActionClassName("min-h-[44px]")}
          disabled={submitDisabled}
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
              Recording…
            </>
          ) : (
            "Confirm waste"
          )}
        </Button>
      </FormPanelFooter>
    </FormPanel>
  );
}
