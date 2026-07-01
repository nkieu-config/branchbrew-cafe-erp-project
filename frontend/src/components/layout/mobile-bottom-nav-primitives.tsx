"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { SidebarNavBadge } from "@/components/shared/sidebar-nav-badge";
import type { SidebarNavBadgeTone } from "@/lib/sidebar-badges";
import {
  mobileBottomNavBarClassName,
  mobileBottomNavClassName,
  mobileBottomNavIconClassName,
  mobileBottomNavIconWrapClassName,
  mobileBottomNavItemClassName,
  mobileBottomNavLabelClassName,
  mobileNavBadgePlacementClassName,
} from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

type MobileNavBadge = {
  count: number;
  tone?: SidebarNavBadgeTone;
  label: string;
};

type MobileBottomNavShellProps = {
  ariaLabel: string;
  children: React.ReactNode;
};

export function MobileBottomNavShell({ ariaLabel, children }: MobileBottomNavShellProps) {
  return (
    <nav aria-label={ariaLabel} className={mobileBottomNavClassName()}>
      <div className={mobileBottomNavBarClassName()}>{children}</div>
    </nav>
  );
}

type MobileBottomNavItemContentProps = {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: MobileNavBadge | null;
};

function MobileBottomNavItemContent({
  icon: Icon,
  label,
  isActive,
  badge,
}: MobileBottomNavItemContentProps) {
  return (
    <>
      <span className={mobileBottomNavIconWrapClassName(isActive)}>
        <Icon className={mobileBottomNavIconClassName(isActive)} aria-hidden />
        {badge && badge.count > 0 && (
          <SidebarNavBadge
            count={badge.count}
            tone={badge.tone}
            label={badge.label}
            variant="dot"
            className={mobileNavBadgePlacementClassName()}
          />
        )}
      </span>
      <span className={mobileBottomNavLabelClassName(isActive)}>{label}</span>
    </>
  );
}

type MobileBottomNavLinkProps = MobileBottomNavItemContentProps & {
  href: string;
  className?: string;
};

export function MobileBottomNavLink({
  href,
  icon,
  label,
  isActive,
  badge,
  className,
}: MobileBottomNavLinkProps) {
  const ariaLabel = badge && badge.count > 0 ? `${label}, ${badge.label}` : label;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      aria-label={ariaLabel}
      className={cn(mobileBottomNavItemClassName(isActive), className)}
    >
      <MobileBottomNavItemContent
        icon={icon}
        label={label}
        isActive={isActive}
        badge={badge}
      />
    </Link>
  );
}

type MobileBottomNavMenuButtonProps = MobileBottomNavItemContentProps & {
  onClick: () => void;
  className?: string;
};

export function MobileBottomNavMenuButton({
  onClick,
  icon,
  label,
  isActive,
  badge,
  className,
}: MobileBottomNavMenuButtonProps) {
  const ariaLabel =
    badge && badge.count > 0 ? `Open menu, ${badge.label}` : "Open full navigation menu";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        mobileBottomNavItemClassName(isActive),
        "cursor-pointer border-0 bg-transparent",
        className,
      )}
    >
      <MobileBottomNavItemContent
        icon={icon}
        label={label}
        isActive={isActive}
        badge={badge}
      />
    </button>
  );
}
