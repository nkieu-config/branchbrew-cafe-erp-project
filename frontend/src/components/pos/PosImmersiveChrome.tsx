"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BranchScopeIndicator } from "@/components/shared/branch-scope-indicator";
import { ImmersiveBranchToolbar } from "@/components/shared/immersive-branch-toolbar";
import {
  MobileBottomNavLink,
  MobileBottomNavMenuButton,
  MobileBottomNavShell,
} from "@/components/layout/mobile-bottom-nav-primitives";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { useBranches } from "@/hooks/domains/useGeneralQueries";
import { getVisibleHubTabs, isTabActive, shouldShowHubSubNav } from "@/lib/navigation";
import {
  kdsImmersiveHeaderMetaClassName,
  kdsImmersiveHeaderRowClassName,
  posImmersiveHeaderClassName,
} from "@/lib/theme/immersive";
import { hubTabClassName, hubTabTrackClassName, text } from "@/lib/theme/surface";
import { shellPageTitleClassName } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/api";

function resolvePosPageTitle(pathname: string) {
  if (pathname === "/pos/terminal" || pathname.startsWith("/pos/terminal/")) {
    return "Terminal";
  }
  return "Point of Sale";
}

function PosImmersiveDesktopTabs() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "STAFF";
  const tabs = getVisibleHubTabs("pos", role);

  if (!shouldShowHubSubNav(tabs, "/pos")) {
    return null;
  }

  return (
    <nav aria-label="POS sections" className="hidden lg:block">
      <div className={hubTabTrackClassName()}>
        {tabs.map((tab) => {
          const isActive = isTabActive(pathname, tab.path, "/pos");
          const TabIcon = tab.icon;
          return (
            <Link
              key={tab.path}
              href={tab.path}
              aria-current={isActive ? "page" : undefined}
              className={hubTabClassName(isActive)}
            >
              <TabIcon className="h-4 w-4 shrink-0" aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PosImmersiveHeader() {
  const pathname = usePathname();
  const { activeBranchId } = useAuth();
  const { data: branches = [] } = useBranches();
  const branchName =
    activeBranchId != null
      ? (branches as Branch[]).find((b) => b.id === activeBranchId)?.name
      : undefined;

  return (
    <header className={posImmersiveHeaderClassName()}>
      <div className={kdsImmersiveHeaderRowClassName()}>
        <h1 className={cn(shellPageTitleClassName("text-lg sm:text-xl lg:text-2xl"), "min-w-0")}>
          {resolvePosPageTitle(pathname)}
        </h1>
        <div className={kdsImmersiveHeaderMetaClassName()}>
          <BranchScopeIndicator
            branchName={branchName}
            allBranches={activeBranchId == null}
          />
        </div>
      </div>

      <PosImmersiveDesktopTabs />
      <ImmersiveBranchToolbar className="max-w-md" />

      <p className={cn("hidden text-sm lg:block", text.muted)}>
        Process sales for the selected branch.
      </p>
    </header>
  );
}

export function PosImmersiveNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggle } = useMobileNav();
  const role = user?.role ?? "STAFF";
  const tabs = getVisibleHubTabs("pos", role);

  return (
    <MobileBottomNavShell ariaLabel="POS navigation">
      {tabs.map((tab) => (
        <MobileBottomNavLink
          key={tab.path}
          href={tab.path}
          icon={tab.icon}
          label={tab.label}
          isActive={isTabActive(pathname, tab.path, "/pos")}
        />
      ))}
      <MobileBottomNavMenuButton
        onClick={toggle}
        icon={Menu}
        label="Menu"
        isActive={false}
      />
    </MobileBottomNavShell>
  );
}
