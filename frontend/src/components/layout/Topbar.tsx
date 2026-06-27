"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, MapPin, Menu, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import {
  getStoredBranchSelection,
  resolveDefaultBranchId,
} from "@/lib/branch-storage";
import { resolveBreadcrumbTrail } from "@/lib/navigation";
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
  selectFocusClassName,
  text,
  topbarBranchIconClassName,
  topbarBranchPickerClassName,
} from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/api";

function BranchPicker({
  branches,
  activeBranchId,
  onChange,
}: {
  branches: Branch[];
  activeBranchId: number | null;
  onChange: (branchId: number | null) => void;
}) {
  const value = activeBranchId == null ? "all" : String(activeBranchId);

  return (
    <div className={topbarBranchPickerClassName()}>
      <MapPin className={topbarBranchIconClassName()} aria-hidden="true" />
      <Select
        value={value}
        onValueChange={(next) => {
          if (next == null) return;
          onChange(next === "all" ? null : Number(next));
        }}
      >
        <SelectTrigger
          aria-label="Select branch"
          className={selectFocusClassName(
            "h-9 min-h-[36px] border-0 bg-transparent shadow-none max-w-[140px] sm:max-w-[220px]",
          )}
        >
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="all">All Branches (HQ)</SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={String(branch.id)}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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
        size="icon"
        className={profileAvatarButtonClassName()}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={profileAvatarInitialClassName()}>{initial}</span>
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
  const { user, activeBranchId, setActiveBranchId, isInitialized } = useAuth();
  const { toggle } = useMobileNav();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const { data: branchesData = [] } = useBranches(isSuperAdmin);
  const branches = branchesData as Branch[];
  const hasAppliedBranchPref = useRef(false);

  const trail = resolveBreadcrumbTrail(pathname);

  useEffect(() => {
    if (!isSuperAdmin || !isInitialized || branches.length === 0) return;
    if (hasAppliedBranchPref.current) return;
    hasAppliedBranchPref.current = true;

    const selection = getStoredBranchSelection();
    if (selection === "unset") {
      const defaultId = resolveDefaultBranchId(branches);
      if (defaultId != null) setActiveBranchId(defaultId);
      return;
    }

    if (selection === null) {
      setActiveBranchId(null);
      return;
    }

    if (branches.some((b) => b.id === selection)) {
      setActiveBranchId(selection);
    } else {
      const defaultId = resolveDefaultBranchId(branches);
      if (defaultId != null) setActiveBranchId(defaultId);
    }
  }, [isSuperAdmin, isInitialized, branches, setActiveBranchId]);

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
          <BranchPicker
            branches={branches}
            activeBranchId={activeBranchId}
            onChange={setActiveBranchId}
          />
        )}
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
