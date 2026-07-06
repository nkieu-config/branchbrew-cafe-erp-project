import { resolveBreadcrumbTrail } from "./breadcrumb";
import { findHubByPathname, resolveHubShellTitle } from "./hub-utils";
import {
  isMobileBottomNavPathCovered,
  shouldShowDesktopBreadcrumb,
  shouldShowMobileBreadcrumb,
} from "./mobile-nav";
import type { BreadcrumbItem } from "./types";

/** Short page title for the mobile topbar when bottom nav covers the route. */
export function resolveTopbarPageTitle(pathname: string): string {
  if (pathname === "/" || pathname === "") {
    return "Dashboard";
  }

  const hub = findHubByPathname(pathname);
  if (hub) {
    return resolveHubShellTitle(pathname, hub);
  }

  const trail = resolveBreadcrumbTrail(pathname);
  return trail[trail.length - 1]?.label ?? "BranchBrew";
}

export type PageChromeTitleVisibility = {
  /** Hide visual h1 on lg+ when desktop breadcrumb shows the same title. */
  hideOnDesktop: boolean;
  /** Hide visual h1 below lg when the mobile topbar shows the page title or breadcrumb. */
  hideOnMobile: boolean;
  /** Show compact page title in the mobile topbar (bottom-nav-covered routes). */
  showMobileTopbarTitle: boolean;
};

export function getPageChromeTitleVisibility(
  pathname: string,
  role: string,
  trail: BreadcrumbItem[] = resolveBreadcrumbTrail(pathname),
): PageChromeTitleVisibility {
  const hideOnDesktop = shouldShowDesktopBreadcrumb(pathname, role, trail);
  const showMobileTopbarTitle = isMobileBottomNavPathCovered(pathname, role);
  const hideOnMobile =
    showMobileTopbarTitle || shouldShowMobileBreadcrumb(pathname, role);

  return {
    hideOnDesktop,
    hideOnMobile,
    showMobileTopbarTitle,
  };
}
