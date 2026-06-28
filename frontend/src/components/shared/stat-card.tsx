import React from "react";
import { LucideIcon } from "lucide-react";
import {
  metricIconWrapClassName,
  metricTrendClassName,
  metricValueClassName,
  typeMetricClassName,
  surfaceCardClassName,
  text,
  type MetricTone,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: MetricTone;
  trend?: number;
  trendText?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "emerald",
  trend,
  trendText,
  className,
}: StatCardProps) {
  return (
    <div className={cn(surfaceCardClassName("rounded-2xl relative overflow-hidden"), className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={cn("text-sm font-medium", text.muted)}>{title}</p>
          <h3 className={cn(typeMetricClassName("text-3xl mt-1"), metricValueClassName(color))}>
            {value}
          </h3>
        </div>
        <div className={metricIconWrapClassName(color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend !== undefined || trendText) && (
        <div className="flex items-center gap-2 mt-4 text-sm font-medium">
          {trend !== undefined && (
            <span className={metricTrendClassName(trend >= 0)}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
          {trendText && <span className={text.subtle}>{trendText}</span>}
        </div>
      )}
    </div>
  );
}
