"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type TableActionButtonProps = {
  label?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  variant?: "ghost" | "outline" | "link";
  destructive?: boolean;
};

export function TableActionButton({
  label,
  icon: Icon,
  onClick,
  className,
  variant = "ghost",
  destructive = false,
}: TableActionButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-8 px-2 font-medium",
        destructive && "text-destructive hover:text-destructive hover:bg-destructive/10",
        !destructive && variant === "ghost" && "text-blue-600 hover:text-blue-700 dark:text-blue-400",
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label && <span className={Icon ? "ml-1.5" : undefined}>{label}</span>}
    </Button>
  );
}
