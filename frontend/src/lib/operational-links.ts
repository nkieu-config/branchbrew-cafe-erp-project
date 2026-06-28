import type { SidebarNavBadgeMap } from "@/lib/sidebar-badges";

export function appendOperationalQuery(
  href: string,
  params: Record<string, string | undefined>,
): string {
  const [path, existing] = href.split("?");
  const search = new URLSearchParams(existing ?? "");
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
    else search.delete(key);
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/** Default hub root path — prefer actionable tab when badges are active. */
export function resolveHubLandingPath(
  hubId: string,
  badges: SidebarNavBadgeMap = {},
): string {
  switch (hubId) {
    case "procurement":
      if (badges.procurement?.count || badges["/procurement/orders"]?.count) {
        return "/procurement/orders?status=PENDING";
      }
      return "";
    case "hr":
      if (badges.hr?.count || badges["/hr/leave"]?.count) {
        return "/hr/leave?status=PENDING";
      }
      return "";
    case "finance":
      if (badges.finance?.count || badges["/finance/overview"]?.count) {
        return "/finance/overview?status=PENDING";
      }
      return "";
    case "inventory": {
      if (badges["/inventory/transfers"]?.count) {
        return "/inventory/transfers?status=PENDING";
      }
      if (badges["/inventory/batches"]?.count) {
        return "/inventory/batches";
      }
      if (badges["/inventory"]?.count || badges.inventory?.count) {
        return "/inventory?filter=low";
      }
      return "";
    }
    default:
      return "";
  }
}

/** Sidebar parent link — deep-link to actionable view when badge is active. */
export function resolveSidebarItemHref(
  itemId: string,
  defaultHref: string,
  badges: SidebarNavBadgeMap = {},
  childTabBadges: SidebarNavBadgeMap = {},
): string {
  const merged = { ...badges, ...childTabBadges };
  const hubPath = resolveHubLandingPath(itemId, merged);
  if (hubPath) return hubPath;
  return defaultHref;
}

/** Sidebar child tab link — append focus query when tab badge is active. */
export function resolveChildTabHref(
  tabPath: string,
  childTabBadges: SidebarNavBadgeMap = {},
): string {
  const tabBadge = childTabBadges[tabPath];
  if (!tabBadge?.count) return tabPath;

  if (tabPath === "/procurement/orders") {
    return appendOperationalQuery(tabPath, { status: "PENDING" });
  }
  if (tabPath === "/inventory") {
    return appendOperationalQuery(tabPath, { filter: "low" });
  }
  if (tabPath === "/inventory/transfers") {
    return appendOperationalQuery(tabPath, { status: "PENDING" });
  }
  if (tabPath === "/finance/overview") {
    return appendOperationalQuery(tabPath, { status: "PENDING" });
  }
  if (tabPath === "/hr/leave") {
    return appendOperationalQuery(tabPath, { status: "PENDING" });
  }
  return tabPath;
}

/** Parse ?status= from URL for operational list filters. */
export function readOperationalStatusParam(
  value: string | null,
  allowed: readonly string[],
): string | null {
  if (!value) return null;
  const normalized = value.toUpperCase();
  return allowed.includes(normalized) ? normalized : null;
}
