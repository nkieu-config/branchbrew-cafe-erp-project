import { describe, expect, it } from "vitest";
import { metricIconWrapClassName, metricValueClassName } from "./metric";

describe("metric tones", () => {
  it("keeps raw metric vars for value text", () => {
    expect(metricValueClassName("blue")).toContain("--metric-blue");
  });

  it("pairs icon wraps with status-soft bg and readable fg", () => {
    expect(metricIconWrapClassName("blue")).toContain("--status-blue-bg");
    expect(metricIconWrapClassName("blue")).toContain("--status-blue-fg");
    expect(metricIconWrapClassName("blue")).not.toContain("bg-muted");
    expect(metricIconWrapClassName("emerald")).toContain("--status-success-bg");
  });
});
