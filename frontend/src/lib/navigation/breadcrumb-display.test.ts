import { describe, expect, it } from "vitest";
import { buildBreadcrumbDisplay } from "./breadcrumb-display";
import type { BreadcrumbItem } from "./types";

const trail = (labels: string[]): BreadcrumbItem[] =>
  labels.map((label, index) => ({
    label,
    href: index < labels.length - 1 ? `/${label.toLowerCase()}` : null,
  }));

describe("buildBreadcrumbDisplay", () => {
  it("returns all items when within mobile limit", () => {
    const items = trail(["Finance", "Overview"]);
    const segments = buildBreadcrumbDisplay(items, false);
    expect(segments).toHaveLength(2);
    expect(segments.every((segment) => segment.kind === "item")).toBe(true);
  });

  it("collapses middle segments on mobile for long trails", () => {
    const items = trail(["Finance", "Ledger", "Journal"]);
    const segments = buildBreadcrumbDisplay(items, false);
    expect(segments).toHaveLength(3);
    expect(segments[0]).toMatchObject({ kind: "item", item: items[0] });
    expect(segments[1]).toMatchObject({ kind: "ellipsis", title: "Ledger" });
    expect(segments[2]).toMatchObject({ kind: "item", item: items[2] });
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
