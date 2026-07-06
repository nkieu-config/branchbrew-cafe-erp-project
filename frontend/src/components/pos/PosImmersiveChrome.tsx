"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  MobileBottomNavLink,
  MobileBottomNavMenuButton,
  MobileBottomNavShell,
} from "@/components/layout/MobileBottomNavPrimitives";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { getVisibleHubTabs, isTabActive, shouldShowHubSubNav } from "@/lib/navigation";
import { posImmersiveHeaderClassName } from "@/lib/theme/immersive";
import { hubTabClassName, hubTabTrackClassName } from "@/lib/theme/surface";
import { cn } from "@/lib/utils";

function PosImmersiveDesktopTabs() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "STAFF";
  const tabs = getVisibleHubTabs("pos", role);

  if (!shouldShowHubSubNav(tabs, "/pos")) {
    return null;
  }

  return (
    <nav aria-label="POS sections">
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
  return (
    <header className={cn(posImmersiveHeaderClassName(), "hidden lg:block")}>
      <PosImmersiveDesktopTabs />
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
