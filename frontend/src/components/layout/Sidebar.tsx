"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ChevronDown, PanelLeftClose } from "lucide-react";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { useAuth } from "@/context/AuthContext";
import { useSidebarExpandedGroups } from "@/hooks/useSidebarExpandedGroups";
import { SIDEBAR_GROUPS } from "@/lib/navigation/sidebar";
import { sidebarBrandLinkClassName, sidebarBrandTitleClassName, sidebarBrandMarkClassName, sidebarBrandMarkIconClassName, sidebarGroupButtonClassName, sidebarIconButtonClassName, sidebarRootClassName, shell, shellHeaderInsetClassName } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

function toGroupId(groupName: string) {
  return groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

type SidebarProps = {
  onNavigate?: () => void;
  onCollapse?: () => void;
  className?: string;
};

export function Sidebar({ onNavigate, onCollapse, className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = (user?.role ?? "STAFF") as Role;
  const { expandedGroups, toggleGroup } = useSidebarExpandedGroups(user?.role as Role | undefined);

  let visibleGroupIndex = 0;

  return (
    <div className={sidebarRootClassName(className)}>
      <div className={cn("shrink-0 border-b", shell.sidebarDivider, shellHeaderInsetClassName())}>
        <div className="h-14 flex items-center gap-1 px-3">
          <Link
            href="/"
            onClick={onNavigate}
            className={sidebarBrandLinkClassName()}
            aria-label="BranchBrew home"
          >
            <div className={sidebarBrandMarkClassName()} aria-hidden>
              <Coffee className={sidebarBrandMarkIconClassName()} />
            </div>
            <span className={cn(sidebarBrandTitleClassName(), "min-w-0 truncate")}>BranchBrew</span>
          </Link>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className={cn(sidebarIconButtonClassName(), "ml-auto opacity-60 hover:opacity-100")}
              aria-label="Collapse sidebar to icon rail"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto custom-scrollbar" aria-label="Primary navigation">
        {SIDEBAR_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          const isSingleItemGroup = visibleItems.length === 1;
          const showGroupDivider = visibleGroupIndex > 0;
          visibleGroupIndex += 1;

          if (isSingleItemGroup) {
            return (
              <div
                key={group.group}
                className={cn(showGroupDivider && "mt-4 pt-4 border-t", shell.sidebarDivider)}
              >
                <SidebarNavItem
                  item={visibleItems[0]}
                  pathname={pathname}
                  role={role}
                  onNavigate={onNavigate}
                />
              </div>
            );
          }

          const isExpanded = expandedGroups[group.group];
          const groupId = toGroupId(group.group);

          return (
            <div
              key={group.group}
              className={cn(showGroupDivider && "mt-4 pt-4 border-t", shell.sidebarDivider)}
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`sidebar-group-${groupId}`}
                onClick={() => toggleGroup(group.group)}
                className={sidebarGroupButtonClassName()}
              >
                {group.group}
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 opacity-60 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none",
                    !isExpanded && "-rotate-90",
                  )}
                  aria-hidden
                />
              </button>

              {isExpanded && (
                <div id={`sidebar-group-${groupId}`} className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <SidebarNavItem
                      key={item.id}
                      item={item}
                      pathname={pathname}
                      role={role}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
