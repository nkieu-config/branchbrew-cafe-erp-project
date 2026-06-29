import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import type { HubId } from "@/lib/navigation";
import type { PageChromeBranchScope } from "@/components/layout/PageChrome";
import { hubCardIconClass } from "@/lib/theme/hub-accent";
import { surfaceCardClassName, text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import { HubPageHeaderClient } from "@/components/shared/hub-page-header-client";

export interface HubCardProps {
  title?: string;
  icon?: LucideIcon;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Optional hub id for module accent on the icon */
  accentHub?: HubId;
  /** Page title level — defaults to h2 under HubShell. Use h1 on standalone pages only. */
  titleLevel?: "h1" | "h2" | "h3";
  /** Omit the title row (HubShell already provides the page h1). */
  hideTitle?: boolean;
  /** Branch scope badge in PageChrome header row (non–SUPER_ADMIN). */
  branchScope?: PageChromeBranchScope;
}

function HubHeading({
  title,
  icon: Icon,
  description,
  actions,
  className,
  accentHub,
  titleLevel = "h2",
  hideTitle = false,
}: HubCardProps) {
  const TitleTag = titleLevel;
  const showTitle = !hideTitle && Boolean(title);
  const hasHeadingBlock = showTitle || Boolean(description);

  if (!hasHeadingBlock && !actions) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
        className,
      )}
    >
      {hasHeadingBlock && (
        <div className="min-w-0">
          {showTitle && (
            <TitleTag className={typeHeadingClassName("text-lg flex items-center gap-2")}>
              {Icon && <Icon className={hubCardIconClass(accentHub)} aria-hidden />}
              {title}
            </TitleTag>
          )}
          {description && (
            <p className={cn("text-sm", showTitle && "mt-1", text.muted)}>{description}</p>
          )}
        </div>
      )}
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-auto">
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
  hideTitle,
}: HubCardProps) {
  const heading = (
    <HubHeading
      title={title}
      icon={icon}
      description={description}
      actions={actions}
      accentHub={accentHub}
      titleLevel={titleLevel}
      hideTitle={hideTitle}
      className="mb-6"
    />
  );

  return (
    <div className={surfaceCardClassName(className)}>
      {heading}
      {children}
    </div>
  );
}

/** Heading only — registers with PageChrome inside HubShell, or renders standalone. */
export function HubPageHeader(props: Omit<HubCardProps, "children">) {
  return <HubPageHeaderClient {...props} titleLevel={props.titleLevel ?? "h2"} />;
}
