"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { SidebarNavBadge } from "@/components/shared/sidebar-nav-badge";
import { useSidebarNavBadges } from "@/hooks/useSidebarNavBadges";
import { resolveMobileBottomNavBadge } from "@/lib/sidebar-badges";
import { getMobileBottomNavItems, isMobileBottomNavActive } from "@/lib/navigation";
import { mobileBottomNavClassName, mobileBottomNavIconClassName, mobileBottomNavItemClassName, mobileNavBadgePlacementClassName } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggle } = useMobileNav();
  const { badges } = useSidebarNavBadges();
  const role = (user?.role ?? "STAFF") as Role;
  const items = getMobileBottomNavItems(role);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Quick navigation" className={mobileBottomNavClassName()}>
      {items.map((item) => {
        const isActive = isMobileBottomNavActive(item, pathname);
        const ItemIcon = item.icon;
        const badge = resolveMobileBottomNavBadge(item.id, badges);

        if (item.action === "menu") {
          return (
            <button
              key={item.id}
              type="button"
              onClick={toggle}
              className={cn(
                mobileBottomNavItemClassName(false),
                "relative border-0 bg-transparent cursor-pointer",
              )}
              aria-label={badge ? `Open menu, ${badge.label}` : "Open full navigation menu"}
            >
              <span className="relative inline-flex">
                <ItemIcon className={mobileBottomNavIconClassName(false)} aria-hidden />
                {badge && (
                  <SidebarNavBadge
                    count={badge.count}
                    tone={badge.tone}
                    label={badge.label}
                    variant="dot"
                    className={mobileNavBadgePlacementClassName()}
                  />
                )}
              </span>
              <span>{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={badge ? `${item.label}, ${badge.label}` : item.label}
            className={cn(mobileBottomNavItemClassName(isActive), "relative")}
          >
            <span className="relative inline-flex">
              <ItemIcon className={mobileBottomNavIconClassName(isActive)} aria-hidden />
              {badge && (
                <SidebarNavBadge
                  count={badge.count}
                  tone={badge.tone}
                  label={badge.label}
                  variant="dot"
                  className={mobileNavBadgePlacementClassName()}
                />
              )}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
