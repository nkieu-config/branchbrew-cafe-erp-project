"use client";

import { MapPin } from "lucide-react";
import { BranchPicker } from "@/components/shared/branch-picker";
import { useBranchPickerInit } from "@/hooks/useBranchPickerInit";
import { emptyStateIconClassName } from "@/lib/theme/color-helpers";
import { sidebarBranchPillClassName } from "@/lib/theme/shell";
import { surface, text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type BranchEmptyStateProps = {
  title?: string;
  description?: string;
  /** Show hint that HQ/all-branches works on analytics pages only */
  showOperationalHint?: boolean;
};

export function BranchEmptyState({
  title = "Select a branch",
  description = "Choose a branch below to load data for this page.",
  showOperationalHint = true,
}: BranchEmptyStateProps) {
  const { isSuperAdmin, branches, activeBranchId, setActiveBranchId } = useBranchPickerInit();

  return (
    <div className={cn(surface.empty)} data-testid="branch-empty-state">
      <MapPin className={emptyStateIconClassName("w-10 h-10 mx-auto mb-4")} aria-hidden />
      <p className={typeUiLabelClassName(text.primary)}>{title}</p>
      <p className={cn("text-sm mt-2 max-w-md mx-auto", text.muted)}>{description}</p>

      {isSuperAdmin && branches.length > 0 && (
        <div className={cn("mt-6 w-full max-w-sm mx-auto", sidebarBranchPillClassName())}>
          <BranchPicker
            variant="sidebar"
            branches={branches}
            activeBranchId={activeBranchId}
            onChange={setActiveBranchId}
            className="w-full"
          />
        </div>
      )}

      {showOperationalHint && isSuperAdmin && (
        <p className={cn("text-xs mt-4 max-w-sm mx-auto", text.muted)}>
          Dashboard and finance overview can use All Branches (HQ). POS, kitchen, inventory, and HR
          need a specific branch.
        </p>
      )}
    </div>
  );
}
