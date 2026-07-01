"use client";

import { BranchPicker } from "@/components/shared/branch-picker";
import { useBranchPickerInit } from "@/hooks/useBranchPickerInit";
import { topbarBranchPickerClassName } from "@/lib/theme/shell";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type ImmersiveBranchToolbarProps = {
  className?: string;
};

/** Branch picker for Super Admin on immersive routes where the global topbar is hidden on mobile. */
export function ImmersiveBranchToolbar({ className }: ImmersiveBranchToolbarProps) {
  const { isSuperAdmin, branches, activeBranchId, setActiveBranchId } = useBranchPickerInit();

  if (!isSuperAdmin || branches.length === 0) return null;

  return (
    <div className={cn("w-full max-w-md lg:hidden", className)}>
      <BranchPicker
        variant="topbar"
        branches={branches}
        activeBranchId={activeBranchId}
        onChange={setActiveBranchId}
        className={cn(topbarBranchPickerClassName(), "w-full max-w-none")}
      />
      {activeBranchId == null && (
        <p className={cn("mt-1.5 text-xs", text.muted)}>
          Select a branch to use this screen. Dashboard and finance support all branches.
        </p>
      )}
    </div>
  );
}
