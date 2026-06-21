import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, icon: Icon, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          {Icon && <Icon className="w-6 h-6 text-emerald-500" />}
          {title}
        </h2>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
