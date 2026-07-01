"use client";

import type { LucideIcon } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dashboardWidgetHeaderClass,
  dashboardWidgetTitleClass,
  type DashboardWidgetVariant,
} from "@/lib/theme/dashboard";
import { text } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

type DashboardWidgetHeaderProps = {
  variant: DashboardWidgetVariant;
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  className?: string;
};

export function DashboardWidgetHeader({
  variant,
  icon: Icon,
  title,
  description,
  badge,
  className,
}: DashboardWidgetHeaderProps) {
  return (
    <CardHeader className={dashboardWidgetHeaderClass(className)}>
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 space-y-0.5">
          <CardTitle
            className={cn(
              "flex items-center gap-2 text-base leading-tight",
              dashboardWidgetTitleClass(variant),
            )}
          >
            <Icon className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
            <span className="truncate">{title}</span>
          </CardTitle>
          {description ? (
            <CardDescription className={cn("text-xs leading-snug", text.muted)}>
              {description}
            </CardDescription>
          ) : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
    </CardHeader>
  );
}
