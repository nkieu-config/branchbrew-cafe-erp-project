"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ClockInOutWidget } from "@/components/hr/ClockInOutWidget";
import { SIDEBAR_GROUPS, isSidebarItemActive } from "@/lib/navigation";
import {
  sidebarBrandTitleClassName,
  sidebarGroupButtonClassName,
  sidebarLogoutButtonClassName,
  sidebarNavIconClassName,
  sidebarNavLinkClassName,
  sidebarRootClassName,
  shell,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

function toGroupId(groupName: string) {
  return groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

type SidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Overview & Analytics": true,
    "Store Operations": true,
    "Back Office": false,
    "System Admin": false,
  });

  useEffect(() => {
    SIDEBAR_GROUPS.forEach((group) => {
      const hasActiveItem = group.items.some((item) =>
        isSidebarItemActive(item, pathname),
      );
      if (hasActiveItem) {
        setExpandedGroups((prev) => ({ ...prev, [group.group]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = () => {
    onNavigate?.();
    void logout();
  };

  return (
    <div className={sidebarRootClassName(className)}>
      <div className={cn("h-16 flex items-center px-6 border-b shrink-0", shell.sidebarDivider)}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm bg-[var(--sidebar-brand-mark-bg)]"
          aria-hidden
        >
          <Coffee className="w-5 h-5 text-[var(--sidebar-brand-mark-fg)]" />
        </div>
        <span className={sidebarBrandTitleClassName()}>QafaCafe</span>
      </div>

      {user && (
        <div
          className={cn(
            "px-6 py-4 border-b shrink-0 bg-[var(--sidebar-user-panel-bg)]",
            shell.sidebarDivider,
          )}
        >
          <p className={cn("text-sm font-bold text-balance", text.primary)}>{user.name}</p>
          <p className={cn("text-xs capitalize", text.muted)}>{user.role.replace("_", " ")}</p>
        </div>
      )}

      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar" aria-label="Primary navigation">
        {SIDEBAR_GROUPS.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.includes((user?.role ?? "STAFF") as Role),
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
                  {visibleItems.map((item) => {
                    const isReallyActive = isSidebarItemActive(item, pathname);
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isReallyActive ? "page" : undefined}
                        className={sidebarNavLinkClassName(isReallyActive)}
                      >
                        <ItemIcon
                          className={sidebarNavIconClassName(isReallyActive)}
                          aria-hidden
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {user && <ClockInOutWidget />}

      <div className={cn("p-4 border-t shrink-0", shell.sidebarDivider)}>
        <Button variant="outline" className={sidebarLogoutButtonClassName()} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
