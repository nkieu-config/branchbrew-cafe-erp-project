import { describe, expect, it } from "vitest";
import type { Account } from "@/types/api";
import { groupAccountsByType } from "./accounts";
import {
  accountTypeLabel,
  filterAccountTree,
  summarizeAccounts,
} from "./account-filters";

describe("account-filters", () => {
  const accounts = [
    {
      id: 1,
      code: "1000",
      name: "Cash",
      type: "ASSET",
      isActive: true,
      description: "Main cash",
    },
    {
      id: 2,
      code: "5000",
      name: "COGS",
      type: "EXPENSE",
      isActive: false,
      description: null,
    },
  ] as Account[];

  it("labels account types", () => {
    expect(accountTypeLabel("ASSET")).toBe("Asset");
  });

  it("summarizes accounts", () => {
    const summary = summarizeAccounts(accounts);
    expect(summary.total).toBe(2);
    expect(summary.active).toBe(1);
    expect(summary.inactive).toBe(1);
    expect(summary.byType.ASSET).toBe(1);
  });

  it("filters account tree", () => {
    const tree = groupAccountsByType(accounts);
    const assetsOnly = filterAccountTree(tree, {
      search: "",
      typeFilter: "ASSET",
      activeFilter: "ALL",
    });
    expect(assetsOnly).toHaveLength(1);
    expect(assetsOnly[0].children).toHaveLength(1);

    const bySearch = filterAccountTree(tree, {
      search: "cogs",
      typeFilter: "ALL",
      activeFilter: "ALL",
    });
    expect(bySearch).toHaveLength(1);
    expect(bySearch[0].type).toBe("EXPENSE");
  });
});
