"use client";

import type { RefObject } from "react";
import { Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt } from "@/components/pos/Receipt";
import { formatCurrency } from "@/lib/money";
import { formatQueueNumber } from "@/lib/queue";
import { parseVatRatePercent } from "@/lib/vat";
import {
  posDialogContentClassName,
  posImmersiveDialogFooterClassName,
  posPriceClassName,
  posPrimaryActionClassName,
  posQueueNumberClassName,
  posSecondaryActionClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { ReceiptOrder } from "@/types/api";

export function PosOrderSuccessDialog({
  open,
  onOpenChange,
  completedOrder,
  receiptRef,
  branchName,
  settings,
  onPrint,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completedOrder: ReceiptOrder | null;
  receiptRef: RefObject<HTMLDivElement | null>;
  branchName: string;
  settings?: {
    companyName?: string;
    taxId?: string;
    vatRate?: string;
    receiptFooter?: string;
  };
  onPrint: () => void;
}) {
  const hasQueue =
    completedOrder?.queueNumber != null && completedOrder.queueNumber > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
    >
      <DialogContent
        className={posDialogContentClassName(
          "gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[380px]",
        )}
      >
        <div className="px-5 pt-6 pb-2 text-center">
          <DialogTitle className={typeHeadingClassName("text-xl")}>Order completed</DialogTitle>
        </div>

        <div className="flex flex-col items-center gap-2 px-5 py-4 text-center">
          <div className="hidden">
            {completedOrder && (
              <Receipt
                ref={receiptRef}
                order={completedOrder}
                branchName={branchName}
                settings={{
                  companyName: settings?.companyName,
                  taxId: settings?.taxId,
                  vatRate: parseVatRatePercent(settings?.vatRate),
                  receiptFooter: settings?.receiptFooter,
                }}
              />
            )}
          </div>

          {hasQueue ? (
            <p className={posQueueNumberClassName()}>
              #{formatQueueNumber(completedOrder!.queueNumber!)}
            </p>
          ) : null}
          <p className={cn(typeHeadingClassName("text-2xl tabular-nums"), posPriceClassName())}>
            {formatCurrency(completedOrder?.netTotal ?? 0)}
          </p>
          <p className={cn("text-xs tabular-nums", text.muted)}>
            Ref #{completedOrder?.id}
            {completedOrder?.customerName ? ` · ${completedOrder.customerName}` : ""}
          </p>
        </div>

        <div className={cn(posImmersiveDialogFooterClassName(), "flex flex-col gap-2")}>
          <Button
            onClick={onPrint}
            className={posPrimaryActionClassName("w-full min-h-[48px] rounded-xl")}
          >
            <Printer className="w-4 h-4 mr-2" aria-hidden />
            Print Receipt
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={posSecondaryActionClassName("min-h-[44px]")}
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            New Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
