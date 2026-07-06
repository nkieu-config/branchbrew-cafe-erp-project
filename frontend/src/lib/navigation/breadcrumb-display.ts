import type { BreadcrumbItem } from "./types";

export type BreadcrumbDisplaySegment =
  | { kind: "item"; item: BreadcrumbItem; index: number }
  | { kind: "ellipsis"; title: string };

/**
 * Collapse middle breadcrumb segments when the trail is long.
 * Mobile: show only the current page. Desktop: collapse when more than 3.
 */
export function buildBreadcrumbDisplay(
  items: BreadcrumbItem[],
  isDesktop: boolean,
): BreadcrumbDisplaySegment[] {
  if (items.length === 0) return [];

  if (!isDesktop) {
    const last = items[items.length - 1];
    return [{ kind: "item", item: last, index: items.length - 1 }];
  }

  const maxVisible = 3;
  if (items.length <= maxVisible) {
    return items.map((item, index) => ({ kind: "item", item, index }));
  }

  const middle = items.slice(1, -1);
  const ellipsisTitle = middle.map((item) => item.label).join(" › ");

  return [
    { kind: "item", item: items[0], index: 0 },
    { kind: "ellipsis", title: ellipsisTitle },
    { kind: "item", item: items[items.length - 1], index: items.length - 1 },
  ];
}
