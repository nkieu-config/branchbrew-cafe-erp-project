import { describe, expect, it } from "vitest";
import { collectDuplicateKeys } from "./use-line-item-rows";

describe("collectDuplicateKeys", () => {
  it("returns duplicate ingredient ids", () => {
    const rows = [{ id: 1 }, { id: 2 }, { id: 1 }];
    expect(collectDuplicateKeys(rows, (row) => row.id)).toEqual(new Set([1]));
  });

  it("ignores empty keys", () => {
    const rows = [{ id: 0 }, { id: 0 }];
    expect(collectDuplicateKeys(rows, (row) => row.id)).toEqual(new Set());
  });
});
