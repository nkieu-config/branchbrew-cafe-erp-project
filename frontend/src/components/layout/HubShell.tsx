"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { AnimatedPage } from "@/components/animated-page";
import { AntdScope } from "@/components/providers/AntdScope";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { isImmersiveRoute } from "@/lib/shell-routes";
import {
  getHubConfig,
  getVisibleHubTabs,
  isTabActive,
  shouldShowHubSubNav,
  type HubId,
} from "@/lib/navigation";
import {
  hubAccentIconClass,
  hubTabClassName,
  hubTabTrackClassName,
  text,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

type HubShellProps = {
  hubId: HubId;
  children: React.ReactNode;
  wrapAntd?: boolean;
  contentClassName?: string;
};

export function HubShell({
  hubId,
  children,
  wrapAntd,
  contentClassName = "relative flex-1 min-h-0 w-full overflow-y-auto pb-10",
}: HubShellProps) {
  const pathname = usePathname();
  const tabsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { user } = useAuth();
  const { open: mobileNavOpen } = useMobileNav();
  const hub = getHubConfig(hubId);
  const role = user?.role ?? "";
  const tabs = getVisibleHubTabs(hubId, role);
  const shouldWrapAntd = wrapAntd ?? hub.wrapAntd ?? true;
  const HubIcon = hub.icon;
  const immersive = isImmersiveRoute(pathname);
  /** Desktop sidebar tree covers hub tabs; keep tabs on mobile unless the nav drawer is open. */
  const showHubTabs =
    shouldShowHubSubNav(tabs, hub.basePath) && !mobileNavOpen;
  const hubTabsClassName = cn("relative shrink-0 w-fit max-w-full", !immersive && "lg:hidden");

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeTab = container.querySelector<HTMLElement>('[data-active="true"]');
    activeTab?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [pathname, tabs.length, prefersReducedMotion]);

  const content = (
    <AnimatedPage className="max-w-[1600px] w-full mx-auto space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className={cn("text-xl sm:text-2xl font-bold text-balance flex items-center gap-2", text.primary)}>
            <HubIcon className={hubAccentIconClass(hubId)} aria-hidden />
            {hub.label}
          </h1>
          <p className={cn("text-sm mt-1", text.muted)}>{hub.description}</p>
        </div>
      </div>

      {showHubTabs && (
        <nav
          aria-label={`${hub.label} sections`}
          className={hubTabsClassName}
        >
          <div
            ref={tabsRef}
            className={hubTabTrackClassName()}
          >
            {tabs.map((tab) => {
              const isActive = isTabActive(pathname, tab.path, hub.basePath);
              const TabIcon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive ? "true" : undefined}
                  className={hubTabClassName(isActive)}
                >
                  <TabIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--hub-fade-from)] to-transparent lg:hidden motion-reduce:opacity-0"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[var(--hub-fade-from)] to-transparent lg:hidden motion-reduce:opacity-0"
            aria-hidden="true"
          />
        </nav>
      )}

      <div className={contentClassName}>{children}</div>
    </AnimatedPage>
  );

  if (shouldWrapAntd) {
    return <AntdScope>{content}</AntdScope>;
  }

  return content;
}
