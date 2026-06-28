"use client";

import { usePathname } from "next/navigation";
import { Coffee, ChevronDown, PanelLeftClose } from "lucide-react";
import { BranchPicker } from "@/components/shared/branch-picker";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { useAuth } from "@/context/AuthContext";
import { useBranchPickerInit } from "@/hooks/useBranchPickerInit";
import { useSidebarExpandedGroups } from "@/hooks/useSidebarExpandedGroups";
import { useSidebarNavBadges } from "@/hooks/useSidebarNavBadges";
import { useSidebarPinnedItems } from "@/hooks/useSidebarPinnedItems";
import { FLAT_SIDEBAR_ITEMS, SIDEBAR_GROUPS } from "@/lib/navigation";
import {
  sidebarBrandTitleClassName,
  sidebarGroupButtonClassName,
  sidebarIconButtonClassName,
  sidebarPinnedLabelClassName,
  sidebarRootClassName,
  shell,
  shellHeaderInsetClassName,
} from "@/lib/theme";
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
  const { isSuperAdmin, branches, activeBranchId, setActiveBranchId } = useBranchPickerInit();
  const { badges, childTabBadges } = useSidebarNavBadges();
  const { canPin, pinnedIds, togglePin, isPinned } = useSidebarPinnedItems();

  const pinnedItems = pinnedIds
    .map((id) => FLAT_SIDEBAR_ITEMS.find((item) => item.id === id))
    .filter((item): item is (typeof FLAT_SIDEBAR_ITEMS)[number] => !!item && item.roles.includes(role));

  return (
    <div className={sidebarRootClassName(className)}>
      <div className={cn("shrink-0 border-b", shell.sidebarDivider, shellHeaderInsetClassName())}>
        <div className="h-14 md:h-16 flex items-center px-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm bg-[var(--sidebar-brand-mark-bg)]"
            aria-hidden
          >
            <Coffee className="w-5 h-5 text-[var(--sidebar-brand-mark-fg)]" />
          </div>
          <span className={cn(sidebarBrandTitleClassName(), "flex-1 min-w-0 truncate")}>QafaCafe</span>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className={cn(sidebarIconButtonClassName(), "ml-2")}
              aria-label="Collapse sidebar to icon rail"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" aria-hidden />
            </button>
          )}
        </div>

        {isSuperAdmin && branches.length > 0 && (
          <div className="px-4 pb-4">
            <BranchPicker
              variant="sidebar"
              branches={branches}
              activeBranchId={activeBranchId}
              onChange={setActiveBranchId}
            />
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar" aria-label="Primary navigation">
        {pinnedItems.length > 0 && (
          <div className="mb-4">
            <p className={sidebarPinnedLabelClassName()}>Pinned</p>
            <div className="space-y-0.5">
              {pinnedItems.map((item) => (
                <SidebarNavItem
                  key={`pinned-${item.id}`}
                  item={item}
                  pathname={pathname}
                  role={role}
                  onNavigate={onNavigate}
                  badges={badges}
                  childTabBadges={childTabBadges}
                  canPin={canPin}
                  isPinned={isPinned(item.id)}
                  onTogglePin={togglePin}
                />
              ))}
            </div>
          </div>
        )}

        {SIDEBAR_GROUPS.map((group, groupIdx) => {
          const visibleItems = group.items.filter(
            (item) => item.roles.includes(role) && !pinnedIds.includes(item.id),
          );
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedGroups[group.group];
          const groupId = toGroupId(group.group);

          return (
            <div key={group.group} className={cn(groupIdx > 0 && "mt-4")}>
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
                    "w-3.5 h-3.5 transition-transform duration-200 motion-reduce:transition-none motion-reduce:transform-none",
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
                      badges={badges}
                      childTabBadges={childTabBadges}
                      canPin={canPin}
                      isPinned={isPinned(item.id)}
                      onTogglePin={togglePin}
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
