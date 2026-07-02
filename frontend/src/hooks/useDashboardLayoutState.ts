"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const DEFAULT_LAYOUT = ["sales", "topBranch", "lowStock", "operationalTasks", "topProducts", "salesChart"] as const;
const VALID_WIDGET_IDS = new Set<string>(DEFAULT_LAYOUT);
const LAYOUT_PARAM = "layout";
const LAYOUT_STORAGE_KEY = "executive_dashboard_layout";
const LAYOUT_STORAGE_VERSION = 1;

type StoredLayoutPayload = {
  v: number;
  order: string[];
};

function normalizeLayout(ids: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of ids) {
    if (VALID_WIDGET_IDS.has(id) && !seen.has(id)) {
      seen.add(id);
      ordered.push(id);
    }
  }
  for (const id of DEFAULT_LAYOUT) {
    if (!seen.has(id)) ordered.push(id);
  }
  return ordered;
}

function parseLayoutParam(value: string | null): string[] | null {
  if (!value) return null;
  const ids = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (ids.length === 0) return null;
  return normalizeLayout(ids);
}

function readStoredLayout(): string[] | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved) as unknown;
    if (Array.isArray(parsed)) {
      return normalizeLayout(parsed.map(String));
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      "v" in parsed &&
      "order" in parsed &&
      (parsed as StoredLayoutPayload).v === LAYOUT_STORAGE_VERSION &&
      Array.isArray((parsed as StoredLayoutPayload).order)
    ) {
      return normalizeLayout((parsed as StoredLayoutPayload).order.map(String));
    }
    return null;
  } catch {
    return null;
  }
}

function serializeLayoutPayload(order: string[]): string {
  const payload: StoredLayoutPayload = { v: LAYOUT_STORAGE_VERSION, order };
  return JSON.stringify(payload);
}

function writeStoredLayout(order: string[]): void {
  const serialized = serializeLayoutPayload(order);
  if (localStorage.getItem(LAYOUT_STORAGE_KEY) === serialized) return;
  localStorage.setItem(LAYOUT_STORAGE_KEY, serialized);
}

function replaceLayoutInUrl(
  pathname: string,
  searchParamsString: string,
  layoutParam: string | null,
  serialized: string,
  router: ReturnType<typeof useRouter>,
): void {
  if (layoutParam === serialized) return;
  const params = new URLSearchParams(searchParamsString);
  params.set(LAYOUT_PARAM, serialized);
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
}

export function useDashboardLayoutState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const searchParamsString = searchParams.toString();
  const layoutParam = searchParams.get(LAYOUT_PARAM);

  const [widgetOrder, setWidgetOrder] = useState<string[]>([...DEFAULT_LAYOUT]);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const fromUrl = parseLayoutParam(layoutParam);
    if (fromUrl) {
      setWidgetOrder(fromUrl);
      writeStoredLayout(fromUrl);
      setLayoutReady(true);
      return;
    }

    const fromStorage = readStoredLayout() ?? [...DEFAULT_LAYOUT];
    setWidgetOrder(fromStorage);
    writeStoredLayout(fromStorage);

    const serialized = fromStorage.join(",");
    replaceLayoutInUrl(pathname, searchParamsString, layoutParam, serialized, router);

    setLayoutReady(true);
  }, [layoutParam, pathname, router, searchParamsString]);

  const handleReorder = useCallback(
    (newOrder: string[]) => {
      const normalized = normalizeLayout(newOrder);
      setWidgetOrder(normalized);
      writeStoredLayout(normalized);

      const serialized = normalized.join(",");
      replaceLayoutInUrl(pathname, searchParamsString, layoutParam, serialized, router);
    },
    [layoutParam, pathname, router, searchParamsString],
  );

  const isCustomLayout = useMemo(
    () => widgetOrder.join(",") !== DEFAULT_LAYOUT.join(","),
    [widgetOrder],
  );

  const handleResetLayout = useCallback(() => {
    const resetOrder = [...DEFAULT_LAYOUT];
    setWidgetOrder(resetOrder);
    writeStoredLayout(resetOrder);

    const serialized = resetOrder.join(",");
    replaceLayoutInUrl(pathname, searchParamsString, layoutParam, serialized, router);
  }, [layoutParam, pathname, router, searchParamsString]);

  return {
    widgetOrder,
    layoutReady,
    isCustomLayout,
    handleReorder,
    handleResetLayout,
  };
}

export { DEFAULT_LAYOUT as DASHBOARD_DEFAULT_LAYOUT };
