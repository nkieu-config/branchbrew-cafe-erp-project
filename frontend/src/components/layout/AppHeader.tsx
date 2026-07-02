"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/providers/ThemeToggle";
import { ClockInOutWidget } from "@/components/hr/ClockInOutWidget";
import { BranchPicker } from "@/components/shared/branch-picker";
import { BreadcrumbTrail } from "@/components/layout/BreadcrumbTrail";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { useScrollCompact } from "@/context/ScrollCompactContext";
import { useBranchPickerInit } from "@/hooks/useBranchPickerInit";
import {
  getPageChromeTitleVisibility,
  resolveTopbarPageTitle,
} from "@/lib/navigation/topbar-chrome";
import { resolveBreadcrumbTrail } from "@/lib/navigation/breadcrumb";
import {
  shouldShowDesktopBreadcrumb,
  shouldShowMobileBreadcrumb,
} from "@/lib/navigation/mobile-nav";
import {
  destructiveMenuItemClassName,
  profileMenuHeaderDividerClassName,
  profileMenuPanelClassName,
  topbarAccountActionsClassName,
  topbarActionButtonClassName,
  topbarActionsDividerClassName,
  topbarActionsRowClassName,
  topbarBranchRowClassName,
  topbarContentFrameClassName,
  topbarDesktopBreadcrumbClassName,
  topbarMainRowClassName,
  topbarMenuButtonClassName,
  topbarMobileTitleClassName,
  topbarRegionClassName,
  topbarShellClassName,
} from "@/lib/theme/shell";
import { text } from "@/lib/theme/surface";
import { typeUiLabelClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/api";

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
    const next = { top: rect.bottom + 8, left };
    setMenuPosition((prev) => {
      if (prev && prev.top === next.top && prev.left === next.left) return prev;
      return next;
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

    let rafId: number | null = null;
    const scheduleReposition = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateMenuPosition();
      });
    };

    const handleScroll = () => setOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", scheduleReposition);
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", scheduleReposition);
      window.removeEventListener("scroll", handleScroll, true);
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
              <p className={cn("text-xs capitalize", text.muted)}>{roleLabel}</p>
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

type TopbarActionsProps = {
  showBranchPicker: boolean;
  branches: Branch[];
  activeBranchId: number | null;
  onBranchChange: (branchId: number | null) => void;
};

/** Shared action cluster — branch inline on desktop; full-width row below on mobile. */
function TopbarActions({
  showBranchPicker,
  branches,
  activeBranchId,
  onBranchChange,
}: TopbarActionsProps) {
  return (
    <div className={topbarActionsRowClassName()}>
      {showBranchPicker && (
        <BranchPicker
          variant="topbar"
          branches={branches}
          activeBranchId={activeBranchId}
          onChange={onBranchChange}
          className="hidden lg:flex lg:w-[12.5rem] lg:flex-none"
        />
      )}
      <ClockInOutWidget variant="toolbar" />
      <div className={topbarActionsDividerClassName()} aria-hidden />
      <div className={topbarAccountActionsClassName()}>
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </div>
  );
}

type AppHeaderProps = {
  className?: string;
};

/** Global application header — navigation context, branch scope, and account controls. */
export function AppHeader({ className }: AppHeaderProps) {
  const pathname = usePathname();
  const compact = useScrollCompact();
  const { toggle, open: mobileNavOpen } = useMobileNav();
  const { user } = useAuth();
  const { isSuperAdmin, branches, activeBranchId, setActiveBranchId } = useBranchPickerInit();
  const trail = resolveBreadcrumbTrail(pathname);
  const role = user?.role ?? "STAFF";
  const { showMobileTopbarTitle } = getPageChromeTitleVisibility(pathname, role, trail);
  const showMobileBreadcrumb = shouldShowMobileBreadcrumb(pathname, role);
  const showDesktopBreadcrumb = shouldShowDesktopBreadcrumb(pathname, role, trail) && !compact;
  const mobileTopbarTitle = resolveTopbarPageTitle(pathname);
  const showBranchPicker = isSuperAdmin && branches.length > 0;

  return (
    <div className={topbarRegionClassName({ compact, className })}>
      <header
        className={topbarShellClassName({
          stacked: showBranchPicker,
          className: topbarContentFrameClassName(),
        })}
      >
        <div className={topbarMainRowClassName({ compact })}>
          <button
            type="button"
            className={topbarMenuButtonClassName()}
            onClick={toggle}
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>

          <div className="flex min-w-0 flex-1 items-center overflow-hidden">
            {showMobileTopbarTitle && (
              <p className={topbarMobileTitleClassName()}>{mobileTopbarTitle}</p>
            )}

            {showMobileBreadcrumb && (
              <BreadcrumbTrail
                items={trail}
                variant="mobile-topbar"
                className="min-w-0 flex-1 overflow-hidden lg:hidden"
              />
            )}

            {showDesktopBreadcrumb && (
              <BreadcrumbTrail items={trail} className={topbarDesktopBreadcrumbClassName()} />
            )}
          </div>

          <TopbarActions
            showBranchPicker={showBranchPicker}
            branches={branches}
            activeBranchId={activeBranchId}
            onBranchChange={setActiveBranchId}
          />
        </div>

        {showBranchPicker && (
          <div className={topbarBranchRowClassName()}>
            <BranchPicker
              variant="topbar"
              branches={branches}
              activeBranchId={activeBranchId}
              onChange={setActiveBranchId}
              className="w-full max-w-none h-9 min-h-[36px]"
            />
          </div>
        )}
      </header>
    </div>
  );
}
