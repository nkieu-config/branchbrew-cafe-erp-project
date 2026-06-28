"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { metricValueClassName, touchTargetClassName, type MetricTone } from "@/lib/theme";
import type { LucideIcon } from "lucide-react";

type TableActionButtonProps = {
  /** Visible and accessible name; required for icon-only buttons. */
  label: string;
  icon?: LucideIcon;
  /** Show icon only; label is exposed via aria-label. */
  iconOnly?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "ghost" | "outline" | "link";
  destructive?: boolean;
  /** Accent color for non-destructive actions (default: blue). */
  tone?: MetricTone;
};

export function TableActionButton({
  label,
  icon: Icon,
  iconOnly = false,
  onClick,
  className,
  variant = "ghost",
  destructive = false,
  tone = "blue",
}: TableActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      aria-label={iconOnly ? label : undefined}
      className={cn(
        touchTargetClassName(),
        "px-2 font-medium",
        destructive && "text-destructive hover:text-destructive hover:bg-destructive/10",
        !destructive && variant === "ghost" && cn(
          metricValueClassName(tone),
          "hover:bg-[var(--table-row-hover)]",
        ),
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      {!iconOnly && <span className={Icon ? "ml-1.5" : undefined}>{label}</span>}
    </Button>
  );
}
