"use client";

import { MapPin, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { branchScopeAllClassName, branchScopeIndicatorClassName } from "@/lib/theme/feedback";
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
  const { user } = useAuth();

  /** SUPER_ADMIN uses the shell branch picker — avoid duplicate scope chrome. */
  if (user?.role === "SUPER_ADMIN") return null;

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
