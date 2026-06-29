"use client";

import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { selectFocusClassName, sidebarBranchPillClassName, topbarBranchIconClassName, topbarBranchPickerClassName } from "@/lib/theme/shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/api";

type BranchPickerProps = {
  branches: Branch[];
  activeBranchId: number | null;
  onChange: (branchId: number | null) => void;
  variant?: "topbar" | "sidebar";
  className?: string;
};

export function BranchPicker({
  branches,
  activeBranchId,
  onChange,
  variant = "topbar",
  className,
}: BranchPickerProps) {
  const value = activeBranchId == null ? "all" : String(activeBranchId);
  const isSidebar = variant === "sidebar";

  const branchItems = useMemo(() => {
    const items: Record<string, string> = { all: "All Branches (HQ)" };
    for (const branch of branches) {
      items[String(branch.id)] = branch.name;
    }
    return items;
  }, [branches]);

  return (
    <div
      className={cn(
        isSidebar ? sidebarBranchPillClassName() : topbarBranchPickerClassName(),
        className,
      )}
    >
      <MapPin
        className={cn(topbarBranchIconClassName(), isSidebar && "w-3.5 h-3.5")}
        aria-hidden="true"
      />
      <Select
        value={value}
        items={branchItems}
        onValueChange={(next) => {
          if (next == null) return;
          onChange(next === "all" ? null : Number(next));
        }}
      >
        <SelectTrigger
          aria-label="Select branch"
          className={selectFocusClassName(
            isSidebar
              ? "h-9 min-h-[36px] border-0 bg-transparent shadow-none w-full text-xs font-medium"
              : "h-9 min-h-[36px] border-0 bg-transparent shadow-none max-w-[140px] sm:max-w-[220px]",
          )}
        >
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent align={isSidebar ? "start" : "end"}>
          <SelectItem value="all">All Branches (HQ)</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={String(branch.id)}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
