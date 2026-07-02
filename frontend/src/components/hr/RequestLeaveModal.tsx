"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { FormDialog } from "@/components/shared/form-modal";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormFieldControl,
  FormFieldError,
  FormFieldLabel,
  FormFieldSelectTrigger,
  FormFieldTextarea,
} from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  validateLeaveFields,
  type LeaveFieldErrors,
} from "@/lib/hr/request-leave-validation";
import { formFieldInvalidClassName } from "@/lib/theme/color-helpers";
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
  const [fieldErrors, setFieldErrors] = useState<LeaveFieldErrors>({});

  useEffect(() => {
    if (!open) return;
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setFieldErrors({});
  }, [open]);

  const clearFieldError = (field: keyof LeaveFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    const errors = validateLeaveFields({
      leaveType,
      startDate,
      endDate,
      reason,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    setFieldErrors({});
    await onSubmit({
      type: leaveType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      reason: reason.trim(),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      className={hrDialogContentClassName()}
    >
      <FormDialog.Title>Request leave</FormDialog.Title>

      <FormDialog.Body className="flex flex-col gap-stack pt-1">
        <FormField id="leave-type" error={fieldErrors.type}>
          <FormFieldLabel className={text.secondary}>Type</FormFieldLabel>
          <Select
            value={leaveType}
            onValueChange={(value) => {
              if (!value) return;
              setLeaveType(value);
              clearFieldError("type");
            }}
          >
            <FormFieldSelectTrigger className={formFieldInsetClassName("w-full")}>
              <SelectValue placeholder="Select type" />
            </FormFieldSelectTrigger>
            <SelectContent className={formSelectContentClassName()}>
              {LEAVE_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormFieldError />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack">
          <FormField id="leave-start" error={fieldErrors.startDate}>
            <FormFieldLabel className={text.secondary}>Start</FormFieldLabel>
            <FormFieldControl>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  clearFieldError("startDate");
                  clearFieldError("endDate");
                }}
                className={cn(
                  formLineDateFieldClassName(),
                  formFieldInvalidClassName(!!fieldErrors.startDate),
                )}
              />
            </FormFieldControl>
            <FormFieldError />
          </FormField>

          <FormField id="leave-end" error={fieldErrors.endDate}>
            <FormFieldLabel className={text.secondary}>End</FormFieldLabel>
            <FormFieldControl>
              <Input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  clearFieldError("endDate");
                }}
                className={cn(
                  formLineDateFieldClassName(),
                  formFieldInvalidClassName(!!fieldErrors.endDate),
                )}
              />
            </FormFieldControl>
            <FormFieldError />
          </FormField>
        </div>

        <FormField id="leave-reason" error={fieldErrors.reason}>
          <FormFieldLabel className={text.secondary}>Reason</FormFieldLabel>
          <FormFieldTextarea
            rows={3}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              clearFieldError("reason");
            }}
            placeholder="Brief reason…"
            className={cn(
              formFieldInsetClassName("min-h-[80px] resize-y py-2"),
              "placeholder:text-muted-foreground",
            )}
          />
          <FormFieldError />
        </FormField>
      </FormDialog.Body>

      <FormDialog.Footer className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="button"
          className={hubCtaClassName("hr")}
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin motion-reduce:animate-none" aria-hidden />}
          Submit
        </Button>
      </FormDialog.Footer>
    </FormDialog>
  );
}
