"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  mobileBottomNavBarClassName,
  mobileBottomNavClassName,
  mobileBottomNavIconClassName,
  mobileBottomNavIconWrapClassName,
  mobileBottomNavItemClassName,
  mobileBottomNavLabelClassName,
} from "@/lib/theme/shell";
import { cn } from "@/lib/utils";

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
};

function MobileBottomNavItemContent({ icon: Icon, label, isActive }: MobileBottomNavItemContentProps) {
  return (
    <>
      <span className={mobileBottomNavIconWrapClassName(isActive)}>
        <Icon className={mobileBottomNavIconClassName(isActive)} aria-hidden />
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
  className,
}: MobileBottomNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      className={cn(mobileBottomNavItemClassName(isActive), className)}
    >
      <MobileBottomNavItemContent icon={icon} label={label} isActive={isActive} />
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
  className,
}: MobileBottomNavMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open full navigation menu"
      className={cn(
        mobileBottomNavItemClassName(isActive),
        "cursor-pointer border-0 bg-transparent",
        className,
      )}
    >
      <MobileBottomNavItemContent icon={icon} label={label} isActive={isActive} />
    </button>
  );
}
