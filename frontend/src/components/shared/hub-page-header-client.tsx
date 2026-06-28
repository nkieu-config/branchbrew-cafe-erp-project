"use client";

import type { HubCardProps } from "@/components/shared/hub-card";
import { usePageChromeContext, usePageChromeExtension } from "@/components/layout/PageChrome";
import { hubCardIconClass, text } from "@/lib/theme";
import { cn } from "@/lib/utils";

type HubPageHeaderClientProps = Omit<HubCardProps, "children">;

export function HubPageHeaderClient({
  title,
  icon: Icon,
  description,
  actions,
  accentHub,
  titleLevel = "h2",
  hideTitle = false,
}: HubPageHeaderClientProps) {
  const pageChrome = usePageChromeContext();

  usePageChromeExtension({
    title: hideTitle ? undefined : title,
    icon: Icon,
    hideTitle,
    description,
    actions,
  });

  if (pageChrome) return null;

  const TitleTag = titleLevel;
  const showTitle = !hideTitle && Boolean(title);
  const hasHeadingBlock = showTitle || Boolean(description);

  if (!hasHeadingBlock && !actions) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {hasHeadingBlock && (
        <div className="min-w-0">
          {showTitle && title && (
            <TitleTag className={cn("text-lg font-bold flex items-center gap-2", text.primary)}>
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
        <div className="flex flex-wrap items-center gap-2 shrink-0 sm:ml-auto">{actions}</div>
      )}
    </div>
  );
}
