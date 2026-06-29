"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { BranchScopeIndicator } from "@/components/shared/branch-scope-indicator";
import { isTabActive } from "@/lib/navigation";
import { shellPageTitleClassName } from "@/lib/theme/shell";
import { hubTabClassName, hubTabTrackClassName, hubTabScrollFadeRightClassName, hubTabScrollFadeLeftClassName, text } from "@/lib/theme/surface";
import { typeHeadingClassName } from "@/lib/theme/typography";
import { cn } from "@/lib/utils";

export type PageChromeBranchScope = {
  branchName?: string | null;
  allBranches?: boolean;
};

export type PageChromeExtension = {
  /** Optional h2 under the shell h1 (page-specific section title). */
  title?: string;
  icon?: LucideIcon;
  hideTitle?: boolean;
  description?: string;
  actions?: ReactNode;
  branchScope?: PageChromeBranchScope;
};

type PageChromeContextValue = {
  register: (extension: PageChromeExtension) => void;
  clear: () => void;
};

const PageChromeContext = createContext<PageChromeContextValue | null>(null);

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [extension, setExtension] = useState<PageChromeExtension>({});

  const register = useCallback((next: PageChromeExtension) => {
    setExtension(next);
  }, []);

  const clear = useCallback(() => {
    setExtension({});
  }, []);

  const value = useMemo(() => ({ register, clear }), [register, clear]);

  return (
    <PageChromeContext.Provider value={value}>
      <PageChromeExtensionContext.Provider value={extension}>
        {children}
      </PageChromeExtensionContext.Provider>
    </PageChromeContext.Provider>
  );
}

const PageChromeExtensionContext = createContext<PageChromeExtension>({});

/** Register page-level chrome (description, actions, branch scope) from hub child pages. */
export function usePageChromeExtension(extension: PageChromeExtension) {
  const ctx = useContext(PageChromeContext);
  const pathname = usePathname();

  useEffect(() => {
    if (!ctx) return;
    ctx.register(extension);
    return () => ctx.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on route change
  }, [
    ctx,
    pathname,
    extension.title,
    extension.hideTitle,
    extension.description,
    extension.actions,
    extension.branchScope?.branchName,
    extension.branchScope?.allBranches,
  ]);
}

export function usePageChromeContext() {
  return useContext(PageChromeContext);
}

type PageChromeProps = {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  actions?: ReactNode;
  branchScope?: PageChromeBranchScope;
  tabs?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Unified shell page header — h1, optional scope, description, hub tabs, then content. */
export function PageChrome({
  title,
  icon: Icon,
  iconClassName,
  description,
  actions,
  branchScope,
  tabs,
  children,
  className,
}: PageChromeProps) {
  const extension = useContext(PageChromeExtensionContext);

  const mergedDescription = extension.description ?? description;
  const mergedActions = extension.actions ?? actions;
  const mergedScope = extension.branchScope ?? branchScope;
  const sectionTitle =
    extension.hideTitle || !extension.title ? undefined : extension.title;
  const SectionIcon = extension.icon;

  const actionSlot =
    mergedScope || mergedActions ? (
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {mergedScope && (
          <BranchScopeIndicator
            branchName={mergedScope.branchName}
            allBranches={mergedScope.allBranches}
          />
        )}
        {mergedActions}
      </div>
    ) : null;

  return (
    <div className={cn("w-full space-y-4 lg:space-y-5 h-full flex flex-col", className)}>
      <div className="space-y-1">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h1 className={shellPageTitleClassName()}>
            <Icon className={cn("w-6 h-6 shrink-0", iconClassName)} aria-hidden />
            <span className="truncate">{title}</span>
          </h1>
          {actionSlot}
        </div>
        {mergedDescription && (
          <p className={cn("text-sm", text.muted)}>{mergedDescription}</p>
        )}
        {sectionTitle && (
          <h2 className={typeHeadingClassName("text-lg flex items-center gap-2 pt-2")}>
            {SectionIcon && <SectionIcon className="w-5 h-5 shrink-0" aria-hidden />}
            {sectionTitle}
          </h2>
        )}
      </div>

      {tabs}

      <div className="min-h-0 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

type HubTabsNavProps = {
  hubLabel: string;
  tabs: Array<{ path: string; label: string; icon: LucideIcon }>;
  basePath: string;
  pathname: string;
  className?: string;
};

export function HubTabsNav({
  hubLabel,
  tabs,
  basePath,
  pathname,
  className,
}: HubTabsNavProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

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

  return (
    <nav aria-label={`${hubLabel} sections`} className={cn("relative shrink-0 w-fit max-w-full", className)}>
      <div ref={tabsRef} className={hubTabTrackClassName()}>
        {tabs.map((tab) => {
          const isActive = isTabActive(pathname, tab.path, basePath);
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
      <div className={hubTabScrollFadeRightClassName()} aria-hidden="true" />
      <div className={hubTabScrollFadeLeftClassName()} aria-hidden="true" />
    </nav>
  );
}
