"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { FormDialog } from "@/components/shared/form-modal";
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
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { hrDialogContentClassName } from "@/lib/theme/hub-hr";
import { formFieldInsetClassName, formLineDateFieldClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
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
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      className={hrDialogContentClassName()}
    >
        <FormDialog.Title>Request leave</FormDialog.Title>

        <FormDialog.Body className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="leave-type" className={text.secondary}>
              Type
            </Label>
            <Select value={leaveType} onValueChange={(value) => value && setLeaveType(value)}>
              <SelectTrigger id="leave-type" className={formFieldInsetClassName("w-full")}>
                <SelectValue placeholder="Select type" />
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
                Start
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
                End
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
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Brief reason…"
              className={cn(
                formFieldInsetClassName("min-h-[80px] resize-y py-2"),
                "placeholder:text-muted-foreground",
              )}
            />
          </div>
        </FormDialog.Body>

        <FormDialog.Footer className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            className={hubCtaClassName("hr")}
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />}
            Submit
          </Button>
        </FormDialog.Footer>
    </FormDialog>
  );
}
