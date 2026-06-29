"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  posCheckoutMutedPanelClassName,
  posDialogContentClassName,
  posNativeCheckboxClassName,
  posPrimaryActionClassName,
} from "@/lib/theme/immersive";

export function PosCheckoutDialog({
  open,
  onOpenChange,
  netTotal,
  paymentMethod,
  onPaymentMethodChange,
  isTaxInvoiceRequested,
  onTaxInvoiceRequestedChange,
  taxInvoiceName,
  onTaxInvoiceNameChange,
  taxInvoiceTaxId,
  onTaxInvoiceTaxIdChange,
  taxInvoiceAddress,
  onTaxInvoiceAddressChange,
  isProcessing,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  netTotal: number;
  paymentMethod: "CASH" | "CREDIT_CARD" | "QR_PROMPTPAY";
  onPaymentMethodChange: (method: "CASH" | "CREDIT_CARD" | "QR_PROMPTPAY") => void;
  isTaxInvoiceRequested: boolean;
  onTaxInvoiceRequestedChange: (value: boolean) => void;
  taxInvoiceName: string;
  onTaxInvoiceNameChange: (value: string) => void;
  taxInvoiceTaxId: string;
  onTaxInvoiceTaxIdChange: (value: string) => void;
  taxInvoiceAddress: string;
  onTaxInvoiceAddressChange: (value: string) => void;
  isProcessing: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={posDialogContentClassName("sm:max-w-[425px]")}>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>Total to pay: ฿{netTotal.toLocaleString()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "CASH" ? "default" : "outline"}
                className="min-h-[44px]"
                onClick={() => onPaymentMethodChange("CASH")}
              >
                Cash
              </Button>
              <Button
                variant={paymentMethod === "CREDIT_CARD" ? "default" : "outline"}
                className="min-h-[44px]"
                onClick={() => onPaymentMethodChange("CREDIT_CARD")}
              >
                Card
              </Button>
              <Button
                variant={paymentMethod === "QR_PROMPTPAY" ? "default" : "outline"}
                className="min-h-[44px]"
                onClick={() => onPaymentMethodChange("QR_PROMPTPAY")}
              >
                QR
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 border-t pt-4">
            <input
              type="checkbox"
              id="tax-invoice"
              checked={isTaxInvoiceRequested}
              onChange={(e) => onTaxInvoiceRequestedChange(e.target.checked)}
              className={posNativeCheckboxClassName()}
            />
            <label htmlFor="tax-invoice" className="text-sm font-medium cursor-pointer">
              Request e-Tax Invoice
            </label>
          </div>

          {isTaxInvoiceRequested && (
            <div className={posCheckoutMutedPanelClassName()}>
              <Input
                placeholder="Company / Individual Name"
                value={taxInvoiceName}
                onChange={(e) => onTaxInvoiceNameChange(e.target.value)}
              />
              <Input
                placeholder="Tax ID (13 digits)"
                value={taxInvoiceTaxId}
                onChange={(e) => onTaxInvoiceTaxIdChange(e.target.value)}
              />
              <Input
                placeholder="Full Address"
                value={taxInvoiceAddress}
                onChange={(e) => onTaxInvoiceAddressChange(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onConfirm}
            className={posPrimaryActionClassName("w-full min-h-[44px]")}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                Processing…
              </>
            ) : (
              <>Pay ฿{netTotal.toLocaleString()}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
