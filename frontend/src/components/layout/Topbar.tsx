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
import { resolveBreadcrumbTrail } from "@/lib/navigation";
import { isImmersiveRoute } from "@/lib/shell-routes";
import {
  breadcrumbCurrentClassName,
  breadcrumbLinkClassName,
  breadcrumbNavClassName,
  breadcrumbParentClassName,
  breadcrumbSeparatorClassName,
  destructiveMenuItemClassName,
  profileAvatarButtonClassName,
  profileAvatarInitialClassName,
  profileMenuPanelClassName,
  text,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";
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

  const initial = user.name?.charAt(0)?.toUpperCase() || "U";
  const roleLabel = user.role.replace("_", " ");

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size={undefined}
        className={cn(profileAvatarButtonClassName(), "w-11 md:w-auto")}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className={cn(
            profileAvatarInitialClassName(),
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full md:bg-[var(--surface-inset)]",
          )}
        >
          {initial}
        </span>
        <span className="hidden md:flex flex-col items-start text-left min-w-0 max-w-[140px]">
          <span className={cn("text-sm font-semibold truncate w-full", text.primary)}>{user.name}</span>
          <span className={cn("text-xs capitalize truncate w-full", text.muted)}>{roleLabel}</span>
        </span>
      </Button>

      {open && (
        <div role="menu" aria-label="Account" className={profileMenuPanelClassName()}>
          <div className={cn("px-3 py-2 border-b mb-1 border-[var(--profile-menu-divider)]")}>
            <p className={cn("text-sm font-semibold truncate", text.primary)}>{user.name}</p>
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

export function Topbar() {
  const pathname = usePathname();
  const { toggle } = useMobileNav();
  const { isSuperAdmin, branches, activeBranchId, setActiveBranchId } = useBranchPickerInit();
  const trail = resolveBreadcrumbTrail(pathname);
  const immersive = isImmersiveRoute(pathname);

  return (
    <header className="h-14 lg:h-16 shrink-0 flex items-center justify-between gap-3 px-3 md:px-6 lg:px-8 bg-transparent mb-2 lg:mb-4 z-20 relative">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden shrink-0 h-11 w-11"
          onClick={toggle}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>

        <nav aria-label="Breadcrumb" className={breadcrumbNavClassName()}>
          <Link href="/" className={breadcrumbLinkClassName()}>
            QafaCafe
          </Link>
          {trail.map((item, index) => (
            <Fragment key={`${item.label}-${index}`}>
              <span className={breadcrumbSeparatorClassName()} aria-hidden="true">
                /
              </span>
              {item.href ? (
                <Link href={item.href} className={breadcrumbLinkClassName()}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    index === trail.length - 1
                      ? breadcrumbCurrentClassName()
                      : breadcrumbParentClassName()
                  }
                  aria-current={index === trail.length - 1 ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isSuperAdmin && branches.length > 0 && (
          <div className={cn(!immersive && "lg:hidden")}>
            <BranchPicker
              variant="topbar"
              branches={branches}
              activeBranchId={activeBranchId}
              onChange={setActiveBranchId}
            />
          </div>
        )}
        <ClockInOutWidget />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
