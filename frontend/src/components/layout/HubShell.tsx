"use client";

import { usePathname } from "next/navigation";
import { AntdProvider } from "@/providers/AntdProvider";
import { PageChrome, PageChromeProvider } from "@/components/layout/PageChrome";
import {
  getHubConfig,
  resolveActiveHubTab,
  resolveHubShellTitle,
} from "@/lib/navigation/hub-utils";
import type { HubId } from "@/lib/navigation/types";
import { hubAccentIconClass } from "@/lib/theme/hub-accent";

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
  const hub = getHubConfig(hubId);
  const shouldWrapAntd = wrapAntd ?? hub.wrapAntd ?? false;
  const activeTab = resolveActiveHubTab(pathname, hub);
  const pageTitle = resolveHubShellTitle(pathname, hub);
  const HeaderIcon = activeTab?.icon ?? hub.icon;

  const content = (
    <PageChromeProvider>
      <div className="flex h-full w-full flex-col">
        <PageChrome
          title={pageTitle}
          icon={HeaderIcon}
          iconClassName={hubAccentIconClass(hubId)}
        >
          <div className={contentClassName}>{children}</div>
        </PageChrome>
      </div>
    </PageChromeProvider>
  );

  if (shouldWrapAntd) {
    return <AntdProvider>{content}</AntdProvider>;
  }

  return content;
}
