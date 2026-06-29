"use client";

import Link from "next/link";
import { ListTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hubCardIconFor, hubCtaClassName, inlineLinkClassName } from "@/lib/theme/hub-primitives";
import { kitchenMetaBadgeClassName } from "@/lib/theme/hub-kitchen";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

type BomListEmptyStateProps = {
  hasSearch: boolean;
  onCreate: () => void;
};

export function BomListEmptyState({ hasSearch, onCreate }: BomListEmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <ListTree className={hubCardIconFor("kitchen", "w-12 h-12 mx-auto mb-4")} />
      <p className={typeUiLabelClassName(text.primary)}>
        {hasSearch ? "No BOMs match your search" : "No production BOMs yet"}
      </p>
      <p className={cn("text-sm mt-2 max-w-md mx-auto", text.muted)}>
        {hasSearch
          ? "Try a different target or raw ingredient name."
          : "Create a production BOM to define raw ingredients and quantities for each finished product."}
      </p>
      {!hasSearch && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className={hubCtaClassName("kitchen")} onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" aria-hidden />
            Create first BOM
          </Button>
          <Link href="/products/ingredients" className={kitchenMetaBadgeClassName("px-4 py-2")}>
            Raw ingredients
          </Link>
        </div>
      )}
    </div>
  );
}
