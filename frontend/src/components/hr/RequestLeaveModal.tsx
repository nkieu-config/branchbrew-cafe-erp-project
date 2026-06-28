"use client";

import { useEffect, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  formFieldInsetClassName,
  formLineDateFieldClassName,
  formSelectContentClassName,
  hrDialogContentClassName,
  hubCtaClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const LEAVE_TYPES = [
  { value: "SICK", label: "Sick leave" },
  { value: "ANNUAL", label: "Annual leave" },
  { value: "UNPAID", label: "Unpaid leave" },
] as const;

type RequestLeaveModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function RequestLeaveModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: RequestLeaveModalProps) {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  }, [open]);

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !reason.trim()) return;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    await onSubmit({
      type: leaveType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      reason: reason.trim(),
    });
  };

  const canSubmit =
    leaveType.length > 0 &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    reason.trim().length > 0 &&
    startDate <= endDate;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={hrDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[var(--hub-hr)]" aria-hidden />
            Request leave
          </DialogTitle>
          <DialogDescription>
            Submit a leave request for manager approval. Approved leave is reflected in scheduling
            and payroll.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="leave-type" className={text.secondary}>
              Leave type
            </Label>
            <Select value={leaveType} onValueChange={(value) => value && setLeaveType(value)}>
              <SelectTrigger id="leave-type" className={formFieldInsetClassName("w-full")}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName()}>
                {LEAVE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leave-start" className={text.secondary}>
                Start date
              </Label>
              <Input
                id="leave-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={formLineDateFieldClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end" className={text.secondary}>
                End date
              </Label>
              <Input
                id="leave-end"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className={formLineDateFieldClassName()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-reason" className={text.secondary}>
              Reason
            </Label>
            <textarea
              id="leave-reason"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Briefly explain your reason…"
              className={cn(
                formFieldInsetClassName("min-h-[96px] resize-y py-2"),
                "placeholder:text-[var(--text-muted)]",
              )}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            className={hubCtaClassName("hr")}
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />
                Submitting…
              </>
            ) : (
              "Submit request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
