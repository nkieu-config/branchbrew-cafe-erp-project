"use client";

import { usePathname } from "next/navigation";
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
import { useSidebarNavBadges } from "@/hooks/useSidebarNavBadges";
import {
  getMobileBottomNavItems,
  isMobileBottomNavActive,
} from "@/lib/navigation";
import { resolveMobileBottomNavBadge } from "@/lib/sidebar-badges";
import {
  kdsImmersiveHeaderClassName,
  kdsImmersiveHeaderMetaClassName,
  kdsImmersiveHeaderRowClassName,
} from "@/lib/theme/immersive";
import { shellPageTitleClassName } from "@/lib/theme/shell";
import { cn } from "@/lib/utils";
import type { Branch, Role } from "@/types/api";

export function KdsImmersiveHeader() {
  const { activeBranchId } = useAuth();
  const { data: branches = [] } = useBranches();
  const branchName =
    activeBranchId != null
      ? (branches as Branch[]).find((b) => b.id === activeBranchId)?.name
      : undefined;

  return (
    <header className={kdsImmersiveHeaderClassName()}>
      <div className={kdsImmersiveHeaderRowClassName()}>
        <h1 className={cn(shellPageTitleClassName("text-lg sm:text-xl lg:text-2xl"), "min-w-0")}>
          Kitchen Display
        </h1>
        <div className={kdsImmersiveHeaderMetaClassName()}>
          <BranchScopeIndicator
            branchName={branchName}
            allBranches={activeBranchId == null}
          />
        </div>
      </div>

      <ImmersiveBranchToolbar className="max-w-md" />
    </header>
  );
}

export function KdsImmersiveNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggle } = useMobileNav();
  const { badges } = useSidebarNavBadges();
  const role = (user?.role ?? "STAFF") as Role;
  const items = getMobileBottomNavItems(role);

  return (
    <MobileBottomNavShell ariaLabel="Quick navigation">
      {items.map((item) => {
        const isActive = isMobileBottomNavActive(item, pathname);
        const badge = resolveMobileBottomNavBadge(item.id, badges);

        if (item.action === "menu") {
          return (
            <MobileBottomNavMenuButton
              key={item.id}
              onClick={toggle}
              icon={item.icon}
              label={item.label}
              isActive={false}
              badge={badge}
            />
          );
        }

        return (
          <MobileBottomNavLink
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActive}
            badge={badge}
          />
        );
      })}
    </MobileBottomNavShell>
  );
}
