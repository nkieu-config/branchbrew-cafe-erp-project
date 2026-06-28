"use client";

import { MapPin, Globe } from "lucide-react";
import { branchScopeAllClassName, branchScopeIndicatorClassName } from "@/lib/theme";
import { cn } from "@/lib/utils";

type BranchScopeIndicatorProps = {
  branchName?: string | null;
  /** When true, data spans all branches (finance HQ view). */
  allBranches?: boolean;
  className?: string;
};

export function BranchScopeIndicator({
  branchName,
  allBranches = false,
  className,
}: BranchScopeIndicatorProps) {
  if (allBranches) {
    return (
      <span className={cn(branchScopeAllClassName(), className)}>
        <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden />
        All branches
      </span>
    );
  }

  if (!branchName) return null;

  return (
    <span className={cn(branchScopeIndicatorClassName(), className)}>
      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {branchName}
    </span>
  );
}
