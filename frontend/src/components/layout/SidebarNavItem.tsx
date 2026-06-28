"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { SidebarNavBadge } from "@/components/shared/sidebar-nav-badge";
import {
  getHubConfig,
  getVisibleHubTabs,
  isSidebarItemActive,
  isTabActive,
  resolveSidebarHubId,
  shouldShowHubSubNav,
  type SidebarItem,
} from "@/lib/navigation";
import type { SidebarNavBadgeMap } from "@/lib/sidebar-badges";
import {
  sidebarNavChildLinkClassName,
  sidebarNavIconClassName,
  sidebarNavLinkClassName,
  sidebarPinButtonClassName,
  sidebarTreeIndentClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

type SidebarNavItemProps = {
  item: SidebarItem;
  pathname: string;
  role: Role;
  onNavigate?: () => void;
  badges?: SidebarNavBadgeMap;
  childTabBadges?: SidebarNavBadgeMap;
  canPin?: boolean;
  isPinned?: boolean;
  onTogglePin?: (itemId: string) => void;
};

export function SidebarNavItem({
  item,
  pathname,
  role,
  onNavigate,
  badges,
  childTabBadges,
  canPin = false,
  isPinned = false,
  onTogglePin,
}: SidebarNavItemProps) {
  const ItemIcon = item.icon;
  const hubId = resolveSidebarHubId(item.id);
  const hub = hubId ? getHubConfig(hubId) : null;
  const childTabs = hubId ? getVisibleHubTabs(hubId, role) : [];
  const isHubActive = isSidebarItemActive(item, pathname);
  const showTree =
    hub != null && isHubActive && shouldShowHubSubNav(childTabs, hub.basePath);
  const badge = badges?.[item.id];

  const activeChildTab = hub
    ? childTabs.find((tab) => isTabActive(pathname, tab.path, hub.basePath))
    : undefined;
  const isParentCurrentPage =
    isHubActive && (!activeChildTab || activeChildTab.path === item.href);

  return (
    <div className="space-y-0.5">
      <div className="group/navitem flex items-center gap-1">
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={isParentCurrentPage ? "page" : undefined}
          className={cn(sidebarNavLinkClassName(isHubActive, isParentCurrentPage), "min-w-0 flex-1")}
        >
          <ItemIcon className={sidebarNavIconClassName(isHubActive)} aria-hidden />
          <span className="truncate">{item.label}</span>
          {badge && (
            <SidebarNavBadge count={badge.count} tone={badge.tone} label={badge.label} />
          )}
        </Link>
        {canPin && onTogglePin && (
          <button
            type="button"
            onClick={() => onTogglePin(item.id)}
            className={sidebarPinButtonClassName(isPinned)}
            aria-label={isPinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
            aria-pressed={isPinned}
            title={isPinned ? "Unpin" : "Pin to top"}
          >
            <Star className={cn("w-3.5 h-3.5", isPinned && "fill-current")} aria-hidden />
          </button>
        )}
      </div>

      {showTree && (
        <ul
          className={cn(sidebarTreeIndentClassName, "space-y-0.5")}
          role="group"
          aria-label={`${item.label} sections`}
        >
          {childTabs.map((tab) => {
            const isChildActive = isTabActive(pathname, tab.path, hub.basePath);
            const tabBadge = childTabBadges?.[tab.path];
            return (
              <li key={tab.path}>
                <Link
                  href={tab.path}
                  onClick={onNavigate}
                  aria-current={isChildActive ? "page" : undefined}
                  aria-label={tabBadge ? `${tab.label}, ${tabBadge.label}` : tab.label}
                  className={cn(sidebarNavChildLinkClassName(isChildActive), "justify-between gap-2")}
                >
                  <span className="truncate">{tab.label}</span>
                  {tabBadge && (
                    <SidebarNavBadge
                      count={tabBadge.count}
                      tone={tabBadge.tone}
                      label={tabBadge.label}
                      className="ml-0 shrink-0"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
