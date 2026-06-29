"use client";

import Link from "next/link";
import { Loader2, UserCog } from "lucide-react";
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
import { Avatar } from "@/components/ui/avatar";
import type { User } from "@/types/api";
import { formatBaht } from "@/lib/money";
import {
  formFieldInsetClassName,
  formLineRowClassName,
  hrAvatarClassName,
  hrDialogContentClassName,
  hubCtaClassName,
  hubModalIconClassName,
  inlineLinkClassName,
  metricValueClassName,
  text,
  typeHeadingClassName,
  typeUiLabelClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import { buildHrPayrollUrl } from "@/lib/hr-hub-url";

type EditCompensationModalProps = {
  open: boolean;
  user: User | null;
  hourlyRate: string;
  onHourlyRateChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  canLinkPayroll?: boolean;
};

export function EditCompensationModal({
  open,
  user,
  hourlyRate,
  onHourlyRateChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  canLinkPayroll = false,
}: EditCompensationModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className={hrDialogContentClassName()}>
        <DialogHeader>
          <DialogTitle className={typeHeadingClassName("text-xl flex items-center gap-2")}>
            <UserCog className={hubModalIconClassName("hr")} aria-hidden />
            Edit compensation
          </DialogTitle>
          <DialogDescription>
            Hourly rate drives payroll from clocked hours. Base salary applies to full-time staff
            separately.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <>
            <div className={cn("mb-2 flex items-center gap-3", formLineRowClassName("items-center"))}>
              <Avatar size="lg" className={hrAvatarClassName()}>
                {user.name?.charAt(0) ?? "U"}
              </Avatar>
              <div>
                <div className={typeHeadingClassName()}>{user.name ?? "Unknown user"}</div>
                <div className={cn("text-sm", text.muted)}>{user.role}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
                  Employment type
                </p>
                <p className={cn("text-sm font-medium", text.primary)}>
                  {user.employmentType?.replace("_", " ") ?? "Not set"}
                </p>
              </div>
              {user.employmentType === "FULL_TIME" && user.baseSalary != null && (
                <div className="space-y-1">
                  <p className={cn("text-xs font-medium uppercase tracking-wide", text.muted)}>
                    Base salary
                  </p>
                  <p className={typeUiLabelClassName(cn("text-sm tabular-nums", metricValueClassName("blue")))}>
                    {formatBaht(user.baseSalary)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly-rate" className={text.secondary}>
                Hourly rate (฿)
              </Label>
              <Input
                id="hourly-rate"
                type="number"
                min={0}
                step={1}
                value={hourlyRate}
                onChange={(event) => onHourlyRateChange(event.target.value)}
                className={formFieldInsetClassName()}
              />
              <p className={cn("text-xs", text.muted)}>
                Used when generating payroll from attendance hours.
                {canLinkPayroll && (
                  <>
                    {" "}
                    <Link href={buildHrPayrollUrl({ employee: user.id })} className={inlineLinkClassName()}>
                      View payroll runs
                    </Link>
                  </>
                )}
              </p>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            className={cn("min-h-[44px]", hubCtaClassName("hr"))}
            onClick={onSubmit}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
