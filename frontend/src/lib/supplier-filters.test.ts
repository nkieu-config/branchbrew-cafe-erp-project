import { describe, expect, it } from "vitest";
import type { PurchaseOrder, Supplier } from "@/types/api";
import {
  countPurchaseOrdersBySupplier,
  matchesSupplierContactFilter,
  summarizeSuppliers,
  supplierMissingEmail,
} from "./supplier-filters";

describe("supplier-filters", () => {
  it("detects missing contact fields", () => {
    const supplier: Supplier = { id: 1, name: "Acme", contactEmail: null, phone: "081" };
    expect(supplierMissingEmail(supplier)).toBe(true);
    expect(matchesSupplierContactFilter(supplier, "missing-email")).toBe(true);
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
