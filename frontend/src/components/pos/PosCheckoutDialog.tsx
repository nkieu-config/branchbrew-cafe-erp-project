"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency } from "@/lib/money";

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
          <DialogDescription>Total to pay: {formatCurrency(netTotal)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium" id="payment-method-label">Payment Method</p>
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="payment-method-label">
              <Button
                type="button"
                variant={paymentMethod === "CASH" ? "default" : "outline"}
                className="min-h-[44px]"
                onClick={() => onPaymentMethodChange("CASH")}
                aria-pressed={paymentMethod === "CASH"}
              >
                Cash
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "CREDIT_CARD" ? "default" : "outline"}
                className="min-h-[44px]"
                onClick={() => onPaymentMethodChange("CREDIT_CARD")}
                aria-pressed={paymentMethod === "CREDIT_CARD"}
              >
                Card
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "QR_PROMPTPAY" ? "default" : "outline"}
                className="min-h-[44px]"
                onClick={() => onPaymentMethodChange("QR_PROMPTPAY")}
                aria-pressed={paymentMethod === "QR_PROMPTPAY"}
              >
                QR Payment
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
              <div className="space-y-1.5">
                <Label htmlFor="tax-invoice-name">Invoice name</Label>
                <Input
                  id="tax-invoice-name"
                  name="taxInvoiceName"
                  autoComplete="organization"
                  placeholder="Company or individual name…"
                  value={taxInvoiceName}
                  onChange={(e) => onTaxInvoiceNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tax-invoice-tax-id">Tax ID</Label>
                <Input
                  id="tax-invoice-tax-id"
                  name="taxInvoiceTaxId"
                  autoComplete="off"
                  inputMode="numeric"
                  placeholder="13-digit tax ID…"
                  value={taxInvoiceTaxId}
                  onChange={(e) => onTaxInvoiceTaxIdChange(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tax-invoice-address">Invoice address</Label>
                <Input
                  id="tax-invoice-address"
                  name="taxInvoiceAddress"
                  autoComplete="street-address"
                  placeholder="Full billing address…"
                  value={taxInvoiceAddress}
                  onChange={(e) => onTaxInvoiceAddressChange(e.target.value)}
                />
              </div>
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
              <>Pay {formatCurrency(netTotal)}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
