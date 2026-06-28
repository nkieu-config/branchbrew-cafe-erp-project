import { describe, expect, it } from "vitest";
import {
  formDialogContentClassName,
  touchTargetClassName,
  typeHeadingClassName,
  typeMetricClassName,
  typeMicroClassName,
} from "./typography";

describe("typography scale", () => {
  it("typeMetricClassName uses font-black", () => {
    expect(typeMetricClassName()).toContain("font-black");
  });

  it("typeHeadingClassName uses font-bold", () => {
    expect(typeHeadingClassName()).toContain("font-bold");
    expect(typeHeadingClassName()).not.toContain("font-black");
  });

  it("typeMicroClassName uses text-xs not 10px", () => {
    expect(typeMicroClassName()).toContain("text-xs");
    expect(typeMicroClassName()).not.toContain("10px");
  });

  it("touchTargetClassName enforces 44px floor", () => {
    expect(touchTargetClassName()).toContain("min-h-[44px]");
    expect(touchTargetClassName()).toContain("min-w-[44px]");
  });

  it("formDialogContentClassName applies numeric max width", () => {
    expect(formDialogContentClassName(520)).toContain("sm:max-w-[520px]");
  });
});
