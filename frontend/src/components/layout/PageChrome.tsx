"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { BranchScopeIndicator } from "@/components/shared/branch-scope-indicator";
import { useAuth } from "@/context/AuthContext";
import { getPageChromeTitleVisibility } from "@/lib/navigation/topbar-chrome";
import { pageChromeStickyBarClassName, shellPageTitleClassName } from "@/lib/theme/shell";
import { text } from "@/lib/theme/surface";
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
  const ctx = use(PageChromeContext);
  const pathname = usePathname();

  useEffect(() => {
    if (!ctx) return;
    ctx.register(extension);
    return () => ctx.clear();
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
  return use(PageChromeContext);
}

type PageChromeProps = {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
  actions?: ReactNode;
  branchScope?: PageChromeBranchScope;
  children: ReactNode;
  className?: string;
};

/** Unified shell page header — h1, optional scope, description, then content. */
export function PageChrome({
  title,
  icon: Icon,
  iconClassName,
  description,
  actions,
  branchScope,
  children,
  className,
}: PageChromeProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role ?? "STAFF";
  const { hideOnDesktop, hideOnMobile } = getPageChromeTitleVisibility(pathname, role);
  const extension = use(PageChromeExtensionContext);

  const mergedDescription = extension.description ?? description;
  const mergedActions = extension.actions ?? actions;
  const mergedScope = extension.branchScope ?? branchScope;
  const sectionTitle =
    extension.hideTitle || !extension.title ? undefined : extension.title;
  const SectionIcon = extension.icon;

  const hasStickyBar = Boolean(mergedScope || mergedActions);

  return (
    <div className={cn("w-full space-y-section lg:space-y-page flex flex-col", className)}>
      <div className={cn("space-y-field", (hideOnDesktop || hideOnMobile) && "max-lg:space-y-field")}>
        <h1
          className={cn(
            shellPageTitleClassName(),
            "min-w-0",
            hideOnDesktop && "lg:sr-only",
            hideOnMobile && "max-lg:sr-only",
          )}
        >
            <Icon className={cn("w-6 h-6 shrink-0", iconClassName)} aria-hidden />
            <span className="truncate">{title}</span>
        </h1>

        {mergedDescription && (
          <p className={cn("text-sm", text.muted)}>{mergedDescription}</p>
        )}

        {hasStickyBar && (
          <div
            className={cn(
              pageChromeStickyBarClassName(),
              mergedScope ? "justify-between" : "justify-end",
            )}
          >
            {mergedScope && (
              <BranchScopeIndicator
                branchName={mergedScope.branchName}
                allBranches={mergedScope.allBranches}
                className="mr-auto"
              />
            )}
            {mergedActions && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {mergedActions}
              </div>
            )}
          </div>
        )}

        {sectionTitle && (
          <h2 className={typeHeadingClassName("text-lg flex items-center gap-2 pt-2")}>
            {SectionIcon && <SectionIcon className="w-5 h-5 shrink-0" aria-hidden />}
            {sectionTitle}
          </h2>
        )}
      </div>

      <div className="min-h-0 flex flex-col">{children}</div>
    </div>
  );
}
