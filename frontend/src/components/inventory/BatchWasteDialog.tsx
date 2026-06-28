"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formFieldInsetClassName, hubDangerActionClassName, text } from "@/lib/theme";

type BatchWasteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredientName: string | null;
  maxQty: number | null;
  quantity: string;
  onQuantityChange: (value: string) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

export function BatchWasteDialog({
  open,
  onOpenChange,
  ingredientName,
  maxQty,
  quantity,
  onQuantityChange,
  reason,
  onReasonChange,
  onSubmit,
  isPending,
}: BatchWasteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-black text-xl">Report Batch Waste</DialogTitle>
          <DialogDescription>
            {ingredientName && maxQty != null
              ? `Discard from ${ingredientName} (max ${maxQty}). This deducts a specific batch — for aggregate waste by ingredient, use the Waste Logs tab.`
              : "Record waste for this batch. For aggregate waste by ingredient, use the Waste Logs tab."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className={`font-bold ${text.secondary}`}>Quantity</Label>
            <Input
              className={formFieldInsetClassName("h-11")}
              type="number"
              min="0.01"
              step="0.01"
              max={maxQty ?? undefined}
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className={`font-bold ${text.secondary}`}>Reason</Label>
            <Input
              className={formFieldInsetClassName("h-11")}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Expired, Spilled, etc."
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className={hubDangerActionClassName()}
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Confirm Waste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
