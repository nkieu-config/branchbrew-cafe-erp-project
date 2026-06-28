import { describe, expect, it } from "vitest";
import type { AuditLog } from "@/types/api";
import {
  auditActionLabel,
  auditTargetTypeLabel,
  categorizeAuditAction,
  filterAuditLogs,
  formatAuditDetails,
  summarizeAuditLogs,
} from "./audit-filters";

describe("audit-filters", () => {
  const logs = [
    {
      id: 1,
      userId: 1,
      action: "CREATE_PO",
      targetType: "PurchaseOrder",
      targetId: 10,
      createdAt: "2026-06-01T10:00:00Z",
      user: { id: 1, email: "a@test.com", name: "Admin", role: "SUPER_ADMIN" },
    },
    {
      id: 2,
      userId: 2,
      action: "APPROVE_SETTLEMENT",
      targetType: "Settlement",
      targetId: 3,
      createdAt: "2026-06-01T11:00:00Z",
      user: { id: 2, email: "b@test.com", name: "Manager", role: "MANAGER" },
    },
  ] as AuditLog[];

  it("labels audit actions and target types", () => {
    expect(auditActionLabel("CREATE_PO")).toBe("Create PO");
    expect(auditTargetTypeLabel("PurchaseOrder")).toBe("Purchase Order");
  });

  it("categorizes audit actions", () => {
    expect(categorizeAuditAction("CREATE_PO")).toBe("create");
    expect(categorizeAuditAction("APPROVE_SETTLEMENT")).toBe("approve");
  });

  it("summarizes audit logs", () => {
    const summary = summarizeAuditLogs(logs);
    expect(summary.total).toBe(2);
    expect(summary.create).toBe(1);
    expect(summary.approve).toBe(1);
  });

  it("filters audit logs by search and category", () => {
    const createOnly = filterAuditLogs(logs, {
      search: "",
      actionFilter: "create",
    });
    expect(createOnly).toHaveLength(1);

    const byUser = filterAuditLogs(logs, {
      search: "manager",
      actionFilter: "ALL",
    });
    expect(byUser).toHaveLength(1);
  });

  it("formats structured audit details", () => {
    const formatted = formatAuditDetails('{"qty":5,"reason":"expired"}');
    expect(formatted.isStructured).toBe(true);
    expect(formatted.preview).toContain("qty: 5");
  });
});
