import { describe, expect, it } from "vitest";
import {
  hubDialogContentClassName,
  hubMetaBadgeClassName,
  hubSectionPanelClassName,
} from "./hub-panel";
import { crmSectionPanelClassName, hrMetaBadgeClassName } from "./hub-section-aliases";

describe("hub panel primitives", () => {
  it("hubSectionPanelClassName uses standard list panel radius and table tokens", () => {
    const panel = hubSectionPanelClassName("inventory");
    expect(panel).toContain("rounded-xl");
    expect(panel).toContain("var(--table-container-bg)");
    expect(panel).toContain("var(--table-container-border)");
  });

  it("deprecated hub aliases delegate to parameterized primitives", () => {
    expect(crmSectionPanelClassName()).toBe(hubSectionPanelClassName("crm"));
    expect(hrMetaBadgeClassName()).toBe(hubMetaBadgeClassName("hr"));
  });

  it("hubDialogContentClassName wraps form dialog shell", () => {
    expect(hubDialogContentClassName(640)).toContain("max-w-[640px]");
  });
});
