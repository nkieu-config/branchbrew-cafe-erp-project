"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, toNumber } from "@/lib/money";
import { getModifierExtra } from "@/lib/pos-modifiers";
import {
  posDialogContentClassName,
  posImmersiveDialogBodyClassName,
  posImmersiveDialogFooterClassName,
  posImmersiveDialogHeaderClassName,
  posModifierGroupLabelClassName,
  posModifierOptionIndicatorClassName,
  posModifierOptionPriceClassName,
  posModifierOptionRowClassName,
  posModifierSectionClassName,
  posNumpadCloseButtonClassName,
  posPriceClassName,
  posPrimaryActionClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { ModifierGroup, Product } from "@/types/api";

function formatOptionPrice(delta: number): string {
  if (delta > 0) return `+${formatCurrency(delta)}`;
  return "Included";
}

export function PosModifierDialog({
  open,
  onOpenChange,
  product,
  modifierGroups,
  selectedModifiers,
  onSelectModifier,
  onAddToCart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  modifierGroups: ModifierGroup[];
  selectedModifiers: Record<number, number>;
  onSelectModifier: (groupId: number, optionId: number) => void;
  onAddToCart: () => void;
}) {
  const basePrice = toNumber(product?.price ?? 0);
  const extra = getModifierExtra(modifierGroups, selectedModifiers);
  const totalPrice = basePrice + extra;

  const isReady = useMemo(
    () =>
      modifierGroups.length === 0 ||
      modifierGroups.every((group) => selectedModifiers[group.id] != null),
    [modifierGroups, selectedModifiers],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={posDialogContentClassName(
          "gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[420px]",
        )}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          Customize {product?.name ?? "menu item"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Choose modifiers for this item, then add it to the current order.
        </DialogDescription>

        <div className={posImmersiveDialogHeaderClassName()}>
          <div className="min-w-0 flex-1 pr-2">
            <h2 className={typeHeadingClassName("text-lg truncate")}>
              {product?.name ?? "Customize item"}
            </h2>
            {product?.category ? (
              <p className={cn("text-sm mt-0.5", text.muted)}>{product.category}</p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className={posNumpadCloseButtonClassName()}
            aria-label="Close customize dialog"
          >
            <X className={cn("h-5 w-5", text.muted)} aria-hidden />
          </Button>
        </div>

        <div className={posImmersiveDialogBodyClassName()}>
          {modifierGroups.map((group) => (
            <section key={group.id} className={posModifierSectionClassName()} aria-label={group.name}>
              <p className={posModifierGroupLabelClassName()}>{group.name}</p>

              <div className="space-y-0.5" role="radiogroup" aria-label={group.name}>
                {group.options.map((option) => {
                  const selected = selectedModifiers[group.id] === option.id;
                  const delta = toNumber(option.priceDelta);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={posModifierOptionRowClassName(selected)}
                      onClick={() => onSelectModifier(group.id, option.id)}
                    >
                      <span className={posModifierOptionIndicatorClassName(selected)}>
                        {selected ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
                      </span>
                      <span className={cn("min-w-0 flex-1 text-sm font-medium", text.primary)}>
                        {option.name}
                      </span>
                      <span
                        className={cn(
                          posModifierOptionPriceClassName(),
                          delta > 0 && posPriceClassName("text-xs"),
                        )}
                      >
                        {formatOptionPrice(delta)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {modifierGroups.length === 0 && (
            <p className={cn("text-sm text-center py-6", text.muted)}>
              No modifiers for this item.
            </p>
          )}
        </div>

        <div className={posImmersiveDialogFooterClassName()}>
          <Button
            type="button"
            className={posPrimaryActionClassName("w-full min-h-[48px] rounded-xl text-base font-semibold")}
            onClick={onAddToCart}
            disabled={!isReady}
          >
            Add to Order ·{" "}
            <span className="tabular-nums">{formatCurrency(totalPrice)}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
