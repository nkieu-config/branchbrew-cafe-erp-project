import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "emerald" | "blue" | "red" | "amber" | "indigo" | "purple" | "slate";
  trend?: number;
  trendText?: string;
  className?: string;
}

const colorMaps = {
  emerald: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20",
  blue: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/20",
  red: "text-red-500 bg-red-500/10 dark:bg-red-500/20",
  amber: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20",
  indigo: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20",
  purple: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20",
  slate: "text-slate-500 bg-slate-500/10 dark:bg-slate-500/20",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = "emerald",
  trend,
  trendText,
  className = "",
}: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className={`text-3xl font-bold mt-1 tabular-nums ${colorMaps[color].split(" ")[0]}`}>
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${colorMaps[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(trend !== undefined || trendText) && (
        <div className="flex items-center gap-2 mt-4 text-sm font-medium">
          {trend !== undefined && (
            <span className={trend >= 0 ? "text-emerald-500" : "text-red-500"}>
              {trend > 0 ? "+" : ""}{trend}%
            </span>
          )}
          {trendText && <span className="text-slate-400">{trendText}</span>}
        </div>
      )}
    </div>
  );
}
