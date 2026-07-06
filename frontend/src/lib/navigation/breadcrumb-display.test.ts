import { describe, expect, it } from "vitest";
import { buildBreadcrumbDisplay } from "./breadcrumb-display";
import type { BreadcrumbItem } from "./types";

const trail = (labels: string[]): BreadcrumbItem[] =>
  labels.map((label, index) => ({
    label,
    href: index < labels.length - 1 ? `/${label.toLowerCase()}` : null,
  }));

describe("buildBreadcrumbDisplay", () => {
  it("shows only the current page on mobile", () => {
    const items = trail(["Finance", "Overview"]);
    const segments = buildBreadcrumbDisplay(items, false);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ kind: "item", item: items[1] });
  });

  it("shows only the last segment on mobile for long trails", () => {
    const items = trail(["Finance", "Ledger", "Journal"]);
    const segments = buildBreadcrumbDisplay(items, false);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ kind: "item", item: items[2] });
  });

  it("shows three segments on desktop before collapsing", () => {
    const items = trail(["Finance", "Ledger", "Journal"]);
    const segments = buildBreadcrumbDisplay(items, true);
    expect(segments).toHaveLength(3);
    expect(segments.every((segment) => segment.kind === "item")).toBe(true);
  });

  it("collapses on desktop when more than three segments", () => {
    const items = trail(["Inventory", "Batches", "Lots", "Detail"]);
    const segments = buildBreadcrumbDisplay(items, true);
    expect(segments[1]).toMatchObject({
      kind: "ellipsis",
      title: "Batches › Lots",
    });
  });
});
