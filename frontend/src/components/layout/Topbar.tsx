"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClockInOutWidget } from "@/components/hr/ClockInOutWidget";
import { BranchPicker } from "@/components/shared/branch-picker";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { useBranchPickerInit } from "@/hooks/useBranchPickerInit";
import {
  findHubByPathname,
  getVisibleHubTabs,
  resolveBreadcrumbTrail,
  shouldShowHubSubNav,
  shouldShowMobileBreadcrumb,
  type BreadcrumbItem,
} from "@/lib/navigation";
import { isImmersiveRoute, isShellHubPage } from "@/lib/shell-routes";
import {
  breadcrumbCurrentClassName,
  breadcrumbLinkClassName,
  breadcrumbNavClassName,
  breadcrumbParentClassName,
  breadcrumbSeparatorClassName,
  destructiveMenuItemClassName,
  profileMenuPanelClassName,
  shellContentFrameClassName,
  text,
  topbarActionButtonClassName,
  topbarActionsRowClassName,
  topbarActionsDividerClassName,
  topbarMenuButtonClassName,
  topbarRegionClassName,
  topbarShellClassName,
  typeUiLabelClassName,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) return null;

  const roleLabel = user.role.replace("_", " ");

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className={cn(topbarActionButtonClassName(), open && "bg-[var(--topbar-action-hover)]")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu — ${user.name}, ${roleLabel}`}
        title="Account"
        onClick={() => setOpen((prev) => !prev)}
      >
        <User className="h-4 w-4" aria-hidden />
      </button>

      {open && (
        <div role="menu" aria-label="Account" className={profileMenuPanelClassName()}>
          <div className={cn("px-3 py-2 border-b mb-1 border-[var(--profile-menu-divider)]")}>
            <p className={cn(typeUiLabelClassName("text-sm truncate"), text.primary)}>{user.name}</p>
            <p className={cn("text-xs capitalize flex items-center gap-1", text.muted)}>
              <User className="w-3 h-3" aria-hidden />
              {roleLabel}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            className={destructiveMenuItemClassName()}
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut className="w-4 h-4" aria-hidden />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function BreadcrumbTrail({
  items,
  className,
  separatorClassName,
}: {
  items: BreadcrumbItem[];
  className?: string;
  separatorClassName?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index > 0 && (
            <span className={separatorClassName ?? breadcrumbSeparatorClassName()} aria-hidden="true">
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className={breadcrumbLinkClassName()}>
              {item.label}
            </Link>
          ) : (
            <span
              className={
                index === items.length - 1
                  ? breadcrumbCurrentClassName()
                  : breadcrumbParentClassName()
              }
              aria-current={index === items.length - 1 ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { toggle, open: mobileNavOpen } = useMobileNav();
  const { user } = useAuth();
  const { isSuperAdmin, branches, activeBranchId, setActiveBranchId } = useBranchPickerInit();
  const trail = resolveBreadcrumbTrail(pathname);
  const immersive = isImmersiveRoute(pathname);
  const role = user?.role ?? "STAFF";
  const hub = findHubByPathname(pathname);
  const hubTabs = hub && role ? getVisibleHubTabs(hub.id, role) : [];
  const hubTabsVisible =
    isShellHubPage(pathname) &&
    shouldShowHubSubNav(hubTabs, hub?.basePath ?? "") &&
    !mobileNavOpen;
  const showMobileBreadcrumb = shouldShowMobileBreadcrumb(pathname, role, {
    hubTabsVisible,
  });

  return (
    <div className={topbarRegionClassName()}>
      <header
        className={topbarShellClassName(
          {},
          shellContentFrameClassName("justify-between"),
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            className={topbarMenuButtonClassName()}
            onClick={toggle}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>

          {showMobileBreadcrumb && (
            <BreadcrumbTrail
              items={trail}
              className={cn(breadcrumbNavClassName(), "lg:hidden min-w-0")}
            />
          )}
        </div>

        {/* Action group stays rightmost; branch picker floats left so it never pushes the group. */}
        <div className="relative shrink-0 ml-auto flex items-center">
          {isSuperAdmin && branches.length > 0 && (
            <div
              className={cn(
                "absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center max-w-[min(220px,40vw)]",
                !immersive && "lg:hidden",
              )}
            >
              <BranchPicker
                variant="topbar"
                branches={branches}
                activeBranchId={activeBranchId}
                onChange={setActiveBranchId}
              />
            </div>
          )}

          <div className={topbarActionsRowClassName()}>
            <ClockInOutWidget variant="toolbar" />

            <div className={topbarActionsDividerClassName()} aria-hidden />

            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </header>
    </div>
  );
}
