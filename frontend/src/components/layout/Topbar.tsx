"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
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
  shouldShowDesktopBreadcrumb,
  shouldShowHubSubNav,
  shouldShowMobileBreadcrumb,
  type BreadcrumbItem,
} from "@/lib/navigation";
import { isShellHubPage } from "@/lib/shell-routes";
import { breadcrumbCurrentClassName, breadcrumbLinkClassName, breadcrumbNavClassName, breadcrumbParentClassName, breadcrumbSeparatorClassName, destructiveMenuItemClassName, profileMenuPanelClassName, shellContentFrameClassName, topbarActionButtonClassName, topbarActionsRowClassName, topbarActionsDividerClassName, topbarDesktopBreadcrumbClassName, topbarMenuButtonClassName, topbarRegionClassName, topbarShellClassName, profileMenuHeaderDividerClassName } from "@/lib/theme/shell";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const viewportPadding = 8;
    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding,
    );
    setMenuPosition({
      top: rect.bottom + 8,
      left,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  if (!user) return null;

  const roleLabel = user.role.replace("_", " ");

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Account"
            className={profileMenuPanelClassName("fixed")}
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <div className={profileMenuHeaderDividerClassName()}>
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className={topbarActionButtonClassName({ active: open })}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu — ${user.name}, ${roleLabel}`}
        title="Account"
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) updateMenuPosition();
            return next;
          });
        }}
      >
        <User className="h-4 w-4" aria-hidden />
      </button>
      {menu}
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
  const showDesktopBreadcrumb = shouldShowDesktopBreadcrumb(pathname, role, trail);

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
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>

          {showMobileBreadcrumb && (
            <BreadcrumbTrail
              items={trail}
              className={cn(breadcrumbNavClassName(), "lg:hidden min-w-0")}
            />
          )}

          {showDesktopBreadcrumb && (
            <BreadcrumbTrail items={trail} className={topbarDesktopBreadcrumbClassName()} />
          )}
        </div>

        {/* Action group stays rightmost; branch picker floats left so it never pushes the group. */}
        <div className="relative shrink-0 ml-auto flex items-center">
          {isSuperAdmin && branches.length > 0 && (
            <div
              className={cn(
                "absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center max-w-[min(240px,40vw)]",
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
