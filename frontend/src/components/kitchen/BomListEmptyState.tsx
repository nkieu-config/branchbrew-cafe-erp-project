"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hubCtaClassName } from "@/lib/theme/hub-primitives";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type BomListEmptyStateProps = {
  hasSearch: boolean;
  onCreate: () => void;
};

export function BomListEmptyState({ hasSearch, onCreate }: BomListEmptyStateProps) {
  return (
    <div className="py-14 text-center">
      <p className={cn("font-medium", text.primary)}>
        {hasSearch ? "No BOMs match your search" : "No production BOMs yet"}
      </p>
      <p className={cn("text-sm mt-1.5", text.muted)}>
        {hasSearch ? "Try a different name." : "Define raw ingredients per finished product."}
      </p>
      {!hasSearch && (
        <Button className={cn("mt-5", hubCtaClassName("kitchen"))} onClick={onCreate}>
          <Plus className="w-4 h-4 mr-2" aria-hidden />
          Create BOM
        </Button>
      )}
    </div>
  );
}
