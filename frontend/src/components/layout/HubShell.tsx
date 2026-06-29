"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedPage } from "@/components/layout/animated-page";
import { AntdScope } from "@/components/providers/AntdScope";
import {
  HubTabsNav,
  PageChrome,
  PageChromeProvider,
} from "@/components/layout/PageChrome";
import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { isImmersiveRoute } from "@/lib/shell-routes";
import {
  getHubConfig,
  getVisibleHubTabs,
  resolveActiveHubTab,
  resolveHubShellTitle,
  shouldShowHubSubNav,
  type HubId,
} from "@/lib/navigation";
import { hubAccentIconClass } from "@/lib/theme/hub-accent";
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
  const { user } = useAuth();
  const { open: mobileNavOpen } = useMobileNav();
  const hub = getHubConfig(hubId);
  const role = user?.role ?? "";
  const tabs = getVisibleHubTabs(hubId, role);
  const shouldWrapAntd = wrapAntd ?? hub.wrapAntd ?? true;
  const activeTab = resolveActiveHubTab(pathname, hub);
  const pageTitle = resolveHubShellTitle(pathname, hub);
  const HeaderIcon = activeTab?.icon ?? hub.icon;
  const immersive = isImmersiveRoute(pathname);
  const showHubTabs =
    shouldShowHubSubNav(tabs, hub.basePath) && !mobileNavOpen;
  const hubTabsClassName = cn(!immersive && "lg:hidden");

  const content = (
    <PageChromeProvider>
      <AnimatedPage className="w-full h-full flex flex-col">
        <PageChrome
          title={pageTitle}
          icon={HeaderIcon}
          iconClassName={hubAccentIconClass(hubId)}
          tabs={
            showHubTabs ? (
              <HubTabsNav
                hubLabel={hub.label}
                tabs={tabs}
                basePath={hub.basePath}
                pathname={pathname}
                className={hubTabsClassName}
              />
            ) : undefined
          }
        >
          <div className={contentClassName}>{children}</div>
        </PageChrome>
      </AnimatedPage>
    </PageChromeProvider>
  );

  if (shouldWrapAntd) {
    return <AntdScope>{content}</AntdScope>;
  }

  return content;
}
