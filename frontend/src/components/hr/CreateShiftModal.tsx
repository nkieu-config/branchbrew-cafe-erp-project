"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import type { User } from "@/types/api";
import { hubCtaClassName, inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { hrDialogContentClassName } from "@/lib/theme/hub-hr";
import { formFieldInsetClassName, formLineDateFieldClassName, formSelectContentClassName } from "@/lib/theme/stock";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type CreateShiftModalProps = {
  open: boolean;
  onClose: () => void;
  employees: User[];
  branchId: number;
  defaultDate?: string;
  onSubmit: (payload: {
    userId: number;
    branchId: number;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
};

export function CreateShiftModal({
  open,
  onClose,
  employees,
  branchId,
  defaultDate,
  onSubmit,
  isSubmitting = false,
}: CreateShiftModalProps) {
  const [userId, setUserId] = useState<string>("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  useEffect(() => {
    if (!open) return;
    setUserId("");
    setShiftDate(defaultDate ?? new Date().toISOString().slice(0, 10));
    setStartTime("09:00");
    setEndTime("17:00");
  }, [open, defaultDate]);

  const staffOptions = useMemo(
    () => employees.filter((employee) => employee.role === "STAFF" || employee.role === "MANAGER"),
    [employees],
  );

  const handleSubmit = async () => {
    const selectedUserId = userId ? Number(userId) : 0;
    if (!selectedUserId) {
      toast.error("Employee is required");
      return;
    }
    if (!shiftDate || !startTime || !endTime) {
      toast.error("Date and times are required");
      return;
    }

    const start = new Date(`${shiftDate}T${startTime}:00`);
    const end = new Date(`${shiftDate}T${endTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Invalid date or time");
      return;
    }
    if (end <= start) {
      toast.error("End time must be after start time");
      return;
    }

    await onSubmit({
      userId: selectedUserId,
      branchId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      className={hrDialogContentClassName()}
    >
        <FormDialog.Title>Schedule shift</FormDialog.Title>

        <FormDialog.Body className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="shift-employee" className={text.secondary}>
              Employee
            </Label>
            {staffOptions.length === 0 ? (
              <p className={cn("text-sm", text.muted)}>
                No employees yet —{" "}
                <Link href="/hr/employees" className={inlineLinkClassName()}>
                  add staff
                </Link>
              </p>
            ) : (
              <Select value={userId} onValueChange={(value) => value != null && setUserId(value)}>
                <SelectTrigger id="shift-employee" className={formFieldInsetClassName("w-full")}>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent className={formSelectContentClassName()}>
                  {staffOptions.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.name ?? employee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shift-date" className={text.secondary}>
                Date
              </Label>
              <Input
                id="shift-date"
                type="date"
                value={shiftDate}
                onChange={(event) => setShiftDate(event.target.value)}
                className={formLineDateFieldClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-start" className={text.secondary}>
                Start
              </Label>
              <Input
                id="shift-start"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-end" className={text.secondary}>
                End
              </Label>
              <Input
                id="shift-end"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className={formFieldInsetClassName()}
              />
            </div>
          </div>
        </FormDialog.Body>

        <FormDialog.Footer className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || staffOptions.length === 0}
            className={cn("min-h-[44px]", hubCtaClassName("hr"))}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            Save
          </Button>
        </FormDialog.Footer>
    </FormDialog>
  );
}
