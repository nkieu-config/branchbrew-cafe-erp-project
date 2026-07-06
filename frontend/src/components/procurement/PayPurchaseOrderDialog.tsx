"use client";

import { useEffect, useState } from "react";
import { Banknote, Loader2 } from "lucide-react";
import { FormModal } from "@/components/shared/form-modal";
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
import { formatCurrency } from "@/lib/money";
import { computePurchaseOrderTotal } from "@/lib/filters/purchase-order-filters";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import {
  formFieldInsetClassName,
  formSelectContentClassName,
} from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";
import type { PurchaseOrder } from "@/types/api";

type PaymentMethod = "CASH" | "BANK_TRANSFER";

type PayPurchaseOrderDialogProps = {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, notes?: string) => void | Promise<void>;
  isSubmitting: boolean;
};

export function PayPurchaseOrderDialog({
  purchaseOrder,
  onClose,
  onConfirm,
  isSubmitting,
}: PayPurchaseOrderDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (purchaseOrder) {
      setMethod("BANK_TRANSFER");
      setNotes("");
    }
  }, [purchaseOrder]);

  return (
    <FormModal
      title={`Pay ${purchaseOrder?.poNumber ?? ""}`}
      icon={Banknote}
      isOpen={purchaseOrder != null}
      onClose={onClose}
      width={480}
    >
      <div className="space-y-4">
        <p className={cn("text-sm", text.secondary)}>
          {purchaseOrder?.supplier?.name ?? "Supplier"} ·{" "}
          <span className={cn("font-semibold tabular-nums", text.primary)}>
            {purchaseOrder ? formatCurrency(computePurchaseOrderTotal(purchaseOrder)) : ""}
          </span>
        </p>

        <div className="space-y-2">
          <Label htmlFor="pay-method" className={text.secondary}>
            Payment method
          </Label>
          <Select
            value={method}
            onValueChange={(value) => {
              if (value == null) return;
              setMethod(value as PaymentMethod);
            }}
          >
            <SelectTrigger
              id="pay-method"
              className={formFieldInsetClassName("h-11 w-full")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={formSelectContentClassName()}>
              <SelectItem value="BANK_TRANSFER">Bank transfer</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pay-notes" className={text.secondary}>
            Reference / notes (optional)
          </Label>
          <Input
            id="pay-notes"
            className={formFieldInsetClassName("h-11")}
            value={notes}
            placeholder="e.g. Transfer ref. 20260706-001"
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={hubCtaClassName("procurement")}
            disabled={isSubmitting}
            onClick={() => void onConfirm(method, notes)}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden
                />
                Recording…
              </>
            ) : (
              "Record payment"
            )}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
