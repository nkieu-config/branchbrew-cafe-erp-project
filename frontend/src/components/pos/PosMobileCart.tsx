"use client";

import { useState } from "react";
import { ChevronUp, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { PosCartSidebar, type PosCartSidebarProps } from "@/components/pos/PosCartSidebar";
import { formatCurrency } from "@/lib/money";
import {
  posMobileCartBarClassName,
  posMobileCartButtonClassName,
  posMobileCartIconClassName,
  posMobileCartSheetClassName,
  posMobileCartTotalClassName,
} from "@/lib/theme/immersive";
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
          disabled={props.cart.length === 0}
          className={posMobileCartButtonClassName()}
          aria-label={`Review order, ${itemCount} items, total ${formatCurrency(props.netTotal)}`}
        >
          <ShoppingBag className={posMobileCartIconClassName("h-4 w-4 shrink-0")} aria-hidden />
          <span className={cn(typeUiLabelClassName("text-sm"), text.secondary)}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className={posMobileCartTotalClassName()}>{formatCurrency(props.netTotal)}</span>
          <span className={cn("ml-auto text-xs font-medium", text.muted)}>Review</span>
          <ChevronUp className={cn("h-4 w-4 shrink-0", text.muted)} aria-hidden />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className={posMobileCartSheetClassName()}
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
