"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PosCartSidebar, type PosCartSidebarProps } from "@/components/pos/PosCartSidebar";
import { posMobileCartBarClassName, posPayActionClassName } from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

export function PosMobileCart(props: PosCartSidebarProps) {
  const [open, setOpen] = useState(false);
  const itemCount = props.cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setOpen(false);
    props.onCheckout();
  };

  return (
    <>
      <div className={posMobileCartBarClassName()}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex flex-1 min-h-[44px] items-center gap-2 rounded-lg border px-3 text-left transition-colors",
            "border-[var(--pos-panel-border)] bg-[var(--pos-panel-bg)]",
            "hover:bg-[var(--table-row-hover)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50",
          )}
          aria-label={`View cart, ${itemCount} items, total ฿${props.netTotal.toLocaleString()}`}
        >
          <ShoppingBag className="h-4 w-4 shrink-0 text-[var(--pos-accent-soft-fg)]" aria-hidden />
          <span className={cn(typeUiLabelClassName("text-sm"), text.secondary)}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className={cn("ml-auto font-bold tabular-nums", text.primary)}>
            ฿{props.netTotal.toLocaleString()}
          </span>
        </button>
        <Button
          className={posPayActionClassName("shrink-0 min-h-[44px] px-4")}
          disabled={props.cart.length === 0}
          onClick={handleCheckout}
        >
          Pay
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[min(92dvh,800px)] gap-0 rounded-t-2xl border-[var(--pos-panel-border)] bg-[var(--pos-panel-bg)] p-0"
          showCloseButton
        >
          <SheetTitle className="sr-only">Current order</SheetTitle>
          <PosCartSidebar
            {...props}
            onCheckout={handleCheckout}
            className="h-full rounded-none border-0 shadow-none"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
