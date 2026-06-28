import { describe, expect, it } from "vitest";
import type { User } from "@/types/api";
import {
  employeeHasMissingRate,
  filterEmployees,
  roleLabel,
  summarizeEmployees,
} from "./employee-filters";

describe("employee-filters", () => {
  const users = [
    {
      id: 1,
      email: "a@test.com",
      name: "Alice",
      role: "MANAGER",
      branchId: 1,
      employmentType: "FULL_TIME",
      hourlyRate: 120,
    },
    {
      id: 2,
      email: "b@test.com",
      name: "Bob",
      role: "STAFF",
      branchId: 1,
      employmentType: "PART_TIME",
      hourlyRate: 0,
    },
  ] as User[];

  it("summarizes employee portfolio", () => {
    const summary = summarizeEmployees(users);
    expect(summary.total).toBe(2);
    expect(summary.managers).toBe(1);
    expect(summary.missingRate).toBe(1);
    expect(summary.partTime).toBe(1);
  });

  it("detects missing hourly rate", () => {
    expect(employeeHasMissingRate(users[1])).toBe(true);
    expect(employeeHasMissingRate(users[0])).toBe(false);
  });

  it("filters by role and missing rate", () => {
    const filtered = filterEmployees(users, {
      search: "",
      roleFilter: "STAFF",
      employmentTypeFilter: "ALL",
      rateFilter: "missing-rate",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("Bob");
  });

  it("labels roles and filters by branch", () => {
    expect(roleLabel("MANAGER")).toBe("Manager");
    const hqUser = { ...users[0], branchId: null } as User;
    const filtered = filterEmployees([hqUser], {
      search: "",
      roleFilter: "ALL",
      employmentTypeFilter: "ALL",
      rateFilter: "ALL",
      branchFilter: "hq",
    });
    expect(filtered).toHaveLength(1);
  });
});
