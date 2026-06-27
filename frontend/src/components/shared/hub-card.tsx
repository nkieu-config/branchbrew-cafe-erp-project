import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import type { HubId } from "@/lib/navigation";
import { hubCardIconClass, surfaceCardClassName, text } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface HubCardProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Optional hub id for module accent on the icon */
  accentHub?: HubId;
  /** Page title level — use h1 on standalone pages without HubShell. */
  titleLevel?: "h1" | "h2" | "h3";
}

function HubHeading({
  title,
  icon: Icon,
  description,
  actions,
  className,
  accentHub,
  titleLevel = "h2",
}: HubCardProps) {
  const TitleTag = titleLevel;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
        className,
      )}
    >
      <div>
        <TitleTag className={cn("text-lg font-bold flex items-center gap-2", text.primary)}>
          {Icon && <Icon className={hubCardIconClass(accentHub)} aria-hidden />}
          {title}
        </TitleTag>
        {description && (
          <p className={cn("text-sm", text.muted)}>{description}</p>
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
  accentHub,
  titleLevel,
}: HubCardProps) {
  return (
    <div className={surfaceCardClassName(className)}>
      <HubHeading
        title={title}
        icon={icon}
        description={description}
        actions={actions}
        accentHub={accentHub}
        titleLevel={titleLevel}
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
