"use client";

import type { RefObject } from "react";
import { Award, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt } from "@/components/pos/Receipt";
import { formatCurrency } from "@/lib/money";
import { formatQueueNumber } from "@/lib/queue";
import { parseVatRatePercent } from "@/lib/vat";
import {
  posDialogContentClassName,
  posPrimaryActionClassName,
  posQueueNumberClassName,
  posReceiptCaptionClassName,
  posReceiptPreviewClassName,
  posSuccessDialogClassName,
  posSuccessTitleClassName,
} from "@/lib/theme/immersive";
import { text } from "@/lib/theme/surface";
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
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onOpenChange(false);
      }}
    >
      <DialogContent className={posSuccessDialogClassName(posDialogContentClassName("sm:max-w-[400px]"))}>
        <DialogHeader>
          <DialogTitle className={posSuccessTitleClassName()}>
            <Award className="w-12 h-12" />
            Order Completed!
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 flex justify-center">
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

          <div className={posReceiptPreviewClassName()}>
            {completedOrder?.queueNumber != null && completedOrder.queueNumber > 0 && (
              <p className={posQueueNumberClassName()}>
                #{formatQueueNumber(completedOrder.queueNumber)}
              </p>
            )}
            <p className={posReceiptCaptionClassName()}>
              {completedOrder?.queueNumber ? "Your Queue Number" : "Receipt Preview"}
            </p>
            <p>Total: {formatCurrency(completedOrder?.netTotal)}</p>
            <p className={`text-xs ${text.muted}`}>Order ref #{completedOrder?.id}</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={onPrint} className={posPrimaryActionClassName("w-full h-12 text-lg")}>
            <Printer className="w-5 h-5 mr-2" />
            Print Receipt
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-12 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            New Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
