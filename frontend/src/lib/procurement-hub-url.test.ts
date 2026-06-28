import { describe, expect, it } from "vitest";
import {
  buildProcurementOrdersUrl,
  parseProcurementOrdersSearchParams,
} from "./procurement-hub-url";

describe("procurement-hub-url", () => {
  it("builds procurement order URLs", () => {
    expect(buildProcurementOrdersUrl()).toBe("/procurement/orders");
    expect(
      buildProcurementOrdersUrl({ status: "PENDING", supplier: 3, auto: true }),
    ).toBe("/procurement/orders?status=PENDING&supplier=3&auto=1");
  });

  it("parses procurement order search params", () => {
    expect(
      parseProcurementOrdersSearchParams(
        new URLSearchParams("status=pending&supplier=4&auto=1"),
      ),
    ).toEqual({
      status: "PENDING",
      supplierId: 4,
      highlightFilter: "auto-draft",
    });
    expect(parseProcurementOrdersSearchParams(new URLSearchParams("status=REJECTED"))).toEqual({
      status: "ALL",
      supplierId: null,
      highlightFilter: "ALL",
    });
  });
});
