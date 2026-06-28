"use client";

import { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BranchScopeIndicator } from "@/components/shared/branch-scope-indicator";
import {
  listToolbarClassName,
  listToolbarFieldClassName,
  listToolbarFiltersClassName,
  listToolbarSearchClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type ListToolbarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  onReset?: () => void;
  showReset?: boolean;
  /** @deprecated Use branchScope on HubPageHeader / PageChrome instead of toolbar scope. */
  branchName?: string | null;
  /** @deprecated Use branchScope on HubPageHeader / PageChrome instead of toolbar scope. */
  allBranches?: boolean;
  className?: string;
};

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  onReset,
  showReset = false,
  branchName,
  allBranches = false,
  className,
}: ListToolbarProps) {
  const hasSearch = onSearchChange != null;

  return (
    <div className={listToolbarClassName(className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        {hasSearch && (
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)] pointer-events-none"
              aria-hidden
            />
            <Input
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(listToolbarFieldClassName(), listToolbarSearchClassName(), "pl-9")}
              aria-label={searchPlaceholder}
            />
          </div>
        )}
        {filters && <div className={listToolbarFiltersClassName()}>{filters}</div>}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {(branchName || allBranches) && (
          <BranchScopeIndicator branchName={branchName} allBranches={allBranches} />
        )}
        {showReset && onReset && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="min-h-[44px] text-[var(--text-secondary)]"
          >
            <X className="w-4 h-4 mr-1.5" aria-hidden />
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
}
