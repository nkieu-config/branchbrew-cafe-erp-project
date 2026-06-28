import { describe, expect, it } from "vitest";
import type { Equipment } from "@/types/api";
import {
  equipmentStatusLabel,
  equipmentTypeLabel,
  filterEquipment,
  isMaintenanceDueSoon,
  summarizeEquipment,
} from "./equipment-filters";

describe("equipment-filters", () => {
  const equipment = [
    {
      id: 1,
      branchId: 1,
      name: "Linea PB",
      type: "ESPRESSO_MACHINE",
      status: "ACTIVE",
      nextMaintenanceDate: "2026-07-01",
      branch: { id: 1, name: "Main" },
    },
    {
      id: 2,
      branchId: 1,
      name: "Grinder A",
      type: "GRINDER",
      status: "BROKEN",
      nextMaintenanceDate: null,
      branch: { id: 1, name: "Main" },
    },
  ] as Equipment[];

  it("labels equipment types and statuses", () => {
    expect(equipmentTypeLabel("ESPRESSO_MACHINE")).toBe("Espresso machine");
    expect(equipmentStatusLabel("ACTIVE")).toBe("Active");
  });

  it("summarizes equipment portfolio", () => {
    const summary = summarizeEquipment(equipment);
    expect(summary.total).toBe(2);
    expect(summary.active).toBe(1);
    expect(summary.broken).toBe(1);
  });

  it("detects maintenance due soon", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    expect(isMaintenanceDueSoon(soon.toISOString())).toBe(true);
  });

  it("filters equipment by search and status", () => {
    const broken = filterEquipment(equipment, {
      statusFilter: "BROKEN",
      typeFilter: "ALL",
      highlightFilter: "ALL",
      search: "",
    });
    expect(broken).toHaveLength(1);

    const byName = filterEquipment(equipment, {
      statusFilter: "ALL",
      typeFilter: "ALL",
      highlightFilter: "ALL",
      search: "linea",
    });
    expect(byName).toHaveLength(1);
  });
});
