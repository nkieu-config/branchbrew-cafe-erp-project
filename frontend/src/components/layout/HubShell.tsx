"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatedPage } from "@/components/animated-page";
import { AntdScope } from "@/components/providers/AntdScope";
import { useAuth } from "@/context/AuthContext";
import {
  getHubConfig,
  getVisibleHubTabs,
  isTabActive,
  type HubId,
} from "@/lib/navigation";

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
  const hub = getHubConfig(hubId);
  const role = user?.role ?? "";
  const tabs = getVisibleHubTabs(hubId, role);
  const shouldWrapAntd = wrapAntd ?? hub.wrapAntd ?? true;
  const HubIcon = hub.icon;

  const content = (
    <AnimatedPage className="max-w-[1600px] w-full mx-auto space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-balance flex items-center gap-2">
            <HubIcon className={hub.iconClassName} />
            {hub.label}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{hub.description}</p>
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const isActive = isTabActive(pathname, tab.path, hub.basePath);
            const TabIcon = tab.icon;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      <div className={contentClassName}>{children}</div>
    </AnimatedPage>
  );

  if (shouldWrapAntd) {
    return <AntdScope>{content}</AntdScope>;
  }

  return content;
}
