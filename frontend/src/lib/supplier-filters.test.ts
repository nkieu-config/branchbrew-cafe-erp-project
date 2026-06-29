import { describe, expect, it } from "vitest";
import type { PurchaseOrder, Supplier } from "@/types/api";
import {
  countPurchaseOrdersBySupplier,
  filterSuppliers,
  hasSupplierFilters,
  matchesSupplierContactFilter,
  matchesSupplierSearch,
  summarizeSuppliers,
  supplierMissingEmail,
} from "./supplier-filters";

const suppliers: Supplier[] = [
  { id: 1, name: "Acme Foods", contactEmail: "sales@acme.com", phone: "0811111111" },
  { id: 2, name: "Beta Supply", contactEmail: null, phone: "0822222222" },
  { id: 3, name: "Gamma Co", contactEmail: "buy@gamma.com", phone: null },
];

describe("supplier-filters", () => {
  it("detects missing contact fields", () => {
    const supplier: Supplier = { id: 1, name: "Acme", contactEmail: null, phone: "081" };
    expect(supplierMissingEmail(supplier)).toBe(true);
    expect(matchesSupplierContactFilter(supplier, "missing-email")).toBe(true);
  });

  it("matches supplier search by name, email, or phone", () => {
    expect(matchesSupplierSearch(suppliers[0], "acme")).toBe(true);
    expect(matchesSupplierSearch(suppliers[0], "sales@acme")).toBe(true);
    expect(matchesSupplierSearch(suppliers[0], "gamma")).toBe(false);
    expect(matchesSupplierSearch(suppliers[0], "")).toBe(true);
  });

  it("filters suppliers by search and contact filter", () => {
    expect(
      filterSuppliers(suppliers, { search: "beta", contactFilter: "ALL" }).map((s) => s.id),
    ).toEqual([2]);
    expect(
      filterSuppliers(suppliers, { search: "", contactFilter: "missing-email" }).map((s) => s.id),
    ).toEqual([2]);
    expect(
      filterSuppliers(suppliers, { search: "gamma", contactFilter: "missing-phone" }).map(
        (s) => s.id,
      ),
    ).toEqual([3]);
  });

  it("detects active supplier filters", () => {
    expect(hasSupplierFilters({ search: "", contactFilter: "ALL" })).toBe(false);
    expect(hasSupplierFilters({ search: "acme", contactFilter: "ALL" })).toBe(true);
    expect(hasSupplierFilters({ search: "", contactFilter: "missing-phone" })).toBe(true);
  });

  it("summarizes supplier portfolio", () => {
    const summary = summarizeSuppliers([
      { id: 1, name: "A", contactEmail: null, phone: "081" },
      { id: 2, name: "B", contactEmail: "a@b.com", phone: null },
    ]);
    expect(summary.total).toBe(2);
    expect(summary.missingEmail).toBe(1);
    expect(summary.missingPhone).toBe(1);
  });

  it("counts POs per supplier", () => {
    const counts = countPurchaseOrdersBySupplier([
      { id: 1, supplierId: 2 } as PurchaseOrder,
      { id: 2, supplierId: 2 } as PurchaseOrder,
    ]);
    expect(counts.get(2)).toBe(2);
  });
});
