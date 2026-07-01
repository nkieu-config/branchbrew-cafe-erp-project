"use client";

import { Banknote, CreditCard, Loader2, QrCode } from "lucide-react";
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
  posPaymentMethodTileClassName,
  posPriceClassName,
  posPrimaryActionClassName,
} from "@/lib/theme/immersive";
import { formatCurrency } from "@/lib/money";
import { typeMetricClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "CASH" as const, label: "Cash", icon: Banknote },
  { id: "CREDIT_CARD" as const, label: "Card", icon: CreditCard },
  { id: "QR_PROMPTPAY" as const, label: "QR Payment", icon: QrCode },
];

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
      <DialogContent className={posDialogContentClassName("sm:max-w-[440px] rounded-2xl")}>
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Review payment details before completing the sale.
          </DialogDescription>
          <p className="flex items-baseline justify-between gap-3 -mt-1">
            <span className="text-sm text-muted-foreground">Amount due</span>
            <span className={cn(typeMetricClassName("text-2xl"), posPriceClassName())}>
              {formatCurrency(netTotal)}
            </span>
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2.5">
            <p className="text-sm font-medium" id="payment-method-label">
              Payment Method
            </p>
            <div
              className="grid grid-cols-3 gap-2"
              role="group"
              aria-labelledby="payment-method-label"
            >
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                const selected = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={posPaymentMethodTileClassName(selected)}
                    onClick={() => onPaymentMethodChange(id)}
                    aria-pressed={selected}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-4">
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
            <div className={posCheckoutMutedPanelClassName("rounded-xl")}>
              <div className="space-y-1.5">
                <Label htmlFor="tax-invoice-name">Invoice name</Label>
                <Input
                  id="tax-invoice-name"
                  name="taxInvoiceName"
                  autoComplete="organization"
                  placeholder="Company or individual name…"
                  value={taxInvoiceName}
                  onChange={(e) => onTaxInvoiceNameChange(e.target.value)}
                  className="rounded-lg"
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
                  className="rounded-lg"
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
                  className="rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={onConfirm}
            className={posPrimaryActionClassName("w-full min-h-[48px] rounded-xl")}
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
