"use client";

import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, toNumber } from "@/lib/money";
import { getModifierExtra } from "@/lib/pos-modifiers";
import {
  posAccentIconClassName,
  posDialogContentClassName,
  posModifierGroupLabelClassName,
  posModifierSelectedClassName,
  posPrimaryActionClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import type { ModifierGroup, Product } from "@/types/api";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={posDialogContentClassName("sm:max-w-[400px]")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings2 className={`w-5 h-5 ${posAccentIconClassName()}`} /> Customize{" "}
            {product?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {modifierGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <label className={posModifierGroupLabelClassName()}>{group.name}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.options.map((opt) => (
                  <Button
                    key={opt.id}
                    variant={selectedModifiers[group.id] === opt.id ? "default" : "outline"}
                    className={
                      selectedModifiers[group.id] === opt.id ? posModifierSelectedClassName() : ""
                    }
                    onClick={() => onSelectModifier(group.id, opt.id)}
                  >
                    {opt.name}
                    {toNumber(opt.priceDelta) > 0 ? ` +${formatCurrency(opt.priceDelta)}` : ""}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          {modifierGroups.length === 0 && (
            <p className={`text-sm ${text.muted}`}>No modifiers configured for this category.</p>
          )}
        </div>
        <DialogFooter>
          <Button
            className={posPrimaryActionClassName("w-full h-12 text-lg")}
            onClick={onAddToCart}
          >
            Add to Order · {formatCurrency(basePrice + extra)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
