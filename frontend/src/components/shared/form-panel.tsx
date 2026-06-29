"use client";

import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { formPanelClassName } from "@/lib/theme/stock";
import { decorativeIconClassName, formContextBannerClassName } from "@/lib/theme";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type FormPanelProps = {
  children: ReactNode;
  className?: string;
};

/** Tier B operational form shell — wraps formPanelClassName. */
export function FormPanel({ children, className }: FormPanelProps) {
  return <div className={formPanelClassName(className)}>{children}</div>;
}

type FormPanelFooterProps = {
  status?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Standard form footer: status text left, Cancel/Primary actions right on desktop. */
export function FormPanelFooter({ status, children, className }: FormPanelFooterProps) {
  return (
    <div className={cn("mt-8 flex flex-col sm:flex-row sm:items-center gap-3", className)}>
      {status ? (
        <div className={cn("text-sm sm:mr-auto space-y-1", text.muted)}>{status}</div>
      ) : (
        <div className="sm:mr-auto" />
      )}
      <div className="flex justify-end gap-3 shrink-0">{children}</div>
    </div>
  );
}

type FormEmptyIngredientsBannerProps = {
  className?: string;
  ingredientsHref?: string;
};

/** Shared empty-state when master ingredient list is empty (stock-in, waste, PO, BOM). */
export function FormEmptyIngredientsBanner({
  className,
  ingredientsHref = "/products/ingredients",
}: FormEmptyIngredientsBannerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center",
        formContextBannerClassName(),
        className,
      )}
    >
      <PackageOpen className={decorativeIconClassName("w-10 h-10")} aria-hidden />
      <p className={cn("font-medium", text.primary)}>No ingredients available</p>
      <p className={cn("text-sm max-w-md", text.muted)}>
        Add raw ingredients in Products before recording stock movements.{" "}
        <ButtonLink href={ingredientsHref} variant="link" className="h-auto p-0">
          Go to Ingredients
        </ButtonLink>
      </p>
    </div>
  );
}
