import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HubCardProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

function HubHeading({
  title,
  icon: Icon,
  description,
  actions,
  className,
}: HubCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
        className,
      )}
    >
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-amber-600" />}
          {title}
        </h2>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

/** Card + heading for hub layout child pages (replaces AnimatedPage + PageHeader). */
export function HubCard({
  title,
  icon,
  description,
  actions,
  children,
  className,
}: HubCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6",
        className,
      )}
    >
      <HubHeading
        title={title}
        icon={icon}
        description={description}
        actions={actions}
        className="mb-6"
      />
      {children}
    </div>
  );
}

/** Heading only — for multi-section hub pages with existing card layouts. */
export function HubPageHeader(props: Omit<HubCardProps, "children">) {
  return <HubHeading {...props} />;
}
