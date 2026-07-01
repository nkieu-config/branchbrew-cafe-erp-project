"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbDisplay } from "@/lib/navigation/breadcrumb-display";
import { useIsLgUp } from "@/hooks/useMediaQuery";
import type { BreadcrumbItem } from "@/lib/navigation";
import {
  breadcrumbCurrentClassName,
  breadcrumbEllipsisClassName,
  breadcrumbLinkClassName,
  breadcrumbNavClassName,
  breadcrumbParentClassName,
  breadcrumbSeparatorClassName,
} from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type BreadcrumbTrailProps = {
  items: BreadcrumbItem[];
  className?: string;
};

function BreadcrumbSeparator() {
  return (
    <ChevronRight
      className={breadcrumbSeparatorClassName()}
      aria-hidden
      strokeWidth={2}
    />
  );
}

export function BreadcrumbTrail({ items, className }: BreadcrumbTrailProps) {
  const isDesktop = useIsLgUp();
  const segments = buildBreadcrumbDisplay(items, isDesktop);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn(breadcrumbNavClassName(), className)}>
      <ol className="flex min-w-0 items-center">
        {segments.map((segment, segmentIndex) => {
          const isLast = segmentIndex === segments.length - 1;

          return (
            <li key={segment.kind === "item" ? `${segment.item.label}-${segment.index}` : "ellipsis"} className="flex min-w-0 items-center">
              {segmentIndex > 0 && <BreadcrumbSeparator />}
              {segment.kind === "ellipsis" ? (
                <span
                  className={breadcrumbEllipsisClassName()}
                  title={segment.title}
                  aria-label={`Collapsed: ${segment.title}`}
                >
                  …
                </span>
              ) : segment.item.href ? (
                <Link href={segment.item.href} className={breadcrumbLinkClassName()}>
                  {segment.item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? breadcrumbCurrentClassName("min-w-0")
                      : breadcrumbParentClassName()
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {segment.item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
