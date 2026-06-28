import { describe, expect, it } from "vitest";
import {
  buildFinanceOverviewUrl,
  parseFinanceOverviewSearchParams,
} from "./finance-hub-url";

describe("finance-hub-url", () => {
  it("builds overview url with status filter", () => {
    expect(buildFinanceOverviewUrl({ status: "PENDING" })).toBe(
      "/finance/overview?status=PENDING",
    );
    expect(buildFinanceOverviewUrl()).toBe("/finance/overview");
  });

  it("parses overview status param", () => {
    const params = new URLSearchParams("status=APPROVED");
    expect(parseFinanceOverviewSearchParams(params).statusFilter).toBe("APPROVED");
  });
});
