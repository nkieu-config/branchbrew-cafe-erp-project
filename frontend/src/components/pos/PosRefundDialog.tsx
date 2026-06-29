"use client";

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

type PosRefundDialogProps = {
  orderId: number | null;
  reason: string;
  loading: boolean;
  onReasonChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function PosRefundDialog({
  orderId,
  reason,
  loading,
  onReasonChange,
  onOpenChange,
  onConfirm,
}: PosRefundDialogProps) {
  return (
    <Dialog open={orderId != null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund order #{orderId}</DialogTitle>
          <DialogDescription>
            Posts a refund journal entry and restores inventory for this completed sale from a
            previous day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="refund-reason">Reason (optional)</Label>
          <Input
            id="refund-reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Customer complaint, wrong item, etc."
          />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            className="w-full min-h-[44px]"
            disabled={loading}
            onClick={onConfirm}
          >
            Confirm refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
